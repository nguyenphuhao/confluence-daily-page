import { MessageSubcriber } from "@/common/message-broker/rabbitmq/subcribers/interface";
import { TrelloSyncSubcriber } from "./daily-page/trello-sync-subcriber";

class MessageQueueService {
  private subcribers: MessageSubcriber[] = [];
  constructor() {
    this.subcribers.push();
  }

  start() {

  }
}