// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import DailyPageService from '../../../services/daily-page';
import { ConfluenceAPI } from '@/common/confluence-api';
import { MessagePublisher } from '@/common/message-broker/rabbitmq/publisher';
import { RabbitMQConnection } from '@/common/message-broker/rabbitmq/connection';
import { toSuccessResponse, toBadRequestResponse } from '@/common/helpers/toResponse';
import { isEmpty } from 'lodash';
type Data = {
  message: string
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { prefix } = req.body;

    const mqConnection = RabbitMQConnection.getConnection();

    const service = new DailyPageService(
      new ConfluenceAPI(),
      new MessagePublisher(mqConnection),
    );
    const result = await service.duplicatePage(process.env.CONFLUENCE_DAILY_PAGE_ROOT_ID!, prefix);
    res.status(200).json(toSuccessResponse(result));
  } catch (error) {
    res.status(500).json({ message: (error as any).message || 'Internal server error' });
  }
}
