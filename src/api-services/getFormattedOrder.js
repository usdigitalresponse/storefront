const { fetchTable } = require('../api-services/airtableHelper');

export function getFormattedOrder(orderId, view) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('getting order result with orderId', orderId, 'and view', view);
      const orderResult = await fetchTable('Orders', {
        view: view,
        // filterByFormula: `{Order ID} = ${orderId}`,
      });
      console.log('got order result');

      if (orderResult.length === 0) {
        console.log('order id not found');
        throw new Error('Order not found for ID: ' + orderId);
      }

      console.log('getting order');
      const order = orderResult.filter((row) => row.fields['Order ID'] === orderId).map((row) => row.fields)[0];
      console.log('got order, getting itemResult');

      const itemResult = await fetchTable('Order Items', {
        view: 'Grid view',
        filterByFormula: `{Order} = "${orderId}"`,
      });
      console.log('got item result, getting pickup address');

      if (order['Type'] === 'Pickup') {
        const pickupLocations = await fetchTable('Pickup Locations', {
          view: 'Grid view',
        });
        const pickupAddresses = pickupLocations
          .filter((row) => row.id === order['Pickup Location'][0])
          .map((row) => row.fields['Address']);
        order.pickupAddress = pickupAddresses[0];
      }
      console.log('got pickup address', order.pickupAddress);

      order.items = itemResult.map((row) => {
        return row.fields;
      });

      console.log('got order.items, getting allInventoryIds');

      const allInventoryIds = order.items.map((item) => {
        return item['Inventory'][0];
      });

      console.log('got allInventoryIds, fetching inventory Result');

      const inventoryResult = await fetchTable('Inventory', {
        view: 'Grid view',
        filterByFormula: "OR( RECORD_ID() = '" + allInventoryIds.join("', RECORD_ID() = '") + "')",
      });

      console.log('got inventoryResult, mapping inventory');

      const inventoryById = {};
      inventoryResult.forEach((row) => {
        inventoryById[row.id] = {
          id: row.id,
          name: row.fields['Name'],
        };
      });

      console.log('created a map of the inventory, adding inventory items to order');

      order.items = order.items.map((item) => {
        return {
          ...item,
          inventoryName:
            item.Inventory.length && inventoryById[item.Inventory[0]] ? inventoryById[item.Inventory[0]]['name'] : null,
        };
      });

      console.log('finalized order object for return');

      resolve(order);
    } catch (error) {
      reject(error);
    }
  });
}
