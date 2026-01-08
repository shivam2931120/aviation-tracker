import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { limit = '50', offset = '0' } = req.query;

        const [airlines, total] = await Promise.all([
            prisma.airline.findMany({
                take: parseInt(String(limit)),
                skip: parseInt(String(offset)),
                orderBy: { otpPercent: 'desc' },
            }),
            prisma.airline.count(),
        ]);

        return res.status(200).json({
            data: airlines,
            pagination: {
                total,
                limit: parseInt(String(limit)),
                offset: parseInt(String(offset)),
                hasMore: parseInt(String(offset)) + airlines.length < total,
            },
        });
    } catch (error) {
        console.error('Error fetching airlines:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
