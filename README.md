# Welcome to My Curl
***
## Task

This README describes a Command-Line Interface (CLI) program named csv-sitrep-cli whose functionality is currently broken and needs to be fixed in order to match the stated functionality. The candidate is tasked with writing a situation report (sitrep) describing what is broken, why, and what the minimum viable path to fix the issue and restore functionality. Optionally the student can solve the issues, but scoring will be based primarily on the quality of diagnosis.

## Desciption
csv-sitrep-cli is designed to manipulate comma-separated value files through three separate functionalities. When starting the program, the user should be met with the prompt:

```bash
--- CSV-TO-JSON-REPORTS APPLICATION ---

--- No file loaded ---
Options: 
  0: Load/Change CSV File
  1: Summary
  2: Validate
  3: Build Report
  exit: Close Program
```

0) Load/Change CSV File- Prompts the user to enter the name of the CSV file that is to be processed.

1) Summary- This function prints total row count, total revenue, average order value, and top 3 products based on total revenue.

2) Validate- This function validates the CSV file vs. the CSV schema and ensures that the correct datatype is contained within each line of the CSV file, thus preventing processing errors.


3) Report- This function converts a CSV to JSON and writes the JSON-formatted information to file.

exit. Exit- should cleanly close the program, otherwise the menu should run in a continuous loop.

csv-sitrep-cli is written in Typescript using an object-orientd approach and runs on NodeJS.

## Installation
1) To clone the repository:

```bash
git clone <repo!!!name>
```

2) Navigate into <repo!!!folder!!!name> folder

```bash
cd <repo!!!folder!!!name>
```

3) Build Typescript environment by running setup-dev-env.sh

```bash
sh setup-dev-env.sh
```

## Usage

To Use:

```bash
npx ts-node index.ts    <<< !!! does index.ts need to have a name change???
```

Follow the options within the program's menu to use the Summary, Validate and Report functionality.

Good Luck!

### The Core Team


<span><i>Made at <a href='https://qwasar.io'>Qwasar SV -- Software Engineering School</a></i></span>
<span><img alt='Qwasar SV -- Software Engineering School's Logo' src='https://storage.googleapis.com/qwasar-public/qwasar-logo_50x50.png' width='20px' /></span>
