import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import csvParser from 'csv-parser';
import fs from 'fs';

// Name,ID,Desc,Price,Number Sold,Revenue
// "Vortex-X Axial Fan","VX-990","High-flow cooling unit",89.50,12,1074.00

type RowData = {
  Name: string;
  ID: string;
  Desc: string;
  Price: number;
  Sold: number;
  Revenue: number;
};






async function csvConverter(fileName: string): Promise<RowData[]> {
  const results: RowData[] = [];

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

function csvSummary(fileName: string) {
        try {

        }
        catch {

        }
        finally {

        }
      }


function csvValidate(fileName: string) {

      }

function buildReport(fileName: string) {

      }

async function runCli() {
        const rl = readline.createInterface({ input, output });

        console.log('\x1b[36m--- CSV-TO-JSON-REPORTS APPLICATION ---\x1b[0m');

        const fileName = await rl.question('Enter CSV filename: ');

        try {
          const data = await csvConverter(fileName);
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
            csvSummary(fileName);
            console.log("running csvSummary");
            break;
          }

          //else if 2
          else if (cleanStatus === "2") {
            csvValidate(fileName);
            console.log("running csvValidate");
            break;
          }

          //else if 3
          else if (cleanStatus === "3") {
            buildReport(fileName);
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