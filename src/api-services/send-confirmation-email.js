const {
  airTableRowsAsKey,
  fetchTable,
  getRecordValueForLanguage,
  DEFAULT_VIEW,
} = require('../api-services/airtableHelper');

const { sendEmail } = require('./sendEmail');
let markdown = require('markdown-it')();
const moment = require('moment');
const numeral = require('numeral');

const { getEmailBody } = require('./getEmailBody');
const { getFormattedOrder } = require('./getFormattedOrder');

const validEmailRegex = (email) => {
  if (!email || !email.trim().length === 0) {
    return false;
  }
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

export const sendOrderConfirmationEmailUser = (order) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!order) {
        throw new Error('No order specified');
      }

      const emailBody = await getEmailBody(order);

      const emailOptions = {
        to: {
          email: order['Email'],
          name: order['Name'],
        },
        subject: 'Order Confirmation',
        htmlBody: emailBody,
      };

      const emailResult = await sendEmail(emailOptions, order.items);

      return resolve(emailResult[0].statusCode === 202);
    } catch (error) {
      return reject(error.message);
    }
  });
};

export const sendDonationConfirmationEmail = (donationSummary) => {
  return new Promise(async (resolve, reject) => {
    const contentList = await fetchTable('Content', { view: DEFAULT_VIEW });
    const content = airTableRowsAsKey(contentList);

    try {
      if (!donationSummary) {
        throw new Error('No donationSummary specified');
      }

      const formattedAmount = numeral(donationSummary.total).format('$0,0.00');
      console.dir({ emailContent: content.email_donation_confirmation_body });
      const donationEmailCopy =
        getRecordValueForLanguage(content.email_donation_confirmation_body, 'en') ||
        '<p>Thank you for your donation.</p>';
      console.dir({ donationEmailCopy });

      let htmlTemplate;

      if (donationEmailCopy.indexOf(`{formattedAmount}`) === -1) {
        htmlTemplate = `
          ${donationEmailCopy}
          <p>
            <b>Name:</b> ${donationSummary.fullName}<br/>
            <b>Donated Amount:</b> ${formattedAmount}<br/>
          </p>
          `;
      } else {
        htmlTemplate = donationEmailCopy
          .replace(/\{formattedAmount\}/g, formattedAmount)
          .replace(/\{fullName\}/g, donationSummary.fullName);
      }
      console.dir({ htmlTemplate });

      const htmlBody = markdown.render(htmlTemplate);

      console.dir({ htmlBody });

      const emailOptions = {
        to: {
          email: donationSummary.email,
          name: donationSummary.fullName,
        },
        subject: 'Donation Confirmation',

        htmlBody: htmlBody,
      };

      console.dir({ emailOptions });

      const emailResult = await sendEmail(emailOptions);

      return resolve(emailResult[0].statusCode === 202);
    } catch (error) {
      console.error(error);
      return reject(error.message);
    }
  });
};

export const sendOrderDeliveryNotification = (orderId, deliveryDate) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!orderId) {
        throw new Error('No orderId specified');
      }
      if (!deliveryDate) {
        throw new Error('No deliveryDate specified');
      }

      const order = await getFormattedOrder(orderId, 'Orders To Deliver');

      let orderItemList = '<ul>';
      order.items.map((item) => {
        orderItemList += '<li>' + item['Quantity'] + ' x ' + item['inventoryName'] + '</li>';
      });
      orderItemList += '</ul>';

      const emailOptions = {
        to: {
          email: order['Email'],
          name: order['Name'],
        },
        subject: 'Your order is being delivered',
        htmlBody: `
        <p>Thank you for your order, you can expect a delivery on ${moment(deliveryDate).format('MM/DD/YYYY')}</p>
        <p>
          <b>Name:</b> ${order['Name']}<br/>
          <b>Address:</b> ${order['Delivery Address']}<br/>
            ${orderItemList}
        </p>
        `,
      };

      const emailResult = await sendEmail(emailOptions);

      return resolve(emailResult[0].statusCode === 202);
    } catch (error) {
      return reject(error.message);
    }
  });
};

export const sendOrderConfirmationEmailPartner = (order) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!order) {
        throw new Error('No order specified');
      }

      if (!order.notificationEmail) {
        return resolve('No pickup email specified');
      }

      if (!validEmailRegex(order.notificationEmail)) {
        console.log('Could not send pickup email to: ' + order.notificationEmail);
        return resolve();
      }

      let orderItemList = '<ul style="margin-top: 0px; margin-left: 5px; padding-left: 0px">';
      order.items.map((item) => {
        orderItemList += '<li>' + item['Quantity'] + ' x ' + item['Inventory Name'] + '</li>';
      });
      orderItemList += '</ul>';

      const formattedAmount = numeral(order['Subsidized'] ? 0 : order['Total']).format('$0,0.00');
      const orderAmount = order['Subsidized'] ? '' : `<b>Total:</b> ${formattedAmount} <br />`;
      const isDelivery = order['Type'] === 'Delivery';

      const emailOptions = {
        to: {
          email: order.notificationEmail,
          name: order.pickupName,
        },
        subject: 'Order Notification ID: ' + order['Order ID'],
        htmlBody: `
        <b>Name:</b>
        <p style="margin-top: 0px;">${order['Name']} | ${order['Email']}</p>
        <b>${isDelivery ? 'Delivery Address' : 'Pickup Location'}:</b>
        <p style="white-space: pre-wrap; margin-top: 0px;">${
          isDelivery ? order['Delivery Address'] : order.pickupAddress
        }</p>
        <b>Items ordered:</b>
        ${orderItemList}
        ${orderAmount}
        `,
      };

      const emailResult = await sendEmail(emailOptions);

      return resolve(emailResult[0].statusCode === 202);
    } catch (error) {
      return reject(error.message);
    }
  });
};
