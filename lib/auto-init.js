'use strict';

const spawn = require('child_process').spawn;
const fs = require('fs');

const getPath = require('./get-path');
const ValidationError = require('./validation-error');

function runTerraform(isRun, cwd, args) {
  if(!isRun) {
    return Promise.resolve('no-op');
  }

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
}

module.exports = function getTerraformOutputs(options) {
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

      const initArgs = ['init', '-no-color', '-input=false', '-get=false'];
      const planArgs = ['plan', '-no-color', '-detailed-exitcode'];
      resolve(runTerraform(options.auto, cwd, initArgs)
        .then(() => {
          return runTerraform(!options['allow-unapplied-plan'], cwd, planArgs);
        }));
    })
  }));
};
