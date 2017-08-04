'use strict';

const proxyquire = require('proxyquire');
const test = require('ava');
const sinon = require('sinon');

const ValidationError = require('../lib/validation-error');

test('resolves right away when auto=false && allow-unapplied-plan=true', t => {
  const autoInit = proxyquire('../lib/auto-init', {
    './get-path': () => 'foo/bar',
    'fs': {
      statSync: Function.prototype,
    },
    child_process: {
      spawn: () => t.fail()
    }
  });

  return autoInit({
    _: ['foo', 'bar'],
    'allow-unapplied-plan': true
  })
  .then(() => {
    t.pass();
  });
});

test('resolves when succeeds', t => {
  const on = sinon.stub();

  on.returns();
  on.withArgs('exit', sinon.match.any).yields(0);

  const stdoutOn = sinon.stub();

  stdoutOn.withArgs('data', sinon.match.any).onCall(0).callsFake((e, callback) => {
    callback('Terraform has been successfully initialized!');
  });

  const autoInit = proxyquire('../lib/auto-init', {
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

  return autoInit({
    _: ['foo', 'bar'],
    auto: true
  })
    .then(() => {
      t.pass();
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

  const autoInit = proxyquire('../lib/auto-init', {
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

  return autoInit({
    _: ['foo', 'bar'],
    auto: true
  })
  .then(() => {
    t.fail()
  })
  .catch(e => {
    t.true(e.message === `'terraform init -no-color -input=false -get=false' returned a non-zero status code in foo/bar`);
  });
});

test('rejects with a ValidationError when path does not exist', t => {
  const on = sinon.stub();

  on.returns()
  on.withArgs('exit', sinon.match.any).yields(0);

  const emitter = {
    on: Function.prototype,
    setEncoding: Function.prototype
  };

  const autoInit = proxyquire('../lib/auto-init', {
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

  return autoInit({
    _: ['foo', 'bar'],
    auto: true
  })
  .then(() => {
    t.fail()
  })
  .catch(e => {
    t.true(e instanceof ValidationError);
  });
});
