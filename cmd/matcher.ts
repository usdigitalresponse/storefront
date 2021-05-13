import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
import stripBomStream from 'strip-bom-stream';

import * as csv from '@fast-csv/format';
//const fastcsv = require('fast-csv');

interface IdLookup {
  [key: string]: any;
}

interface ParseResult {
  list: any[];
  lookup: IdLookup;
  msTaken: number;
  byOrder: IdLookup;
}

const main = async () => {
  const maxBirthYear = 1961;

  const fileDir = process.argv[2];

  console.dir({ fileDir });

  const promises: Promise<ParseResult>[] = [];
  promises.push(parse(fileDir, 'orders'));
  promises.push(parse(fileDir, 'pickup'));
  promises.push(parse(fileDir, 'inventory'));
  promises.push(parse(fileDir, 'order-items'));

  const results = await Promise.all(promises);

  const orders = await promises[0];
  const pickup = results[1];
  const inventory = results[2];
  const orderItems = results[3];

  const inventoryByLocation: IdLookup = parseInventory(inventory);

  parseBirthDates(orders);

  let dupes = householdsAndDupesCheck(orders);
  householdsAndDupesOutput(dupes, fileDir);

  let lotteryOrders = filterLotteryOrders(orders, pickup);

  const priorityZips = ['20001', '20003'];
  const prioritySeniors = filterApplicants(lotteryOrders, true, maxBirthYear, priorityZips);
  const priority = filterApplicants(lotteryOrders, true, undefined, priorityZips);
  const seniors = filterApplicants(lotteryOrders, true, maxBirthYear, undefined);

  let total = lotteryOrders.list.length;

  const priortySeniorResult = assign(
    prioritySeniors,
    prioritySeniors.length,
    inventoryByLocation,
    orderItems.byOrder,
    inventoryByLocation,
  );
  const priorityResult = assign(priority, priority.length, inventoryByLocation, orderItems.byOrder, inventoryByLocation);
  const seniorResult = assign(seniors, seniors.length, inventoryByLocation, orderItems.byOrder, inventoryByLocation);

  const remaining = filterApplicants(lotteryOrders, false, undefined, undefined);

  let totalAssigned = priortySeniorResult.assigned + priorityResult.assigned + seniorResult.assigned;

  const remainingResult = assign(
    lotteryOrders.list,
    total - totalAssigned,
    inventoryByLocation,
    orderItems.byOrder,
    inventoryByLocation,
  );

  totalAssigned += remainingResult.assigned;

  let orderItemsMatched = translateToOrderItems(lotteryOrders, inventory, orderItems);

  console.dir({ totalAssigned });
  console.dir({ priortySeniorResult }, { depth: null });
  console.dir({ priorityResult }, { depth: null });
  console.dir({ seniorResult }, { depth: null });
  console.dir({ remainingResult }, { depth: null });

  temporaryIventoryDump(fileDir, inventory, orderItems, pickup);

  return { orders, pickup, inventory, prioritySeniors, priority, seniors, remaining };
};

(async () => {
  let { orders, pickup, inventory, prioritySeniors, priority, seniors, remaining } = await main();

  //correctnessChecks(orders, pickup, inventory, prioritySeniors, priority, seniors, remaining)
})().catch((e) => {
  console.error(e);
  // Deal with the fact the chain failed
});

export {};

async function parse(fileDir: string, file: string): Promise<ParseResult> {
  let p: Promise<ParseResult> = new Promise((resolve, reject) => {
    let start = Date.now();
    let first = true;
    let list: any[] = [];
    let lookup: IdLookup = {};
    let byOrder: IdLookup = {};

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
        lookup[row['Airtable ID']] = row;
        if (row['Order']) {
          if (byOrder[row['Order']] === undefined) {
            byOrder[row['Order']] = [];
          }
          byOrder[row['Order']].push(row);
        }
      })
      .on('end', () => {
        let msTaken = Date.now() - start;
        console.dir({ msg: `CSV file successfully processed`, file, msTaken });
        resolve({ list, lookup, msTaken, byOrder });
      });
  });

  return p;
}

