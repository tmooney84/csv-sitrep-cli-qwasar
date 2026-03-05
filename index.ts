import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import csvParser from 'csv-parser';
import fs from 'fs';

// Name,ID,Desc,Price,Number Sold,Revenue
// "Vortex-X Axial Fan","VX-990","High-flow cooling unit",89.50,12,1074.00

type RowData = {
  OrderID: string;
  TimeStamp: Date;
  Name: string;
  ItemID: string;
  Desc: string;
  Price: number;
  Sold: number;
  Revenue: number;
};

async function csvConverter(fileName: string): Promise<RowData[]> {
  const results: RowData[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(fileName)
      .pipe(csvParser())
      // Use 'any' for the raw incoming row because it's just raw strings
      .on('data', (data: any) => {
        const row: RowData = {
          OrderID: data.ID,
          TimeStamp: new Date(data.Date), // Parsing the ISO string to Date object
          Name: data.Name,
          ItemID: data['Item ID'], // Use bracket notation for keys with spaces
          Desc: data.Desc,
          Price: parseFloat(data.Price),
          Sold: parseInt(data['Number Sold'], 10),
          Revenue: parseFloat(data.Revenue)
        };
        results.push(row);
      })
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}


// csv-sitrep summary <file.csv> prints totals: row count, 
// total revenue, average order value, 
// top 3 products by revenue  (IS THIS BASED OFF OF REVENUE???) ratio of revenue and # sold per product?

function csvSummary(data: RowData[]) {
  try {
    const rowCount: number = data.length;
    let totalRevenue: number = 0;
    for (let i: number = 0; i < data.length; i++) {
      totalRevenue += Number(data[i].Revenue);
    }
    const averageOrderValue: number = totalRevenue / rowCount;

    console.log("Row Count: ", rowCount);
    console.log("Total Revenue: ", totalRevenue);
    console.log("Row Average Order Value: ", averageOrderValue);
    console.log("Top 3 Products by Revenue: ", data.sort((a, b) => b.Revenue - a.Revenue).slice(0, 3));
  }
  catch (e) {
    console.error('csvSummary function failed.', e);
  }
}

// csv-sitrep validate <file.csv> validates schema and prints errors with line numbers
// Name 	| ID		| Desc 		| Price | Number Sold | Revenue
// “Widget 1”, “UD45643”, “Blah Blah”,  49.99, 	   10, 	               499.90

function csvValidate(data: RowData[]) {
  // check if 8 csv values
  data.forEach((row, index) => {
      const isAnyNull = Object.values(row).some(value => value === null || value === undefined || value === "");
      if (isAnyNull) {
        console.error("Found a missing value at index " + index + "!");
        return;
      }
  });

  // csv[0] check that it starts with "UID-" and next 3 have to be between ("0" and "9")
  for (let i = 0; i < data.length; i++) {
    if (data[i].OrderID.startsWith("UID-")) {
      const idPart = data[i].OrderID.slice(4); // Get the part after "UID-"
      if (idPart.length !== 3) {
        console.error("Invalid UID format");
        return;
      }
      for (let j = 0; j < idPart.length; j++) {
        if (idPart[j] < '0' || idPart[j] > '9') {
          console.error("Invalid UID format");
          return;
        }
      }
    }

    if (!(data[i].TimeStamp instanceof Date) || isNaN(data[i].TimeStamp.getTime())) {
      console.error("This date is invalid!");
      return;
    }

    const timeStampFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    let timestampStr = data[i].TimeStamp.toISOString();
    if (!timeStampFormat.test(timestampStr)) {
      console.error("Timestamp format incorrect");
      return;
    }

    // csv[i] is number ... check that value is between ("0" and "9") or "."
    if (Number.isNaN(data[i].Price) || Number.isNaN(data[i].Sold) || Number.isNaN(data[i].Revenue)) {
      console.error("Price, Number Sold, and Revenue must be valid numbers.");
      return;
    }

    // if csv[i] is string... I don't know? check for quotes???
    let nameVal = data[i].Name;
    let itemIDVal = data[i].ItemID;
    let descVal = data[i].Desc;
    if (typeof nameVal !== 'string' || typeof itemIDVal !== 'string' || typeof descVal !== 'string' ||
      nameVal.trim() === '' || itemIDVal.trim() === '' || descVal.trim() === '') {
      console.error("Name, ItemID, Desc must be valid strings (cannot be empty)");
      return;
    }

    if (/^\d+$/.test(nameVal.trim()) || /^\d+$/.test(itemIDVal.trim()) || /^\d+$/.test(descVal.trim())) {
      console.error("Name, ItemID, Desc cannot contain only numbers");
      return;
    }
  }
  
}

// csv-sitrep report <file.csv> --out report.json 
// writes JSON report to disk CSV to JSON

async function buildReport(data: RowData[]) {
  // convert to json

  const jsonReport = JSON.stringify(data, null, 2);

  const rll = readline.createInterface({ input, output });
  // get user to type in name for json
  const jsonName = await rll.question('Enter desired name for json file: <name>.json: ');
  const jsonfileName = jsonName + ".json";
  console.log(jsonfileName); // save json to .json file
  fs.writeFile(jsonfileName, jsonReport, (err) => {
    if (err) {
      console.error('Error writing JSON file: ', err);
    } else {
      console.log('JSON report successfully saved as ', jsonfileName);
    }
  });

  rll.close()
}

async function runCli() {
  let data: RowData[] = [];
  const rl = readline.createInterface({ input, output });

  console.log('\x1b[36m--- CSV-TO-JSON-REPORTS APPLICATION ---\x1b[0m');

  const fileName = await rl.question('Enter CSV filename: ');

  try {
    data = await csvConverter(fileName);
    //console.log('Parsed List:', data);
  } catch (err) {
    console.error('CSV file conversion failed.', err);
  }

  let keepRunning: boolean = true;

  while (keepRunning) {
    console.log(`\nOptions: 
  1: Summary
  2: Validate
  3: Build Report
  exit: Close Program`);

    const answer = await rl.question('\nSelection: ');
    const choice = answer.trim().toLowerCase();

    switch (choice) {
      case "1":
        console.log("running csvSummary...");
        csvSummary(data);
        break;
      case "2":
        console.log("running csvValidate...");
        csvValidate(data);
        break;
      case "3":
        console.log("running buildReport...");
        await buildReport(data);
        break;
      case "exit":
        keepRunning = false;
        break;
      default:
        console.log("Invalid option. Please try again.");
    }
  }

  console.log("Goodbye!");

  rl.close();
}

runCli();