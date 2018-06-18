## 应用程序（Applet）{#applet}

**Applet** 应用程序是一个包含一组中间件函数的对象，它是按照类似堆栈的方式组织和执行的。
因为使用了 Koa 的核心概念，所以关键的设计点与Koa保持一致：在其低级中间件层中提供高级“语法糖”。
这样既提高了互操作性、稳健性，并使书写中间件更加愉快。

#### 示例：必修的 hello world 应用

```js
const Applet = require('applet');
const app = new Applet();
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

> **ctx** 表示handle函数的执行上下文，储存中间件的运行数据；
**next** 是一个函数，用来暂停当前中间件、移交控制权到下游，待下游释放控制权，然后恢复控制权。


#### 级联

**Applet** 中间件以更传统的方式级联（避免 Node.js 的回调地狱），
所以通过使用 **async/await** 功能，我们可以实现 “真实” 的中间件。
通过一系列功能直接传递控制，直到一个返回，Applet 调用“下游”，然后控制流回“上游”。

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
  // handle 函数返回值是一个 Promise 实例。
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


#### new Applet([silent=false[, keys='env silent']]){#new-applet}

初始化一个 Applet 应用，参数可选：

- `{boolean} silent` 静默处理错误。
- `{string | Array<string>} keys` 上下文环境的属性名称。


#### app.use(...fns){#app-use}

注册中间件到 Applet 应用上，然后**返回当前Applet应用实例**，方便链式调用。
参阅 [Middleware](#middleware) 获取更多信息.

- `{Array<Function>} fns` 中间件列表。

> 实际上，同时注册的多个中间件会被组合（compose）成一个中间件注册到 Applet 应用上。


#### app.onerror(err){#app-onerror}

默认错误处理方式。参阅 [Exception](#exception) 获取更多信息.

- `{Error | *} err` 被处理的错误。

> 如果参数 `err` 不是 `Error` 的实例，则或触发 `TypeError` 异常，该异常不会被处理，会导致 Applet 应用立即退出。


#### app.callback([context])

将Applet应用转换成可以执行中间件的**`handle函数`**，该函数可以接收一个**`done函数`**来获取最终的**`handle函数执行上下文`**数据。
参阅 [Context](#context) 获取更多信息。

- `{Object | Function} context` 注入到handle函数执行上下文内给中间件使用的数据。


> * **handle函数**，返回值是一个 Promise 实例。
> * **done函数**，接收的第一个参数是handle函数执行上下文。
