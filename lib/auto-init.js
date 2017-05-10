'use strict';

const spawn = require('child_process').spawn;
const fs = require('fs');

const getPath = require('./get-path');
const ValidationError = require('./validation-error');

/* eslint-disable no-console */

module.exports = function getTerraformOutputs(options) {
  if (!options.auto) {
    return Promise.resolve();
  }

  return Promise.all(options._.map(dir => {
    return new Promise((resolve, reject) => {
      const cwd = getPath(dir, options);

      try {
        fs.statSync(cwd);
      } catch (e) {
        if (e.code === 'ENOENT') {
          reject(new ValidationError(`the path ${cwd} calculated from ${options.path} does not exist`));
        }
        reject(e);
        return;
      }

      const args = ['init', '-no-color', '-input=false'];

      const terraform = spawn(
        'terraform',
        args,
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
          resolve({
            cwd,
            output
          });
        } else {
          reject(new ValidationError(`'terraform init' returned a non-zero status code in ${cwd}`, {
            output,
            errorOutput
          }));
        }
      });
    })
  }))
  .then(results => {
    return results.map(result => {
      console.log('Backend initialized successfully');
      console.log('- ', result.cwd, ':\n', result.output);
      console.log('Ready to get outputs');
    })
  });
};
