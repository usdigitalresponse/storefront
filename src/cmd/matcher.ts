import csvParser from 'csv-parser'
import fs from 'fs'
import { promises } from 'node:dns'
import { resourceLimits } from 'node:worker_threads'
import path from 'path'

const main = async () => {
  // let thing = {whee: [1,2,3]}


  // thing?.whee.forEach((item) =>
  // {
  //   console.log("item", item)
  // })

  let fileDir = process.argv[2]

  console.dir({fileDir})


  let promises: Promise<any>[] = []
  promises.push(parse(fileDir, 'orders'))
  promises.push(parse(fileDir, 'pickup'))
  promises.push(parse(fileDir, 'inventory'))

  let results = await Promise.all(promises)

  console.dir({order: (results[0] as any[])[0]} )
  console.dir({ pickup: (results[1] as any[])[0] })
  console.dir({ inventory: (results[2] as any[])[0] })
}

(async () => {
  var mainRet = await main();
  console.dir({mainRet});
})().catch(e => {
  console.error(e)
  // Deal with the fact the chain failed
});


export {}

async function parse(fileDir: string, file: string) {
  let p = new Promise((resolve, reject) => {
    let first = true;
    let retval: any[] = []

    const fileName = path.join(fileDir, `${file}.csv`)
    console.dir({ file, fileName })
    fs.createReadStream(fileName)
      .pipe(csvParser())
      .on('data', (row) => {
        if (first) {
          console.dir(row, { depth: null })
          first = false
        }
        retval.push(row)
      })
      .on('end', () => {
        console.log(`${file} CSV file successfully processed`)
        resolve(retval)
      })
  })

  return p
}