function correctnessChecks(
  orders: ParseResult,
  pickup: ParseResult,
  inventory: ParseResult,
  prioritySenior: any[],
  priority: any[],
  senior: any[],
  remaining: any[],
) {
  let orderItem = orders.list[0];
  let pickupItem = pickup.list[0];
  let inventoryItem = inventory.list[0];

  console.dir({ order: orderItem });
  console.dir({ pickup: pickupItem });
  console.dir({ inventory: inventoryItem });

  console.dir({ list: orderItem.Name, lookup: orders.lookup[orderItem['Airtable ID']].Name });
  console.dir({ list: pickupItem.Name, lookup: pickup.lookup[pickupItem['Airtable ID']].Name });
  console.dir({ list: inventoryItem.Name, lookup: inventory.lookup[inventoryItem['Airtable ID']].Name });

  let checked = false;
  let idx = 1;
  while (checked === false) {
    if (orderItem) {
      console.dir(orderItem);
      if (orderItem.LocationIDs) {
        const locations = orderItem.LocationIDs.split('|');
        if (locations.length === 3) {
          checked = true;
          console.dir({ msg: 'loc 1', locationId: locations[0], location: pickup.lookup[locations[0]] });
          console.dir({ msg: 'loc 2', locationId: locations[1], location: pickup.lookup[locations[1]] });
          console.dir({ msg: 'loc 3', locationId: locations[2], location: pickup.lookup[locations[2]] });
        }
      }
      orderItem = orders.list[idx++];
    } else {
      checked = true;
    }
  }

  let birthParsing: {
    parsed: number;
    missed: number;
    badFormat: number;
    badData: number;
    unparsed: string[];
    toCheck: string[];
  } = { parsed: 0, missed: 0, badFormat: 0, badData: 0, unparsed: [], toCheck: [] };
  orders.list.forEach((order: any) => {
    if (order.birthYear !== undefined) {
      if (order.birthYear.length !== 4) {
        birthParsing.badFormat++;
        console.log('bad year', order.birthYear);
      } else {
        if (order.birthYear < 1910) {
          birthParsing.badData++;
          birthParsing.toCheck.push(order['Birth Year']);
        } else {
          birthParsing.parsed++;
        }
      }
    } else {
      birthParsing.missed++;
      birthParsing.unparsed.push(order['Birth Year']);
    }
  });

  console.dir({ birthParsing });

  console.dir({ prioritySenior1: prioritySenior[0], prioritySeniorN: prioritySenior[prioritySenior.length - 1] });
  console.dir({ priority1: priority[0], priority: priority[priority.length - 1] });
  console.dir({ senior1: senior[0], seniorN: senior[senior.length - 1] });
  console.dir({ remaining1: remaining[0], remainingN: remaining[remaining.length - 1] });

  console.dir({
    prioritySenior: prioritySenior.length,
    assigned: prioritySenior.filter((item) => item.assigned).length,
  });
  console.dir({ priority: priority.length, assigned: priority.filter((item) => item.assigned).length });
  console.dir({ senior: senior.length, assigned: senior.filter((item) => item.assigned).length });
  console.dir({ remaining: remaining.length, assigned: remaining.filter((item) => item.assigned).length });

  console.dir({ totalPopulation: orders.list.length, assigned: orders.list.filter((item) => item.assigned).length });
}

function parseBirthDates(orders: ParseResult) {
  orders.list.some((order) => {
    if (order['Birth Year']) {
      let input = order['Birth Year']
        .trim()
        .replace(/\s/g, '')
        .trim();
      if (input.length === 4) {
        if (parseInt(input) !== NaN) {
          order.birthYear = input;
          return false;
        }
      }

      let parts = input.split('/');
      if (parts.length === 3) {
        let part = parts[2].trim();
        if (part.length === 4) {
          order.birthYear = part;
          return false;
        }
        if (part.length === 2) {
          order.birthYear = `19${part}`;
          return false;
        }
      }

      parts = input.split('-');
      if (parts.length === 3) {
        let part = parts[2].trim();
        if (part.length === 4) {
          order.birthYear = part;
          return false;
        }
        if (part.length === 2) {
          order.birthYear = `19${part}`;
          return false;
        }
      }

      if (input.length === 8) {
        if (parseInt(input) !== NaN) {
          order.birthYear = input.substring(4);
          console.log('year', order.birthYear);
          return false;
        }
      }
    }
    return false;
  });
}

