if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_API_KEY) {
  throw new Error('Airtable API keys not set');
}

let Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export const airTableRowsAsKey = function(records) {
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

export const valueOrNull = function(configValues, key) {
  return configValues[key] ? configValues[key].value : null;
};

export const fetchTable = function(tableName, selectOptions) {
  return base(tableName)
    .select(selectOptions)
    .firstPage();
};

export const findRecord = function(tableName, airtableRecordId) {
  return base(tableName).find(airtableRecordId);
};
