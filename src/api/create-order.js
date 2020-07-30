const {
  sendOrderConfirmationEmailUser,
  sendOrderConfirmationEmailPartner,
} = require('../api-services/send-confirmation-email');
const { getFormattedOrder } = require('../api-services/getFormattedOrder');
const { airTableRowsAsKey, findRecord, fetchTable, DEFAULT_VIEW } = require ('../api-services/airtableHelper');

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

    const requiredFields = ['type', 'fullName', 'phone', 'email', 'subtotal', 'tax', 'total', 'items'];
    const requiredDeliveryFields = requiredFields.concat(['street1', 'city', 'state', 'zip']);
    const requiredPickupFields = requiredFields.concat(['pickupLocationId']);

    if (orderIntent.type === 'Delivery') {
      requiredDeliveryFields.forEach((field) => {
        if (orderIntent[field] == null) {
          throw new Error('Invalid Order Intent: ' + field + ' not set');
        }
      });
    } else if (orderIntent.type === 'Pickup') {
      requiredPickupFields.forEach((field) => {
        if (!orderIntent[field] == null) {
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

    // prevent duplicate orders
    const configRecords = await fetchTable('Config', { view: DEFAULT_VIEW });
    const configRecordsByKey = airTableRowsAsKey(configRecords);
    const shouldLimit = configRecordsByKey?.limit_to_one_order?.value === 'true' ? true : false;

    if (shouldLimit) {
      let existingOrders = await fetchTable('Orders', {
        view: DEFAULT_VIEW,
        filterByFormula: `AND({Name} = "${orderIntent.fullName}", {Email} = "${orderIntent.email}")`,
      });

      if (existingOrders && existingOrders.length > 0) {
        throw new Error('You have already placed an order. One order per person.');
      }
    }

    // collate delivery preferences
    const deliveryPreferences = [];
    if (orderIntent.deliveryPref_weekends) deliveryPreferences.push('Weekends');
    if (orderIntent.deliveryPref_weekdays) deliveryPreferences.push('Weekdays');
    if (orderIntent.deliveryPref_mornings) deliveryPreferences.push('Mornings');
    if (orderIntent.deliveryPref_afternoons) deliveryPreferences.push('Afternoons');
    if (orderIntent.deliveryPref_evenings) deliveryPreferences.push('Evenings');

    // get correct order status
    if (orderIntent.items.length === 1 && orderIntent.items[0].quantity === 1) {
      const product = await findRecord('Inventory', orderIntent.items[0].id)
      if (product && product.fields['Stock Remaining'] != null && product.fields['Stock Remaining'] <= 0) {
        orderIntent.status = 'Waitlist';
      }
    }

    const order = await base('Orders').create(
      {
        'Order Status': orderIntent.status,
        Type: orderIntent.type,
        Name: orderIntent.fullName,
        Email: orderIntent.email,
        'Phone Number': orderIntent.phone,
        address_street1: orderIntent.street1,
        address_street2: orderIntent.street2,
        address_city: orderIntent.city,
        address_state: orderIntent.state,
        Subsidized: orderIntent.subsidized,
        address_zip: orderIntent.zip,
        'Pickup Location': orderIntent.type === 'Pickup' ? [orderIntent.pickupLocationId] : undefined,
        'Stripe Payment ID': orderIntent.stripePaymentId,
        'Delivery Preferences': deliveryPreferences,
        Subtotal: orderIntent.subtotal,
        Discount: orderIntent.discount !== 0 ? orderIntent.discount : undefined,
        Tax: orderIntent.tax,
        Total: orderIntent.total,
        'Discount Code': orderIntent.discountCode,
        'Opt In Comms': orderIntent.optInComms,
        'Opt In Subsidy': orderIntent.optInSubsidy,
      },
      { typecast: true },
    );

    // process order items in batches of 10 (airtable limits to 10 records created per request)
    let iter = 0;
    const items = [];
    while (iter * 10 < orderIntent.items.length) {
      const start = iter * 10;
      const end = Math.min(iter * 10 + 10, orderIntent.items.length);
      const iterItems = await base('Order Items').create(
        orderIntent.items.slice(start, end).map((item) => {
          return {
            fields: {
              Order: [order.id],
              Quantity: item.quantity,
              Inventory: [item.id],
            },
          };
        }),
      );
      items.push(...iterItems);
      iter++;
    }

    // process question responses
    const questionResponses = Object.keys(orderIntent)
      .filter((field) => /^question-/.test(field))
      .reduce((acc, field) => {
        const [questionName, option] = field.split('_');
        const id = questionName.replace('question-', '');
        const val = orderIntent[field];

        if (!acc[id]) {
          if (option && val) {
            acc[id] = option;
          } else if (!option && typeof val === 'boolean') {
            acc[id] = val === true ? 'yes' : 'no';
          } else if (!option) {
            acc[id] = val;
          }
        } else {
          acc[id] += val ? `,${option}` : '';
        }

        return acc;
      }, {});

    const questionIds = Object.keys(questionResponses);
    if (questionIds.length) {
      await base('Response Items').create(
        questionIds.map((questionId) => {
          return {
            fields: {
              Question: [questionId],
              Order: [order.id],
              Response: questionResponses[questionId],
            },
          };
        }),
      );
    }

    try {
      const formattedOrder = await getFormattedOrder(order.fields['Order ID'], DEFAULT_VIEW);
      await Promise.all([
        sendOrderConfirmationEmailUser(formattedOrder),
        sendOrderConfirmationEmailPartner(formattedOrder),
      ]);
    } catch (error) {
      console.error('Could not send order confirmation email: ', error);
    }

    // send to connected NEX base
    const nexBaseId = configRecordsByKey?.nex_integration_base_id?.value;
    if (nexBaseId) {
      try {
        const nexBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(nexBaseId);
        await nexBase('Orders').create({
          'Order ID': order.fields['Order ID'],
          Name: order.fields['Name'],
          Email: order.fields['Email'],
          'Phone Number': order.fields['Phone Number'],
          'Order Contents': items.map(item => `${item.fields.Quantity}x ${item.fields['Inventory Name']}`).join(", "),
          Type: order.fields['Type'],
          'Order Address': order.fields['Order Address'] ? typeof order.fields['Order Address'] === 'string' ? order.fields['Order Address'] : order.fields['Order Address'][0] : '',
          'Delivery Preferences': order.fields['Delivery Preferences'],
        });
      } catch (error) {
        console.log('Count not send order to NEX base', error);
      }
    }

    const orderSummary = {
      id: order.fields['Order ID'],
      status: order.fields['Order Status'],
      createdAt: order.fields['Created'],
      fullName: order.fields['Name'],
      phone: order.fields['Phone Number'],
      email: order.fields['Email'],
      type: order.fields['Type'],
      deliveryAddress: order.fields['address_street1']
        ? {
            street1: order.fields['address_street1'],
            street2: order.fields['address_street2'],
            city: order.fields['address_city'],
            state: order.fields['address_state'],
            zip: order.fields['address_zip'],
          }
        : undefined,
      deliveryPreferences: order.fields['Delivery Preferences'],
      pickupLocationId: order.fields['Pickup Location'] ? order.fields['Pickup Location'][0] : undefined,
      subtotal: order.fields['Subtotal'],
      discount: order.fields['Discount'],
      tax: order.fields['Tax'],
      total: order.fields['Total'],
      items: items.map((item) => ({ id: item.fields.Inventory[0], quantity: item.fields.Quantity })),
      stripePaymentId: order.fields['Stripe Payment ID'],
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...orderSummary }),
    };
  } catch (err) {
    console.error('createOrder failed with error: ', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Error',
        error: err.message,
      }),
    };
  }
};
