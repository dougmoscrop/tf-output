'use strict';

const spawn = require('child_process').spawn;

const ValidationError = require('./validation-error');

module.exports = function runTerraform(cwd, args) {
    return new Promise((resolve, reject) => {
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
          reject(new ValidationError(`'terraform ${args.join(' ')}' returned a non-zero status code in ${cwd}`, {
            output,
            errorOutput
          }));
        }
      });
    });
};
