import { DirectSubcriber } from "@/common/message-broker/rabbitmq/subcribers/direct";
import DailyPageService from "@/services/daily-page";
import { DAILY_PAGE_EXCHANGE, DAILY_PAGE_QUEUE, TRELLO_SYNC_ROUTE } from "./config";
import { Subcriber } from "../interface";

type TaskId = {
  taskId: string
}
export class TrelloSyncSubcriber implements Subcriber {
  constructor(private messageBroker: DirectSubcriber, private dailyPageService: DailyPageService) { }
  subcribe() {
    this.messageBroker.subcribe<Partial<TaskId>>({
      exchange: DAILY_PAGE_EXCHANGE,
      queue: DAILY_PAGE_QUEUE,
      routingKey: TRELLO_SYNC_ROUTE
    }, async (params) => {
      try {
        if (params.taskId) {
          await this.dailyPageService.sync(params.taskId);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
  }
}
