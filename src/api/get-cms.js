exports.handler = async (event, context) => {
  try {
    if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_API_KEY) {
      throw new Error('Airtable API keys not set');
    }
    const base = require('airtable').base(process.env.AIRTABLE_BASE_ID);
    const records = await base('CMS')
      .select({ view: 'Grid view' })
      .firstPage();

    const rowFields = records.map((row) => {
      return row.fields;
    });

    const fieldsByKey = {};
    rowFields.map((row) => {
      fieldsByKey[row.key] = {
        ...row,
      };
      delete fieldsByKey[row.key]['key'];
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fieldsByKey),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        status: 'Error',
        error: error.message,
      },
    };
  }
};
