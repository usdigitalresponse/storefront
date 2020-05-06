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
      stripe_public_api_key: valueOrNull(configRecordsByKey, 'stripe_public_api_key'),
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

    // Discount Codes
    const discountCodesRecords = await fetchTable('Discount Codes', { view: DEFAULT_VIEW });

    const discountCodes = discountCodesRecords
      .filter((row) => row.fields['Active'])
      .map((row) => {
        return {
          id: row.id,
          code: row.fields['Code'],
          amount: row.fields['End Time'],
          type: row.fields['Type'],
        };
      });

    return successResponse({
      config,
      content,
      inventory,
      pickupLocations,
      schedules,
      discountCodes,
    });
  } catch (error) {
    return errorResponse(error.message);
  }
};
