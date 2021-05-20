import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
import stripBomStream from 'strip-bom-stream';

import * as csv from '@fast-csv/format';
import { isDate } from 'node:util';

interface IdLookup {
  [key: string]: any;
}

interface ParseResult {
  list: any[];
  lookup: IdLookup;
  msTaken: number;
  byOrder: IdLookup;
  byOrderItem: IdLookup;
  tooYoung?: number;
  duplicates?: number;
  assignedPickupLocation?: number;
  delivery?: number;
  waitlist?: number;
  households?: IdLookup;
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
  householdsAndDupesOutput(dupes, fileDir, orders);

  let lotteryOrders = filterLotteryOrders(orders, pickup);
  let marketChampionOrders = ['6732', '5328', '6144', '5366', '5505'];
  const marketChampions = filterApplicants(lotteryOrders, true, undefined, undefined, marketChampionOrders);

  const priorityZips = ['20001', '20003'];
  const prioritySeniors = filterApplicants(lotteryOrders, true, maxBirthYear, priorityZips);
  const priority = filterApplicants(lotteryOrders, true, undefined, priorityZips);
  const seniors = filterApplicants(lotteryOrders, true, maxBirthYear, undefined);

  let total = lotteryOrders.list.length;

  const marketChampionResult = assign(
    marketChampions,
    marketChampions.length,
    inventoryByLocation,
    orderItems,
    inventoryByLocation,
    lotteryOrders,
  );

  //console.dir({ marketChampions }, { depth: null });
  //console.dir({ marketChampionResult });
  //return { orders, pickup, inventory, prioritySeniors, priority, seniors, remaining: null };

  const priortySeniorResult = assign(
    prioritySeniors,
    prioritySeniors.length,
    inventoryByLocation,
    orderItems,
    inventoryByLocation,
    lotteryOrders,
  );
  const priorityResult = assign(
    priority,
    priority.length,
    inventoryByLocation,
    orderItems,
    inventoryByLocation,
    lotteryOrders,
  );
  const seniorResult = assign(
    seniors,
    seniors.length,
    inventoryByLocation,
    orderItems,
    inventoryByLocation,
    lotteryOrders,
  );

  const remaining = filterApplicants(lotteryOrders, false, undefined, undefined);

  let totalMatched =
    marketChampionResult.stats.matched +
    priortySeniorResult.stats.matched +
    priorityResult.stats.matched +
    seniorResult.stats.matched;
  let totalHouseholdMatched =
    marketChampionResult.stats.householdMatched +
    priortySeniorResult.stats.householdMatched +
    priorityResult.stats.householdMatched +
    seniorResult.stats.householdMatched;

  const remainingResult = assign(
    lotteryOrders.list,
    total - totalMatched,
    inventoryByLocation,
    orderItems,
    inventoryByLocation,
    lotteryOrders,
  );

  totalMatched += remainingResult.stats.matched;
  totalHouseholdMatched += remainingResult.stats.householdMatched;

  let grandTotalMatched = totalMatched + totalHouseholdMatched;

  let orderItemsMatched = translateToOrderItems(lotteryOrders, inventory, orderItems);

  console.dir({ totalMatched, totalHouseholdMatched, grandTotalMatched });
  console.dir({ marketChampionResult }, { depth: null });
  console.dir({ priortySeniorResult }, { depth: null });
  console.dir({ priorityResult }, { depth: null });
  console.dir({ seniorResult }, { depth: null });
  console.dir({ remainingResult }, { depth: null });

