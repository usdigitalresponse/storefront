const DEFAULT_VIEW = 'Grid view';

const { airTableRowsAsKey, valueOrNull, fetchTable } = require('../api-services/airtableHelper');
const { successResponse, errorResponse } = require('../api-services/response');

exports.handler = async (event, context) => {
  try {
    // Site Content
    const contentList = await fetchTable('Content', { view: DEFAULT_VIEW });

    const content = airTableRowsAsKey(contentList);

    // Config
    const configRecords = await fetchTable('Config', { view: DEFAULT_VIEW });

    const configRecordsByKey = airTableRowsAsKey(configRecords);

    const config = {
      languages: valueOrNull(configRecordsByKey, 'languages'),
      stripe_main_public_api_key: valueOrNull(configRecordsByKey, 'stripe_main_public_api_key'),
      stripe_donation_public_api_key: valueOrNull(configRecordsByKey, 'stripe_donation_public_api_key'),
      default_state: valueOrNull(configRecordsByKey, 'default_state'),
      tax_rate: valueOrNull(configRecordsByKey, 'tax_rate'),
      theme_color: valueOrNull(configRecordsByKey, 'theme_color'),
      donation_units: valueOrNull(configRecordsByKey, 'donation_units'),
      driver_form_id: valueOrNull(configRecordsByKey, 'driver_form_id'),
    };

    // Inventory
    const inventoryRecords = await fetchTable('Inventory', { view: DEFAULT_VIEW });

    const inventory = inventoryRecords
      .filter((row) => row.fields['Name'] && row.fields['Description'] && row.fields['Price'] && row.fields['Image'])
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
    const pickupLocationRecords = await fetchTable('Pickup Locations', { view: DEFAULT_VIEW });

    const pickupLocations = pickupLocationRecords.map((row) => {
      return {
        id: row.id,
        name: row.fields['Name'],
        address: {
          street1: row.fields['Address Street'],
          street2: row.fields['Address Street 2'],
          city: row.fields['Address City'],
          state: row.fields['Address State'],
          zip: row.fields['Address Zip'],
        },
        schedules: row.fields['Schedules'],
      };
    });

    // Schedules
    const schedulesRecords = await fetchTable('Schedules', { view: DEFAULT_VIEW });

    const schedules = schedulesRecords.map((row) => {
      return {
        id: row.id,
        type: row.fields['Type'],
        start: row.fields['Start Time'],
        end: row.fields['End Time'],
        day: row.fields['Day'],
      };
    });

    // Valid Zipcodes
    const validZipcodesRecords = await fetchTable('Valid Zipcodes', { view: DEFAULT_VIEW });

    const validZipcodes = validZipcodesRecords.map((row) => {
      return row.fields['Zip Code'];
    });

    return successResponse({
      config,
      content,
      inventory,
      pickupLocations,
      schedules,
      validZipcodes,
    });
  } catch (error) {
    return errorResponse(error.message);
  }
};
