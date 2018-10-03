'use strict';

const proxyquire = require('proxyquire');
const test = require('ava');

const ValidationError = require('../lib/validation-error');

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
