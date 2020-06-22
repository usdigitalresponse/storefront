const { sendOrderConfirmationEmailPartner } = require('../api-services/send-confirmation-email');
const { getFormattedOrder } = require('../api-services/getFormattedOrder');

exports.handler = async (event, context) => {
  try {
    // allow options
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
        body: JSON.stringify({ message: 'You can use CORS' }),
      };
    }

    if (!event.queryStringParameters) {
      throw new Error('event.queryStringParameters not set');
    }

    const orderId = event.queryStringParameters.orderId;
    if (!orderId) {
      throw new Error('No orderId specified');
    }

    // const deliveryDate = event.queryStringParameters.deliveryDate;
    // if (!deliveryDate) {
    //   throw new Error('No deliveryDate specified');
    // }

    const formattedOrder = await getFormattedOrder(orderId);
    const result = await sendOrderConfirmationEmailPartner(formattedOrder);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
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
