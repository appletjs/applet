import {assert, createCallbackContext, getEnv, isfn, only} from './util';
import {compose} from './compose';

export default class Applet {
  /**
   * @param {boolean} [silent] - 静默方式处理错误
   * @param {string | string[]} [keys='env silent'] - 上下文数据名称
   */
  constructor(silent = false, keys = 'env silent') {
    this.env = getEnv().NODE_ENV || 'development';
    this.silent = Boolean(silent);
    this.context = Object.create(only(this, keys));
    this.stack = [];
  }

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
  use(...fns) {
    const fn = fns.length > 1 ? compose(fns) : fns[0];
    assert(isfn(fn), 'middleware must be a function!');
    this.stack.push(fn);
    return this;
  }

  /**
   * @param {Error} err
   */
  onerror(err) {
    assert(err instanceof Error, `non-error thrown: ${err}`);
    if (this.silent) return;
    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }

  /**
   * @param {function(*=): object | object} context
   * @return {function(*=): Promise<*>}
   */
  callback(context) {
    const fn = compose(this.stack);
    let onerror = err => this.onerror(err);

    if (typeof this.listeners === 'function'
      && !this.listeners('error').length
      && typeof this.on === 'function'
    ) {
      this.on('error', this.onerror);
      onerror = (err) => this.emit('error', err);
    }

    return (done) => {
      // 两种扩展 ctx 的方式：
      // 注入扩展: 通过 APP 实例扩展；
      // 执行扩展：通过中间件设置ctx属性。
      const ctx = createCallbackContext(this.context, context);
      if (ctx.onerror == null) ctx.onerror = onerror;
      return fn(ctx, done).catch(ctx.onerror);
    };
  }
}

Applet.App = Applet;
Applet.only = only;
Applet.compose = compose;
