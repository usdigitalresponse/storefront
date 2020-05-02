const DEFAULT_VIEW = 'Grid view';

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
      // throw new Error('Airtable API keys not set');
    }

    var Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    // Site Content
    const contentList = await base('Content')
      .select({ view: DEFAULT_VIEW })
      .firstPage();

    const content = airTableRowsAsKey(contentList);

    // Config
    const configRecords = await base('Config')
      .select({ view: DEFAULT_VIEW })
      .firstPage();

    const configRecordsByKey = airTableRowsAsKey(configRecords);

    const config = {
      languages: valueOrNull(configRecordsByKey, 'languages'),
      stripe_public_api_key: valueOrNull(configRecordsByKey, 'stripe_public_api_key'),
    };

    // Inventory
    const inventoryRecords = await base('Inventory')
      .select({ view: DEFAULT_VIEW })
      .firstPage();

    const inventory = inventoryRecords
    .filter(row =>
      row.fields['Name'] &&
      row.fields['Description'] &&
      row.fields['Price'] &&
      row.fields['Image']
    )
    .map((row) => {
      return {
        id: row.id,
        name: row.fields['Name'],
        description: row.fields['Description'],
        price: row.fields['Price'],
        image: row.fields['Image'],
      };
    });

    // Pickup Locations
    const pickupLocationRecords = await base('Pickup Locations')
      .select({ view: DEFAULT_VIEW })
      .firstPage();

    const pickupLocations = pickupLocationRecords.map((row) => {
      return {
        id: row.id,
        name: row.fields['Name'],
        address: {
          street1: row.fields['Address Street 1'],
          street2: row.fields['Address Street 2'],
          city: row.fields['Address City'],
          zip: row.fields['Address Zip'],
        },
        schedules: row.fields['Schedules'],
      };
    });

    // Schedules
    const schedulesRecords = await base('Schedules')
      .select({ view: DEFAULT_VIEW })
      .firstPage();

    const schedules = schedulesRecords.map((row) => {
      return {
        id: row.id,
        type: row.fields['Type'],
        start: row.fields['Start Time'],
        end: row.fields['End Time'],
        day: row.fields['Day'],
      };
    });

    // Discount Codes
    const discountCodesRecords = await base('Discount Codes')
      .select({ view: DEFAULT_VIEW })
      .firstPage();

    const discountCodes = discountCodesRecords.filter(row => row.fields['Active']).map((row) => {
      return {
        id: row.id,
        code: row.fields['Code'],
        amount: row.fields['End Time'],
        type: row.fields['Type'],
      };
    });

    return {
      statusCode: 200,
      headers: {
        'contentListt-Type': 'application/json',
      },
      body: JSON.stringify({
        config,
        content,
        inventory,
        pickupLocations,
        schedules,
        discountCodes
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
