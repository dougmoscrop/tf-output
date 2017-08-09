'use strict';

const fs = require('fs');
const path = require('path');

const ValidationError = require('./validation-error');

module.exports = function getCwd(dir, options) {
  return Promise.resolve()
    .then(() => {
      const values = Object.assign({}, options.command, options, { dir });

      let value = options.path;
      let match;

      do {
        match = /{([a-zA-Z0-9_]*)}/.exec(value);

        if (match) {
          const key = match[1];
          if (key in values) {
            value = value.replace(match[0], values[key]);
          } else {
            throw new ValidationError(`terraform path template ${options.path} references missing value '${key}'`)
          }
        }
      } while (match);

      const cwd = path.join(
        process.cwd(),
        value
      );

      try {
        fs.statSync(cwd);
      } catch (e) {
        if (e.code === 'ENOENT') {
          throw new ValidationError(`the path ${cwd} calculated from ${options.path} does not exist`);
        }
        throw e;
      }

      return cwd;
    });
};