  temporaryInventoryDump(fileDir, inventory, orderItems, pickup);

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
    let byOrderItem: IdLookup = {};

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
        if (row['Item ID']) {
          if (byOrderItem[row['Item ID']] === undefined) {
            byOrderItem[row['Item ID']] = [];
          }
          byOrderItem[row['Item ID']].push(row);
        }
      })
      .on('end', () => {
        let msTaken = Date.now() - start;
        console.dir({ msg: `CSV file successfully processed`, file, msTaken });
        resolve({ list, lookup, msTaken, byOrder, byOrderItem });
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
  ordersToMatch?: string[],
) {
  let result: any[] = [];
  console.dir({ msg: 'filtering applicants', maxBirthYear, zipCodes, ordersToMatch });
  orders.list.some((order) => {
    let passes = false;
    if (ordersToMatch && ordersToMatch.includes(order['Order ID'])) {
      order.matcherGroup = 'Order List';
      passes = true;
    } else {
      if (ordersToMatch) {
        return false;
      }
    }

    if (!passes) {
      if (maxBirthYear) {
        order.matcherGroup = 'Senior';
      }

      if (zipCodes) {
        order.matcherGroup = 'Priority';
      }

      if (maxBirthYear && zipCodes) {
        order.matcherGroup = 'Senior Priority';
      }

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
    }

    if (passes) {
      order.filtered = true;
      result.push(order);
    } else {
      order.matcherGroup = null;
    }

    return false;
  });
  return result;
}

function assign(
  population: any[],
  limitToMatch: number,
  inventory: IdLookup,
  orderItems: ParseResult,
  inventoryByLocation: IdLookup,
  lotteryOrders: ParseResult,
) {
  console.dir({ msg: 'Attepmting to match', limitToMatch, of: population.length });

  let stats = {
    assignments: { first: 0, second: 0, third: 0 },
    waitlist: { first: 0, second: 0, third: 0 },
    badLocationIDsSize: 0,
    matched: 0,
    assigned: 0,
    waitlisted: 0,
    attempts: 0,
    failedToMatch: 0,
    householdMatched: 0,
  };
  while (stats.matched < limitToMatch && stats.matched < population.length) {
    if (stats.attempts++ > 500000) {
      break;
    }

    let rand = Math.floor(Math.random() * population.length);
    let applicant = population[rand];
    if (applicant) {
      //console.log("assigning", rand, population[rand].assigned)
      matchApplicant(applicant, inventoryByLocation, stats, orderItems.byOrderItem, lotteryOrders);
    } else {
      console.log('bad rand', rand, population.length);
    }
  }

  population.some((applicant) => {
    if (!applicant.assigned) {
      matchApplicant(applicant, inventoryByLocation, stats, orderItems.byOrderItem, lotteryOrders);
      if (!applicant.assigned)
        console.dir({
          msg: 'catch all match',
          orderID: applicant['Order ID'],
          assigned: applicant.assigned,
          matchAttempts: applicant.matchAttempts,
        });
    }
    return false;
  });

  let retval = {
    totalMatched: stats.matched + stats.householdMatched,
    attempts: stats.attempts,
    pop: population.length,
    stats,
  };
  //console.dir({retval});

  return retval;
}

function matchApplicant(
  applicant: any,
  inventoryByLocation: IdLookup,
  stats: any,
  byOrderItem: IdLookup,
  lotteryOrders: ParseResult,
  household?: string,
) {
  if (!applicant.assigned) {
    applicant.householdMatch = household;
    // check prefernces, check inventory, assign to specific location

    if (!applicant.LocationIDs) {
      let items = applicant['Order Items'].split(',');
      let locationIDs: string[] = [];
      items.some((itemID: string) => {
        let item = byOrderItem[itemID][0];
        if (item) {
          let pickupAirtableId = item['Airtable ID (from Linked Pickup Location) (from Inventory)'];
          //console.dir({ pickupAirtableId });
          if (pickupAirtableId !== '') {
            locationIDs.push(pickupAirtableId);
          }
        }
        //console.dir({ item });
        //return true;
      });

      if (locationIDs.length > 0) {
        applicant.LocationIDs = locationIDs.join('|');
      }

      // console.log(
      //   'no LocationIDs, faked from Order Items',
      //   applicant['Order ID'],
      //   applicant.LocationIDs,
      //   applicant.selectedLocation,
      //   applicant['Order Items'],
      // );
    }

    if (!applicant.LocationIDs) {
      console.log('faking assigned to let math work out');
      applicant.assigned = true;
      stats.assigned++;
    }

    if (applicant.LocationIDs) {
      let matched = false;
      let locationPreferences = applicant.LocationIDs.split('|');
      if (locationPreferences.length !== 3 || (locationPreferences[1] || '') === '') {
        //console.error('Bad LocationIds size', applicant['Order ID'], locationPreferences);
        //console.dir({ applicant });
        stats.badLocationIDsSize++;
      }

      if (locationPreferences.length > 0) {
        applicant.matchStatus = 'Neither';

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
                  stats.assigned++;
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
          if (matched) {
            applicant.matchStatus = 'Assigned';
          }

          return matched;
        });

        applicant.attempted = true;

        if (!matched) {
          //console.log('trying waitlist', applicant['Order ID'], attempts, locationPreferences);
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
                    stats.waitlisted++;
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
                  } else {
                    //console.dir({ msg: 'adding Order to overwaitlist', order: applicant['Order ID']})
                    item.overWaitlist[applicant['Order ID']] = applicant;
                  }
                }
              });
            } else {
              console.dir({ msg: 'no items waitlist', location, OrderID: applicant['Order ID'] });
            }

            if (matched) {
              applicant.matchStatus = 'Waitlisted';
            }

            return matched;
          });
        }

        if (!matched) {
          //console.dir({msg: 'no match possible', applicant})
        }
        applicant.assigned = matched;
        applicant.matchAttempts = applicant.matchAttempts || 0;
        applicant.matchAttempts++;
        if (matched) {
          if (household) {
            stats.householdMatched++;
          } else {
            stats.matched++;
          }
        } else {
          if (applicant.matchAttempts === 1) {
            stats.failedToMatch++;
          }
        }

        if (applicant.Household && !household) {
          //console.dir({ apphousehold: applicant.Household, household });
          if (lotteryOrders.households) {
            let householdOrders = lotteryOrders.households[applicant.Household];
            householdOrders.some((subApplicant: any) => {
              if (!subApplicant.assigned) {
                if (subApplicant['Order ID'] !== applicant['Order ID']) {
                  //console.dir({ sub: subApplicant['Order ID'], subHouse: subApplicant.Household });
                  matchApplicant(
                    subApplicant,
                    inventoryByLocation,
                    stats,
                    byOrderItem,
                    lotteryOrders,
                    subApplicant.Household,
                  );

                  if (!subApplicant.assigned) {
                    console.dir({
                      msg: 'Household match result',
                      subOrder: subApplicant['Order ID'],
                      assigned: subApplicant.assigned,
                      matchStatus: subApplicant.matchStatus,
                      choice: subApplicant.choice,
                      matchAttempts: subApplicant.matchAttempts,
                    });
                  }
                }
              } else {
                // console.dir({
                //   msg: 'Household memeber already matched',
                //   subOrder: subApplicant['Order ID'],
                //   attempts: subApplicant.attempts,
                //   household: subApplicant.Household,
                // });
              }
            });
          }
        }
      }
    }
  }
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

    const name = order.Name?.trim().toLowerCase();
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
  orders: ParseResult,
) {
  let dupeEmails: { email: string; count: number }[] = [];
  let dupePhones: { phone: string; count: number }[] = [];
  let dupeAddreses: { address: string; count: number }[] = [];
  let dupeLastWords: { lastWord: string; count: number }[] = [];

  let dupeOrdersByEmails: {
    dupe: string;
    Name: string;
    BirthYear: string;
    Email: string;
    Phone: string;
    Street: string;
    Street2: string;
    Zip: string;
    OrderID: string;
    Duplicate: string;
    Household: string;
  }[] = [];
  let dupeOrdersByPhones: {
    dupe: string;
    Name: string;
    BirthYear: string;
    Email: string;
    Phone: string;
    Street: string;
    Street2: string;
    Zip: string;
    OrderID: string;
    Duplicate: string;
    Household: string;
  }[] = [];
  let dupeOrdersByAddresses: {
    dupe: string;
    Name: string;
    BirthYear: string;
    Email: string;
    Phone: string;
    Street: string;
    Street2: string;
    Zip: string;
    OrderID: string;
    Duplicate: string;
    Household: string;
  }[] = [];
  let dupeOrdersByLastWords: {
    dupe: string;
    Name: string;
    BirthYear: string;
    Email: string;
    Phone: string;
    Street: string;
    Street2: string;
    Zip: string;
    OrderID: string;
    Duplicate: string;
    Household: string;
  }[] = [];

  Object.keys(list.emails).forEach((key) => {
    let dupes = list.emails[key];
    if (dupes.length > 1) {
      dupeEmails.push({ email: key, count: dupes.length });

      orders.list.some((order: any) => {
        if (order.Email === key) {
          dupeOrdersByEmails.push({
            dupe: key,
            Name: order.Name,
            BirthYear: order['Birth Year'],
            Email: order.Email,
            Phone: order['Phone Number'],
            Street: order.address_street1,
            Street2: order.address_street2,
            Zip: order.Zip,
            OrderID: order['Order ID'],
            Duplicate: order['Duplicate'],
            Household: order['Household'],
          });
        }
      });
    }
  });

  Object.keys(list.phones).forEach((key) => {
    let dupes = list.phones[key];
    if (dupes.length > 1) {
      dupePhones.push({ phone: key, count: dupes.length });

      orders.list.some((order: any) => {
        if (order['Phone Number'] === key) {
          dupeOrdersByPhones.push({
            dupe: key,
            Name: order.Name,
            BirthYear: order['Birth Year'],
            Email: order.Email,
            Phone: order['Phone Number'],
            Street: order.address_street1,
            Street2: order.address_street2,
            Zip: order.Zip,
            OrderID: order['Order ID'],
            Duplicate: order['Duplicate'],
            Household: order['Household'],
          });
        }
      });
    }
  });

  Object.keys(list.addresses).forEach((key) => {
    let dupes = list.addresses[key];
    if (dupes.length > 1) {
      dupeAddreses.push({ address: key, count: dupes.length });

      orders.list.some((order: any) => {
        if (order['address_street1'] === key) {
          dupeOrdersByAddresses.push({
            dupe: key,
            Name: order.Name,
            BirthYear: order['Birth Year'],
            Email: order.Email,
            Phone: order['Phone Number'],
            Street: order.address_street1,
            Street2: order.address_street2,
            Zip: order.Zip,
            OrderID: order['Order ID'],
            Duplicate: order['Duplicate'],
            Household: order['Household'],
          });
        }
      });
    }
  });

  Object.keys(list.lastWords).forEach((key) => {
    let dupes = list.lastWords[key];
    if (dupes.length > 1) {
      dupeLastWords.push({ lastWord: key, count: dupes.length });

      orders.list.some((order: any) => {
        let parts = order.Name.trim()
          .toLowerCase()
          .split(' ');

        if (parts[parts.length - 1] === key) {
          dupeOrdersByLastWords.push({
            dupe: key,
            Name: order.Name,
            BirthYear: order['Birth Year'],
            Email: order.Email,
            Phone: order['Phone Number'],
            Street: order.address_street1,
            Street2: order.address_street2,
            Zip: order.Zip,
            OrderID: order['Order ID'],
            Duplicate: order['Duplicate'],
            Household: order['Household'],
          });
        }
      });
    }
  });

  let ws = fs.createWriteStream(path.join(fileDir, 'dupe-emails.csv'));
  csv.write(dupeEmails, { headers: true }).pipe(ws);
  console.log('wrote emails dupes');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-emails-orders.csv'));
  csv.write(dupeOrdersByEmails, { headers: true }).pipe(ws);
  console.log('wrote emails dupes orders');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-phones.csv'));
  csv.write(dupePhones, { headers: true }).pipe(ws);
  console.log('wrote phones dupes');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-phones-orders.csv'));
  csv.write(dupeOrdersByPhones, { headers: true }).pipe(ws);
  console.log('wrote phones dupes orders');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-addresses.csv'));
  csv.write(dupeAddreses, { headers: true }).pipe(ws);
  console.log('wrote addresses dupes');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-Addresses-orders.csv'));
  csv.write(dupeOrdersByAddresses, { headers: true }).pipe(ws);
  console.log('wrote Addresses dupes orders');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-last-words.csv'));
  csv.write(dupeLastWords, { headers: true }).pipe(ws);
  console.log('wrote last-words dupes');

  ws = fs.createWriteStream(path.join(fileDir, 'dupe-LastWords-orders.csv'));
  csv.write(dupeOrdersByLastWords, { headers: true }).pipe(ws);
  console.log('wrote LastWords dupes orders');
}

