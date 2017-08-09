'use strict';

const getCwd = require('./get-cwd');
const runTerraform = require('./run-terraform');

module.exports = function(dir, options) {
  return getCwd(dir, options)
    .then(cwd => {
      return Promise.resolve()
        .then(() => {
          if (options['auto-init']) {
            return runTerraform(cwd, ['init', '-no-color', '-input=false', '-get=false']);
          }
        })
        .then(() => {
          if (options['check-plan']) {
            return runTerraform(cwd, ['plan', '-no-color', '-detailed-exitcode']);
          }
        })
        .then(() => {
          const args = ['output', '-json'];

          if (options.module) {
            if (options.module === true) {
              args.push(`-module=${dir}`);
            } else {
              args.push(`-module=${options.module}`);
            }
          }

          return runTerraform(cwd, args)
            .then(result => {
              if (result && result.output) {
                const parsed = JSON.parse(result.output);

                return Object.keys(parsed).reduce((memo, key) =>
                  Object.assign(memo, { [key]: parsed[key].value }), {});
              }
            });
        });
    });
}
