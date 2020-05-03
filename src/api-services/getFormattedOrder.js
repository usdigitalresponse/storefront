const { fetchTable } = require('../api-services/airtableHelper');

export function getFormattedOrder(orderId) {
  return new Promise(async (resolve, reject) => {
    try {
      const orderResult = await fetchTable('Orders', {
        view: 'Orders to Fulfill',
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

      order.items = itemResult.map((row) => {
        return row.fields;
      });

      const allInventoryIds = order.items.map((item) => {
        return item['Inventory'][0];
      });
      console.log('inventoryIds', allInventoryIds);

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
