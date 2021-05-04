'use strict';

const getCwd = require('./get-cwd');
const interpolate = require('./interpolate');
const runTerraform = require('./run-terraform');

module.exports = function(dir, options) {
  return getCwd(dir, options)
    .then(cwd => {
      return Promise.resolve()
        .then(() => {
          if (options['auto-init']) {
            const initOpts = options['init-opts']
              ? interpolate(options['init-opts'], options, { dir }).split(' ')
              : [];
            return runTerraform(cwd, ['init', '-no-color', '-input=false', `-get=${options['auto-init-get']}`].concat(initOpts));
          }
        })
        .then(() => {
          if (options['check-plan']) {
            const planOpts = options['plan-opts']
              ? interpolate(options['plan-opts'], options, { dir }).split(' ')
              : [];
            return runTerraform(cwd, ['plan', '-no-color', '-detailed-exitcode'].concat(planOpts))
              .catch(e => {
                if (e.code === 2) {
                  e.message = 'tf-output with --check-plan detected changes. Your terraform configuration does not match the current state. Update your local copy, or apply the changes.';
                }

                return Promise.reject(e);
              });
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

                const addValue = (key, value, acc) => {
                  return typeof value === 'object' && value !== null && options.flatten
                    ? Object.keys(value).reduce((memo, nested) => addValue(`${key}${options['flatten-delimiter']}${nested}`, value[nested], memo), acc)
                    : Object.assign(acc, { [key]: value })
                }

                return Object.keys(parsed).reduce((memo, key) => addValue(key, parsed[key].value, memo), {});
              }
            });
        });
    });
}
