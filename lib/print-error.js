'use strict';

const ValidationError = require('../lib/validation-error');

/* eslint-disable no-console */
module.exports = function printError(e) {
  if (e instanceof ValidationError) {
    if (e.output) {
      console.error(e.output);
    }

    if (e.errorOutput) {
      console.error(e.errorOutput);
    }

    console.error(`Error: ${e.message}`);
  } else {
    console.error(e);
  }
};
