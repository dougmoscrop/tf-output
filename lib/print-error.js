'use strict';

const ValidationError = require('../lib/validation-error');

/* eslint-disable no-console */
module.exports = function printError(e, options) {
  if (e instanceof ValidationError) {
    if (options.verbose) {
      if (e.output) {
        console.error(e.output);
      }

      if (e.errorOutput) {
        console.error(e.errorOutput);
      }
    }

    console.error(`Error: ${e.message}`);
  } else {
    if (options.verbose) {
      console.error(e);
    } else {
      console.error(`Error: ${e.message}`);
    }
  }
};
