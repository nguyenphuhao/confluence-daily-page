// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import DailyPageService from '../../../services/daily-page';
import { ConfluenceAPI } from '@/common/confluence-api';
import { MessagePublisher } from '@/common/message-broker/rabbitmq/publisher';
import { RabbitMQConnection } from '@/common/message-broker/rabbitmq/connection';
import toResponse from '@/common/helpers/toResponse';
import moment from 'moment-timezone';
type Data = {
  message: string
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    moment.tz.setDefault(process.env.TIMEZONE_ASIA_BANGKOK);
    const { parentPageId, prefix } = req.body;
    const mqConnection = RabbitMQConnection.getConnection();

    const service = new DailyPageService(
      new ConfluenceAPI(),
      new MessagePublisher(mqConnection),
    );
    const result = await service.duplicatePage(parentPageId, prefix);
    res.status(200).json(toResponse(result));
  } catch (error) {
    res.status(500).json({ message: (error as any).message || 'Internal server error' });
  }
}
