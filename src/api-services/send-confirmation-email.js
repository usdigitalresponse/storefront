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
