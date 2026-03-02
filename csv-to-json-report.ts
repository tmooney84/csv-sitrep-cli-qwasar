//import * as readline from 'node:readline/promises';
//import { stdin as input, stdout as output } from 'node:process';

import * as readline from 'node:readline';

async function startSurvey() {
  // 1. Initialize the interface
  const rl = readline.createInterface({ input, output });

  try {
    // 2. Ask questions (waits for user input)
    const name = await rl.question('What is your name? ');
    const ageStr = await rl.question('How old are you? ');

    // 3. Simple TypeScript Parsing/Validation
    const age = parseInt(ageStr, 10);

    if (isNaN(age)) {
      console.error('That... is not a number. 🤨');
    } else {
      console.log(`Hello ${name}, you are ${age} years old!`);
    }
  } finally {
    // 4. Always close the interface to free up the process
    rl.close();
  }
}

startSurvey();