function filterApplicants(
  orders: ParseResult,
  reconsiderPriorAssigned: boolean,
  maxBirthYear?: number,
  zipCodes?: string[],
) {
  let result: any[] = [];
  console.dir({ maxBirthYear, zipCodes });
  orders.list.some((order) => {
    if (maxBirthYear) {
      order.matcherGroup = 'Senior';
    }

    if (zipCodes) {
      order.matcherGroup = 'Priority';
    }

    if (maxBirthYear && zipCodes) {
      order.matcherGroup = 'Senior Priority';
    }

    let passes = false;
    if (order.filtered && order.filtered !== reconsiderPriorAssigned) {
      return false;
    }
    if (order.birthYear) {
      passes = true;
      if (maxBirthYear !== undefined) {
        let birthCheck = order.birthYear <= maxBirthYear;
        passes = passes && birthCheck;
      }
    }

    if (zipCodes) {
      let zipCheck = zipCodes.includes(order.address_zip);
      passes = passes && zipCheck;
    }

    if (passes) {
      order.filtered = true;
      result.push(order);
    } else {
      order.matcherGroup = null
    }

    return false;
  });
  return result;
}

function assign(
  population: any[],
  limitToAssign: number,
  inventory: IdLookup,
  byOrder: IdLookup,
  inventoryByLocation: IdLookup,
) {
  console.dir({ msg: 'Would assign', limitToAssign, of: population.length });

  let assigned = 0;
  let waitlisted = 0;
  let attempts = 0;
  let stats = {
    assignments: { first: 0, second: 0, third: 0 },
    waitlist: { first: 0, second: 0, third: 0 },
    badLocationIDsSize: 0,
  };
  while (assigned + waitlisted < limitToAssign && assigned + waitlisted < population.length - 1) {
    if (attempts++ > 100000) {
      break;
    }

    let rand = Math.floor(Math.random() * (population.length - 1));
    let applicant = population[rand];
    if (applicant) {
      //console.log("assigning", rand, population[rand].assigned)
      if (!applicant.assigned) {
        // check prefernces, check inventory, assign to specific location

        if (!applicant.LocationIDs) {
          console.log(
            'no LocationIDs',
            applicant['Order ID'],
            applicant.LocationIDs,
            applicant.selectedLocation,
            applicant['Order Items'],
          );

          applicant.assigned = true;
          assigned++;
        }

        if (applicant.LocationIDs) {
          let matched = false;
          let locationPreferences = applicant.LocationIDs.split('|');
          if (locationPreferences.length !== 3 || (locationPreferences[1] || '') === '') {
            console.error('Bad LocationIds size', locationPreferences);
            stats.badLocationIDsSize++;

            //console.error('TODO: simulate LocationIDs via Order Items ');
          } else {
            //console.log('trying assign', applicant['Order ID'], locationPreferences);
            locationPreferences.some((location: string, idx: number) => {
              let items = inventoryByLocation[location];
              //console.log('trying assign', applicant['Order ID'], location, items.length);

              if (items) {
                items.some((item: any) => {
                  //console.dir(item);
                  if (item.Name.indexOf('DACL') === -1) {
                    // if (item.assigned >= item.stockAmount)
                    //   console.dir({
                    //     msg: 'check stock',
                    //     name: item['Linked Pickup Location'],
                    //     stock: item['Stock Level'],
                    //     assigned: item.assigned,
                    //   });
                    if (item.assigned < item.stockAmount) {
                      matched = true;
                      item.assigned++;
                      item.orders.push(applicant['Order ID']);

                      switch (idx) {
                        case 0:
                          stats.assignments.first++;
                          applicant.choice = 'first';
                          break;
                        case 1:
                          stats.assignments.second++;
                          applicant.choice = 'second';
                          // console.dir({
                          //   msg: 'second choice',
                          //   name: item.Name,
                          //   assigned: item.assigned,
                          //   OrderID: applicant['Order ID'],
                          //   LocationIds: applicant.LocationIDs,
                          // });
                          break;
                        case 2:
                          stats.assignments.third++;
                          applicant.choice = 'third';
                          break;
                      }
                    }
                    return true;
                  }

                  return false;
                });
              } else {
                console.dir({ msg: 'no items assign', location, OrderID: applicant['Order ID'] });
              }
              //console.log('assign attempt', applicant['Order ID'], idx, matched);
              return matched;
            });

            applicant.attempted = true;

            if (!matched) {
              console.log('trying waitlist', applicant['Order ID'], attempts, locationPreferences);
              locationPreferences.some((location: string, idx: number) => {
                if (location === '') {
                  return false;
                }
                let items = inventoryByLocation[location];
                if (items) {
                  //console.dir({ location, items: items.length });
                  items.forEach((item: any) => {
                    //console.dir(item);
                    if (item.Name.indexOf('DACL') === -1) {
                      if (item.waitlisted < item.waitlistLevel) {
                        matched = true;
                        item.waitlisted++;
                        item.waitlist.push(applicant['Order ID']);

                        // console.dir({
                        //   msg: 'waitlisted',
                        //   name: item.Name,
                        //   waitlisted: item.waitlisted,
                        //   assigned: item.assigned,
                        //   waitlist: item.waitlist,
                        // });

                        switch (idx) {
                          case 0:
                            stats.waitlist.first++;
                            applicant.choice = 'first';

                            break;
                          case 1:
                            stats.waitlist.second++;
                            applicant.choice = 'second';

                            break;
                          case 2:
                            stats.waitlist.third++;
                            applicant.choice = 'third';

                            break;
                        }
                      }
                    }
                  });
                } else {
                  console.dir({ msg: 'no items waitlist', location, OrderID: applicant['Order ID'] });
                }

                return matched;
              });
            }

            applicant.assigned = matched;
            if (matched) assigned++;
          }
        }
      }
    } else {
      console.log('bad rand', rand, population.length);
    }
  }
  let retval = { assigned, attempts, pop: population.length, stats };
  //console.dir({retval});

  return retval;
}

