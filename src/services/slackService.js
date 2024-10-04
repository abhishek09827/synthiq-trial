import { WebClient } from '@slack/web-api';

// Initialize Slack client with the token from environment variables
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Sends a message to a specific Slack channel.
 * @param {string} channel - The Slack channel ID or name.
 * @param {string} message - The message to send.
 */
export const sendSlackNotification = async (channel, message) => {
  try {
    await slackClient.chat.postMessage({
      channel: channel, // Channel ID or name
      text: message,    // Message text
    });
    console.log(`Message sent to Slack channel: ${channel}`);
  } catch (error) {
    console.error(`Failed to send message to Slack: ${error}`);
  }
};
