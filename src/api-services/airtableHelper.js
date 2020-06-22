import { table } from 'console';

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

export const compareTable = function(table, masterBase, secondaryBase) {
  return new Promise(async (resolve, reject) => {
    try {
      const tableName = typeof table === 'string' ? table : table.tableName;
      const viewName = typeof table === 'string' ? 'Grid view' : table.viewName;

      const selectOptions = { view: viewName, maxRecords: 1 };
      const masterRecords = await masterBase(tableName)
        .select(selectOptions)
        .firstPage();
      if (!masterRecords || !masterRecords.length) {
        return reject('No master records for ' + tableName);
      }

      const secondaryRecords = await secondaryBase(tableName)
        .select(selectOptions)
        .firstPage();
      if (!secondaryRecords || !secondaryRecords.length) {
        return reject('No secondary records for ' + tableName);
      }

      const masterColumnNames = Object.keys(masterRecords[0].fields);
      const secondaryColumnNames = Object.keys(secondaryRecords[0].fields);

      let missingSecondaryFields = [];
      masterColumnNames.map((masterFieldName) => {
        if (secondaryColumnNames.indexOf(masterFieldName) === -1) {
          missingSecondaryFields.push(masterFieldName);
        }
      });

      let additionalSecondaryFields = [];
      secondaryColumnNames.map((secondaryFieldName) => {
        if (masterColumnNames.indexOf(secondaryFieldName) === -1) {
          additionalSecondaryFields.push(secondaryFieldName);
        }
      });

      const status =
        missingSecondaryFields.length === 0 && additionalSecondaryFields.length === 0 ? 'MATCHING' : 'DIFFERENT';

      return resolve({
        tableName,
        status,
        'Items in missing in target base': missingSecondaryFields,
        'Items in target base not in master': additionalSecondaryFields,
      });
    } catch (error) {
      return resolve({
        tableName: typeof table === 'string' ? table : table.tableName,
        error: error.message,
      });
    }
  });
};
