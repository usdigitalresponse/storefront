const { airTableRowsAsKey, valueOrNull } = require('../api-services/airtableHelper');
const sgMail = require('@sendgrid/mail');

export async function sendEmail(email) {
  return new Promise(async (resolve, reject) => {
    try {
      let Airtable = require('airtable');
      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      const configRecords = await base('Config')
        .select({ view: 'Grid view' })
        .firstPage();
      const configByKey = airTableRowsAsKey(configRecords);
      const from = {
        email: valueOrNull(configByKey, 'email_from_address'),
        name: valueOrNull(configByKey, 'project_name'),
      };

      if (!from.email) {
        throw new Error('email_from_address not set in config');
      }

      if (!from.name) {
        throw new Error('project_name not set in config');
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const result = await sgMail.send({
        to: email.to,
        from: from,
        subject: email.subject,
        text: email.htmlBody,
        html: email.htmlBody,
      });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}
