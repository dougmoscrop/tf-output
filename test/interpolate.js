'use strict';

const test = require('ava');

const interpolate = require('../lib/interpolate');

test('retuns empty string when value is not defined', t => {
  const options = { path: 'terraform/{dir}'};
  const result = interpolate(options.baz, options, { dir: 'foo' });

  t.is(result, '');
});

test('replaces the module name', t => {
  const options = { path: 'terraform/{dir}'};
  const result = interpolate(options.path, options, { dir: 'foo' });

  t.is(result, 'terraform/foo');
});

test('rejects when a substitution is missing', t => {
  const options = {
    path: 'terraform/{module}/{missing}',
    module: 'm'
  };

  t.throws(
    () => interpolate(options.path, options, { dir: 'bar' }),
    `"terraform/{module}/{missing}" references missing value 'missing'`
  );
});

test('replaces other properties', t => {
  const options = {
    path: 'terraform/{region}-{stage}/{dir}',
    stage: 'stg',
    region: 'reg'
  };
  const result = interpolate(options.path, options, { dir: 'baz' });

  t.is(result, 'terraform/reg-stg/baz');
});
