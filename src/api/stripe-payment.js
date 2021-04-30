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

    const paymentType = event.queryStringParameters.paymentType;
    if (!paymentType) {
      throw new Error('No paymentType specified');
    }

    if (paymentType !== 'donation' && paymentType !== 'main') {
      throw new Error('Invalid paymentType: ' + paymentType);
    }

    if (isNaN(amountCents)) {
      throw new Error('Invalid amountCents');
    }

    let apiKey =
      paymentType === 'donation'
        ? process.env.STRIPE_DONATION_PRIVATE_API_KEY
        : process.env.STRIPE_MAIN_PRIVATE_API_KEY;

    if( event.queryStringParameters.testcard ) {
      apiKey = process.env.STRIPE_TEST_PRIVATE_API_KEY
    }

    if (!apiKey) {
      throw new Error('Stripe api key not set');
    }
    // Set your secret key. Remember to switch to your live secret key in production!
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    const stripe = require('stripe')(apiKey);

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
