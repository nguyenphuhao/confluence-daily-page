import { ConfluenceAPI } from '@/common/confluence-api';
import moment from '@/common/moment';
import { IMessagePublisher } from '@/common/message-broker/rabbitmq/publisher/interface';
import { DAILY_PAGE_EXCHANGE, TRELLO_SYNC_ROUTE } from '@/mq-services/daily-page/config';
import { Logger } from '@/common/logger/interface';

class DailyPageService {
  constructor(private confluence: ConfluenceAPI, private messageBroker: IMessagePublisher, private logger: Logger) {
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
        this.logger.warn('latestPage not found')
        return;
      }

      const task = await this.confluence.duplicatePage({
        parentPageId: dailyStandupPage.id, fromPageId: latestPage?.id, title, search: latestPage?.title, prefix
      });
      if (!task) {
        this.logger.warn('task not found');
        return;
      }
      this.messageBroker.publish(DAILY_PAGE_EXCHANGE, TRELLO_SYNC_ROUTE, {
        taskId: task.id
      });
      this.logger.info(task, 'Task found');
      return task;
    } catch (error) {
      this.logger.error(error, 'Error in duplicatePage');
      throw error;
    }
  }
}
export default DailyPageService;