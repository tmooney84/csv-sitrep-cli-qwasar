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
  let results: RowData[] = [];

  // Add the parentheses and the arrow here:
  return new Promise((resolve, reject) => { 
    fs.createReadStream(fileName)
      .pipe(csvParser()) // separator: ',' is the default, so {} is optional
      .on('data', (row: RowData) => {
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
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
        catch {

        }
        finally {

        }
}

// csv-sitrep validate <file.csv> validates schema and prints errors with line numbers
// Name 	| ID		| Desc 		| Price | Number Sold | Revenue
// “Widget 1”, “UD45643”, “Blah Blah”,  49.99, 	   10, 	               499.90

function csvValidate(data: RowData[]) {

}

// csv-sitrep report <file.csv> --out report.json 
// writes JSON report to disk CSV to JSON

function buildReport(data: RowData[]) {

}

async function runCli() {
        let data: RowData[] = [];
        const rl = readline.createInterface({ input, output });

        console.log('\x1b[36m--- CSV-TO-JSON-REPORTS APPLICATION ---\x1b[0m');

        const fileName = await rl.question('Enter CSV filename: ');

        try {
          data = await csvConverter(fileName);
          console.log('Parsed List:', data);
        } catch (err) {
          console.error('CSV file conversion failed.', err);
        }

        console.log(`Choose from the following options to manipulate the CSV file:
          1) Summary of CSV file
          2) Validate CSV file
          3) Build Report of CSV file`);

        let status: string = await rl.question('Enter 1, 2, 3 or \"exit\" to exit: ');
        let cleanStatus: string = status.trim().toLowerCase();

        while (true) {
          //if 1
          if (cleanStatus === "1") {
            csvSummary(data);
            console.log("running csvSummary");
            break;
          }

          //else if 2
          else if (cleanStatus === "2") {
            csvValidate(data);
            console.log("running csvValidate");
            break;
          }

          //else if 3
          else if (cleanStatus === "3") {
            buildReport(data);
            console.log("running buildReport");
            break;
          }

          else if(cleanStatus === "exit")
          {
            break;
          }

          else{
            status = rl.question('Incorrect Input. Please enter 1, 2, or 3: ');
            cleanStatus = status.trim().toLowerCase();
          }

      }
     
    rl.close();
}

runCli();