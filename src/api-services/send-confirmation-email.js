const { sendEmail } = require('./sendEmail');
const numeral = require('numeral');
const moment = require('moment');

const { getFormattedOrder } = require('../api-services/getFormattedOrder');

export const sendOrderConfirmationEmail = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!orderId) {
        throw new Error('No orderId specified');
      }

      const order = await getFormattedOrder(orderId, 'Orders to Fulfill');

      const formattedAmount = numeral(order['Total']).format('$0,0.00');

      let orderItemText = '<ul>';
      order.items.map((item) => {
        orderItemText += '<li>' + item['Quantity'] + ' x ' + item['inventoryName'] + '</li>';
      });
      orderItemText += '</ul>';

      const emailOptions = {
        to: {
          email: order['Email'],
          name: order['Name'],
        },
        subject: 'Order Confirmation',
        htmlBody: `
        <p>Thank you for your order.</p>
        <p>
          <b>Name:</b> ${order['Name']}<br/>
          <b>Address:</b> ${order['Delivery Address']}<br/>
            ${orderItemText}

          <br/>
          <b>Total:</b> ${formattedAmount}<br/>
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

export const sendDonationConfirmationEmail = (donationSummary) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!donationSummary) {
        throw new Error('No donationSummary specified');
      }

      const formattedAmount = numeral(donationSummary.amount).format('$0,0.00');

      const emailOptions = {
        to: {
          email: donationSummary.email,
          name: donationSummary.fullName,
        },
        subject: 'Donation Confirmation',
        htmlBody: `
        <p>Thank you for your donation.</p>
        <p>
          <b>Name:</b> ${donationSummary.fullName}<br/>
          <b>Donated Amount:</b> ${formattedAmount}<br/>
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

      let orderItemText = '<ul>';
      order.items.map((item) => {
        orderItemText += '<li>' + item['Quantity'] + ' x ' + item['inventoryName'] + '</li>';
      });
      orderItemText += '</ul>';

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
            ${orderItemText}
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
