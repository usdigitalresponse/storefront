exports.handler = async (event, context) => {
  try {
    if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_API_KEY) {
      throw new Error('Airtable API keys not set');
    }
    const base = require('airtable').base(process.env.AIRTABLE_BASE_ID);
    const records = await base('CMS')
      .select({ view: 'Grid view' })
      .firstPage();
    return {
      statusCode: 200,
      body: JSON.stringify(records),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        status: 'Error',
        error: error.message,
      },
    };
  }
};
