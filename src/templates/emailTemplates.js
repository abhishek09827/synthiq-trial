const EmailTemplates = {
alertTemplate(name, alertMessage){ `
  <h1>Alert Notification</h1>
  <p>Hello ${name},</p>
  <p>${alertMessage}</p>
  <p>Regards,<br>Your Company</p>
`},
reportTemplate(name, reportContent){ `
  <h1>Weekly Report</h1>
  <p>Hello ${name},</p>
  <p>Here is your weekly report:</p>
  <pre>${reportContent}</pre>
  <p>Regards,<br>Your Company</p>
`},
}
export default EmailTemplates;