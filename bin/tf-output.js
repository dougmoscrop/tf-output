#!/usr/bin/env node

'use strict';

const getOptions = require('../lib/get-options');
const getOutputs = require('../lib/get-outputs');
const runCommand = require('../lib/run-command');
const printError = require('../lib/print-error');
const printOutputs = require('../lib/print-outputs');

const args = process.argv.slice(2);
const options = getOptions(args);

if (options === false) {
  process.exitCode = 2;
  return;
}

Promise.all(options.dirs.map(dir => getOutputs(dir, options)))
  .then(results => Object.assign({}, ...results))
  .then(outputs => {
    if (options.commandArgv && options.commandArgv.length) {
      return runCommand(options.commandArgv, { test: 'value' });
    } else {
      return printOutputs(outputs, options);
    }
  })
  .catch(e => {
    process.exitCode = 1;
    printError(e, options);
  });
