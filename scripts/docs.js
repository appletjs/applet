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
  const data = hl.highlight(lang, code, 'linenumbers');
  return data.value;
}

renderer.heading = function(text, level, raw) {
  text = text.replace(idMatchReplace, '');
  let id = raw.match(idMatchRE);
  id = id && id[1].trim().replace(/\s+/i, '-');
  if (id && level === 2) links.push({text, id});
  const ID = id ? ' id="' + id + '"' : '';
  const anchor = id ? `<a href="#${id}">#</a>` : '';
  return `<h${level} class="heading"${ID}>${anchor}${text}</h${level}>\n`;
};

function createNevigation() {
  return `<div class="nav">
  <div class="nav-anchor">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <nav class="nav-menu">
${links.map(function ({text, id}) {
  return `    <a href="#${id}">${text}</a>`
}).join('\n')}
    <hr class="nav-menu-divider">
    <a href="#">返回顶部（Go to top）</a>
  </nav>
</div>`
}

function html(sources) {
  const partials = [];
  const tasks = [];

  locals.logo = 'applet.svg';

  sources.map(function (file, i) {
    let tag = 'section';
    if (i === 0) tag = 'header';
    else if (i === sources.length - 1) tag = 'footer';
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

        partials.push(
          '<' + tag + '>\n' +
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
    const content = fs.readFileSync(__dirname + '/../docs/_template.html', 'UTF-8');
    locals.content = createNevigation() + '\n\n' + partials.join('\n\n');
    fs.writeFileSync(__dirname + '/../docs/index.html', replace(content), 'UTF8');
  }).catch(function (err) {
    console.error(err);
    process.exit(err.code || -1);
  });
}

html(sources);
