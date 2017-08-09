'use strict';

const test = require('ava');

const getOptions = require('../lib/get-options');

test('defaults', t => {
  const options = getOptions(['foo', 'bar']);
  t.deepEqual(options._, ['foo', 'bar']);
  t.deepEqual(options.format, 'env');
  t.deepEqual(options.path, 'terraform/{dir}');
});

test('custom format', t => {
  const options = getOptions(['foo', '-f', 'json']);
  t.deepEqual(options._, ['foo']);
  t.deepEqual(options.format, 'json');
  t.deepEqual(options.path, 'terraform/{dir}');
});

test('autoInit', t => {
  const options = getOptions(['--auto-init']);
  t.deepEqual(options.autoInit, true);
  t.deepEqual(options.path, 'terraform/{dir}');
});

test('custom path', t => {
  const options = getOptions(['foo', '-p', 'anything/{dir}/{other}']);
  t.deepEqual(options._, ['foo']);
  t.deepEqual(options.format, 'env');
  t.deepEqual(options.path, 'anything/{dir}/{other}');
});

test('command', t => {
  const options = getOptions(['foo', '--', 'deploy']);
  t.deepEqual(options._, ['foo']);
  t.deepEqual(options.command, {});
  t.deepEqual(options.commandArgv, ['deploy']);
});

test('command with options', t => {
  const options = getOptions(['foo', '--', 'deploy', '--stage', 'dev']);
  t.deepEqual(options._, ['foo']);
  t.deepEqual(options.command, { stage: 'dev' });
  t.deepEqual(options.commandArgv, ['deploy', '--stage', 'dev']);
});
