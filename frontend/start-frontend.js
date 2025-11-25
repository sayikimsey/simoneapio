// File: /frontend/start-frontend.js

const { exec } = require('child_process');
const path = require('path');

// Execute `npm start` in the current directory
const child = exec('npm start', { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Frontend Start Error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

console.log('Starting frontend service...');