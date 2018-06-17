import {assert, isfn} from './util';

/**
 * @param {function[]} middleware
 */
export function compose(middleware) {
  assert(Array.isArray(middleware), 'Middleware stack must be an array!');
  assert(middleware.every(isfn), 'Middleware must be composed of functions!');

  /**
   * @param {object} ctx
   * @param {function} [done]
   * @return {Promise<*>}
   */
  return function (ctx, done) {
    // last called middleware
    let index = -1;

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(
          new Error('next() called multiple times')
        );
      }

      index = i;

      let fn = middleware[i];
      if (i === middleware.length) fn = done;
      if (!fn) return Promise.resolve();

      try {
        const next = dispatch.bind(null, i + 1);
        if (isfn(fn)) return Promise.resolve(fn(ctx, next));
        if (ctx.silent) return next();
        assert(false, `middleware is not a function, give ${fn}!`);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  }
}
