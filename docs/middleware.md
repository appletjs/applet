## 中间件（Middleware）{#middleware}

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