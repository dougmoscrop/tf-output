'use strict';

const path = require('path');
const test = require('ava');
const proxyquire = require('proxyquire');

const ValidationError = require('../lib/validation-error');

test('replaces the module name', t => {
  const getCwd = proxyquire('../lib/get-cwd', {
    fs: {
      statSync: Function.prototype,
    },
  });

  return getCwd('foo', { path: 'terraform/{dir}'} )
    .then(cwd => {
      t.deepEqual(cwd, path.join(process.cwd(), 'terraform/foo'));
    });
});

test('rejects when a substitution is missing', t => {
  const getCwd = proxyquire('../lib/get-cwd', {
    fs: {
      statSync: Function.prototype,
    },
  });

  return getCwd('bar', { path: 'terraform/{module}/{missing}', module: 'm' } )
    .then(() => t.fail())
    .catch(e => {
      t.true(e.message === `terraform path template terraform/{module}/{missing} references missing value 'missing'`);
    });
});

test('replaces other properties', t => {
  const getCwd = proxyquire('../lib/get-cwd', {
    fs: {
      statSync: Function.prototype,
    },
  });

  return getCwd('baz', { path: 'terraform/{region}-{stage}/{dir}', stage: 'stg', region: 'reg' } )
    .then(cwd => {
      t.deepEqual(cwd, path.join(process.cwd(), 'terraform/reg-stg/baz'));
    });
});

test('rejects with a ValidationError when path does not exist', t => {
  const getCwd = proxyquire('../lib/get-cwd', {
    fs: {
      statSync: () => {
        const e = new Error();
        e.code = 'ENOENT';
        throw e;
      }
    },
  });

  return getCwd('asdf', { path: 'terraform/abc' })
    .then(() => t.fail())
    .catch(e => {
      t.true(e instanceof ValidationError);
    });
});
