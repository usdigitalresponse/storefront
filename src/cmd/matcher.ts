import csvParser from 'csv-parser'
import fs from 'fs'
import path from 'path'
import stripBomStream  from 'strip-bom-stream';

interface IdLookup {
  [key: string]: any
}

interface ParseResult {
   list: any[];
   lookup: IdLookup
}

const main = async () => {
  // let thing = {whee: [1,2,3]}


  // thing?.whee.forEach((item) =>
  // {
  //   console.log("item", item)
  // })

  let fileDir = process.argv[2]

  console.dir({fileDir})


  let promises: Promise<ParseResult>[] = []
  promises.push(parse(fileDir, 'orders'))
  promises.push(parse(fileDir, 'pickup'))
  promises.push(parse(fileDir, 'inventory'))

  let results = await Promise.all(promises)

  let orders = results[0]
  let pickup = results[1]
  let inventory = results[2]

  console.dir({order: orders.list[0]} )
  console.dir({ pickup: pickup.list[0] })
  console.dir({ inventory: inventory.list[0] })

  console.dir({list: orders.list[0].Name, lookup: orders.lookup[orders.list[0]["Airtable ID"]].Name})
  console.dir({ list: pickup.list[0].Name, lookup: pickup.lookup[pickup.list[0]["Airtable ID"]].Name })
  console.dir({ list: inventory.list[0].Name, lookup: inventory.lookup[inventory.list[0]["Airtable ID"]].Name })
}

(async () => {
  var mainRet = await main();
  console.dir({mainRet});
})().catch(e => {
  console.error(e)
  // Deal with the fact the chain failed
});


export {}

async function parse(fileDir: string, file: string): Promise<ParseResult> {
  let p: Promise<ParseResult> = new Promise((resolve, reject) => {
    let first = true;
    let list: any[] = []
    let lookup: IdLookup = {}

    const fileName = path.join(fileDir, `${file}.csv`)
    console.dir({ file, fileName })
    fs.createReadStream(fileName)
      .pipe(stripBomStream())
      .pipe(csvParser())
      .on('data', (row) => {
        if (first) {
          console.dir(row, { depth: null })
          first = false
        }
        list.push(row)
        lookup[row["Airtable ID"]] = row
      })
      .on('end', () => {
        console.log(`${file} CSV file successfully processed`)
        resolve({list, lookup})
      })
  })

  return p
}
