'use strict';

/* eslint-disable no-console */
module.exports = function printOutput(outputs, options) {
  const format = options.format;

  switch(format) {
    case 'json':
      console.log(JSON.stringify(outputs, null, 2));
    break;
    case 'env':
      Object.keys(outputs).forEach(key => {
        console.log(`${key}="${outputs[key]}"`);
      });
    break;
  }
};
