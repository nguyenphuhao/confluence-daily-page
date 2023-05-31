import { ConfluenceAPI } from '@/common/confluence-api';
import moment from '@/common/moment';
import { IMessagePublisher } from '@/common/message-broker/rabbitmq/publisher/interface';
import { DAILY_PAGE_EXCHANGE, TRELLO_SYNC_ROUTE } from '@/mq-services/daily-page/config';
import { Logger } from '@/common/logger/interface';
import { TrelloAPI } from '@/common/trello-api';
import { DailyPageAPI } from '@/common/power-automate-api/daily-page-api';
import { SimpleCache } from '@/common/simple-cache';

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
      SimpleCache.value = task.id;
      this.logger.info(task, 'Task found');
      return task;
    } catch (error) {
      this.logger.error(error, 'Error in duplicatePage');
      throw error;
    }
  }

  async sync(productPageId: string) {
    try {
      const dailyStandupPage = await this.confluence.getLastestDailyStandupPage(productPageId);
      const latestPage = await this.getLatestPage(dailyStandupPage.id);
      if (!latestPage) {
        this.logger.warn('latestPage not found');
        return;
      }

      const page = `${process.env.CONFLUENCE_HOST}/wiki/spaces/EN/pages/${latestPage.id}/${latestPage.title}`;
      await this.dailyPage.createDailyPageRecord(page);
      this.logger.info(page, 'Create url successfully');
      return page;
    } catch (error) {
      this.logger.error(error, 'Sync error');
      throw error;
    }
  }

}
export default DailyPageService;