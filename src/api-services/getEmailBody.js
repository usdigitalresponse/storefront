const { airTableRowsAsKey, fetchTable, getRecordValueForLanguage } = require('./airtableHelper');
let markdown = require('markdown-it')();
const numeral = require('numeral');
const DEFAULT_VIEW = 'Grid view';

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

      let deliverySchedule = '';
      if (isDelivery && order.address_zip) {
        const validZipcodeRecords = await fetchTable('Valid Zipcodes', {
          view: DEFAULT_VIEW,
          filterByFormula: `{Zip Code} = "${order.address_zip}"`,
        });

        if (validZipcodeRecords.length > 0 && validZipcodeRecords[0].fields['Linked Schedules']) {
          const zipcodeRecordLookup = validZipcodeRecords[0].fields['Linked Schedules']
            .map((schedule) => `RECORD_ID() = "${schedule}"`)
            .join(', ');

          const schedulesRecords = await fetchTable('Schedules', {
            view: DEFAULT_VIEW,
            fields: ['Start Time', 'End Time', 'Day'],
            filterByFormula: `OR(${zipcodeRecordLookup})`,
          });

          deliverySchedule = schedulesRecords
            .map((row) => {
              return `${row.fields['Day']}s from ${row.fields['Start Time']} to ${row.fields['End Time']}`;
            })
            .join(', ');
        }
      }

      const orderDetails = `
        <p style="margin-top: 0px;"></p>

        <p><b>Order Number:</b> ${order['Order ID']}
        </p>

        <p>This is a ${isDelivery ? 'delivery' : 'pickup'} order.
        </p>
        <b>${isDelivery ? 'Your Delivery Address' : 'Your Pickup Location'}:</b>
        <p style="white-space: pre-wrap; margin-top: 0px;">${
          isDelivery ? order['Delivery Address'] : order.pickupAddress
        }</p>
        ${deliverySchedule &&
          `<p style="margin-top: 0px;"></p>
            <b>Delivery Schedule:</b>
            <p style="white-space: pre-wrap; margin-top: 0px;">${deliverySchedule}</p>`}
        <b>Items Ordered:</b>
        ${orderItemList}
        ${orderAmount}
        `;

      let emailBody;
      switch(order['Order Status']) {
        case 'Donation Requested':
          emailBody = content.email_request_confirmation_body
            ? markdown
              .render(getRecordValueForLanguage(content.email_request_confirmation_body, 'en'))
                .replace('{orderDetails}', orderDetails)
                .replace(/\{pickupLocationName\}/g, pickupLocationName || 'The vendor')
                .replace(
                  /\{pickupOrDeliveryLanguage\}/g,
                  isDelivery ? 'for delivery' : `for pickup${pickupLocationName ? ` at ${pickupLocationName}` : ''}`,
                )
            : `<p>Thank you for your order. We have received your request for a donated item.</p><p>We will contact you with more information.</p>`;
          break;
        case 'Waitlist':
          emailBody = content.email_waitlist_confirmation_body
            ? markdown
                .render(getRecordValueForLanguage(content.email_waitlist_confirmation_body, 'en'))
                .replace('{orderDetails}', orderDetails)
                .replace(/\{pickupLocationName\}/g, pickupLocationName || 'The vendor')
                .replace(
                  /\{pickupOrDeliveryLanguage\}/g,
                  isDelivery ? 'for delivery' : `for pickup${pickupLocationName ? ` at ${pickupLocationName}` : ''}`,
                )
            : `<p>Thank you for your order. Due to the high demand, you have been added to
            the waitlist.</p><p>If our availability changes we will contact you. In the
            meantime, please do not submit another order.</p>`;
            break;
        default:
          let emailContent = content.email_order_confirmation_body;
          console.dir({ order });
          if (order.pickupName) {
            let enrolledContent = getRecordValueForLanguage(content.email_order_confirmation_body_enrolled, 'en')
            console.dir({enrolledContent, type: typeof enrolledContent, trim: enrolledContent.trim})
            if (enrolledContent && enrolledContent.trim() !== '')
              emailContent = enrolledContent || emailContent;
          }
          console.dir({ emailContent });
          emailBody = emailContent
            ? markdown
                .render(getRecordValueForLanguage(emailContent, 'en'))
                .replace('{orderDetails}', orderDetails)
                .replace(/\{pickupLocationName\}/g, pickupLocationName || 'The vendor')
                .replace(
                  /\{pickupOrDeliveryLanguage\}/g,
                  isDelivery ? 'for delivery' : `for pickup${pickupLocationName ? ` at ${pickupLocationName}` : ''}`,
                )
            : `<p>Thank you for your order.</p>
          ${orderDetails}`;
      }

      resolve(emailBody);
    } catch (error) {
      console.error(error)
      reject(error);
    }
  });
}
