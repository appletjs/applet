'use strict';

const assert = require('assert');
const Applet = require('..');

describe('app.context', () => {
  const app1 = new Applet();
  app1.context.msg = 'hello';
  const app2 = new Applet();

  const done = (ctx) => {
    assert.equal(ctx.status, 204);
  };

  it('should merge properties', () => {
    app1.use((ctx, next) => {
      assert.equal(ctx.msg, 'hello');
      ctx.status = 204;
    });

    app1.callback()(done);
  });

  it('should not affect the original prototype', () => {
    app2.use((ctx, next) => {
      assert.equal(ctx.msg, undefined);
      ctx.status = 204;
    });

    app2.callback()(done);
  });
});
