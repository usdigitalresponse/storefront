const { airTableRowsAsKey, fetchTable } = require('./airtableHelper');
let markdown = require('markdown-it')();
const numeral = require('numeral');
const DEFAULT_VIEW = 'Grid view';

function getRecordValueForLanguage(record, language) {
  const val = record[language];
  return val ? val.trim() : '';
}

export function getEmailBody(order) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!order) {
        throw new Error('No order set');
      }

      const contentList = await fetchTable('Content', { view: DEFAULT_VIEW });
      const content = airTableRowsAsKey(contentList);

      let orderItemList = '<ul style="margin-top: 0px; margin-left: 5px; padding-left: 0px">';
      order.items.map((item) => {
        orderItemList += '<li>' + item['Quantity'] + ' x ' + item['Inventory Name'] + '</li>';
      });
      orderItemList += '</ul>';

      const formattedAmount = numeral(order['Subsidized'] ? 0 : order['Total']).format('$0,0.00');
      const orderAmount = order['Subsidized'] ? '' : `<b>Total:</b> ${formattedAmount} <br />`;
      const isDelivery = order['Type'] === 'Delivery';
      const pickupLocationName = order.pickupName;

      const orderDetails = `
        <p style="margin-top: 0px;"></p>
        <b>${isDelivery ? 'Delivery Address' : 'Pickup Location'}:</b>
        <p style="white-space: pre-wrap; margin-top: 0px;">${
          isDelivery ? order['Delivery Address'] : order.pickupAddress
        }</p>
        <b>Items ordered:</b>
        ${orderItemList}
        ${orderAmount}
        `;

      let emailBody;
      if (order['Order Status'] === 'Waitlist') {
        emailBody = content.email_waitlist_confirmation_body
          ? markdown
              .render(getRecordValueForLanguage(content.email_waitlist_confirmation_body, 'en'))
              .replace('{orderDetails}', orderDetails)
              .replace('{pickupLocationName}', pickupLocationName || 'The vendor')
          : `<p>Thank you for your order. Due to the high demand, you have been added to
          the waitlist.</p><p>If our availability changes we will contact you. In the
          meantime, please do not submit another order.</p>`;
      } else {
        emailBody = content.email_order_confirmation_body
          ? markdown
              .render(getRecordValueForLanguage(content.email_order_confirmation_body, 'en'))
              .replace('{orderDetails}', orderDetails)
              .replace('{pickupLocationName}', pickupLocationName || 'The vendor')
          : `<p>Thank you for your order.</p>
        ${orderDetails}`;
      }

      resolve(emailBody);
    } catch (error) {
      reject(error);
    }
  });
}