function householdsAndDupesCheck(orders: ParseResult) {
  const emails: { [index: string]: any } = {};
  const phones: { [index: string]: any } = {};
  const addresses: { [index: string]: any } = {};
  const lastWords: { [index: string]: any } = {};
  orders.list.some((order) => {
    //console.log(order)
    const email = order.Email?.toLowerCase();
    if (!emails[email]) {
      emails[email] = [];
    }
    emails[email].push(order);

    const phone = order['Phone Number']?.toLowerCase();
    if (!phones[phone]) {
      phones[phone] = [];
    }
    phones[phone].push(order);

    const address = order['address_street1']?.toLowerCase();
    if (!addresses[address]) {
      addresses[address] = [];
    }
    addresses[address].push(order);

    const name = order.Name?.toLowerCase();
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 0) {
        const lastWord = parts[parts.length - 1];
        if (!lastWords[lastWord]) {
          lastWords[lastWord] = [];
        }
        lastWords[lastWord].push(order);
      }
    }

    return false;
  });

  return { emails, phones, addresses, lastWords };
}

function householdsAndDupesOutput(
  list: {
    emails: { [index: string]: any };
    phones: { [index: string]: any };
    addresses: { [index: string]: any };
    lastWords: { [index: string]: any };
  },
  fileDir: string,
) {
  let dupeEmails: { email: string; count: number }[] = [];
  let dupePhones: { phone: string; count: number }[] = [];
  let dupeAddreses: { address: string; count: number }[] = [];
  let dupeLastWords: { lastWord: string; count: number }[] = [];

  Object.keys(list.emails).forEach((key) => {
    let orders = list.emails[key];
    if (orders.length > 1) {
      dupeEmails.push({ email: key, count: orders.length });
    }
  });

  Object.keys(list.phones).forEach((key) => {
    let orders = list.phones[key];
    if (orders.length > 1) {
      dupePhones.push({ phone: key, count: orders.length });
    }
  });

  Object.keys(list.addresses).forEach((key) => {
    let orders = list.addresses[key];
    if (orders.length > 1) {
      dupeAddreses.push({ address: key, count: orders.length });
    }
  });

  Object.keys(list.lastWords).forEach((key) => {
    let orders = list.lastWords[key];
    if (orders.length > 1) {
      dupeLastWords.push({ lastWord: key, count: orders.length });
    }
  });

  let ws = fs.createWriteStream(path.join(fileDir, 'dupe-emails.csv'));
  csv.write(dupeEmails, { headers: true }).pipe(ws);

  console.log('wrote emails dupes');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-phones.csv'));
  csv.write(dupePhones, { headers: true }).pipe(ws);

  console.log('wrote phones dupes');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-addresses.csv'));
  csv.write(dupeAddreses, { headers: true }).pipe(ws);

  console.log('wrote addresses dupes');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-last-words.csv'));
  csv.write(dupeLastWords, { headers: true }).pipe(ws);

  console.log('wrote last-words dupes');
}

