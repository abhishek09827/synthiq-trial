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
        if (!html) {
          throw new Error("Email content (HTML) is missing");
        }
    
        const response = await resend.emails.send({
          from: 'updates@synthiqcloud.com',  // Ensure this is a valid email or domain configured with Resend
          to,
          subject,
          html,
        });
    
        console.log('Email sent successfully:', response);
        return response;
      } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Throw the error so that the controller can handle it
      }
    
};
