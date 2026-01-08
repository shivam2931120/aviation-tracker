import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Delay Prediction API
 * 
 * Formula (documented in comments):
 * reliability_score = 0.5 * airlineOtp + 0.3 * airportOtp - 0.2 * weatherRisk + 0.1 * turnaroundFactor
 * 
 * Variables:
 * - airlineOtp: Airline on-time performance percentage (0-100)
 * - airportOtp: Combined departure + arrival airport OTP (0-100)
 * - weatherRisk: Weather risk factor (0-1)
 * - turnaroundFactor: Turnaround efficiency score based on estimated time
 * - historicalDelay: Average delay for this route
 * - timeOfDay: Peak hour factor (0.8-1.5)
 */

interface PredictionInput {
    originIata: string;
    destIata: string;
    airlineIata: string;
    scheduledDeparture?: string;
    turnaroundMinutes?: number;
}

interface PredictionResult {
    reliabilityScore: number;
    predictedDelayMinutes: number;
    confidence: number;
    factors: {
        name: string;
        value: number;
        impact: 'positive' | 'negative' | 'neutral';
        description: string;
    }[];
    explanation: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const input: PredictionInput = req.body;

        if (!input.originIata || !input.destIata || !input.airlineIata) {
            return res.status(400).json({
                error: 'Missing required fields: originIata, destIata, airlineIata'
            });
        }

        // Fetch required data from database
        const [airline, originAirport, destAirport, route, historicalFlights] = await Promise.all([
            prisma.airline.findUnique({ where: { iata: input.airlineIata } }),
            prisma.airport.findUnique({ where: { iata: input.originIata } }),
            prisma.airport.findUnique({ where: { iata: input.destIata } }),
            prisma.route.findFirst({
                where: {
                    originIata: input.originIata,
                    destIata: input.destIata,
                    airlineIata: input.airlineIata,
                },
            }),
            prisma.flight.findMany({
                where: {
                    departureIata: input.originIata,
                    arrivalIata: input.destIata,
                    airlineIata: input.airlineIata,
                },
                orderBy: { scheduledDeparture: 'desc' },
                take: 50,
                select: { delayMinutes: true, reliabilityScore: true },
            }),
        ]);

        // Calculate factors
        const airlineOtp = airline?.otpPercent ?? 75;
        const originOtp = originAirport?.otpPercent ?? 75;
        const destOtp = destAirport?.otpPercent ?? 75;
        const airportOtp = (originOtp + destOtp) / 2;
        const weatherRisk = route?.weatherRisk ?? 0.2;

