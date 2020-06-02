const { fetchTable } = require('../api-services/airtableHelper');

export function getFormattedOrder(orderId, view) {
  return new Promise(async (resolve, reject) => {
    try {
      const orderResult = await fetchTable('Orders', {
        view: view,
        filterByFormula: `{Order ID} = ${orderId}`,
      });

      if (orderResult.length === 0) {
        throw new Error('Order not found for ID: ' + orderId);
      }

      const order = orderResult.map((row) => row.fields)[0];

      const itemResult = await fetchTable('Order Items', {
        view: 'Grid view',
        filterByFormula: `{Order} = "${orderId}"`,
      });

      if (order['Type'] === 'Pickup') {
        const pickupLocations = await fetchTable('Pickup Locations', {
          view: 'Grid view',
        });
        const pickupAddresses = pickupLocations
          .filter((row) => row.id === order['Pickup Location'][0])
          .map((row) => row.fields['Address']);
        order.pickupAddress = pickupAddresses[0];
      }

      order.items = itemResult.map((row) => {
        return row.fields;
      });

      const allInventoryIds = order.items.map((item) => {
        return item['Inventory'][0];
      });

      const inventoryResult = await fetchTable('Inventory', {
        view: 'Grid view',
        filterByFormula: "OR( RECORD_ID() = '" + allInventoryIds.join("', RECORD_ID() = '") + "')",
      });
      const inventoryById = {};
      inventoryResult.map((row) => {
        inventoryById[row.id] = {
          id: row.id,
          name: row.fields['Name'],
        };
      });

      order.items = order.items.map((item) => {
        return {
          ...item,
          inventoryName:
            item.Inventory.length && inventoryById[item.Inventory[0]] ? inventoryById[item.Inventory[0]]['name'] : null,
        };
      });
      resolve(order);
    } catch (error) {
      reject(error);
    }
  });
}
