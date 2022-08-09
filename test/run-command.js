'use strict';

const proxyquire = require('proxyquire');
const test = require('ava');
const sinon = require('sinon');

test('returns a promise', t => {
  const runCommand = proxyquire('../lib/run-command', {
    child_process: {
      spawn: () => {
        return {
          on: Function.prototype
        };
      }
    }
  });

  const run = runCommand(['a', '--b', 'c']);
  t.true(run instanceof Promise);
});

test('resolves when command returns 0', t => {
  const on = sinon.stub();

  on.returns();
  on.withArgs('exit', sinon.match.any).yields(0);

  const runCommand = proxyquire('../lib/run-command', {
    child_process: {
      spawn: () => {
        return {
          on
        };
      }
    }
  });

  return runCommand(['a', '--b', 'c']).then(() => {
    t.true(on.withArgs('exit', sinon.match.any).calledOnce);
  });
});

test('rejects when command returns non-zero', t => {
  const on = sinon.stub();

  on.returns();
  on.withArgs('exit', sinon.match.any).yields();

  const runCommand = proxyquire('../lib/run-command', {
    child_process: {
      spawn: () => {
        return {
          on
        };
      }
    }
  });

  return runCommand(['a', '--b', 'c'])
    .then(() => {
      t.fail()
    })
    .catch(err => {
      t.true(on.withArgs('exit', sinon.match.any).calledOnce);
      t.deepEqual(err.message, 'a exited with non-zero status code');
    });
});


test('handles quotes', t => {
  const on = sinon.stub();

  on.returns();
  on.withArgs('exit', sinon.match.any).yields();

  const runCommand = proxyquire('../lib/run-command', {
    child_process: {
      spawn: () => {
        return {
          on
        };
      }
    }
  });

  return runCommand(['a', '--b', 'c d'])
    .then(() => {
      t.fail()
    })
    .catch(err => {
      t.true(on.withArgs('exit', sinon.match.any).calledOnce);
      t.deepEqual(err.message, `a exited with non-zero status code`);
    });
});