function filterLotteryOrders(orders: ParseResult, pickup: ParseResult): ParseResult {
  let lottery: ParseResult = {
    list: [],
    lookup: {},
    msTaken: -1,
    byOrder: {},
    byOrderItem: {},
    tooYoung: 0,
    duplicates: 0,
    assignedPickupLocation: 0,
    waitlist: 0,
    delivery: 0,
    households: {},
  };

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
      lottery.assignedPickupLocation = (lottery.assignedPickupLocation || 0) + 1;
    } else {
      if (order.Type !== 'Delivery') {
        if (order['Order Status'] !== 'Waitlist') {
          if (order.birthYear && order.birthYear >= 2006) {
            console.dir({ msg: 'skipping too young', birthYear: order.birthYear, orderID: order['Order ID'] });
            lottery.tooYoung = (lottery.tooYoung || 0) + 1;
          } else {
            if (order.Duplicate) {
              lottery.duplicates = (lottery.duplicates || 0) + 1;
            } else {
              lottery.list.push(order);
              lottery.lookup[order['Airtable ID']] = order;
              if (order['Order ID']) {
                lottery.byOrder[order['Order ID']] = order;
              }

              if (order.Household) {
                if (lottery.households && !lottery.households[order.Household]) {
                  lottery.households[order.Household] = [];
                }
                if (lottery.households) {
                  lottery.households[order.Household].push(order);
                }
              }
            }
          }
        } else {
          console.dir({ msg: 'skip waitlist', type: order.Type, status: order['Order Status'] });
          lottery.waitlist = (lottery.waitlist || 0) + 1;
        }
      } else {
        //console.dir({ msg: "skip delivery", type: order.Type, status: order['Order Status'] })
        lottery.delivery = (lottery.delivery || 0) + 1;
      }
    }
  });

  lottery.msTaken = Date.now() - start;
  console.dir({ orders: { count: orders.list.length } });
  console.dir({
    lottery: {
      count: lottery.list.length,
      tooYoung: lottery.tooYoung,
      duplicates: lottery.duplicates,
      assignedPickup: lottery.assignedPickupLocation,
      delivery: lottery.delivery,
      waitlist: lottery.waitlist,
    },
  });
  console.dir({
    lottery: {
      count: lottery.list.length,
      totalSkipped:
        (lottery.tooYoung || 0) +
        (lottery.duplicates || 0) +
        (lottery.assignedPickupLocation || 0) +
        (lottery.delivery || 0) +
        (lottery.waitlist || 0),
      lotteryPlusSkipped:
        lottery.list.length +
        (lottery.tooYoung || 0) +
        (lottery.duplicates || 0) +
        (lottery.assignedPickupLocation || 0) +
        (lottery.delivery || 0) +
        (lottery.waitlist || 0),
      originalTotal: orders.list.length,
    },
  });

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

    item.overWaitlist = {};

    item.stockAmount = parseInt(item['Stock Level']);
    if (item.stockAmount === 5000) {
      item.stockAmount = 50;
    }

    item.waitlistLevel = Math.floor(item.stockAmount * 0.3);
  });

  return byLocation;
}

