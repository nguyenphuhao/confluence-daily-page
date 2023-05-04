// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import DailyPageService from '../../../services/daily-page';
type Data = {
    message: string
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        const { parentPageId, prefix } = req.body;
        const service = new DailyPageService();
        await service.duplicate(parentPageId, prefix);
        res.status(200).json({ message: 'Success' })
    } catch (error) {
        res.status(500).json({ message: (error as any).message });
    }
}
