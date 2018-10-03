'use strict';

const fs = require('fs');
const path = require('path');

const interpolate = require('./interpolate');
const ValidationError = require('./validation-error');

module.exports = function getCwd(dir, options) {
  return Promise.resolve()
    .then(() => {
      const value = interpolate(options.path, options, { dir });
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
