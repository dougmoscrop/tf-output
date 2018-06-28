'use strict';

const spawn = require('child_process').spawn;

const quote = require('shell-quote').quote;

module.exports = function(commandArgv, outputs) {
  return new Promise((resolve, reject) => {
    const command = quote(commandArgv);
    const proc = spawn(
      command,
      [],
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
        reject(new Error(`${command} exited with non-zero status code`));
      }
    });
  });
};
