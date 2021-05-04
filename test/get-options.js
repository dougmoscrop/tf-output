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
    t.true(e.message === 'Missing dependent arguments:\n auto-init-get -> auto-init');
  }
});

test('initOpts', t => {
  const options = getOptions(['dir', '--auto-init', '--init-opts=-backend-config=foo']);
  t.deepEqual(options.autoInit, true);
  t.deepEqual(options.initOpts, '-backend-config=foo');
  t.deepEqual(options.path, 'terraform/{dir}');
});

test('initOpts requires autoInit', t => {
  try {
    getOptions(['dir', '--init-opts=-backend-config=foo']);
    t.fail();
  } catch(e) {
    t.true(e.message === 'Missing dependent arguments:\n init-opts -> auto-init');
  }
});

test('planOpts', t => {
  const options = getOptions(['dir', '--check-plan', '--plan-opts=-var-file=foo']);
  t.deepEqual(options.checkPlan, true);
  t.deepEqual(options.planOpts, '-var-file=foo');
  t.deepEqual(options.path, 'terraform/{dir}');
});

test('planOpts requires autoInit', t => {
  try {
    getOptions(['dir', '--plan-opts=-var-file=foo']);
    t.fail();
  } catch(e) {
    t.true(e.message === 'Missing dependent arguments:\n plan-opts -> check-plan');
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

test('flatten', t => {
  const options = getOptions(['foo', '--flatten']);
  t.deepEqual(options.flatten, true);
});

test('flattenDelimiter', t => {
  const options = getOptions(['foo', '--flatten-delimiter', '"-"']);
  t.deepEqual(options.flattenDelimiter, '-');
});