        // Time of day factor (peak hours have higher factor)
        let timeOfDayFactor = 1.0;
        if (input.scheduledDeparture) {
            const hour = new Date(input.scheduledDeparture).getHours();
            // Peak hours: 7-9 AM and 5-8 PM
            if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) {
                timeOfDayFactor = 1.3;
            } else if (hour >= 22 || hour <= 5) {
                timeOfDayFactor = 0.8; // Late night flights have fewer delays
            }
        }

        // Turnaround factor (shorter turnarounds = higher risk)
        let turnaroundFactor = 1.0;
        if (input.turnaroundMinutes) {
            if (input.turnaroundMinutes < 30) {
                turnaroundFactor = 0.7; // High risk
            } else if (input.turnaroundMinutes < 45) {
                turnaroundFactor = 0.85;
            } else if (input.turnaroundMinutes > 90) {
                turnaroundFactor = 1.1; // Lower risk
            }
        }

        // Historical delay average
        const avgHistoricalDelay = historicalFlights.length > 0
            ? historicalFlights.reduce((sum, f) => sum + (f.delayMinutes ?? 0), 0) / historicalFlights.length
            : route?.avgDelay ?? 15;

        // Calculate reliability score using the formula
        // reliability_score = 0.5 * airlineOtp + 0.3 * airportOtp - 0.2 * weatherRisk * 100 + 0.1 * turnaroundFactor * 100
        const reliabilityScore = Math.max(0, Math.min(100,
            0.5 * airlineOtp +
            0.3 * airportOtp -
            0.2 * weatherRisk * 100 +
            0.1 * turnaroundFactor * 100 -
            0.05 * (timeOfDayFactor - 1) * 100
        ));

        // Predict delay based on factors
        const baseDelay = avgHistoricalDelay;
        const weatherImpact = weatherRisk * 20;
        const peakHourImpact = (timeOfDayFactor - 1) * 15;
        const turnaroundImpact = (1 - turnaroundFactor) * 10;
        const otpImpact = ((100 - airportOtp) / 100) * 10;

        const predictedDelayMinutes = Math.max(0, Math.round(
            baseDelay * 0.5 + weatherImpact + peakHourImpact + turnaroundImpact + otpImpact
        ));

        // Calculate confidence based on data availability
        let confidence = 0.6; // Base confidence
        if (route) confidence += 0.1;
        if (historicalFlights.length >= 10) confidence += 0.15;
        else if (historicalFlights.length >= 5) confidence += 0.1;
        if (airline) confidence += 0.05;
        if (originAirport && destAirport) confidence += 0.1;
        confidence = Math.min(0.95, confidence);

        // Build factors breakdown
        const factors = [
            {
                name: 'Airline OTP',
                value: airlineOtp,
                impact: airlineOtp >= 80 ? 'positive' as const : airlineOtp < 70 ? 'negative' as const : 'neutral' as const,
                description: `${airline?.name ?? input.airlineIata} has ${airlineOtp.toFixed(1)}% on-time performance`,
            },
            {
                name: 'Airport OTP',
                value: airportOtp,
                impact: airportOtp >= 75 ? 'positive' as const : airportOtp < 70 ? 'negative' as const : 'neutral' as const,
                description: `Combined airport on-time rate: ${airportOtp.toFixed(1)}%`,
            },
            {
                name: 'Weather Risk',
                value: weatherRisk * 100,
                impact: weatherRisk < 0.2 ? 'positive' as const : weatherRisk > 0.35 ? 'negative' as const : 'neutral' as const,
                description: `Weather risk factor: ${(weatherRisk * 100).toFixed(0)}%`,
            },
            {
                name: 'Time of Day',
                value: timeOfDayFactor * 100 - 100,
                impact: timeOfDayFactor <= 1 ? 'positive' as const : timeOfDayFactor > 1.2 ? 'negative' as const : 'neutral' as const,
                description: timeOfDayFactor > 1 ? 'Peak hour departure increases delay risk' : 'Off-peak departure time',
            },
        ];

        if (input.turnaroundMinutes) {
            factors.push({
                name: 'Turnaround',
                value: input.turnaroundMinutes,
                impact: turnaroundFactor >= 1 ? 'positive' as const : turnaroundFactor < 0.8 ? 'negative' as const : 'neutral' as const,
                description: `${input.turnaroundMinutes} min turnaround time`,
            });
        }

        // Generate explanation
        const explanation = generateExplanation(reliabilityScore, predictedDelayMinutes, factors);

        const result: PredictionResult = {
            reliabilityScore: Math.round(reliabilityScore * 10) / 10,
            predictedDelayMinutes,
            confidence: Math.round(confidence * 100) / 100,
            factors,
            explanation,
        };

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error predicting delay:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}

function generateExplanation(
    reliabilityScore: number,
    predictedDelay: number,
    factors: PredictionResult['factors']
): string {
    const negativeFactors = factors.filter(f => f.impact === 'negative');
    const positiveFactors = factors.filter(f => f.impact === 'positive');

    let explanation = '';

    if (reliabilityScore >= 80) {
        explanation = `High reliability expected (${reliabilityScore.toFixed(1)} score). `;
    } else if (reliabilityScore >= 70) {
        explanation = `Moderate reliability expected (${reliabilityScore.toFixed(1)} score). `;
    } else {
        explanation = `Lower reliability predicted (${reliabilityScore.toFixed(1)} score). `;
    }

    if (predictedDelay <= 10) {
        explanation += 'On-time arrival is likely. ';
    } else if (predictedDelay <= 30) {
        explanation += `Minor delay of ~${predictedDelay} minutes expected. `;
    } else {
        explanation += `Significant delay of ~${predictedDelay} minutes predicted. `;
    }

    if (negativeFactors.length > 0) {
        explanation += `Risk factors: ${negativeFactors.map(f => f.name.toLowerCase()).join(', ')}. `;
    }

    if (positiveFactors.length > 0) {
        explanation += `Favorable factors: ${positiveFactors.map(f => f.name.toLowerCase()).join(', ')}.`;
    }

    return explanation.trim();
}
