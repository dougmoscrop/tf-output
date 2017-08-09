'use strict';

const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

test('returns stdout', t => {
  const on = sinon.stub();

  on.returns()
  on.withArgs('exit', sinon.match.any).yields(0);

  const stdoutOn = sinon.stub();

  stdoutOn.withArgs('data', sinon.match.any).onCall(0).callsFake((e, callback) => {
    callback('{');
    callback('"foo":{"value":"bar"}');
    callback('}');
  });

  stdoutOn.withArgs('data', sinon.match.any).onCall(1).callsFake((e, callback) => {
    callback('{');
    callback('"bar":{"value":"baz"}');
    callback('}');
  });

  const runTerraform = proxyquire('../lib/run-terraform', {
    child_process: {
      spawn: () => {
        return {
          on,
          stdout: {
            setEncoding: Function.prototype,
            on: stdoutOn
          },
          stderr: {
            on: Function.prototype,
            setEncoding: Function.prototype
          }
        };
      }
    }
  });

  return runTerraform('foo/bar', ['foo', 'bar'])
    .then(result => {
      t.deepEqual(result.output, '{"foo":{"value":"bar"}}');
    });
});

test('rejects when exec returns non-zero', t => {
  const on = sinon.stub();

  on.returns()
  on.withArgs('exit', sinon.match.any).yields(1);

  const emitter = {
    on: Function.prototype,
    setEncoding: Function.prototype
  };

  const runTerraform = proxyquire('../lib/run-terraform', {
    child_process: {
      spawn: () => {
        return {
          on,
          stdout: emitter,
          stderr: emitter
        };
      }
    }
  });

  return runTerraform('foo/bar', ['foo', 'bar'])
    .then(() => {
      t.fail()
    })
    .catch(e => {
      t.true(e.message === `'terraform foo bar' returned a non-zero status code in foo/bar`);
    });
});
