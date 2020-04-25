exports.handler = async (event, context) => {
  try {
    // if (event.httpMethod !== 'POST') {
    //   return { statusCode: 405, body: 'Method Not Allowed' };
    // }

    if (!event.queryStringParameters) {
      throw new Error('event.queryStringParameters not set');
    }

    const amountCents = event.queryStringParameters.amountCents;
    if (!amountCents) {
      throw new Error('No amountCents specified');
    }

    if (isNaN(amountCents)) {
      throw new Error('Invalid amountCents');
    }

    if (!process.env.STRIPE_PRIVATE_API_KEY) {
      throw new Error('Stripe api key not set');
    }
    // Set your secret key. Remember to switch to your live secret key in production!
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    const stripe = require('stripe')(process.env.STRIPE_PRIVATE_API_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_secret: paymentIntent.client_secret,
      }),
    };
  } catch (error) {
    console.error('error', error);
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
