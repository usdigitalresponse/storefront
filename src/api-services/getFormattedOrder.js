const { fetchTable, findRecord } = require('../api-services/airtableHelper');

export function getFormattedOrder(orderId, view) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!orderId) {
        throw new Error('No order id set');
      }

      let orderResult = await fetchTable('Orders', {
        view: 'All Orders',
        filterByFormula: `{Order ID} = "${orderId}"`,
      });

      if (!orderResult || !orderResult.length) {
        throw new Error('Order not found for ID: ' + orderId);
      }

      const order = orderResult[0].fields;

      const itemResult = await fetchTable('Order Items', {
        view: 'Grid view',
        filterByFormula: `{Order} = "${order['Order ID']}"`,
      });

      order.items = itemResult.map((row) => {
        return row.fields;
      });

      if (order['Type'] === 'Pickup' && order['Pickup Location'].length) {
        const pickupLocation = await findRecord('Pickup Locations', order['Pickup Location'][0]);

        if (pickupLocation) {
          order.pickupAddress = pickupLocation.fields['Address'];
          order.pickupEmail = pickupLocation.fields['Email'];
          order.pickupName = pickupLocation.fields['Name'];
        }
      }

      resolve(order);
    } catch (error) {
      reject(error);
    }
  });
}
