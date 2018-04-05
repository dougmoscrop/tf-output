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
  const options = getOptions(['dir', '--auto-init']);
  t.deepEqual(options.autoInit, true);
  t.deepEqual(options.path, 'terraform/{dir}');
});

test('autoInitGet', t => {
  const options = getOptions(['dir', '--auto-init-get', '--auto-init']);
  t.deepEqual(options.autoInit, true);
  t.deepEqual(options.autoInitGet, true);
  t.deepEqual(options.path, 'terraform/{dir}');
});

test('autoInitGet requires autoInit', t => {
  try {
    getOptions(['dir', '--auto-init-get']);
    t.fail();
  } catch(e) {
    t.true(e.message === 'Implications failed:\n  auto-init-get -> auto-init');
  }
});

test('custom path', t => {
  const options = getOptions(['foo', '-p', 'anything/{dir}/{other}']);
  t.deepEqual(options._, ['foo']);
  t.deepEqual(options.format, 'env');
  t.deepEqual(options.path, 'anything/{dir}/{other}');
});

test('returns false when missing dirs', t => {
  const options = getOptions(['-m', '-a']);
  t.deepEqual(options, false);
});

test('supports --dirs', t => {
  const options = getOptions(['--dirs', 'xyz', '-p', 'anything/{dir}/{other}']);
  t.deepEqual(options.dirs, ['xyz']);
});

test('supports dirs from cmd', t => {
  const options = getOptions(['xyz', '-p', 'anything/{dir}/{other}']);
  t.deepEqual(options.dirs, ['xyz']);
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
