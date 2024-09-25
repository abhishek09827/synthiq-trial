const EmailTemplates = {
alertTemplate(name, alertMessage){ return `
    <div style="font-family: Arial, sans-serif;">
      <h1>Alert Notification</h1>
      <p>Hello ${name},</p>
      <p>${alertMessage}</p>
      <p>Best regards,<br>Your Company</p>
    </div>
  `},
reportTemplate(name, reportContent){ return`
  <h1>Weekly Report</h1>
  <p>Hello ${name},</p>
  <p>Here is your weekly report:</p>
  <pre>${reportContent}</pre>
  <p>Regards,<br>Your Company</p>
`},
}
export default EmailTemplates;