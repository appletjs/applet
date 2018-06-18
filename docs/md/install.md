## 安装（Installation）{#installation}

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
<script src="//cdn.jsdelivr.net/npm/applet@{{version}}/browser.js"></script>
<script src="//unpkg.com/applet@{{version}}/browser.js"></script>

<!-- 或者由CDN自动选择（最新版本可能有所延迟） -->
<script src="//cdn.jsdelivr.net/npm/applet"></script>
<script src="//unpkg.com/applet"></script>
```

你可以在 [cdn.jsdelivr.net/npm/applet](https://cdn.jsdelivr.net/npm/applet/) 浏览 NPM 包的源代码，
或者在 [GitHub仓库](https://github.com/appletjs/applet/tree/dev) 浏览开发版源代码。
