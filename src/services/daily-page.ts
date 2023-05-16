import { ConfluenceAPI } from '@/common/confluence-api';
import moment from '@/common/moment';
import { IMessagePublisher } from '@/common/message-broker/rabbitmq/publisher/interface';
import { DAILY_PAGE_EXCHANGE, TRELLO_SYNC_ROUTE } from '@/mq-services/daily-page/config';

class DailyPageService {
  constructor(private confluence: ConfluenceAPI, private messageBroker: IMessagePublisher) {
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

  async duplicatePage(productPageId: string, prefix?: string) {
    try {
      const title = this.getCurrentTitle();
      const dailyStandupPage = await this.confluence.getLastestDailyStandupPage(productPageId);
      const latestPage = await this.getLatestPage(dailyStandupPage.id);
      if (!latestPage) {
        return;
      }

      const task = await this.confluence.duplicatePage({
        parentPageId: dailyStandupPage.id, fromPageId: latestPage?.id, title, search: latestPage?.title, prefix
      });
      if (!task) {
        return;
      }
      this.messageBroker.publish(DAILY_PAGE_EXCHANGE, TRELLO_SYNC_ROUTE, {
        taskId: task.id
      });
      return task;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
export default DailyPageService;