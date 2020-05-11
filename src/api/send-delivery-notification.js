const { sendOrderDeliveryNotification } = require('../api-services/send-confirmation-email');

exports.handler = async (event, context) => {
  try {
    if (!event.queryStringParameters) {
      throw new Error('event.queryStringParameters not set');
    }

    const orderId = event.queryStringParameters.orderId;
    if (!orderId) {
      throw new Error('No orderId specified');
    }

    const deliveryDate = event.queryStringParameters.deliveryDate;
    if (!deliveryDate) {
      throw new Error('No deliveryDate specified');
    }

    const result = await sendOrderDeliveryNotification(orderId, deliveryDate);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'success' }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Error',
        error: err.toString(),
      }),
    };
  }
};
