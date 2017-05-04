'use strict';

const spawn = require('child_process').spawn;

module.exports = function(commandArgv, outputs) {
  return new Promise((resolve, reject) => {
    const command = commandArgv.shift();
    const proc = spawn(
      command,
      commandArgv,
      {
        stdio: 'inherit',
        shell: true,
        env: Object.assign({}, process.env, outputs)
    });

    [
      'SIGTERM',
      'SIGINT',
      'SIGHUP',
      'SIGBREAK'
    ].forEach(signal => {
      process.on(signal, () => proc.kill(signal));
    });

    proc.on('error', reject);
    proc.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};
