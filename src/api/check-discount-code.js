const { airTableRowsAsKey, fetchTable, DEFAULT_VIEW } = require('../api-services/airtableHelper');
const { successResponse, errorResponse } = require('../api-services/response');

function validateSequenialCode(code, sequences) {
  for (const sequence of sequences) {
    if (code >= sequence[0] && code <= sequence[1]) {
      return true
    }
  }
  return false;
}

async function checkIfCodeUsed(code) {
  const usedSequentialCodesRecords = await fetchTable('Used Sequential Codes', { view: DEFAULT_VIEW });
  for (const row of usedSequentialCodesRecords) {
    if (row.fields['Code'] === code) {
      return true;
    }
  }
  return false;
}

exports.handler = async (event, context) => {
  try {
    if (!event.queryStringParameters) {
      throw new Error('event.queryStringParameters not set');
    }

    let discountCode = event.queryStringParameters.discountCode;
    if (!discountCode) {
      throw new Error('No discountCode specified');
    }

    // sequential discount codes
    let validSequentialCode = false;
    const configRecords = await fetchTable('Config', { view: DEFAULT_VIEW });
    const configRecordsByKey = airTableRowsAsKey(configRecords);
    const sequentialCodeValues = configRecordsByKey?.sequential_code_values?.value;
    const sequentialDiscountCode = configRecordsByKey?.sequential_discount_code?.value;

    const sequences = [];
    if (/((\d+-\d+),?)*(\d+-\d+)$/.test(sequentialCodeValues)) {
      try {
        const ranges = sequentialCodeValues.split(',');
        for (const range of ranges) {
          sequences.push(range.split('-').map(num => parseInt(num)))
        }
      } catch(e) {
        console.log('failed to parse sequential discount codes', e);
      }
    }

    const code = parseInt(discountCode);
    let hasBeenUsed = false;
    if (sequences.length && !isNaN(code)) {
      const isValid = validateSequenialCode(code, sequences);
      if (isValid) {
        hasBeenUsed = await checkIfCodeUsed(discountCode);
      }
      if (isValid && !hasBeenUsed && sequentialDiscountCode) {
        discountCode = sequentialDiscountCode;
        validSequentialCode = true;
      }
    }

    if (hasBeenUsed) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Error',
          error: 'Code Already Used',
        }),
      };
    }

    const discountCodesRecords = await fetchTable('Discount Codes', { view: DEFAULT_VIEW });

    const matchedCode = discountCodesRecords
      .map((row) => row.fields)
      .filter((row) => validSequentialCode || row['Active'])
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

    return successResponse({
      id: matchedCode.id,
      code: matchedCode['Code'],
      amount: matchedCode['Amount'],
      type: matchedCode['Type']
    });
  } catch (error) {
    console.error('error', error);
    return errorResponse(error.message);
  }
};
