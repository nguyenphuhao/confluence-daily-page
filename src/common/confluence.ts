import axios from 'axios';

// Set config defaults when creating the instance
const confluence = axios.create({
  baseURL: 'https://propine.atlassian.net'
});

// Alter defaults after instance has been created
confluence.defaults.headers.common['Authorization'] = `Basic ${Buffer.from(
  'hao.nguyen@propine.com:ATATT3xFfGF0jU4EKc4XfmkoX4EjQ7VoRHZFw2DKBfV7jsLKT9WnhXSCp_OEAmzxZsGAjnF0Orvd0X33LXvd6ZloJUTowqSOUY7C2gwP1uXug6NjRX3ZbiY9s4VkJa6GbInnaVUEHKogFdJ8bxUQ1DqDN_NCrFEei7de00pk0INmz8meuD7TNcY=163BCD5D'
).toString('base64')}`;
confluence.defaults.headers.common['Accept'] = 'application/json';
confluence.defaults.headers.common['Content-Type'] = 'application/json';

export default confluence;
