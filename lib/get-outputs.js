'use strict';

const spawn = require('child_process').spawn;
const fs = require('fs');

const getPath = require('./get-path');
const ValidationError = require('./validation-error');

module.exports = function getTerraformOutputs(options) {
  return Promise.all(options.modules.map(module => {
    return new Promise((resolve, reject) => {
      const cwd = getPath(module, options);

      try {
        fs.statSync(cwd);
      } catch (e) {
        if (e.code === 'ENOENT') {
          throw new ValidationError(`the path ${cwd} calculated from ${options.path} does not exist`);
        }
        throw e;
      }

      const terraform = spawn(
        'terraform',
        [
          'output',
          '-json',
          `-module=${module}`
        ],
        {
          cwd,
          shell: true
      });

      let output = '';
      let errorOutput = '';

      terraform.stdout.setEncoding('utf8');
      terraform.stdout.on('data', data => {
        output += data;
      });

      terraform.stderr.setEncoding('utf8');
      terraform.stderr.on('data', data => {
        errorOutput += data;
      });

      [
        'SIGTERM',
        'SIGINT',
        'SIGHUP',
        'SIGBREAK'
      ].forEach(signal => {
        process.on(signal, () => terraform.kill(signal));
      });

      terraform.on('error', reject);
      terraform.on('exit', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          throw new ValidationError(`'terraform output' returned a non-zero status code for the '${module}' module`, {
            output,
            errorOutput
          });
        }
      });
    })
  }))
  .then(results => {
    return results.reduce((memo, result) => {
      if (result) {
        const parsed = JSON.parse(result);

        Object.keys(parsed).forEach(key => {
          Object.assign(memo, { [key]: parsed[key].value });
        });
      }

      return memo;
    }, {});
  });
};
