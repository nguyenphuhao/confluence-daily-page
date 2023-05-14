import { ConfluenceAPI } from '@/common/confluence-api';
import moment from 'moment';
import { TrelloAPI } from '@/common/trello-api';
import { IMessagePublisher } from '@/common/message-broker/rabbitmq/publisher/interface';
import { DAILY_PAGE_EXCHANGE, TRELLO_SYNC_ROUTE } from '@/mq-services/daily-page/config';

class DailyPageService {
  constructor(private confluence: ConfluenceAPI, private trello: TrelloAPI, private messageBroker: IMessagePublisher) {

  }
  private async getLatestPage(parentPageId: string) {
    try {
      const pages = await this.confluence.getChildrenPages(parentPageId)
      if (!pages[0]) {
        return;
      }
      return pages[0];
    } catch (error) {
      throw error;
    }
  }
  private getCurrentTitle() {
    const now = moment();
    return now.format('D MMM');
  }

  async duplicatePage(parentPageId = '428310577', prefix?: string) {
    try {
      const title = this.getCurrentTitle();
      const latestPage = await this.getLatestPage(parentPageId);
      if (!latestPage) {
        return;
      }

      const task = await this.confluence.duplicatePage({
        parentPageId, fromPageId: latestPage?.id, title, search: latestPage?.title, prefix
      });
      if (!task) {
        return;
      }

      setTimeout(() => {
        this.messageBroker.publish(DAILY_PAGE_EXCHANGE, TRELLO_SYNC_ROUTE, {
          taskId: task.id
        });
      }, 5000);
      return task;
    } catch (error) {
      console.error(error);
      throw error;
    }
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
      await this.trello.createNewCard({
        name: `${process.env.CONFLUENCE_HOST}/wiki${detail.destinationUrl}`,
        desc: detail.destinationId
      });
      return detail;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
export default DailyPageService;