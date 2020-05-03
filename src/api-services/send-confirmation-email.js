const { sendEmail } = require('./sendEmail');
const numeral = require('numeral');

const { getFormattedOrder } = require('../api-services/getFormattedOrder');

export const sendConfirmationEmail = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!orderId) {
        throw new Error('No orderId specified');
      }

      const order = await getFormattedOrder(orderId);

      const formattedAmount = numeral(order['Amount']).format('$0,0.00');

      const emailResult = await sendEmail({
        to: {
          email: order['Email'],
          name: order['Contact Name'],
        },
        subject: 'Order Confirmation',
        htmlBody: `
        <p>Thank you for your order.</p>
        <p>
          <b>Name:</b> ${order['Contact Name']}<br/>
          <b>Address:</b> ${order['Delivery Address']}<br/>
          <b>Total:</b> ${formattedAmount}<br/>
        </p>
        `,
      });

      return resolve(emailResult[0].statusCode === 202);
    } catch (error) {
      return reject(error.message);
    }
  });
};
