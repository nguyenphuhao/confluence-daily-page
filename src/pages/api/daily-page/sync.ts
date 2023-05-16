// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import DailyPageService from '../../../services/daily-page';
import { ConfluenceAPI } from '@/common/confluence-api';
import { MessagePublisher } from '@/common/message-broker/rabbitmq/publisher';
import { RabbitMQConnection } from '@/common/message-broker/rabbitmq/connection';
import { TrelloSyncSubcriber } from '@/mq-services/daily-page/trello-sync-subcriber';
import { DirectSubcriber } from '@/common/message-broker/rabbitmq/subcribers/direct';
import { toSuccessResponse } from '@/common/helpers/toResponse';
import { DailyPageAPI } from '@/common/power-automate-api/daily-page-api';
type Data = {
  message: string
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const mqConnection = RabbitMQConnection.getConnection();
    new TrelloSyncSubcriber(
      new DirectSubcriber(mqConnection),
      new ConfluenceAPI(),
      new DailyPageAPI()
    ).subcribe();
    res.status(200).json(toSuccessResponse(true));
  } catch (error) {
    res.status(500).json({ message: (error as any).message || 'Internal server error' });
  }
}
