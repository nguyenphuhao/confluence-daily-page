import axios, { AxiosInstance } from 'axios';
import { CreateNewCardParams } from './types';
const defaultListId = '6451fbf37248445542d2d75d';
export class TrelloAPI {
  private trello: AxiosInstance;
  constructor() {
    this.trello = this.init();
  }
  private init() {
    const instance = axios.create({
      baseURL: process.env.TRELLO_API_HOST
    });

    // Alter defaults after instance has been created
    instance.defaults.headers.common['Accept'] = 'application/json';
    instance.defaults.headers.common['Content-Type'] = 'application/json';
    // Add a request interceptor
    instance.interceptors.request.use(function (config) {
      config.params = {
        ...config.params,
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_SECRET_KEY
      }
      return config;
    }, function (error) {
      // Do something with request error
      return Promise.reject(error);
    });
    return instance;
  }

  getList(idList?: string) {
    const listId = idList || defaultListId;
    return this.trello.get(`1/lists/${listId}`);
  }

  updateList(name: string, idList?: string) {
    const listId = idList || defaultListId;
    return this.trello.put(`1/lists/${listId}`, {
      name
    });
  }

  createNewCard(params: CreateNewCardParams) {
    const {
      name = '',
      desc = '',
      idList = defaultListId
    } = params;
    return this.trello.post(`1/cards`, {
      name,
      desc,
      idList
    });
  }
}
