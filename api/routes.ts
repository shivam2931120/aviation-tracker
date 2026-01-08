import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            airline,
            origin,
            destination,
            sortBy = 'reliabilityIndex',
            order = 'desc',
            limit = '50',
            offset = '0'
        } = req.query;

        const where: Record<string, unknown> = {};
        if (airline) where.airlineIata = String(airline);
        if (origin) where.originIata = String(origin);
        if (destination) where.destIata = String(destination);

        const orderBy: Record<string, 'asc' | 'desc'> = {};
        const sortField = String(sortBy);
        orderBy[sortField] = order === 'asc' ? 'asc' : 'desc';

        const [routes, total] = await Promise.all([
            prisma.route.findMany({
                where,
                take: parseInt(String(limit)),
                skip: parseInt(String(offset)),
                orderBy,
            }),
            prisma.route.count({ where }),
        ]);

        // Enrich routes with airport names
        const enrichedRoutes = await Promise.all(
            routes.map(async (route) => {
                const [origin, destination] = await Promise.all([
                    prisma.airport.findUnique({
                        where: { iata: route.originIata },
                        select: { name: true, city: true }
                    }),
                    prisma.airport.findUnique({
                        where: { iata: route.destIata },
                        select: { name: true, city: true }
                    }),
                ]);

                return {
                    ...route,
                    originCity: origin?.city || route.originIata,
                    originName: origin?.name || route.originIata,
                    destCity: destination?.city || route.destIata,
                    destName: destination?.name || route.destIata,
                };
            })
        );

        return res.status(200).json({
            data: enrichedRoutes,
            pagination: {
                total,
                limit: parseInt(String(limit)),
                offset: parseInt(String(offset)),
                hasMore: parseInt(String(offset)) + routes.length < total,
            },
        });
    } catch (error) {
        console.error('Error fetching routes:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
