import { shouldNotify } from './userPreferenceService.js';
import { emailQueue } from '../queues/emailQueue.js';

const notificationTemplates = {
  HIGH_USAGE: (data) => ({
    subject: 'High Usage Alert',
    html: `Your usage (${data.usage}) is approaching your limit (${data.limit}).`,
  }),
  CRITICAL_USAGE: (data) => ({
    subject: 'Critical Usage Alert',
    html: `Your usage (${data.usage}) has almost reached your limit (${data.limit})!`,
  }),
  HIGH_BUDGET: (data) => ({
    subject: 'High Budget Alert',
    html: `Your spent amount (${data.spent}) is approaching your budget (${data.budget}).`,
  }),
  CRITICAL_BUDGET: (data) => ({
    subject: 'Critical Budget Alert',
    html: `Your spent amount (${data.spent}) has almost reached your budget (${data.budget})!`,
  }),
};

export const triggerNotification = async (email, event, data) => {
  if (await shouldNotify(email, event)) {
    const { subject, html } = notificationTemplates[event](data);
    await emailQueue.add({ email, subject, html });
  }
};