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
    .option('format', {
      alias: 'f',
      default: 'env',
      choices: ['env', 'json'],
      describe: 'Output format if printing to stdout'
    })
    .option('module', {
      alias: 'm',
      describe: 'a specific module to read outputs from in each destination directory'
    })
    .option('auto-init', {
      alias: 'a',
      default: false,
      describe: 'initialize backend automatically in each destination directory',
      type: 'boolean'
    })
    .option('path', {
      alias: 'p',
      default: 'terraform/{dir}',
      describe: 'path to terraform modules, supports substitution {variables}',
    })
    .option('check-plan', {
      alias: 'c',
      default: false,
      describe: 'checks if plan has any unapplied changes (and aborts if it does)',
      type: 'boolean'
    })
    .usage('$0 <list of dirs> [options] [-- command --flag]')
    .example('$0 dir_1 dir_2 -f json', 'print the module_1 and module_2 outputs as json to stdout')
    .example('$0 dir_1 dir_2 -- sls deploy', `exec 'sls deploy' command with environment variables available`)
    .argv;

  if (argv._.length === 0) {
    yargs.showHelp();
  }

  return Object.assign({}, argv, { command, commandArgv });
};
