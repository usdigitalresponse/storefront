import axios from 'axios';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
import stripBomStream from 'strip-bom-stream';

import * as csv from '@fast-csv/format';
import { stringify } from 'qs';

interface ParseResult {
  list: any[];
  msTaken: number;
}

const main = async () => {
  const fileDir = process.argv[2];

  console.dir({ fileDir });

  let results = {
    start: Date.now(),
    msParsing: -1,
    msProcess: -1,
  };
  const items = await parse(fileDir, 'assignments-items');
  results.msParsing = Date.now() - results.start;

  let start = Date.now();
  await processOrderItems(items);
  results.msProcess = Date.now() - start;

  return { results };
};

(async () => {
  let { results } = await main();

  //correctnessChecks(orders, pickup, inventory, prioritySeniors, priority, seniors, remaining)
  console.dir({ results });
})().catch((e) => {
  console.error(e);
  // Deal with the fact the chain failed
});

export {};

async function processOrderItems(items: ParseResult) {
  let records: any[] = [];
  let promises: any[] = [];
  let options = { headers: { Authorization: `Bearer ${process.env.AIRTABLEKEY}` } };

  for (let id of items.list) {
    /*curl -v -X PATCH https://api.airtable.com/v0/appjW6vdBT5HsLaC6/Order%20Items \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
  "records": [
    {
      "id": "recBIx2PyteTbxtHM",
      "fields": {
        "Order": [
          "recUN2gDD0vXHeAd9"
        ],
        "Quantity": 1,
        "Inventory": [
          "rec8MBPICUTVNXym2"
        ]
      }
    },
    {
      "id": "rec89NKebdhMltMKg",
      "fields": {
        "Order": [
          "recdOTjVDrUDSILyc"
        ],
        "Quantity": 1,
        "Inventory": [
          "rec8MBPICUTVNXym2"
        ]
      }
    }
  ]
}'
    */

    let record: { id: string; fields: { 'Customer ID': string; Assigned?: boolean; Waitlisted?: boolean } } = {
      id: id['OrderItemAirtableID'],
      fields: { 'Customer ID': id['CustomerID'] },
    };
    switch (id.Status) {
      case 'Assigned':
        record.fields.Assigned = true;
        break;
      case 'Waitlisted':
        record.fields.Waitlisted = true;
        break;
      default:
        console.error('No matching status', id.Status);
        process.exit(-1);
    }
    records.push(record);
    let values = { records };

    if (records.length === 10) {
      let res: any = await toAirtable(values, options);
      if (res.status === 200) {
        records = [];
      }
    }
  }

  console.log('sending last batch', records.length);
  if (records.length > 0) {
    let values = { records };
    let res: any = await toAirtable(values, options);
    if (res.status === 200) {
      records = [];
    }
  }

  let allDone = await Promise.all(promises);

  return allDone;
}

async function toAirtable(
  values: { records: any[] },
  options: { headers: { Authorization: string } },
  retry = 0,
): Promise<any> {
  console.dir({ values }, { depth: null });

  //let res = Promise.resolve({ status: 429 });
  let res = axios.patch('https://api.airtable.com/v0/appjW6vdBT5HsLaC6/Order%20Items', values, options);
  let p = res
    .then((res) => {
      console.dir({ status: res.status });
      return { status: res.status };
    })
    .catch((err) => {
      console.dir({ err });
      return { status: -1, err };
    });

  let result = await p;

  console.dir({ result });

  if (result.status !== 200) {
    console.dir({ msg: 'bad status', result });
    if (result.status === 429) {
      if (retry === 0) {
        console.log(Date.now(), 'waiting 5+ seconds after 429 then retrying');
        let wait = await new Promise((r) => setTimeout(r, 5500)).then(() => {
          console.log(Date.now(), 'done waiting');
        });
        result = await toAirtable(values, options, ++retry);
      } else {
        console.dir({ msg: 'Retry also hit 429' });
        process.exit(-1);
      }
    } else {
      console.dir({ msg: 'Response was not 200 or 429', status: result.status });
      process.exit(-1);
    }
  }

  console.log(Date.now(), 'waiting');
  let wait = await new Promise((r) => setTimeout(r, 250)).then(() => {
    console.log(Date.now(), 'done waiting');
  });

  process.exit(-1);

  return result;
}

async function parse(fileDir: string, file: string): Promise<ParseResult> {
  let p: Promise<ParseResult> = new Promise((resolve, reject) => {
    let start = Date.now();
    let first = true;
    let list: any[] = [];

    const fileName = path.join(fileDir, `${file}.csv`);
    console.dir({ file, fileName });
    fs.createReadStream(fileName)
      .pipe(stripBomStream())
      .pipe(csvParser())
      .on('data', (row) => {
        if (first) {
          console.dir(row, { depth: null });
          first = false;
        }
        list.push(row);
      })
      .on('end', () => {
        let msTaken = Date.now() - start;
        console.dir({ msg: `CSV file successfully processed`, file, msTaken });
        resolve({ list, msTaken });
      });
  });

  return p;
}
