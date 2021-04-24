const { airTableRowsAsKey, valueOrNull } = require('../api-services/airtableHelper');
const sgMail = require('@sendgrid/mail');

export async function sendEmail(email, items) {
  return new Promise(async (resolve, reject) => {
    try {
      let Airtable = require('airtable');
      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      const configRecords = await base('Config')
        .select({ view: 'Grid view' })
        .firstPage();
      const configByKey = airTableRowsAsKey(configRecords);
      email.from = {
        email: valueOrNull(configByKey, 'email_from_address'),
        name: valueOrNull(configByKey, 'project_name'),
      };

      if (!email.from.email) {
        throw new Error('email_from_address not set in config');
      }

      if (!email.from.name) {
        throw new Error('project_name not set in config');
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      // const emailDetails = {
      //   to: email.to,
      //   from: from,
      //   subject: email.subject,
      //   text: email.htmlBody,
      //   html: email.htmlBody,
      // }
      email.html = email.htmlBody
      delete email.htmlBody
      email.text = email.html

      let dacl = false
      if (items) {
        console.dir({ items: items })
        items.some((item) => {
          console.dir({ Inventory: item.Inventory })
          if (item['Inventory Name'].indexOf("DACL") > -1) {
            dacl = true
            return true
          }
          return false
        })
      }
      if (dacl) {
        email.bcc = [{ email: valueOrNull(configByKey, 'dacl_item_bcc_email') }]
      }


      console.log({email})
      const result = await sgMail.send(email);
      resolve(result);
    } catch (error) {
      console.dir({msg: "sendEmail Error", error})
      reject(error);
    }
  });
}
