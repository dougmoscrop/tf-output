#!/usr/bin/env node

'use strict';

const getOptions = require('../lib/get-options');
const init = require('../lib/auto-init');
const getOutputs = require('../lib/get-outputs');
const runCommand = require('../lib/run-command');
const printOutputs = require('../lib/print-outputs');
const printError = require('../lib/print-error');

const args = process.argv.slice(2);
const options = getOptions(args);

init(options)
  .then(() => getOutputs(options))
  .then(outputs => {
    if (options.commandArgv && options.commandArgv.length) {
      return runCommand(options.commandArgv, outputs);
    } else {
      return printOutputs(outputs, options);
    }
  })
  .catch(e => {
    process.exitCode = 1;
    printError(e);
  });
