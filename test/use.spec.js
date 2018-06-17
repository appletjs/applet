'use strict';

const assert = require('assert');
const Applet = require('..');

describe('app.use(fn)', () => {
  it('should compose middleware', async () => {
    const app = new Applet();
    const calls = [];

    app.use((ctx, next) => {
      calls.push(1);
      return next().then(() => {
        calls.push(6);
      });
    });

    app.use((ctx, next) => {
      calls.push(2);
      return next().then(() => {
        calls.push(5);
      });
    });

    app.use((ctx, next) => {
      calls.push(3);
      return next().then(() => {
        calls.push(4);
      });
    });

    await app.callback()();

    assert.deepEqual(calls, [1, 2, 3, 4, 5, 6]);
  });

  it('should compose mixed middleware', async () => {
    const app = new Applet();
    const calls = [];

    app.use((ctx, next) => {
      calls.push(1);
      return next().then(() => {
        calls.push(6);
      });
    });

    app.use((ctx, next) => {
      calls.push(3);
      return next().then(() => {
        calls.push(4);
      });
    });

    await app.callback()();

    assert.deepEqual(calls, [1, 3, 4, 6]);
  });

  it('should throw error for non function', () => {
    const app = new Applet();

    [null, undefined, 0, false, 'not a function'].forEach(v => {
      assert.throws(() => app.use(v), /middleware must be a function!/);
    });
  });
});
