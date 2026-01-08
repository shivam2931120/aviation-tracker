import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { type, id, format = 'json' } = req.query;

        // Validate request
        if (!type || !['flight', 'airport', 'route', 'summary'].includes(String(type))) {
            return res.status(400).json({
                error: 'Invalid type. Use: flight, airport, route, or summary'
            });
        }

        let reportData: Record<string, unknown> = {};

        if (type === 'flight' && id) {
            const flight = await prisma.flight.findUnique({ where: { id: String(id) } });
            if (!flight) return res.status(404).json({ error: 'Flight not found' });

            const [airline, depAirport, arrAirport] = await Promise.all([
                prisma.airline.findUnique({ where: { iata: flight.airlineIata } }),
                prisma.airport.findUnique({ where: { iata: flight.departureIata } }),
                prisma.airport.findUnique({ where: { iata: flight.arrivalIata } }),
            ]);

            reportData = {
                title: `Flight Report: ${flight.callsign}`,
                generatedAt: new Date().toISOString(),
                flight,
                airline,
                departure: depAirport,
                arrival: arrAirport,
            };
        } else if (type === 'airport' && id) {
            const airport = await prisma.airport.findUnique({ where: { iata: String(id) } });
            if (!airport) return res.status(404).json({ error: 'Airport not found' });

            const [incidents, routes, flightCount] = await Promise.all([
                prisma.incident.findMany({ where: { airportIata: String(id) }, take: 10, orderBy: { date: 'desc' } }),
                prisma.route.findMany({ where: { OR: [{ originIata: String(id) }, { destIata: String(id) }] }, take: 20 }),
                prisma.flight.count({ where: { OR: [{ departureIata: String(id) }, { arrivalIata: String(id) }] } }),
            ]);

            reportData = {
                title: `Airport Report: ${airport.name}`,
                generatedAt: new Date().toISOString(),
                airport,
                incidents,
                routes,
                recentFlightCount: flightCount,
            };
        } else if (type === 'route' && id) {
            const route = await prisma.route.findUnique({ where: { id: parseInt(String(id)) } });
            if (!route) return res.status(404).json({ error: 'Route not found' });

            const [origin, dest, flights] = await Promise.all([
                prisma.airport.findUnique({ where: { iata: route.originIata } }),
                prisma.airport.findUnique({ where: { iata: route.destIata } }),
                prisma.flight.findMany({
                    where: { departureIata: route.originIata, arrivalIata: route.destIata, airlineIata: route.airlineIata },
                    take: 20,
                    orderBy: { scheduledDeparture: 'desc' },
                }),
            ]);

            reportData = {
                title: `Route Report: ${route.originIata} → ${route.destIata}`,
                generatedAt: new Date().toISOString(),
                route,
                origin,
                destination: dest,
                recentFlights: flights,
            };
        } else if (type === 'summary') {
            // Summary report with aggregated stats
            const [
                totalFlights,
                activeFlights,
                delayedFlights,
                airports,
                airlines,
                routes,
                incidents
            ] = await Promise.all([
                prisma.flight.count(),
                prisma.flight.count({ where: { status: 'active' } }),
                prisma.flight.count({ where: { status: 'delayed' } }),
                prisma.airport.findMany({ orderBy: { otpPercent: 'desc' }, take: 10 }),
                prisma.airline.findMany({ orderBy: { otpPercent: 'desc' } }),
                prisma.route.findMany({ orderBy: { reliabilityIndex: 'desc' }, take: 10 }),
                prisma.incident.findMany({ where: { resolved: false }, orderBy: { date: 'desc' }, take: 10 }),
            ]);

            reportData = {
                title: 'Aviation Reliability Summary Report',
                generatedAt: new Date().toISOString(),
                overview: {
                    totalFlights,
                    activeFlights,
                    delayedFlights,
                    delayRate: totalFlights > 0 ? ((delayedFlights / totalFlights) * 100).toFixed(1) + '%' : '0%',
                },
                topAirports: airports,
                airlines,
                topRoutes: routes,
                activeIncidents: incidents,
            };
        }

        // Handle different formats
        if (format === 'csv') {
            // Generate CSV
            const csv = generateCSV(reportData);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
            return res.status(200).send(csv);
        }

        return res.status(200).json(reportData);
    } catch (error) {
        console.error('Error generating report:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}

function generateCSV(data: Record<string, unknown>): string {
    const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, string> => {
        const result: Record<string, string> = {};
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}_${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
            } else if (Array.isArray(value)) {
                result[newKey] = JSON.stringify(value);
            } else {
                result[newKey] = String(value ?? '');
            }
        }
        return result;
    };

    const flattened = flattenObject(data);
    const headers = Object.keys(flattened).join(',');
    const values = Object.values(flattened).map(v => `"${v.replace(/"/g, '""')}"`).join(',');

    return `${headers}\n${values}`;
}
