/**
 * Determine if a value is a Function
 *
 * @param {Object} fn The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
export function isfn(fn) {
  return !!fn && typeof fn === 'function';
}

/**
 * @param {*} value
 * @param {string} msg
 */
export function assert(value, msg) {
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
export function only(obj, keys) {
  if (typeof keys === 'string') {
    keys = keys.split(/\s+/);
  }

  return keys.reduce(function (ref, key) {
    const val = obj[key];
    if (val != null) ref[key] = val;
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
export function createCallbackContext(context, injector) {
  const ctx = Object.create(context);

  if (typeof injector === 'function') {
    return injector(ctx);
  }

  if (injector && typeof injector === 'object' && !Array.isArray(injector)) {
    for (const prop in injector) {
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
export function getEnv() {
  if (typeof process !== 'undefined' && process.env) return process.env;
  if (typeof self !== 'undefined' && self.env) return self.env;
  return {};
}
