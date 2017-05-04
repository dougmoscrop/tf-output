'use strict';

const proxyquire = require('proxyquire');
const test = require('ava');
const sinon = require('sinon');

const ValidationError = require('../lib/validation-error');

test('returns a promise', t => {
  const emitter = {
    on: Function.prototype,
    setEncoding: Function.prototype
  };

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-path': () => 'foo/bar',
    'fs': {
      statSync: Function.prototype,
    },
    child_process: {
      spawn: () => {
        return {
          on: Function.prototype,
          stdout: emitter,
          stderr: emitter
        };
      }
    }
  });

  const outputs = getOutputs({
    modules: ['foo', 'bar']
  });

  t.true(outputs instanceof Promise);
});

test('parses terraform stdout to fetch values', t => {
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

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-path': () => 'foo/bar',
    'fs': {
      statSync: Function.prototype,
    },
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

  return getOutputs({ modules: ['foo', 'bar'] })
    .then(outputs => {
      t.deepEqual(outputs, { foo: "bar", bar: "baz" });
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

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-path': () => 'foo/bar',
    'fs': {
      statSync: Function.prototype,
    },
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

  return getOutputs({
    modules: ['foo', 'bar']
  })
  .then(() => {
    t.fail()
  })
  .catch(e => {
    t.true(e.message === `'terraform output' returned a non-zero status code for the 'foo' module`);
  });
});

test('rejects with a ValidatoinError when path does not exist', t => {
  const on = sinon.stub();

  on.returns()
  on.withArgs('exit', sinon.match.any).yields(0);

  const emitter = {
    on: Function.prototype,
    setEncoding: Function.prototype
  };

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-path': () => 'foo/bar',
    'fs': {
      statSync: () => {
        const err = new Error();
        err.code = 'ENOENT'
        throw err;
      }
    },
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

  return getOutputs({
    modules: ['foo', 'bar']
  })
  .then(() => {
    t.fail()
  })
  .catch(e => {
    t.true(e instanceof ValidationError);
  });
});
