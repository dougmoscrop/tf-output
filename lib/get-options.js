'use strict';

const yargs = require('yargs');

function getCommandOptions(start) {
  const options = {};

  let todo = [start];

  while (todo.length) {
    const args = todo.pop();

    const argv = yargs(args).argv;
    const next = argv._.slice(1);

    if (next.length) {
      todo.push(next);
    }

    delete argv._;

    Object.keys(argv).forEach(key => {
      if (key[0] === '$') {
        return;
      }
      options[key] = argv[key];
    });
  }

  return options;
}

module.exports = function getTerraformOptions(args) {
  const index = args.indexOf('--');

  const terraformArgv = index === -1 ? args : args.slice(0, index);
  const commandArgv = index === -1 ? [] : args.slice(index + 1);

  const command = getCommandOptions(commandArgv);

  const argv = yargs(terraformArgv)
    .option('modules', {
      array: true,
      demand: true,
      alias: 'm',
      describe: 'List of modules from which to obtain outputs'
    })
    .option('format', {
      alias: 'f',
      default: 'env',
      choices: ['env', 'json'],
      describe: 'Output format if printing to stdout'
    })
    .option('path', {
      alias: 'p',
      default: 'terraform/{module}',
      describe: 'path to terraform modules, supports substitution {variables}',
    })
    .usage('$0 -m <list of modules> [-- command --command-flag=x]')
    .example('$0 -m module_1 module_2 -f json', 'print the module_1 and module_2 outputs as json to stdout')
    .example('$0 -m module_1 module_2 -- sls deploy', `exec 'sls deploy' command with environment variables available`)
    .argv;

  return Object.assign({}, argv, { command, commandArgv });
};
