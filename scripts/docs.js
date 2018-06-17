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
  file = path.join(__dirname, '../docs', file);
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
  const ID = id ? ' id="' + id + '"' : '';
  return `<h${level}${ID}>${text}</h${level}>\n`;
};

function createNevigation() {
  return `<div id="navigation">
  <div class="nav" id="nav">
    <span class="logo">applet</span>
    <div class="nav-anchor" id="nav-anchor">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <nav class="nav-menu">
  ${links.map(function ({text, id}) {
      return `      <a href="#${id}">${text}</a>`;
    }).join('\n')}
      <hr class="nav-menu-divider">
      <a href="#">返回顶部（Go to top）</a>
    </nav>
  </div>
</div>`;
}

function html(sources) {
  const partials = [];
  const tasks = [];

  locals.logo = 'applet.svg';

  sources.map(function (file, i) {
    return new Promise(function (resolve, reject) {
      const content = replace(sources[i]);
      marked(content, {highlight, renderer}, function (err, content) {
        if (err) return reject(err);
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

        const id = i === 0
          ? ' id="head"'
          : i === sources.length - 1
            ? ' id="foot"'
            : '';

        partials.push(
          '<section' + id + '>\n' +
          '  <article>\n' +
          '    ' + content.trim() + '\n' +
          '  </article>\n' +
          '</section>\n'
        );

        resolve();
      });
    });
  });

  Promise.all(tasks).then(function () {
    fs.writeFileSync(__dirname + '/../docs/index.html', replace(`<!DOCTYPE html>
<html lang="zh">
<head>
  <meta name="charset" content="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="keywords" content="{{keywords}}">
  <meta name="description" content="{{description}}"/>
  <meta name="author" content="{{author}}"/>
  <title>Applet - 中间件开发框架</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${createNevigation()}

${partials.join('\n')}
<script src="script.js"></script>
</body>
</html>`), 'UTF8');
  }).catch(function (err) {
    console.error(err);
    process.exit(err.code || -1);
  });
}

html(sources);
