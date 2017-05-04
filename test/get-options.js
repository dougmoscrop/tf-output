'use strict';

const test = require('ava');

const getOptions = require('../lib/get-options');

test('defaults', t => {
  const options = getOptions(['-m', 'foo', 'bar']);
  t.deepEqual(options.modules, ['foo', 'bar']);
  t.deepEqual(options.format, 'env');
  t.deepEqual(options.path, 'terraform/{module}');
});

test('custom format', t => {
  const options = getOptions(['-m', 'foo', '-f', 'json']);
  t.deepEqual(options.modules, ['foo']);
  t.deepEqual(options.format, 'json');
  t.deepEqual(options.path, 'terraform/{module}');
});

test('custom path', t => {
  const options = getOptions(['-m', 'foo', '-p', 'anything/{module}/{other}']);
  t.deepEqual(options.modules, ['foo']);
  t.deepEqual(options.format, 'env');
  t.deepEqual(options.path, 'anything/{module}/{other}');
});

test('command', t => {
  const options = getOptions(['-m', 'foo', '--', 'deploy']);
  t.deepEqual(options.modules, ['foo']);
  t.deepEqual(options.command, {});
  t.deepEqual(options.commandArgv, ['deploy']);
});

test('command with options', t => {
  const options = getOptions(['-m', 'foo', '--', 'deploy', '--stage', 'dev']);
  t.deepEqual(options.modules, ['foo']);
  t.deepEqual(options.command, { stage: 'dev' });
  t.deepEqual(options.commandArgv, ['deploy', '--stage', 'dev']);
});
