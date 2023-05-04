import axios from 'axios';

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: 'https://api.trello.com'
});

// Alter defaults after instance has been created
instance.defaults.headers.common['Accept'] = 'application/json';
instance.defaults.headers.common['Content-Type'] = 'application/json';

type HTTPMethod = 'get' | 'post' | 'put' | 'delete';
const trelloAPI = <T>(path: string, method: HTTPMethod, params?: T,) => {
  const apiKey = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_SECRET_KEY;
  return instance[method](`${path}?key=${apiKey}&token=${token}`, params as any);
}

export default trelloAPI;
