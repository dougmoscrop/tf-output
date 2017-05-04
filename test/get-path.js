'use strict';

const path = require('path');
const test = require('ava');

const getPath = require('../lib/get-path');

test('replaces the module name', t => {
  const fooPath = getPath('foo', { path: 'terraform/{module}'} );
  t.deepEqual(fooPath, path.join(process.cwd(), 'terraform/foo'));
});

test('throws when a substitution is missing', t => {
  t.throws(() => {
    getPath('bar', { path: 'terraform/{module}/{missing}'} );
  });
});

test('replaces other properties', t => {
  const fooPath = getPath('baz', { path: 'terraform/{region}-{stage}/{module}', stage: 'stg', region: 'reg' } );
  t.deepEqual(fooPath, path.join(process.cwd(), 'terraform/reg-stg/baz'));
});
