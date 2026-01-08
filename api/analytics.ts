import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get airline rankings by OTP
        const airlineRankings = await prisma.airline.findMany({
            orderBy: { otpPercent: 'desc' },
        });

        // Get airport rankings by OTP
        const airportRankings = await prisma.airport.findMany({
            orderBy: { otpPercent: 'desc' },
            take: 20,
        });

        // Get most delayed routes
        const delayedRoutes = await prisma.route.findMany({
            orderBy: { avgDelay: 'desc' },
            take: 10,
        });

        // Get most reliable routes
        const reliableRoutes = await prisma.route.findMany({
            orderBy: { reliabilityIndex: 'desc' },
            take: 10,
        });

        // Flight statistics
        const flightStats = await prisma.flight.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        // Delay distribution
        const flights = await prisma.flight.findMany({
            where: { delayMinutes: { not: null } },
            select: { delayMinutes: true, scheduledDeparture: true },
        });

        const delayDistribution = {
            onTime: flights.filter(f => (f.delayMinutes ?? 0) <= 15).length,
            minor: flights.filter(f => (f.delayMinutes ?? 0) > 15 && (f.delayMinutes ?? 0) <= 30).length,
            moderate: flights.filter(f => (f.delayMinutes ?? 0) > 30 && (f.delayMinutes ?? 0) <= 60).length,
            severe: flights.filter(f => (f.delayMinutes ?? 0) > 60).length,
        };

        // Peak hour analysis
        const peakHourData = flights.reduce((acc, f) => {
            const hour = new Date(f.scheduledDeparture).getHours();
            const key = String(hour).padStart(2, '0');
            if (!acc[key]) acc[key] = { hour: key, count: 0, totalDelay: 0 };
            acc[key].count++;
            acc[key].totalDelay += f.delayMinutes ?? 0;
            return acc;
        }, {} as Record<string, { hour: string; count: number; totalDelay: number }>);

        const peakHourAnalysis = Object.values(peakHourData)
            .map(d => ({
                ...d,
                avgDelay: d.count > 0 ? d.totalDelay / d.count : 0,
            }))
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

        // Active incidents
        const activeIncidents = await prisma.incident.findMany({
            where: { resolved: false },
            orderBy: { date: 'desc' },
        });

        return res.status(200).json({
            airlines: airlineRankings,
            airports: airportRankings,
            delayedRoutes,
            reliableRoutes,
            flightStats: flightStats.reduce((acc, s) => {
                acc[s.status] = s._count.status;
                return acc;
            }, {} as Record<string, number>),
            delayDistribution,
            peakHourAnalysis,
            activeIncidents,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
