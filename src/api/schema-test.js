const { compareTable } = require('../api-services/airtableHelper');
const { successResponse, errorResponse } = require('../api-services/response');

exports.handler = async (event, context) => {
  try {
    let Airtable = require('airtable');

    if (!process.env.MASTER_AIRTABLE_API_KEY) {
      throw new Error('MASTER_AIRTABLE_API_KEY not present');
    }

    if (!process.env.MASTER_AIRTABLE_BASE_ID) {
      throw new Error('MASTER_AIRTABLE_BASE_ID not present');
    }

    const masterBase = new Airtable({ apiKey: process.env.MASTER_AIRTABLE_API_KEY }).base(
      process.env.MASTER_AIRTABLE_BASE_ID,
    );
    const secondaryBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    const schemaPromises = [
      {
        tableName: 'Orders',
        viewName: 'All Orders',
      },
      'Order Items',
      'Inventory',
      'Config',
      'Content',
      'Pickup Locations',
      'Valid Zipcodes',
      'Donations',
      'Schedules',
      'Discount Codes',
      'Response Items',
    ].map((table) => {
      return compareTable(table, masterBase, secondaryBase);
    });

    const results = await Promise.all(schemaPromises);
    return successResponse(results);
  } catch (error) {
    console.error('error', error);
    return errorResponse(error.message);
  }
};
