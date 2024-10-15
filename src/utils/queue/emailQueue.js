import { Queue, Worker } from 'bullmq';
import { sendEmail } from '../../services/emailService.js';

export const emailQueue = new Queue('email', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

const processor = async (job) => {
  const { email, subject, html } = job.data;
  console.log("Processing job data");
  try {
    await sendEmail(email, subject, html);
    console.log(`Email sent to ${email} with subject "${subject}"`);
  } catch (error) {
    console.error(`Failed to send email to ${email} with subject "${subject}":`, error);
    throw error;
  }
};

const emailWorker = new Worker('email', processor, {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

emailWorker.on('failed', async (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
  if (job.attemptsMade < 3) {
    await job.retry();
  }
});

emailQueue.on('error', (error) => {
  console.error('Error adding job to queue:', error);
});