function filterLotteryOrders(orders: ParseResult, pickup: ParseResult): ParseResult {
  let lottery: ParseResult = { list: [], lookup: {}, msTaken: -1, byOrder: {} };

  let start = Date.now();
  orders.list.some((order) => {
    if (order['Pickup Location']) {
      if (order.LocationIDs.indexOf('||') === -1) {
        console.log('DC Greens: Not a lottery order?', order['Order ID'], order['Pickup Location'], order.LocationIDs);
      }
      let pickupLocation = pickup.lookup[order['Airtable ID (from Pickup Location)']];

      if (!pickupLocation) {
        console.error(
          'DC Greens: No pickup location found',
          order['Order ID'],
          order['Airtable ID (from Pickup Location)'],
        );
      } else {
        if (!pickupLocation['Community Site']) {
          console.error(
            'DC Greens: Assigned location Not a community site',
            order['Order ID'],
            pickupLocation['Airtable ID'],
          );
        }
      }
    } else {
      lottery.list.push(order);
      lottery.lookup[order['Airtable ID']] = order;
      if (order['Order ID']) {
        lottery.byOrder[order['Order ID']] = order;
      }
    }
  });

  lottery.msTaken = Date.now() - start;
  console.dir({ orders: { count: orders.list.length } });
  console.dir({ lottery: { count: lottery.list.length, msTaken: lottery.msTaken } });

  return lottery;
}

function parseInventory(inventory: ParseResult): { [index: string]: any[] } {
  let byLocation: { [index: string]: any[] } = {};
  inventory.list.forEach((item) => {
    let locationID = item['Airtable ID (from Location)'];
    if (!byLocation[locationID]) {
      byLocation[locationID] = [];
    }

    byLocation[locationID].push(item);

    item.assigned = 0;
    item.orders = [];

    item.waitlisted = 0;
    item.waitlist = [];

    item.stockAmount = parseInt(item['Stock Level']);
    if (item.stockAmount === 5000) {
      item.stockAmount = 50;
    }

    item.waitlistLevel = Math.floor(item.stockAmount * 0.3);
  });

  return byLocation;
}

