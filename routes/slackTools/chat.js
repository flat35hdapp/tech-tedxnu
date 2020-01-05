/*global process*/
require('dotenv').config();
const axios = require("axios");
const qs = require('qs');
const api_url = 'https://slack.com/api';
const slack_oauth_token = process.env.SLACK_OAUTH_TOKEN;

const postMessage = async (to,text) => {
  const args = {
    "token": slack_oauth_token,
    "channel": to,
    "text": text,
  };
  const result = await axios.post(`${api_url}/chat.postMessage`,qs.stringify(args));
  return result;
};
module.exports = {postMessage};
