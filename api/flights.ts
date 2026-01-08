import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            status,
            airline,
            departure,
            arrival,
            limit = '50',
            offset = '0'
        } = req.query;

        const where: Record<string, unknown> = {};
        if (status) where.status = String(status);
        if (airline) where.airlineIata = String(airline);
        if (departure) where.departureIata = String(departure);
        if (arrival) where.arrivalIata = String(arrival);

        const [flights, total] = await Promise.all([
            prisma.flight.findMany({
                where,
                take: parseInt(String(limit)),
                skip: parseInt(String(offset)),
                orderBy: { scheduledDeparture: 'desc' },
            }),
            prisma.flight.count({ where }),
        ]);

        // Enrich flights with airline and airport names
        const enrichedFlights = await Promise.all(
            flights.map(async (flight) => {
                const [airline, depAirport, arrAirport] = await Promise.all([
                    prisma.airline.findUnique({
                        where: { iata: flight.airlineIata },
                        select: { name: true }
                    }),
                    prisma.airport.findUnique({
                        where: { iata: flight.departureIata },
                        select: { name: true, city: true }
                    }),
                    prisma.airport.findUnique({
                        where: { iata: flight.arrivalIata },
                        select: { name: true, city: true }
                    }),
                ]);

                return {
                    ...flight,
                    airlineName: airline?.name || flight.airlineIata,
                    departureCity: depAirport?.city || flight.departureIata,
                    departureName: depAirport?.name || flight.departureIata,
                    arrivalCity: arrAirport?.city || flight.arrivalIata,
                    arrivalName: arrAirport?.name || flight.arrivalIata,
                };
            })
        );

        return res.status(200).json({
            data: enrichedFlights,
            pagination: {
                total,
                limit: parseInt(String(limit)),
                offset: parseInt(String(offset)),
                hasMore: parseInt(String(offset)) + flights.length < total,
            },
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