function temporaryIventoryDump(fileDir: string, inventory: ParseResult, orderItems: ParseResult, pickup: ParseResult) {
  const assignments: any[] = [];
  const summary: any[] = [];
  inventory.list.some((item: any) => {
    // item.orders.forEach((order: string) => {
    //   assignments.push({
    //     InventoryItem: item['Airtable ID'],
    //     OrderID: order,
    //     Status: 'Assigned',
    //     //Group: order.matcherGroup,
    //   });
    // });
    // //console.dir({ item });
    // item.waitlist.forEach((order: string) => {
    //   assignments.push({
    //     InventoryItem: item['Airtable ID'],
    //     OrderID: order,
    //     Status: 'Waitlisted',
    //     //Group: order.matcherGroup,
    //   });
    // });

    // console.dir({ item });
    // return true;
    summary.push({
      Location: item['Stock Location'],
      Assigned: item.assigned,
      Waitlisted: item.waitlisted,
      'Stock Limit': item.stockAmount,
      'Waitlist Limit': item.waitlistLevel,
    });
  });

  orderItems.list.some((item) => {
    let toPush: any = {};
    if (item.Assigned && item.Assigned !== 'checked') {
      toPush.Status = 'Assigned';
    }
    if (item.Waitlisted && item.Waitlisted !== 'checked') {
      toPush.Status = 'Waitlisted';
    }

    if (toPush.Status) {
      //console.dir({ item });
      toPush.Location = item['Inventory Item Linked Pickup Location'];
      toPush.OrderID = item.Order;

      let stockItem = inventory.lookup[item.stockItemAirtableId];

      if (!stockItem) {
        console.dir({ msg: 'could not find inventory item', item });
        return false;
      }
      //console.dir({ stockItem });

      toPush.LocationStock = stockItem.stockAmount;
      toPush.Assigned = stockItem.assigned;
      toPush.LocationWaitlist = stockItem.waitlistLevel;
      toPush.Waitlisted = stockItem.waitlisted;

      let pickupSite = pickup.lookup[item['Location Airtable ID (from Inventory)']];
      toPush.CustomerID = (pickupSite['CustomerID Prefix'] || pickupSite.Name).trim() + item.siteIndex;

      toPush.OrderItemAirtableID = item['Airtable ID'];

      assignments.push(toPush);

      //return true;
    }
  });

  let ws = fs.createWriteStream(path.join(fileDir, 'assignments-test.csv'));
  csv.write(assignments, { headers: true }).pipe(ws);

  ws = fs.createWriteStream(path.join(fileDir, 'assignments-summary.csv'));
  csv.write(summary, { headers: true }).pipe(ws);
}

function translateToOrderItems(lotteryOrders: ParseResult, inventory: ParseResult, orderItems: ParseResult) {
  inventory.list.some((stockItem: any) => {
    if (stockItem.assigned > 0) {
      //console.dir({ stockItem });
      stockItem.orders.some((orderId: string, idx: number) => {
        let itemsInOrder = orderItems.byOrder[orderId];

        if (itemsInOrder) {
          itemsInOrder.some((orderItem: any) => {
            if (stockItem['Airtable ID (from Location)'] === orderItem['Location Airtable ID (from Inventory)']) {
              orderItem.Assigned = 1;
              orderItem.stockItemAirtableId = stockItem['Airtable ID'];
              orderItem.siteIndex = (idx + 1).toString().padStart(3, '0');
            }
          });
        } else {
          console.dir({ msg: 'No order found', orderId });
        }
        //console.dir({ orderId, itemsInOrder });
        //return true;
      });
    }
    if (stockItem.waitlisted > 0) {
      //console.dir({ stockItem });
      stockItem.waitlist.some((orderId: string) => {
        let itemsInOrder = orderItems.byOrder[orderId];
        itemsInOrder.some((orderItem: any, idx: number) => {
          if (stockItem['Airtable ID (from Location)'] === orderItem['Location Airtable ID (from Inventory)']) {
            orderItem.Waitlisted = 1;
            orderItem.stockItemAirtableId = stockItem['Airtable ID'];
            orderItem.siteIndex = (500 + idx + 1).toString().padStart(3, '0');
          }
        });
        //console.dir({ orderId, stockItemLocation: stockItem['Airtable ID (from Location)'], itemsInOrder });
        //return true;
      });

      //return true;
    }
  });
}
