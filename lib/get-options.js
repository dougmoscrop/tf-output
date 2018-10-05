'use strict';

const fs = require('fs');
const path = require('path');
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

  const config = {};
  const configPath = path.join(process.cwd(), '.tfoutput');

  if (fs.existsSync(configPath)) {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    Object.assign(config, parsed);
  }

  const argv = yargs(terraformArgv)
    .config(config)
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
    .option('auto-init-get', {
      alias: 'g',
      default: false,
      describe: 'get modules mentioned in the root module during initialization',
      type: 'boolean'
    })
    .implies('auto-init-get', 'auto-init')
    .option('init-opts', {
      alias: 'i',
      describe: 'additional options to pass to init command, supports substitution {variables}',
      type: 'string'
    })
    .implies('init-opts', 'auto-init')
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
    .option('plan-opts', {
      alias: 'o',
      describe: 'additional options to pass to plan command, supports substitution {variables}',
      type: 'string'
    })
    .implies('plan-opts', 'check-plan')
    .option('verbose', {
      alias: 'v',
      default: false,
      describe: 'print more verbose output',
      type: 'boolean'
    })
    .option('dirs', {
      alias: 'd',
      default: [],
      describe: 'used in .tfoutput to specify <dirs>',
      type: 'array'
    })
    .exitProcess(false)
    .usage('$0 <list of dirs> [options] [-- command --flag]')
    .example('$0 dir_1 dir_2 -f json', 'print the module_1 and module_2 outputs as json to stdout')
    .example('$0 dir_1 dir_2 -- sls deploy', `exec 'sls deploy' command with environment variables available`)
    .argv;

  const dirs = argv._.length === 0 ? argv.dirs : argv._;

  if (dirs.length === 0) {
    yargs.showHelp();
    return false;
  }

  return Object.assign({}, argv, { command, commandArgv, dirs });
};
