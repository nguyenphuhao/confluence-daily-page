// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import DailyPageService from '../../../services/daily-page';
import { ConfluenceAPI } from '@/common/confluence-api';
import { TrelloAPI } from '@/common/trello-api';
import { MessagePublisher } from '@/common/message-broker/rabbitmq/publisher';
import { RabbitMQConnection } from '@/common/message-broker/rabbitmq/connection';
import { TrelloSyncSubcriber } from '@/mq-services/daily-page/trello-sync-subcriber';
import { DirectSubcriber } from '@/common/message-broker/rabbitmq/subcribers/direct';
import toResponse from '@/common/helpers/toResponse';
type Data = {
  message: string
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { parentPageId, prefix } = req.body;
    const mqConnection = RabbitMQConnection.getConnection();

    const service = new DailyPageService(
      new ConfluenceAPI(),
      new TrelloAPI(),
      new MessagePublisher(mqConnection)
    );
    new TrelloSyncSubcriber(new DirectSubcriber(mqConnection), service).subcribe();
    const result = await service.duplicatePage(parentPageId, prefix);
    res.status(200).json(toResponse(result));
  } catch (error) {
    res.status(500).json({ message: (error as any).message || 'Internal server error' });
  }
}
