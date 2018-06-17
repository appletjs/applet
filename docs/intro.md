## 简介（Introduction）{#introduction}

`Applet` 参考并使用了 [`Koa框架`](https://koajs.com/) 核心部分，是一个体积极小且极具表现力的中间件框架。
它没有捆绑任何中间件，也不依赖第三方包，可以运行在**Node.js环境下**和**浏览器端**。
它的中间件之间按照编码顺序在栈内依次执行，允许我们执行操作并向下传递请求（downstream），之后过滤并逆序返回响应（upstream）。

#### 运行环境

理论上，符合下面任一条件即可：

* 在 Node.js 环境下，Applet 依赖 **node v7.6.0** 或 ES2015及更高版本和 async 方法支持；
* 在浏览器端则需要通过其它工具转码 [`async 函数`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)，或者使用 [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)。

> 推荐使用转码工具（如：[buble](https://buble.surge.sh/guide/)、[babel](http://babeljs.io/)）配合打包工具（如：[rollup](https://rollupjs.org)、[parcel](https://parceljs.org/)、[webpack](https://webpack.js.org/)）转换 `async/await`。