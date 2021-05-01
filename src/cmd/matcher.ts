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
   msTaken: number
}

const main = async () => {
  const maxBirthYear = 1961

  const fileDir = process.argv[2]

  console.dir({fileDir})


  const promises: Promise<ParseResult>[] = []
  promises.push(parse(fileDir, 'orders'))
  promises.push(parse(fileDir, 'pickup'))
  promises.push(parse(fileDir, 'inventory'))

  const results = await Promise.all(promises)

  const orders = results[0]
  const pickup = results[1]
  const inventory = results[2]

  parseBirthDates(orders)

  const priorityZips = ['20001', '20003']
  const prioritySeniors = filterApplicants(orders, true, maxBirthYear, priorityZips)
  assign(prioritySeniors, 100)
  const priority = filterApplicants(orders, true, undefined, priorityZips)
  assign(priority, 75)
  const seniors = filterApplicants(orders, true, maxBirthYear, undefined)
  assign(seniors, 50)
  const remaining = filterApplicants(orders, false, undefined, undefined)
  assign(remaining, 300)

  return { orders, pickup, inventory, prioritySeniors, priority, seniors, remaining}
}

(async () => {
  var { orders, pickup, inventory, prioritySeniors, priority, seniors, remaining} = await main();

  correctnessChecks(orders, pickup, inventory, prioritySeniors, priority, seniors, remaining)

})().catch(e => {
  console.error(e)
  // Deal with the fact the chain failed
});


export {}

async function parse(fileDir: string, file: string): Promise<ParseResult> {
  let p: Promise<ParseResult> = new Promise((resolve, reject) => {
    let start = Date.now()
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
        let msTaken = Date.now() - start
        console.dir({msg: `CSV file successfully processed`, file, msTaken})
        resolve({list, lookup, msTaken})
      })
  })

  return p
}

function correctnessChecks(orders: ParseResult, pickup: ParseResult, inventory: ParseResult, prioritySenior: any[], priority: any[], senior: any[], remaining: any[]) {
  let orderItem = orders.list[0];
  let pickupItem = pickup.list[0];
  let inventoryItem = inventory.list[0];

  console.dir({ order: orderItem })
  console.dir({ pickup: pickupItem })
  console.dir({ inventory: inventoryItem })

  console.dir({ list: orderItem.Name, lookup: orders.lookup[orderItem["Airtable ID"]].Name })
  console.dir({ list: pickupItem.Name, lookup: pickup.lookup[pickupItem["Airtable ID"]].Name })
  console.dir({ list: inventoryItem.Name, lookup: inventory.lookup[inventoryItem["Airtable ID"]].Name })

  let checked = false
  let idx = 1
  while( checked === false) {
    if( orderItem ) {
      console.dir(orderItem)
      if( orderItem.LocationIDs ) {
        const locations = orderItem.LocationIDs.split("|")
        if( locations.length === 3 ) {
          checked = true
          console.dir({msg: 'loc 1', locationId: locations[0], location: pickup.lookup[locations[0]]})
          console.dir({ msg: 'loc 2', locationId: locations[1], location: pickup.lookup[locations[1]] })
          console.dir({ msg: 'loc 3', locationId: locations[2], location: pickup.lookup[locations[2]] })
        }
      }
      orderItem = orders.list[idx++]
    } else
    {
      checked = true
    }
  }

  let birthParsing: { parsed: number, missed: number, badFormat: number, badData: number, unparsed: string[], toCheck: string[] } = {parsed: 0, missed: 0, badFormat: 0, badData: 0, unparsed: [], toCheck: []}
  orders.list.forEach((order: any)=>{
    if( order.birthYear !== undefined ) {
      if( order.birthYear.length !== 4 ) {
        birthParsing.badFormat++
        console.log("bad year", order.birthYear)
      } else {
        if( order.birthYear < 1910 ) {
          birthParsing.badData++
          birthParsing.toCheck.push(order['Birth Year'])
        } else {
          birthParsing.parsed++
        }
      }
    } else {
      birthParsing.missed++
      birthParsing.unparsed.push(order['Birth Year'])
    }
  })

  console.dir({birthParsing})


  console.dir({ prioritySenior1: prioritySenior[0], prioritySeniorN: prioritySenior[prioritySenior.length-1] })
  console.dir({ priority1: priority[0], priority: priority[priority.length-1] })
  console.dir({ senior1: senior[0], seniorN: senior[senior.length-1] })
  console.dir({ remaining1: remaining[0], remainingN: remaining[remaining.length-1] })

  console.dir({ prioritySenior: prioritySenior.length, assigned: prioritySenior.filter((item) => item.assigned).length })
  console.dir({ priority: priority.length, assigned: priority.filter((item) => item.assigned).length })
  console.dir({ senior: senior.length, assigned: senior.filter((item) => item.assigned).length })
  console.dir({ remaining: remaining.length, assigned: remaining.filter((item) => item.assigned).length })

  console.dir({ totalPopulation: orders.list.length, assigned: orders.list.filter((item) => item.assigned).length })
}

function parseBirthDates(orders: ParseResult) {
  orders.list.some((order) => {
    let input = order['Birth Year'].trim().replace(/\s/g,"").trim()
    if( input.length === 4 ) {
      if( parseInt(input) !== NaN ) {
        order.birthYear = input
        return false
      }
    }

    let parts = input.split("/")
    if( parts.length === 3 ) {
      let part = parts[2].trim()
      if( part.length === 4 ) {
        order.birthYear = part
        return false
      }
      if (part.length === 2) {
        order.birthYear = `19${part}`
        return false
      }
    }

    parts = input.split("-")
    if (parts.length === 3) {
      let part = parts[2].trim()
      if (part.length === 4) {
        order.birthYear = part
        return false
      }
      if (part.length === 2) {
        order.birthYear = `19${part}`
        return false
      }

    }

    if (input.length === 8) {
      if (parseInt(input) !== NaN) {
        order.birthYear = input.substring(4)
        console.log("year", order.birthYear)
        return false
      }
    }

    return false
  })
}

function filterApplicants(orders: ParseResult, reconsiderPriorAssigned: boolean, maxBirthYear?: number, zipCodes?: string[]) {
  let result: any[] = []
  console.dir({maxBirthYear, zipCodes})
  orders.list.some((order) => {
    let passes = false
    if (order.filtered && order.filtered !== reconsiderPriorAssigned ) {
      return false
    }
    if( order.birthYear ) {
      passes = true
      if( maxBirthYear !== undefined ) {
        let birthCheck = order.birthYear <= maxBirthYear
        passes = passes && birthCheck
      }
    }

    if( zipCodes ) {
      let zipCheck = zipCodes.includes(order.address_zip)
      passes = passes && zipCheck
    }

    if( passes ) {
      order.filtered = true
      result.push(order)
    }

    return false
  })
  return result
}

function assign(population: any[], limitToAssign: number) {
  console.dir({msg: "Would assign", limitToAssign, of: population.length})

  let assigned = 0
  while(assigned < limitToAssign ) {
    let rand =  Math.floor(Math.random() * (population.length - 1))
    if( population[rand] ) {
      console.log("assigning", rand, population[rand].assigned)
      if( ! population[rand].assigned ) {
        population[rand].assigned = true
        assigned++
      }
    } else {
      console.log("bad rand", rand, population.length)
    }
  }
}
