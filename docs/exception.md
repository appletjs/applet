## 异常处理（Exception）{#exception}

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
