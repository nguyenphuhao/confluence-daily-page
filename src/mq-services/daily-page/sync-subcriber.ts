import { DirectSubcriber } from "@/common/message-broker/rabbitmq/subcribers/direct";
import { DAILY_PAGE_EXCHANGE, DAILY_PAGE_QUEUE, TRELLO_SYNC_ROUTE } from "./config";
import { Subcriber } from "../interface";
import { DailyPageAPI } from "@/common/power-automate-api/daily-page-api";
import { ConfluenceAPI } from "@/common/confluence-api";
import { Logger } from "@/common/logger/interface";

type TaskId = {
  taskId: string
}
export class SyncSubcriber implements Subcriber {
  constructor(private messageBroker: DirectSubcriber, private confluence: ConfluenceAPI, private dailyPageAPI: DailyPageAPI, private logger: Logger) {
    this.logger.info('Init SyncSubcriber...')
  }
  subcribe() {
    this.messageBroker.subcribe<Partial<TaskId>>({
      exchange: DAILY_PAGE_EXCHANGE,
      queue: DAILY_PAGE_QUEUE,
      routingKey: TRELLO_SYNC_ROUTE
    }, async (params) => {
      try {
        this.logger.info(params, 'Start processing SYNCING...')
        if (params.taskId) {
          await this.sync(params.taskId);
        }
      } catch (error) {
        this.logger.error(error);
        throw error;
      }
    });
  }

  async sync(taskId: string) {
    try {
      const task = await this.confluence.getLongTask(taskId);
      if (!task?.successful) {
        this.logger.info('sync', 'in progress');
        throw new Error('in progress');
      }
      this.logger.info(task, 'Task syncing...');
      const detail = task?.additionalDetails;
      await this.dailyPageAPI.createDailyPageRecord(`${process.env.CONFLUENCE_HOST}/wiki${detail.destinationUrl}`);
      this.logger.info(detail.destinationUrl, 'Create url successfully');
      return detail;
    } catch (error) {
      this.logger.error(error, 'Sync error');
      throw error;
    }
  }
}
