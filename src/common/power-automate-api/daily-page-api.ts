import axios, { AxiosInstance } from "axios";

export class DailyPageAPI {
  private instance: AxiosInstance;
  private endpointUrl = ''
  constructor() {
    this.instance = this.init();
    this.endpointUrl = process.env.POWER_AUTOMATE_DAILY_PAGE_ENDPOINT!;
  }
  private init() {
    const instance = axios.create();
    return instance;
  }

  async createDailyPageRecord(url: string) {
    this.instance.post(this.endpointUrl, {
      url
    });
  }
}