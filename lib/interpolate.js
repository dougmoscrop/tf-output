'use strict';

const ValidationError = require('./validation-error');

module.exports = function(value, options, defaults) {
  if (!value) {
    return '';
  }

  const values = Object.assign({}, options.command, options, defaults );

  let interpolated = value;
  let match;

  do {
    match = /{([a-zA-Z0-9_]*)}/.exec(interpolated);

    if (match) {
      const key = match[1];
      if (key in values) {
        interpolated = interpolated.replace(match[0], values[key]);
      } else {
        throw new ValidationError(`"${value}" references missing value '${key}'`)
      }
    }
  } while (match);

  return interpolated;
}
