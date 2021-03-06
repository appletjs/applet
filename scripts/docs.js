const fs = require('fs');
const path = require('path');
const locals = require('../package');
const marked = require('marked');
const hl = require('highlightjs');

hl.configure({
  tabReplace: '  ',
  lineNumber: true
});

const files = [
  'banner.md',
  'intro.md',
  'install.md',
  'applet.md',
  'middleware.md',
  'context.md',
  'event.md',
  'exception.md',
  'footer.md'
];

const sources = files.map(function (file) {
  file = path.join(__dirname, '../docs/md', file);
  return fs.readFileSync(file, 'UTF8').trim();
});

const [name, email] = locals.author.split('<');
locals.author = name.trim();
locals.email = email.split('>')[0].trim();
locals.keywords = locals.keywords.join(' ');
locals.LICENSE = 'LICENSE';

const renderer = new marked.Renderer();
const idMatchRE = /{#([^}]+)}/;
const idMatchReplace = /{#[^}]+}/g;
const links = [];

function replace(source, data = locals) {
  return source.replace(/\{\{\s*([\w$]+)\s*\}\}/g, function (expr, word) {
    return data[word] != null ? data[word] : expr;
  });
}

function highlight(code, lang) {
  const data = hl.highlight(lang, code);
  return data.value;
}

renderer.heading = function (text, level, raw) {
  text = text.replace(idMatchReplace, '');
  let id = raw.match(idMatchRE);
  id = id && id[1].trim().replace(/\s+/i, '-');
  if (id && level === 2) links.push({text, id});
  // const ID = id ? ' id="' + id + '"' : '';
  // return `<h${level}${ID}>${text}</h${level}>\n`;
  return `<h${level}>${text}</h${level}>\n`;
};

renderer.link = function(href, title, text) {
  let temp = '', clazz;
  if (/^[#.]/.test(title)) {
    clazz = title.split('.').map(function (cl) {
      const [c, i] = cl.split('#', 2);
      if (i) temp += ' id="' + i + '"';
      return c;
    }).filter(Boolean).join(' ');
    title = '';
  }
  if (clazz) temp += ' class="' + clazz + '"';
  let html = marked.Renderer.prototype.link.call(this, href, title, text);
  if (temp) html = '<a' + temp + html.substring(2);
  return html;
};

const partials = [];
const tasks = [];

sources.map(function (file, i) {
  return new Promise(function (resolve, reject) {
    const content = replace(sources[i]);
    marked(content, {highlight, renderer}, function (err, content) {
      if (err) return reject(err);

      content = content.replace(/\.\.\/(img|css|js)/i, '$1');

      let inPre = false;
      content = content.split('\n').map(function (line) {
        if (inPre) {
          if (line.endsWith('</pre>')) inPre = false;
          return line;
        }

        if (line.startsWith('<pre>')) {
          inPre = true;
        }

        return '    ' + line;
      }).join('\n');

      const link = links[i - 1];
      const tag = i === 0 ? 'header' : i === sources.length - 1 ? 'footer' : 'section';
      const id = ' id="' + (i > 0 ? (link ? link.id : '') : 'site-header') + '"';
      const title = ' title="' + (i > 0 ? (link ? link.text : '') : '') + '"';

      partials.push(
        '<' + tag + id + title + '>\n' +
        '  <article>\n' +
        '    ' + content.trim() + '\n' +
        '  </article>\n' +
        '</' + tag + '>\n'
      );

      resolve();
    });
  });
});

Promise.all(tasks).then(function () {
  fs.writeFileSync(__dirname + '/../docs/index.html', replace(`<!doctype html>
<html lang="zh">
<head>
  <meta name="charset" content="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="keywords" content="{{keywords}}">
  <meta name="description" content="{{description}}">
  <meta name="author" content="{{author}}">
  <title>Applet - 中间件开发框架</title>
  <link rel="shortcut icon" href="img/ico.png">
  <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="nav-wrapper">
  <div class="nav">
    <div class="nav-brand">
      <img class="brand" src="img/applet-white.png" alt="applet">
    </div>
    <div class="nav-title"></div>
    <nav class="nav-main">
${links.map(function ({text, id}) {
  return `      <a href="#${id}" title="${text}">${text}</a>`;
}).join('\n')}
      <div class="nav-main-divider"></div>
      <a href="#site-header">返回顶部（Go to top）</a>
    </nav>
    <div class="nav-hamburger">
        <span></span>
        <span></span>
    </div>
  </div>
</div>

${partials.join('\n')}

<script src="script.js"></script>
</body>
</html>`), 'UTF8');
}).catch(function (err) {
  console.error(err);
  process.exit(err.code || -1);
});