function temporaryInventoryDump(fileDir: string, inventory: ParseResult, orderItems: ParseResult, pickup: ParseResult) {
  const assignments: any[] = [];
  const summary: any[] = [];
  const ids: any[] = [];
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

    //   if( Object.keys(item.overWaitlist).length > 0 ) {
    //  console.dir({ item });
    //  return true;
    //   }

    let site = pickup.lookup[item['Airtable ID (from Linked Pickup Location)']];

    if (!site) {
      //console.dir(item);
    }

    summary.push({
      Location: item['Stock Location'],
      Community: site && site['Community Site'],
      Assigned: item.assigned,
      Waitlisted: item.waitlisted,
      'Assignments Available': item.stockAmount - item.assigned,
      'Waitlists Available': item.waitlistLevel - item.waitlisted,
      'Over Waitlist': Object.keys(item.overWaitlist).length,
      'Stock Limit': item.stockAmount,
      'Waitlist Limit': item.waitlistLevel,
      'Pickup Location Airtable ID': item['Airtable ID (from Linked Pickup Location)'],
    });
  });

  orderItems.list.some((item) => {
    let toPush: any = {};

    if (item.Assigned === 1) {
      toPush.Status = 'Assigned';
    }
    if (item.Waitlisted === 1) {
      toPush.Status = 'Waitlisted';
    }

    if (toPush.Status) {
      //console.dir({ hasStatus: item });
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
    } else {
      let pickupID = item['Airtable ID (from Linked Pickup Location) (from Inventory)'];
      let pickupSite = pickup.lookup[pickupID];
      if (pickupSite) {
        pickupSite.idCount = pickupSite.idCount || 0;
        //console.dir({ msg: 'No push Status', item, pickupSite });
        if (pickupSite['Community Site'] === 'checked') {
          let prefix = pickupSite['CustomerID Prefix'];
          if (item['Order Type'] === 'Delivery') {
            prefix = 'DELIVER';
          }
          let orderNum = pickupSite.idCount++ + 1;
          let idVal = {
            'Customer ID': `${prefix}${orderNum.toString().padStart(3, '0')}`,
            'Airtable ID': item['Airtable ID'],
          };
          //console.dir({ idVal });

          //return true;
          ids.push(idVal);
        } else {
          //console.log({ noStatus: item });
        }
      } else {
        if (pickupID.indexOf(',') > -1) {
          //console.dir({ msg: 'multiple pickup sites', pickupID, orderID: item['Order'] });
        } else {
          console.dir({ msg: 'no pickup site', item });
        }
      }
    }
  });

  let ws = fs.createWriteStream(path.join(fileDir, 'assignments-items.csv'));
  csv.write(assignments, { headers: true }).pipe(ws);

  ws = fs.createWriteStream(path.join(fileDir, 'assignments-summary.csv'));
  csv.write(summary, { headers: true }).pipe(ws);

  ws = fs.createWriteStream(path.join(fileDir, 'assignments-ids.csv'));
  csv.write(ids, { headers: true }).pipe(ws);
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
