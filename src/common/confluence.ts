import axios from 'axios';

const confluenceAPI = () => {
  // Set config defaults when creating the instance
  const confluence = axios.create({
    baseURL: 'https://propine.atlassian.net'
  });

  // Alter defaults after instance has been created
  confluence.defaults.headers.common['Authorization'] = `Basic ${Buffer.from(
    `${process.env.CONFLUENCE_USERNAME}:${process.env.CONFLUENCE_API_KEY}`
  ).toString('base64')}`;
  confluence.defaults.headers.common['Accept'] = 'application/json';
  confluence.defaults.headers.common['Content-Type'] = 'application/json';
  return confluence;
}
export default confluenceAPI;
