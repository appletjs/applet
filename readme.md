<h1 align="center">

![applet](applet.png)

</h1>

[![version](https://img.shields.io/npm/v/applet.svg?style=flat-square)](https://www.npmjs.com/package/applet)
[![downloads](https://img.shields.io/npm/dt/applet.svg?style=flat-square)](https://www.npmjs.com/package/applet)
[![cdn](https://data.jsdelivr.com/v1/package/npm/applet/badge)](https://www.jsdelivr.com/package/npm/applet)
[![license](https://img.shields.io/npm/l/applet.svg?style=flat-square)](LICENSE)

The middleware framework on promise



## 简介（Introduction）

`Applet` 参考并使用了 [`Koa框架`](https://koajs.com/) 核心部分，是一个体积极小且极具表现力的中间件框架。
它没有捆绑任何中间件，也不依赖第三方包，可以运行在**Node.js环境下**和**浏览器端**。
它的中间件之间按照编码顺序在栈内依次执行，允许我们执行操作并向下传递请求（downstream），之后过滤并逆序返回响应（upstream）。

#### 运行环境

理论上，符合下面任一条件即可：

* 在 Node.js 环境下，Applet 依赖 **node v7.6.0** 或 ES2015及更高版本和 async 方法支持；
* 在浏览器端则需要通过其它工具转码 [`async 函数`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)，或者使用 [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)。

> 推荐使用转码工具（如：[buble](https://buble.surge.sh/guide/)、[babel](http://babeljs.io/)）配合打包工具（如：[rollup](https://rollupjs.org)、[parcel](https://parceljs.org/)、[webpack](https://webpack.js.org/)）转换 `async/await`。



## 安装（Installation）

Node.js 环境下或用于集成到项目可以使用 [`npm`](https://docs.npmjs.com/getting-started/what-is-npm) 或 [`yarn`](https://yarnpkg.com/) 安装：


#### npm

```bash
# 安装最新版本
$ npm install applet
```


#### yarn

```bash
# 安装最新版本
$ yarn add applet
```

#### CDN

浏览器环境使用包目录下的 `browser.js` 文件，或者使用 CDN ：

```html
<!-- 推荐链接到一个你可以手动更新的指定版本号 -->
<script src="//cdn.jsdelivr.net/npm/applet@0.0.7/browser.js"></script>
<script src="//unpkg.com/applet@0.0.7/browser.js"></script>

<!-- 或者由CDN自动选择（最新版本可能有所延迟） -->
<script src="//cdn.jsdelivr.net/npm/applet"></script>
<script src="//unpkg.com/applet"></script>
```

你可以在 [cdn.jsdelivr.net/npm/applet](https://cdn.jsdelivr.net/npm/applet/) 浏览 NPM 包的源代码，
或者在 [GitHub仓库](https://github.com/appletjs/applet/tree/dev) 浏览开发版源代码。



## 应用程序（Applet）

**Applet** 应用程序是一个包含一组中间件函数的对象，它是按照类似堆栈的方式组织和执行的。
因为使用了 Koa 的核心概念，所以关键的设计点与Koa保持一致：在其低级中间件层中提供高级“语法糖”。
这提高了互操作性，稳健性，并使书写中间件更加愉快。

#### 示例：必修的 hello world 应用

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


#### 级联

**Applet** 中间件以更传统的方式级联，你可能习惯使用类似的工具（避免 Node.js 的回调地狱）,
所以通过使用 **async/await** 功能，我们可以实现 “真实” 的中间件。通过一系列功能直接传递控制，
直到一个返回，Applet 调用“下游”，然后控制流回“上游”。

下面以 “Hello World” 的响应作为示例，首先请求流通过 x-response-time 和 logging 中间件来请求何时开始，
然后继续移交控制给 response 中间件。当一个中间件调用 `next()` 则该函数暂停并将控制传递给定义的下一个中间件。
当在下游没有更多的中间件执行后，堆栈将展开并且每个中间件恢复执行其上游行为。

```js
// 级联示例

const http = require('http');
const Applet = require('applet');
const app = new Applet();

http.createServer(function(req, res) {
  // 每次 http 请求，上下文数据不一样，所以在这里调用 app.callback;
  // 当然，你还可以使用其它方式注入上下文，具体实现方式参考后面的【Context】。
  const handle = app.callback({
    req,
    res,
    body: '',
    headers: {}
  });
  
  // 为什么需要这个呢, 请参考【中间件说明】
  const done = ctx => ctx;
  
  const send = (ctx) => {
    res.writeHead(ctx.status || 200, ctx.headers);
    res.write(ctx.body);
    res.end();
  };

  handle(done).then(send).catch(e => {
    send({
      status: 500,
      headers: {'Context-Type': 'text/plain;charset=UTF-8'},
      body: e.stack || e.message
    });
  });
})
.listen(3000);

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.headers['X-Response-Time'] = `${ms}ms`;
});

// logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response
app.use(async ctx => {
  ctx.body = 'Hello World';
});
```


#### new Applet([silent=false[, keys='env silent']])

初始化一个 Applet 应用，参数可选：

- `{boolean} silent` 静默处理错误。
- `{string | Array<string>} keys` 上下文环境的属性名称。


#### app.use(...fns)

注册中间件到 applet 应用上，然后**返回当前Applet应用实例**。
参阅 【Middleware】 获取更多信息.

- `{Array<Function>} fns` 中间件列表。

> 实际上，同时注册的多个中间件会被组合（compose）成一个中间件注册到 Applet 应用上。


#### app.onerror(err)

默认错误处理方式。

- `{Error | *} err` 被处理的错误。

> 如果参数 `err` 不是 `Error` 的实例，则或触发 `TypeError` 异常，该异常不会被处理，会导致 Applet 应用立即退出。


#### app.callback([context])

将Applet应用转换成可以执行中间件的**`handle函数`**，
该函数可以接收一个**`done函数`**来获取最终的**`handle函数运行时上下文`**数据。
参阅 【Context】 获取更多信息。

- `{Object | Function} context` 注入到handle函数运行时上下文内给中间件使用的数据。


> * **handle函数**，返回值是一个 Promise 实例。
> * **done函数**，接收的第一个参数是handle函数运行时上下文。



## 中间件（Middleware）

Applet 是一个中间件框架，可以采用两种不同的方法来实现中间件：

* async function
* common function

以下是使用两种不同方法实现一个日志中间件的示例：

#### 示例：_async_ function (node v7.6+)

```js
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`Take ${ms}ms`);
});
```

#### 示例：Common function

```js
app.use((ctx, next) => {
  const start = Date.now();
  return next().then(() => {
    const ms = Date.now() - start;
    console.log(`Take ${ms}ms`);
  });
});
```

> 中间件通常带有两个参数 `(ctx, next)`, `ctx` 是一个**handle函数运行时上下文（context）**，
`next` 是调用执行下游中间件的函数。在代码执行完成后通过 **then** 方法返回一个 **Promise**。



#### 分组中间件

通过 `app.use(...fns)` 注册的一系列中间件（传递了多个参数），将转换成**组合中间件**被注册到 Applet 应用上。
需要注意的是，当**组合中间件**中某一个中间件发生了异常或未调用`next函数`，则会跳过组合中尚未被执行的中间件（即不会被执行）。



## 上下文（Context）

上下文分为 **Applet应用上下文** 和 **handle函数运行时上下文**。

每个中间件都接收一个纯对象 `Object`，正常情况下，该对象初始化状态仅仅包含了 Applet 实例的下面两个简单配置为属性。
`ctx` 通常用作上下文对象的参数名称。

* **env** - 运行环境，默认值为 `(process || self).env.NODE_ENV || 'development'`;
* **silent** - 对错误处理使用静默模式。

> 正常情况下，在运行 **handle函数** 时中修改 Applet 应用的 `slient`、`env` 属性，
是无法作用到运行时上下文，除非通过自定义的**handle函数运行时上下文**建立响应式。



#### 执行前（执行时）注入数据

在调用 **`app.callback(data)`** 产生 **`handle函数`** 时，可以将你的数据注入到执行上下文；
但是在 **handle函数** 被执行时，被注入的数据有可能被中间件修改。

```js
app.callback({
  // 被注入到handle函数执行上下文的数据
  foo: 'bar'
});

// 其实也可以接受一个函数，由函数来注入数据
// app.callback(function(ctx) {
//   ctx.foo = 'bar';
//   return ctx;
// });

app.use(async function(ctx, next) {
  // 在此修改handle函数执行上下文的数据，那么
  // 后面的中间件访问到的 foo 的值是 'bazz'；
  // 当然，你可以在其它中间件中修改回来或改成其它值。
  ctx.foo = 'bazz';
  
  // 这是在调用 app.callback 是未被指定的，
  // 是执行时注入的数据。
  ctx.fruit = 'banana';
  
  await next();
});
```



#### 自定义上下文

同样，通过**`app.callback(fn)`**实现自定义：

```js
app.callback(function(ctx) {
  const xhr = new XMLHttpRequest();
  
  // 将比较重要的两个handle函数执行时上下文
  // 绑定到 xhr 实例对象上，当然，我们也可以不需要这么做。
  xhr.silent = ctx.silent;
  xhr.env = ctx.env;
  
  // ctx 是 Applet 应用产生的执行上下文对象，可以忽略它。
  // 我们通过返回 XMLHttpRequest 实例，
  // 使用它作为执行上下文。
  return xhr;
});
```



## 事件触发接口（EventEmitter）

Applet应用预留了三个事件触发接口，**需要我们自己实现**，它直接影响到 Applet 的默认错误处理方式，具体情况请查看【异常】。

* listeners(event) 返回事件侦听器列表
  - `{string|symbol} event` 事件名称


* on(event, listener) => void): this` 添加侦听器
  - `{string|symbol} event` 事件名称
  - `{Function} listener` 被添加的侦听器


* emit(event, ...args): boolean 触发事件，返回值表示是事件否被触发
  - `{string|symbol} event` 事件名称
  - `{any[]} args` 传递个侦听器的参数列表

> 上述接口是完全根据 Node.js 的 events 模块的接口设计的。 

#### 示例：Node.js 环境下

```js
// 使用 events 模块
const EventEmitter = require('events');
const Applet = require('applet');

class MyApplet extends Applet {
  constructor(silent, keys) {
    super(silent, keys);
    // 继承 EventEmitter 实例属性 
    EventEmitter.call(this);
  }
}
// 继承 EventEmitter 原型链属性
Object.assign(MyApplet.prototype, EventEmitter.prototype);

const app = new MyApplet();

// 这个时候，我们可以轻松愉快地
// 使用 events 模块的订阅/发布功能了。
app.on('start', function(foo) {
  console.log(foo);
});

app.use(async function(ctx, next) {
  app.emit('start', ctx.foo);
  await next();
  app.emit('end', ctx.bar);
});
```


#### 示例：浏览器端

```js
class Ajax extends Applet {
  on(event, listener) {}
  listeners(event) {}
  emit(event, ...args) {}
}

const app = new Ajax();

// 自定义handle函数的运行时上下文
const handle = app.callback(function() {
  const xhr = new XMLHttpRequest();
  
  xhr.addEventListener('abort', function() {
    app.emit('cancel', '用户取消接收');
  });
  
  return xhr;
});

app.use(function(ctx, next) {
  // ctx 就是上面的 XMLHttpRequest 实例
  
  ctx.addEventListener('load', function() {
    next();
  });

  ctx.addEventListener('error', function ()  {
    app.onerror(new Error('数据接收出错'))
  });

  ctx.open('POST', 'path/to', true);
  ctx.send('foo=bar');
});

handle(function(ctx) {
  return JSON.parse(ctx.responseText);
}).then(function(data) {
  // ... 
  console.log(data);
}).catch(function(err) {
  app.emit('error', err);
});
```



## 异常处理（Exception）

该框架本身极小，API也非常少，产出的异常可以分成两种，**传参类型错误**和**handle函数运行错误**。



#### 传参类型错误

调用Applet应用的相关方法（可查看Applet的API），缺少参数或给出参数类型不符合预期触发的 `TypeError` 异常。
该类异常会**导致 Applet 应用程序立即退出**，你可以通过 **try/catch** 捕获。

```js
const app = new Applet();

// 使用中间件触发异常的用例：
app.use();//没有传参
app.use(234);//参数不是函数
app.use('123', () => 'todo something');// 第一个参数不是函数

try {
  // 在这里调用 app.use 方法使用中间件到 Applet 应用上。
} catch(err) {
  // err 是捕获到的异常信息
}

// handle函数异常处理触发的异常用例：
// 参数必须是 Error 的实例
app.onerror('error message');
```


#### handle函数运行错误

该错误是调用Applet应用的callback方法产出的handle函数被执行是触发的，是中间件产出的。
由于handle函数返回值是 Promise 实例，这可以轻松的使用**`.catch`**刚发捕获该异常。

```js
const app = new Applet();

app.use(function() {
  // ...
  // 中间件产生的异常
  throw new Error('.....');
});

const handle = app.callback();

handle().catch(function(err) {
  // 在这里可以捕获到异常
  console.log(err);
});
```


#### Applet应用的静默模式

handle函数执行时，发现中间件类型不符合预期，未开启静默模式的情况下，会触发 TypeError 异常，相反则忽略之。

在默认情况下，会将handle函数产出的的所有错误输出到 **stderr** 或者 **控制台**，除非handle函数的执行上下文属性 `silent` 为 `true`。



## 授权协议（License）

MIT © 2018, <a href="mailto:japplet@163.com" title="japplet@163.com">Maofeng Zhang</a>