'use strict';

const proxyquire = require('proxyquire');
const test = require('ava');
const sinon = require('sinon');

test('returns a promise', t => {
  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': () => Promise.resolve()
  });

  const outputs = getOutputs('dir', {
    _: ['foo', 'bar']
  });

  t.true(outputs instanceof Promise);
});

test('calls runTerraform', t => {
  const runTerraform = sinon.stub().resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar']
  })
  .then(() => {
    t.true(runTerraform.calledOnce);
  });
});

test('calls runTerraform for auto init', t => {
  const runTerraform = sinon.stub().onCall(0).resolves().onCall(1).resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    ['auto-init']: true
  })
  .then(() => {
    t.true(runTerraform.calledTwice);
    t.deepEqual(runTerraform.firstCall.args[1], ['init', '-no-color', '-input=false', '-get=undefined']);
  });
});

test('calls runTerraform for auto init with init-opts', t => {
  const runTerraform = sinon.stub().onCall(0).resolves().onCall(1).resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    ['auto-init']: true,
    ['init-opts']: '-backend-config=/env/{stage} -reconfigure',
    ['stage']: 'foo'
  })
  .then(() => {
    t.true(runTerraform.calledTwice);
    t.deepEqual(runTerraform.firstCall.args[1], ['init', '-no-color', '-input=false', '-get=undefined', '-backend-config=/env/foo', '-reconfigure']);
  });
});

test('calls runTerraform for check plan', t => {
  const runTerraform = sinon.stub().onCall(0).resolves().onCall(1).resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    ['check-plan']: true
  })
  .then(() => {
    t.true(runTerraform.calledTwice);
    t.deepEqual(runTerraform.firstCall.args[1], ['plan', '-no-color', '-detailed-exitcode']);
  });
});

test('calls runTerraform for check plan with plan-opts', t => {
  const runTerraform = sinon.stub().onCall(0).resolves().onCall(1).resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    ['check-plan']: true,
    ['plan-opts']: '-var-file=/env/{stage} -refresh=true',
    ['stage']: 'foo'
  })
  .then(() => {
    t.true(runTerraform.calledTwice);
    t.deepEqual(runTerraform.firstCall.args[1], ['plan', '-no-color', '-detailed-exitcode', '-var-file=/env/foo', '-refresh=true']);
  });
});

test('calls runTerraform for auto-init and check plan', t => {
  const runTerraform = sinon.stub()
    .onCall(0).resolves()
    .onCall(1).resolves()
    .onCall(2).resolves();

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    ['auto-init']: true,
    ['check-plan']: true,
  })
  .then(() => {
    t.true(runTerraform.calledThrice);
  });
});

test('parses terraform output', t => {
  const runTerraform = sinon.stub().resolves({ output: '{"test":{"value":1}}' });

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar']
  })
  .then(result => {
    t.true(result.test === 1);
  });
});

test('does not flatten object values when flatten option is false', t => {
  const runTerraform = sinon.stub().resolves({ output: '{"test":{"value":{"foo":"bar"}}}' });

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    flatten: false
  })
  .then(result => {
    t.deepEqual(result.test, {
      foo: 'bar'
    });
  });
});

test('flattens object values when flatten option is true', t => {
  const runTerraform = sinon.stub().resolves({ output: '{"test":{"value":{"foo":{"bar": "baz", "bazz": null}}}}' });

  const getOutputs = proxyquire('../lib/get-outputs', {
    './get-cwd': () => Promise.resolve('foo/bar'),
    './run-terraform': runTerraform
  });

  return getOutputs('dir', {
    _: ['foo', 'bar'],
    flatten: true,
    'flatten-delimiter': '-'
  })
  .then(result => {
    t.is(result.test, undefined);
    t.true(result['test-foo-bar'] === 'baz');
    t.true(result['test-foo-bazz'] === null);
  });
});
