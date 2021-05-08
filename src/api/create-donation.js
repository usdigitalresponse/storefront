const { sendDonationConfirmationEmail } = require('../api-services/send-confirmation-email');

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

    const donationIntent = JSON.parse(event.body);

    // validate orderIntent
    if (!donationIntent) {
      throw new Error('Invalid Order Intent');
    }
    const requiredFields = ['fullName', 'phone', 'email', 'amount', 'stripePaymentId'];

    requiredFields.forEach((field) => {
      if (!donationIntent[field]) {
        throw new Error('Invalid Order Intent: ' + field + ' not set');
      }
    });

    const order = await base('Donations').create(
      {
        Name: donationIntent.fullName,
        Email: donationIntent.email,
        'Phone Number': donationIntent.phone,
        'Stripe Payment ID': donationIntent.stripePaymentId,
        Amount: donationIntent.amount,
        'Test Card': donationIntent.testCard
      },
      { typecast: true },
    );

    const donationSummary = {
      id: order.fields['Donation ID'],
      createdAt: order.fields['Created'],
      fullName: order.fields['Name'],
      phone: order.fields['Phone Number'],
      email: order.fields['Email'],
      stripePaymentId: order.fields['Stripe Payment ID'],
      total: order.fields['Amount'],
    };

    try {
      await sendDonationConfirmationEmail(donationSummary);
    } catch (error) {
      console.error('Could not send confirmation email: ', error);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...donationSummary }),
    };
  } catch (err) {
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
