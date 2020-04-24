import React from 'react';

export const cmsContext = React.createContext({});

export const getCmsRecordFromKey = (key: string, records: Array<{key:String, picture?:Array<{url:String}>}>) => {
  // We need to make the picture field into something more useful
  // to the front end

  const record = records.filter(record => record.key === key)[0];

  // If we don't find a record, lets return a blank object so the application
  // doesn't fail, and log this out to the user so they can check their airtable
  // spreadsheet
  if (!record) {
    console.error(`❗ Missing ${key} value in CMS`);
    return {};
  }

  if (!record.key) {
    console.error(`The CMS was set up incorrectly and is missing a "key" column. Check that the column name is not "Name"!`);
  }

  return record;
}
