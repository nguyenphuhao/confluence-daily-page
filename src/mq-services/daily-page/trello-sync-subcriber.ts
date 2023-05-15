import { DirectSubcriber } from "@/common/message-broker/rabbitmq/subcribers/direct";
import DailyPageService from "@/services/daily-page";
import { DAILY_PAGE_EXCHANGE, DAILY_PAGE_QUEUE, TRELLO_SYNC_ROUTE } from "./config";
import { Subcriber } from "../interface";
import { DailyPageAPI } from "@/common/power-automate-api/daily-page-api";
import { ConfluenceAPI } from "@/common/confluence-api";

type TaskId = {
  taskId: string
}
export class TrelloSyncSubcriber implements Subcriber {
  constructor(private messageBroker: DirectSubcriber, private confluence: ConfluenceAPI, private dailyPageAPI: DailyPageAPI) {
    process.env.TZ = 'Asia/Bangkok';
  }
  subcribe() {
    this.messageBroker.subcribe<Partial<TaskId>>({
      exchange: DAILY_PAGE_EXCHANGE,
      queue: DAILY_PAGE_QUEUE,
      routingKey: TRELLO_SYNC_ROUTE
    }, async (params) => {
      try {
        if (params.taskId) {
          await this.sync(params.taskId);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
  }

  async sync(taskId: string) {
    try {
      const task = await this.confluence.getLongTask(taskId);
      if (!task?.successful) {
        console.log('sync', 'in progress');
        throw new Error('in progress');
      }
      console.log('task', task);
      const detail = task?.additionalDetails;
      await this.dailyPageAPI.createDailyPageRecord(`${process.env.CONFLUENCE_HOST}/wiki${detail.destinationUrl}`)
      return detail;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
