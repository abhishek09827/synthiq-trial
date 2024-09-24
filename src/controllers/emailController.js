import { sendEmail } from '../services/emailService.js';
import { alertTemplate } from '../templates/alertTemplate.js';
import { reportTemplate } from '../templates/reportTemplate.js';

const EmailController = {
    // Trigger an alert notification email
 async sendAlertNotification(req, res) {
    const { email, name, alertMessage } = req.body;
    const htmlContent = alertTemplate(name, alertMessage);
    
    try {
      await sendEmail(email, 'Alert Notification', htmlContent);
      res.status(200).json({ message: 'Alert notification sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send alert notification' });
    }
  },
  
  // Trigger a report notification email
async sendReportNotification (req, res) {
    const { email, name, reportContent } = req.body;
    const htmlContent = reportTemplate(name, reportContent);
    
    try {
      await sendEmail(email, 'Weekly Report', htmlContent);
      res.status(200).json({ message: 'Report sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send report' });
    }
  }
}
export default EmailController;
