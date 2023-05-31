import type { NextApiRequest, NextApiResponse } from 'next'
import { ConfluenceAPI } from '@/common/confluence-api';
import { RabbitMQConnection } from '@/common/message-broker/rabbitmq/connection';
import { SyncSubcriber } from '@/mq-services/daily-page/sync-subcriber';
import { DirectSubcriber } from '@/common/message-broker/rabbitmq/subcribers/direct';
import { toSuccessResponse } from '@/common/helpers/toResponse';
import { DailyPageAPI } from '@/common/power-automate-api/daily-page-api';
import { PinoLogger } from '@/common/logger/pino';
import DailyPageService from '@/services/daily-page';
import { MessagePublisher } from '@/common/message-broker/rabbitmq/publisher';
import { TrelloAPI } from '@/common/trello-api';
type Data = {
  message: string
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const mqConnection = RabbitMQConnection.getConnection();
    const logger = new PinoLogger();
    logger.info('sync calling...')
    const service = new DailyPageService(new ConfluenceAPI(), new MessagePublisher(mqConnection), new TrelloAPI(), new DailyPageAPI(), logger)
    // service.sync();
    logger.info('subcribed sync...')
    res.status(200).json(toSuccessResponse({}));
  } catch (error) {
    res.status(500).json({ message: (error as any).message || 'Internal server error' });
  }
}
