## Applet

[![version](https://img.shields.io/npm/v/applet.svg?style=flat-square)](https://www.npmjs.com/package/applet)
[![downloads](https://img.shields.io/npm/dt/applet.svg?style=flat-square)](https://www.npmjs.com/package/applet)
[![cdn](https://data.jsdelivr.com/v1/package/npm/applet/badge)](https://www.jsdelivr.com/package/npm/applet)
[![license](https://img.shields.io/npm/l/applet.svg?style=flat-square)](LICENSE)

#### 简单介绍

`Applet` 参考并使用了 [`Koa框架`](https://koajs.com/) 核心部分，是一个体积极小且极具表现力的中间件框架。
它没有捆绑任何中间件，也不依赖第三方包，可以运行在**Node.js环境下**和**浏览器端**。
它的中间件之间按照编码顺序在栈内依次执行，允许我们执行操作并向下传递请求（downstream），之后过滤并逆序返回响应（upstream）。

#### 运行环境

理论上，符合下面任一条件即可：

* 在 Node.js 环境下，Applet 依赖 **node v7.6.0** 或 ES2015及更高版本和 async 方法支持；
* 在浏览器端则需要通过其它工具转码 [`async 函数`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)，或者使用 [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)。

> 推荐使用转码工具（如：[buble](https://buble.surge.sh/guide/)、[babel](http://babeljs.io/)）配合打包工具（如：[rollup](https://rollupjs.org)、[parcel](https://parceljs.org/)、[webpack](https://webpack.js.org/)）转换 `async/await`。


#### 示例（Example）

必修的 hello world 应用

```js
const Applet = require('applet');
const app = new Applet();

// handle 执行结果返回一个 promise 实例
const handle = app.callback();

// 使用一个普通函数作为中间件
app.use((ctx, next) => {
  ctx.hello = 'hello';
  return next();
});

// 使用 async 函数作中间件
app.use(async (ctx, next) => {
  ctx.hello += ' world!';
  await next();
});

handle((ctx) => {
 console.log(ctx.hello);
  // => 'hello world!'
});
```


## 开发文档

* [简介](https://appletjs.github.io/applet/index.html#introduction)
* [安装](https://appletjs.github.io/applet/index.html#installation)
* [应用程序](https://appletjs.github.io/applet/index.html#applet)
* [中间件](https://appletjs.github.io/applet/index.html#middleware)
* [上下文](https://appletjs.github.io/applet/index.html#context)
* [事件接口](https://appletjs.github.io/applet/index.html#event-emitter)
* [异常处理](https://appletjs.github.io/applet/index.html#exception)
* [授权协议](https://appletjs.github.io/applet/index.html#license)



## License

MIT © 2018, <a href="mailto:japplet@163.com" title="japplet@163.com">Maofeng Zhang</a>