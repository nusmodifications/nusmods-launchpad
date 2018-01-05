const WebClient = require('@slack/client').WebClient;
const config = require('../config');

const token = config.slackAPIToken;
const channels = config.slackBroadcastChannels;

const web = new WebClient(token);

module.exports = function sendMessage(message) {
  if (!channels || !message) return;
  channels.forEach((channelId) => {
    web.chat
      .postMessage(channelId, message)
      .catch((err) => console.log('Slack bot message send error:', err));
  });
};
