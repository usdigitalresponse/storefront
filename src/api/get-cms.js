const airTableRowsAsKey = function(records) {
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

  return fieldsByKey;
};

const valueOrNull = function(configValues, key) {
  return configValues[key] ? configValues[key].value : null;
};

exports.handler = async (event, context) => {
  try {
    if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_API_KEY) {
      throw new Error('Airtable API keys not set');
    }

    const base = require('airtable').base(process.env.AIRTABLE_BASE_ID);

    const cmsRecords = await base('CMS')
      .select({ view: 'Grid view' })
      .firstPage();

    const inventoryRecords = await base('Inventory')
      .select({ view: 'Grid view' })
      .firstPage();

    const configRecords = await base('Config')
      .select({ view: 'Grid view' })
      .firstPage();

    const configRecordsByKey = airTableRowsAsKey(configRecords);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          languages: valueOrNull(configRecordsByKey, 'languages'),
          stripe_public_api_key: valueOrNull(configRecordsByKey, 'stripe_public_api_key'),
        },
        cms: airTableRowsAsKey(cmsRecords),
        inventory: inventoryRecords.map(row => row.fields),
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
