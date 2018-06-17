/*!
 * applet.js v0.0.8
 * (c) 2018 Maofeng Zhang
 * Released under the MIT License.
 */

'use strict';

/**
 * Determine if a value is a Function
 *
 * @param {Object} fn The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isfn(fn) {
  return !!fn && typeof fn === 'function';
}

/**
 * @param {*} value
 * @param {string} msg
 */
function assert(value, msg) {
  if (!value) {
    throw new TypeError(msg);
  }
}

/**
 * 自给定的对象中获取指定的数据
 *
 * @param {Object} obj
 * @param {string | string[]} keys
 * @return {Object}
 */
function only(obj, keys) {
  if (typeof keys === 'string') {
    keys = keys.split(/\s+/);
  }

  return keys.reduce(function (ref, key) {
    var val = obj[key];
    if (val != null) { ref[key] = val; }
    return ref;
  }, {});
}

/**
 * 创建 App 回调函数的 Context 数据
 *
 * @param {Object} context
 * @param {Function | Object} injector
 * @return {Object}
 */
function createCallbackContext(context, injector) {
  var ctx = Object.create(context);

  if (typeof injector === 'function') {
    return injector(ctx);
  }

  if (injector && typeof injector === 'object' && !Array.isArray(injector)) {
    for (var prop in injector) {
      if (injector.hasOwnProperty(prop)) {
        ctx[prop] = injector[prop];
      }
    }
  }

  return ctx;
}

/**
 * 获取环境变量信息
 *
 * - Node.js 环境下，返回 process.env；
 * - 浏览器环境下，如果用户自定义了 self.env，则返回之；
 * - 上述两种情况检测失败，则返回一个空对象。
 *
 * @return {Object}
 */
function getEnv() {
  if (typeof process !== 'undefined' && process.env) { return process.env; }
  if (typeof self !== 'undefined' && self.env) { return self.env; }
  return {};
}

/**
 * @param {function[]} middleware
 */
function compose(middleware) {
  assert(Array.isArray(middleware), 'Middleware stack must be an array!');
  assert(middleware.every(isfn), 'Middleware must be composed of functions!');

  /**
   * @param {object} ctx
   * @param {function} [done]
   * @return {Promise<*>}
   */
  return function (ctx, done) {
    // last called middleware
    var index = -1;

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(
          new Error('next() called multiple times')
        );
      }

      index = i;

      var fn = middleware[i];
      if (i === middleware.length) { fn = done; }
      if (!fn) { return Promise.resolve(); }

      try {
        var next = dispatch.bind(null, i + 1);
        if (isfn(fn)) { return Promise.resolve(fn(ctx, next)); }
        if (ctx.silent) { return next(); }
        assert(false, ("middleware is not a function, give " + fn + "!"));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  }
}

var Applet = function Applet(silent, keys) {
  if ( silent === void 0 ) silent = false;
  if ( keys === void 0 ) keys = 'env silent';

  this.env = getEnv().NODE_ENV || 'development';
  this.silent = Boolean(silent);
  this.context = Object.create(only(this, keys));
  this.stack = [];
};

/**
 * 两种方式使用中间件：
 *
 * - 单独注册中间件
 * - 组合注册中间件
 *
 * 多个参数会被组合成一个中间件
 *
 * @param {function[]} fns
 * @return {Applet}
 */
Applet.prototype.use = function use () {
    var fns = [], len = arguments.length;
    while ( len-- ) fns[ len ] = arguments[ len ];

  var fn = fns.length > 1 ? compose(fns) : fns[0];
  assert(isfn(fn), 'middleware must be a function!');
  this.stack.push(fn);
  return this;
};

/**
 * @param {Error} err
 */
Applet.prototype.onerror = function onerror (err) {
  assert(err instanceof Error, ("non-error thrown: " + err));
  if (this.silent) { return; }
  var msg = err.stack || err.toString();
  console.error();
  console.error(msg.replace(/^/gm, '  '));
  console.error();
};

/**
 * @param {function(*=): object | object} context
 * @return {function(*=): Promise<*>}
 */
Applet.prototype.callback = function callback (context) {
    var this$1 = this;

  var fn = compose(this.stack);
  var onerror = function (err) { return this$1.onerror(err); };

  if (typeof this.listeners === 'function'
    && !this.listeners('error').length
    && typeof this.on === 'function'
  ) {
    this.on('error', this.onerror);
    onerror = function (err) { return this$1.emit('error', err); };
  }

  return function (done) {
    // 两种扩展 ctx 的方式：
    // 注入扩展: 通过 APP 实例扩展；
    // 执行扩展：通过中间件设置ctx属性。
    var ctx = createCallbackContext(this$1.context, context);
    if (ctx.onerror == null) { ctx.onerror = onerror; }
    return fn(ctx, done).catch(ctx.onerror);
  };
};

Applet.App = Applet;
Applet.only = only;
Applet.compose = compose;

module.exports = Applet;
