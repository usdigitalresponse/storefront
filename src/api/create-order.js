const { sendConfirmationEmail } = require('../api-services/send-confirmation-email');

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

    const requiredFields = ['type', 'fullName', 'phone', 'email', , 'amount', 'items'];
    const requiredDeliveryFields = requiredFields.concat(['street1', 'city', 'state', 'zip']);
    const requiredPickupFields = requiredFields.concat(['pickupLocationId']);

    if (orderIntent.type === 'Delivery') {
      requiredDeliveryFields.forEach((field) => {
        if (!orderIntent[field]) {
          throw new Error('Invalid Order Intent: ' + field + ' not set');
        }
      });
    } else if (orderIntent.type === 'Pickup') {
      requiredPickupFields.forEach((field) => {
        if (!orderIntent[field]) {
          throw new Error('Invalid Order Intent: ' + field + ' not set');
        }
      });
    } else {
      requiredFields.forEach((field) => {
        if (!orderIntent[field]) {
          throw new Error('Invalid Order Intent: ' + field + ' not set');
        }
      });
    }

    const requiredItemFields = ['id', 'quantity'];
    orderIntent.items.map((item) => {
      requiredItemFields.map((field) => {
        if (!item[field]) {
          throw new Error('Invalid Order Intent item: ' + field + ' not set');
        }
      });
    });

    const deliveryPreferences = [];
    if (orderIntent.deliveryPref_weekends) deliveryPreferences.push('Weekends')
    if (orderIntent.deliveryPref_weekdays) deliveryPreferences.push('Weekdays')
    if (orderIntent.deliveryPref_mornings) deliveryPreferences.push('Mornings')
    if (orderIntent.deliveryPref_afternoons) deliveryPreferences.push('Afternoons')
    if (orderIntent.deliveryPref_evenings) deliveryPreferences.push('Evenings')

    const orders = await base('Orders').create([
      {
        fields: {
          'Order Status': 'Paid',
          'Type': orderIntent.type,
          'Name': orderIntent.fullName,
          'Email': orderIntent.email,
          'Phone Number': orderIntent.phone,
          'address_street1': orderIntent.street1,
          'address_street2': orderIntent.street2,
          'address_city': orderIntent.city,
          'address_state': orderIntent.state,
          'address_zip': orderIntent.zip,
          'Pickup Location': [orderIntent.pickupLocationId],
          'Stripe Payment ID': orderIntent.stripePaymentId,
          'Delivery Preferences': deliveryPreferences,
          Amount: orderIntent.amount,
        },
        typecase: true
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

    try {
      const emailResult = await sendConfirmationEmail(orders[0].fields['Order ID']);
    } catch (error) {
      console.log('Error sending confirmation email', error);
    }

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
