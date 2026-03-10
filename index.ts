import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import csvParser from 'csv-parser';
import { writeFile } from 'node:fs/promises';
import fs from 'node:fs';

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
  let invalidData: boolean = false;
  
  data.forEach((row, index) => {
    // index starts at 0, data starts after header, so physical row = index + 2
    const fileRowNumber = index + 2; 

    const isAnyNull = Object.values(row).some(
      value => value === null || value === undefined || value === ""
    );

    if (isAnyNull) {
      console.error(`Validation Error: Missing value found on CSV row ${fileRowNumber} at column ${index}`);
      // Note: return here only exits the current iteration, not the whole function
      invalidData = true;
    }
    
    // ... rest of your validation logic using fileRowNumber
  });

  // csv[0] check that it starts with "UID-" and next 3 have to be between ("0" and "9")
  for (let i = 0; i < data.length; i++) {
    if (data[i].OrderID.startsWith("UID-")) {
      const idPart = data[i].OrderID.slice(4); // Get the part after "UID-"
      if (idPart.length !== 3) {
        console.error("Validation Error: Invalid UID format");
        invalidData = true;
      }
      for (let j = 0; j < idPart.length; j++) {
        if (idPart[j] < '0' || idPart[j] > '9') {
          console.error("Validation Error: Invalid UID format");
          invalidData = true;
        }
      }
    }

    if (!(data[i].TimeStamp instanceof Date) || isNaN(data[i].TimeStamp.getTime())) {
      console.error(`Validation Error: The date format is invalid for row ${i}`);
      invalidData = true;
    }

    // The (\.\d{3})? makes the decimal and three digits for milliseconds optional
    const timeStampFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;  
    let timestampStr = data[i].TimeStamp.toISOString();
    if (!timeStampFormat.test(timestampStr)) {
      console.error(`Validation Error: Timestamp format is invalid for row ${i}`);
      invalidData = true; 
    }

    // csv[i] is number ... check that value is between ("0" and "9") or "."
    if (Number.isNaN(data[i].Price) || Number.isNaN(data[i].Sold) || Number.isNaN(data[i].Revenue)) {
      console.error(`Validation Error: Price, Number Sold, and Revenue must be valid numbers in row ${i}.`);
      invalidData = true;
    }

    // if csv[i] is string... I don't know? check for quotes???
    let nameVal = data[i].Name;
    let itemIDVal = data[i].ItemID;
    let descVal = data[i].Desc;
    if (typeof nameVal !== 'string' || typeof itemIDVal !== 'string' || typeof descVal !== 'string' ||
      nameVal.trim() === '' || itemIDVal.trim() === '' || descVal.trim() === '') {
      console.error(`Validation Error: Name, ItemID, Desc must be valid strings (cannot be empty) in row ${i}`);
      invalidData = true;
    }

    if (/^\d+$/.test(nameVal.trim()) || /^\d+$/.test(itemIDVal.trim()) || /^\d+$/.test(descVal.trim())) {
      console.error(`Validation Error: Name, ItemID, Desc cannot contain only numbers in row ${i}`);
      invalidData = true;
    }
  }

  if(invalidData === false){
    console.log("CSV file format is VALID");
  }
  else{
    console.log("CSV file format is INVALID");
  }
}

// csv-sitrep report <file.csv> --out report.json 
// writes JSON report to disk CSV to JSON

async function buildReport(data: RowData[], rl: readline.Interface) {
  // convert to json
  const jsonReport = JSON.stringify(data, null, 2);

  // get user to type in name for json
  const jsonName = await rl.question('Enter desired name for json file: <name>.json: ');
  const jsonfileName = jsonName + ".json";
  console.log(jsonfileName); // save json to .json file
 
  try{
    await writeFile(jsonfileName, jsonReport);
    console.log('JSON report successfully saved as ', jsonfileName)
  } catch(err){
    console.error('Error writing JSON file: ', err);
  }

  return;
}
async function runCli() {
  let data: RowData[] = [];
  let currentFileName: string = "";
  const rl = readline.createInterface({ input, output });

  console.log('\x1b[36m--- CSV-TO-JSON-REPORTS APPLICATION ---\x1b[0m');

  let keepRunning: boolean = true;

  while (keepRunning) {
    // Show current file status
    const status = currentFileName ? `Active File: ${currentFileName}` : "No file loaded";
    console.log(`\n--- ${status} ---`);
    console.log(`Options: 
  0: Load/Change CSV File
  1: Summary
  2: Validate
  3: Build Report
  exit: Close Program`);

    const answer = await rl.question('\nSelection: ');
    const choice = answer.trim().toLowerCase();

    // Guard clause: If they try to process data before loading a file
    if (["1", "2", "3"].includes(choice) && data.length === 0) {
      console.log("\x1b[31mError: No data loaded. Please select option '0' first.\x1b[0m");
      continue;
    }

    switch (choice) {
      case "0":
        const fileName = await rl.question('Enter CSV filename: ');
        try {
          const newData = await csvConverter(fileName);
          data = newData;
          currentFileName = fileName;
          console.log(`\x1b[32mSuccessfully loaded ${data.length} rows from ${fileName}\x1b[0m`);
        } catch (err) {
          console.error('\x1b[31mCSV file conversion failed. Check the filename and try again.\x1b[0m');
        }
        break;

      case "1":
        console.log("Running csvSummary...");
        csvSummary(data);
        break;

      case "2":
        console.log("Running csvValidate...");
        csvValidate(data);
        break;

      case "3":
        console.log("Running buildReport...");
        await buildReport(data, rl);
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