/**
 * Skripta koja nas pita za update verzije
 * ako treba treba je ugraditi u build
 */

// see: https://www.npmjs.com/package/prompt
//npm i --save-dev prompt 
//node .\version-prompt.js  "ng build --configuration=styria-test"

/**
 * Conosle colors: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
 */
var prompt = require('prompt');
const { exec } = require('child_process');
const { spawn } = require("child_process");
var pjson = require('./package.json');
const options = {shell: true};
let lastExitCode = 0;

//The key difference between exec() and spawn() is how they return the data. 
//As exec() stores all the output in a buffer, it is more memory intensive than 
//spawn(), which streams the output as it comes.
//!spawn program - atačan na porces i 
//https://stackabuse.com/executing-shell-commands-with-node-js/
var spawnProgram = function (pProg) {
  lastExitCode = 0;
  if (!pProg) return;

  const ls = spawn(pProg,null, options);
  ls.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
  });
  ls.stderr.on("data", data => {
    console.log('\x1b[31m',`stderr: ${data}`);
  });
  ls.on('error', (error) => {
    console.log('\x1b[31m',`error: ${error.message}`);
    lastExitCode = 1;

  });
  ls.on("close", code => {
    console.log(`child process exited with code ${code}`);
    lastExitCode = code;
  });
}


//!Exec program
var execProgram = function (pProg) {
  lastExitCode = 0;
  if (!pProg) return;
  console.log('exec: ' + pProg);

  exec(pProg, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    if (error) console.log('\x1b[31m', 'stderr: ' + stderr);
    if (error) {
      console.log('\x1b[31m', 'exec error: ' + error);
      lastExitCode = 1;
    }
  });
}

let tStart;
//CMD arguments
// console.log(__dirname);

process.argv.forEach(function (val, index, array) {
  // console.log(index + ': ' + val);
  this.tStart = val;
});


//
// Start the prompt
//
prompt.start();

//
// Get two properties from the user: username and email
//
prompt.get([{
  name: 'version', description: 'Update current version:'+pjson.version, type: 'string',                 // Specify the type of input to expect.
  default: 'y',             // Default value to use if no value is entered.
}], function (err, result) {
  //console.log('  version: ' + result.version);
  if (result.version === 'y' || result.version === 'Y') {
    execProgram("npm version patch");
    if (lastExitCode) return;
  }
  // spawnProgram(this.tStart);

  //reset console colors
  console.log('\x1b[0m', '');
});

