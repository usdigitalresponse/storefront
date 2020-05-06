const { fetchTable } = require('../api-services/airtableHelper');
const { successResponse, errorResponse } = require('../api-services/response');
const DEFAULT_VIEW = 'Grid view';

exports.handler = async (event, context) => {
  try {
    if (!event.queryStringParameters) {
      throw new Error('event.queryStringParameters not set');
    }

    const discountCode = event.queryStringParameters.discountCode;
    if (!discountCode) {
      throw new Error('No discountCode specified');
    }

    const discountCodesRecords = await fetchTable('Discount Codes', { view: DEFAULT_VIEW });

    const matchedCode = discountCodesRecords
      .map((row) => row.fields)
      .filter((row) => row['Active'])
      .find((row) => {
        return row['Code'] === discountCode;
      });

    if (!matchedCode) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Error',
          error: 'Invalid Discount Code',
        }),
      };
    }

    return successResponse(matchedCode);
  } catch (error) {
    console.error('error', error);
    return errorResponse(error.message);
  }
};
