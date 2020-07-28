const { airTableRowsAsKey, valueOrNull, fetchTable } = require('../api-services/airtableHelper');
const { successResponse, errorResponse } = require('../api-services/response');
const DEFAULT_VIEW = 'Grid view';

exports.handler = async (event, context) => {
  try {
    // Site Content
    const contentList = await fetchTable('Content', { view: DEFAULT_VIEW });
    const content = airTableRowsAsKey(contentList);

    // Config
    const configRecords = await fetchTable('Config', { view: DEFAULT_VIEW });
    const configRecordsByKey = airTableRowsAsKey(configRecords);
    const config = Object.keys(configRecordsByKey).reduce((acc, key) => {
      acc[key] = valueOrNull(configRecordsByKey, key);
      return acc;
    }, {});

    // create languages array
    const languages = config.languages.split(',');

    // Inventory
    const inventoryRecords = await fetchTable('Inventory', { view: DEFAULT_VIEW });
    const inventory = inventoryRecords
      .filter((row) => row.fields['Name'] && row.fields['Description'] && row.fields['Price'] && row.fields['Image'] && !row.fields['Disabled'])
      .map((row) => {
        return {
          id: row.id,
          name: row.fields['Name'],
          description: row.fields['Description'],
          strings: languages.reduce((acc, language) => {
            acc[language] = language === 'en' ? {
              name: row.fields['Name'],
              description: row.fields['Description'],
            } : {
              name: row.fields[`Name_${language}`],
              description: row.fields[`Description_${language}`],
            };
            return acc;
          }, {}),
          price: row.fields['Price'],
          image: row.fields['Image'],
          stockRemaining: row.fields['Stock Remaining'] != null ? row.fields['Stock Remaining'] : null,
          stockLocation: row.fields['Linked Pickup Location'] ? row.fields['Linked Pickup Location'][0] : null,
          stockZipcodes: row.fields['Stock Zipcodes'] ? row.fields['Stock Zipcodes'].split(',') : null,
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
        waitlistOnly: row.fields['Waitlist Only'],
      };
    });

    // Schedules
    const schedulesRecords = await fetchTable('Schedules', { view: DEFAULT_VIEW });
    const schedules = schedulesRecords.map((row) => {
      return {
        id: row.id,
        start: row.fields['Start Time'],
        end: row.fields['End Time'],
        day: row.fields['Day'],
      };
    });

    // Valid Zipcodes
    const validZipcodesRecords = await fetchTable('Valid Zipcodes', { view: DEFAULT_VIEW });
    const validZipcodes = validZipcodesRecords
      .filter((row) => row.fields['Zip Code'])
      .map((row) => {
        return {
          zipcode: row.fields['Zip Code'],
          schedules: row.fields['Linked Schedules']
        }
      });

    // Questions
    const questionsRecords = await fetchTable('Questions', { view: DEFAULT_VIEW });
    const questions = questionsRecords.map((row) => {
      const optionsString = row.fields['Options'];
      const label = row.fields['Label'];
      return {
        id: row.id,
        label: label ? label.trim() : label,
        strings: languages.reduce((acc, language) => {
          const label = language === 'en' ? row.fields['Label'] : row.fields[`Label_${language}`];
          const optionsString = language === 'en' ? row.fields['Options'] : row.fields[`Options_${language}`];
          acc[language] = { label: label ? label.trim() : label, options: optionsString ? optionsString.split(',').map((v) => v.trim()) : null }
          return acc;
        }, {}),
        type: row.fields['Type'],
        options: optionsString ? optionsString.split(',').map((v) => v.trim()) : null,
        waitlistOnly: row.fields['Waitlist Only'],
        required: row.fields['Required'],
      };
    });

    return successResponse({
      config,
      content,
      inventory,
      pickupLocations,
      schedules,
      validZipcodes,
      questions,
    });
  } catch (error) {
    console.error(error.message);
    return errorResponse(error.message);
  }
};
