import { ConfluenceAPI } from '@/common/confluence-api';
import moment from '@/common/moment';
import { IMessagePublisher } from '@/common/message-broker/rabbitmq/publisher/interface';
import { DAILY_PAGE_EXCHANGE, TRELLO_SYNC_ROUTE } from '@/mq-services/daily-page/config';
import { Logger } from '@/common/logger/interface';
import { TrelloAPI } from '@/common/trello-api';
import { DailyPageAPI } from '@/common/power-automate-api/daily-page-api';

class DailyPageService {
  constructor(private confluence: ConfluenceAPI, private messageBroker: IMessagePublisher, private trello: TrelloAPI, private dailyPage: DailyPageAPI, private logger: Logger) {
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
        this.logger.warn('latestPage not found');
        return;
      }

      const task = await this.confluence.duplicatePage({
        parentPageId: dailyStandupPage.id, fromPageId: latestPage?.id, title, search: latestPage?.title, prefix
      });
      if (!task) {
        this.logger.warn('task not found');
        return;
      }
      // this.trello.updateList(task.id);
      // this.messageBroker.publish(DAILY_PAGE_EXCHANGE, TRELLO_SYNC_ROUTE, {
      //   taskId: task.id
      // });
      this.sync(task.id);
      this.logger.info(task, 'Task found');
      return task;
    } catch (error) {
      this.logger.error(error, 'Error in duplicatePage');
      throw error;
    }
  }

  async sync(taskId: string) {
    try {
      const task = await this.confluence.getLongTask(taskId);
      if (!task?.successful) {
        this.logger.info('sync', 'in progress');
        await this.sync(taskId);
      }
      this.logger.info(task, 'Task syncing...');
      const detail = task?.additionalDetails;
      await this.dailyPage.createDailyPageRecord(`${process.env.CONFLUENCE_HOST}/wiki${detail.destinationUrl}`);
      this.logger.info(detail.destinationUrl, 'Create url successfully');
      return detail;
    } catch (error) {
      this.logger.error(error, 'Sync error');
      throw error;
    }
  }

}
export default DailyPageService;