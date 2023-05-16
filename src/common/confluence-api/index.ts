import axios, { AxiosInstance } from 'axios';
import moment from '@/common/moment';
import { sortBy } from 'lodash';

export class ConfluenceAPI {
  private confluence: AxiosInstance;
  constructor() {
    this.confluence = this.init();
  }
  private init() {
    const confluence = axios.create({
      baseURL: process.env.CONFLUENCE_HOST + '/wiki/rest/api'
    });
    confluence.defaults.headers.common['Authorization'] = `Basic ${Buffer.from(
      `${process.env.CONFLUENCE_USERNAME}:${process.env.CONFLUENCE_API_KEY}`
    ).toString('base64')}`;
    confluence.defaults.headers.common['Accept'] = 'application/json';
    confluence.defaults.headers.common['Content-Type'] = 'application/json';
    return confluence;
  }

  async duplicatePage(params: {
    parentPageId: string;
    fromPageId: string;
    title: string;
    search: string;
    prefix?: string;
  }) {
    try {
      const { parentPageId, fromPageId, title, search, prefix } = params;
      const res = await this.confluence.post(`/content/${fromPageId}/pagehierarchy/copy`, {
        "copyAttachments": true,
        "copyPermissions": true,
        "copyProperties": true,
        "copyLabels": true,
        "copyCustomContents": true,
        "copyDescendants": true,
        "destinationPageId": parentPageId,
        "titleOptions": {
          "prefix": prefix,
          "replace": title,
          "search": search
        }
      });
      return res.data;
    } catch (error) {
      throw new Error((error as any).response.data.message);
    }
  }

  async getLongTask(taskId: string): Promise<{
    successful: boolean;
    additionalDetails: {
      destinationUrl: string,
      destinationId: string
    }
  }> {
    try {
      const res = await this.confluence.get(`/longtask/${taskId}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  async getChildrenPages(parentPageId: string): Promise<{
    id: string;
    title: string;
    createdDate: string;
  }[]> {
    try {
      const res = await this.confluence.get(`/content/${parentPageId}/descendant/page`);
      const data = res?.data?.results;
      if (!data) {
        return [];
      }
      const pages = data.map((p: any) => {
        return {
          id: p.id,
          title: p.title
        }
      });
      const sortedPages = sortBy(pages, (p) => p.id).reverse();
      return sortedPages;
    } catch (error) {
      throw error;
    }
  }

  async getLastestDailyStandupPage(rootPageId: string): Promise<{
    id: string;
    title: string;
    createdDate: string;
  }> {
    try {
      const sprintPages = await this.getChildrenPages(rootPageId);
      const dailyStandupPage = sprintPages.find((p) => p.title.includes(process.env.CONFLUENCE_DAILY_STANDUP_PAGE_NAME!))
      return dailyStandupPage!;
    } catch (error) {
      throw error;
    }
  }
}
