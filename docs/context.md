## 上下文（Context）{#context}

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