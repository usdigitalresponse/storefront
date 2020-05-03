exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_API_KEY) {
      throw new Error('Airtable API keys not set');
    }

    var Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    const orderIntent = JSON.parse(event.body);

    // validate orderIntent
    if (!orderIntent) {
      throw new Error('Invalid Order Intent');
    }

    console.log('orderIntent', orderIntent);

    const requiredFields = ['fullName', 'deliveryAddress', 'amount', 'items'];

    requiredFields.map((field) => {
      if (!orderIntent[field]) {
        throw new Error('Invalid Order Intent: ' + field + ' not set');
      }
    });

    const requiredItemFields = ['id', 'quantity'];
    orderIntent.items.map((item) => {
      requiredItemFields.map((field) => {
        if (!item[field]) {
          throw new Error('Invalid Order Intent item: ' + field + ' not set');
        }
      });
    });

    const orders = await base('Orders').create([
      {
        fields: {
          'Contact Name': orderIntent.fullName,
          'Delivery Address': orderIntent.deliveryAddress,
          'Stripe Payment ID': orderIntent.stripePaymentId,
          Amount: orderIntent.amount,
        },
      },
    ]);

    const items = await base('Order Items').create(
      orderIntent.items.map((item) => {
        return {
          fields: {
            Order: [orders[0].id],
            Quantity: item.quantity,
            Inventory: [item.id],
          },
        };
      }),
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Order: {
          ...orders[0].fields,
          items: items.map((item) => item.fields),
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Error',
        error: error.message,
      }),
    };
  }
};
