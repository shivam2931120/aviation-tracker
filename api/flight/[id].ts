import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Flight ID is required' });
        }

        const flight = await prisma.flight.findUnique({
            where: { id },
        });

        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        // Fetch related data
        const [airline, departureAirport, arrivalAirport, route] = await Promise.all([
            prisma.airline.findUnique({ where: { iata: flight.airlineIata } }),
            prisma.airport.findUnique({ where: { iata: flight.departureIata } }),
            prisma.airport.findUnique({ where: { iata: flight.arrivalIata } }),
            prisma.route.findFirst({
                where: {
                    originIata: flight.departureIata,
                    destIata: flight.arrivalIata,
                    airlineIata: flight.airlineIata,
                },
            }),
        ]);

        // Get historical flights for this route
        const historicalFlights = await prisma.flight.findMany({
            where: {
                departureIata: flight.departureIata,
                arrivalIata: flight.arrivalIata,
                airlineIata: flight.airlineIata,
                id: { not: flight.id },
            },
            orderBy: { scheduledDeparture: 'desc' },
            take: 10,
            select: {
                id: true,
                callsign: true,
                scheduledDeparture: true,
                actualDeparture: true,
                delayMinutes: true,
                status: true,
                reliabilityScore: true,
            },
        });

        // Calculate delay prediction explanation
        const explanation = generateDelayExplanation(flight, route, departureAirport, arrivalAirport);

        return res.status(200).json({
            flight,
            airline,
            departure: departureAirport,
            arrival: arrivalAirport,
            route,
            history: historicalFlights,
            explanation,
        });
    } catch (error) {
        console.error('Error fetching flight:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}

interface FlightData {
    reliabilityScore: number;
    delayMinutes: number | null;
}

interface RouteData {
    reliabilityIndex: number;
    weatherRisk: number;
    peakHourFactor: number;
    avgDelay: number;
}

interface AirportData {
    otpPercent: number;
    avgDelay: number;
    name: string;
}

function generateDelayExplanation(
    flight: FlightData,
    route: RouteData | null,
    depAirport: AirportData | null,
    arrAirport: AirportData | null
): string {
    const factors: string[] = [];

    if (route) {
        if (route.weatherRisk > 0.3) {
            factors.push(`Elevated weather risk (${(route.weatherRisk * 100).toFixed(0)}%) may impact flight times.`);
        }
        if (route.peakHourFactor > 1.2) {
            factors.push(`Peak hour congestion expected (factor: ${route.peakHourFactor.toFixed(1)}x).`);
        }
        if (route.avgDelay > 15) {
            factors.push(`This route has a historical average delay of ${route.avgDelay.toFixed(0)} minutes.`);
        }
    }

    if (depAirport && depAirport.otpPercent < 75) {
        factors.push(`${depAirport.name} has below-average on-time performance (${depAirport.otpPercent.toFixed(1)}%).`);
    }

    if (arrAirport && arrAirport.avgDelay > 15) {
        factors.push(`Arrival airport typically experiences ${arrAirport.avgDelay.toFixed(0)} min average delays.`);
    }

    if (flight.reliabilityScore > 80) {
        factors.push(`High reliability score (${flight.reliabilityScore.toFixed(1)}) indicates good chance of on-time arrival.`);
    } else if (flight.reliabilityScore < 70) {
        factors.push(`Lower reliability score (${flight.reliabilityScore.toFixed(1)}) suggests potential delays.`);
    }

    if (factors.length === 0) {
        return 'This flight has typical conditions with no significant delay factors identified.';
    }

    return factors.join(' ');
}
