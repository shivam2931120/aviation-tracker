import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { search, limit = '50', offset = '0' } = req.query;

        const where = search
            ? {
                OR: [
                    { iata: { contains: String(search), mode: 'insensitive' as const } },
                    { name: { contains: String(search), mode: 'insensitive' as const } },
                    { city: { contains: String(search), mode: 'insensitive' as const } },
                    { country: { contains: String(search), mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [airports, total] = await Promise.all([
            prisma.airport.findMany({
                where,
                take: parseInt(String(limit)),
                skip: parseInt(String(offset)),
                orderBy: { totalFlights: 'desc' },
            }),
            prisma.airport.count({ where }),
        ]);

        // Get related incident counts for each airport
        const airportsWithStats = await Promise.all(
            airports.map(async (airport) => {
                const incidentCount = await prisma.incident.count({
                    where: { airportIata: airport.iata, resolved: false },
                });
                return {
                    ...airport,
                    activeIncidents: incidentCount,
                };
            })
        );

        return res.status(200).json({
            data: airportsWithStats,
            pagination: {
                total,
                limit: parseInt(String(limit)),
                offset: parseInt(String(offset)),
                hasMore: parseInt(String(offset)) + airports.length < total,
            },
        });
    } catch (error) {
        console.error('Error fetching airports:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
