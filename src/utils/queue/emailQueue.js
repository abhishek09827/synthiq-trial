import Queue from 'bullmq';
import { sendEmail } from '../../services/emailService.js';

export const emailQueue = new Queue('email', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

const processor = async (job) => {
  const { email, subject, html } = job.data;
  await sendEmail(email, subject, html);
};

emailQueue.process(processor);

emailQueue.on('failed', async (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
  if (job.attemptsMade < 3) {
    await job.retry();
  }
});