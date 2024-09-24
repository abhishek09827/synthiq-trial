import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email through Resend
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: 'abhisekk9827@gmail.com',
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
