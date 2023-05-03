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
  const apiKey = 'ca653e7f7e0fe8b85894d88dc13ddfb2';
  const token = 'ATTA2ce2d8dd56fe41f55eac1d5505bb2ed82cf815bd0cd415c7b8e99326b46bee04330D30B2';
  return instance[method](`${path}?key=${apiKey}&token=${token}`, params as any);
}

export default trelloAPI;
