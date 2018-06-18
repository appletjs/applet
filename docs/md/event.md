## 事件接口（EventEmitter）{#event-emitter}

Applet应用预留了三个事件触发接口，**需要我们自己实现**，它直接影响到 Applet 的默认错误处理方式。
参阅 [Exception](#exception) 获取更多信息.

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

// 自定义handle函数的执行上下文
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