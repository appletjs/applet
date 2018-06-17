(function (codes) {
  function each(arr, fn) {
    for (var i = 0; i < arr.length; i++) {
      fn(arr[i], i, arr);
    }
  }

  function createElement(tag, className) {
    var el = document.createElement(tag);
    el.className = className;
    return el;
  }

  each(codes, function (code) {
    var parent = code.parentNode;
    switch (parent.nodeName) {
      case 'PRE':
        break;
      case 'A':
        parent.className += ' code-link';
        break;
      default:
        return;
    }
    if (code.parentNode.nodeName !== 'PRE') {
      return;
    }

    var ul = createElement('ul', 'pre-numbering');

    each(code.innerHTML.split('\n'), function (_, i) {
      var li = createElement('li', '');
      li.innerHTML = (i + 1) + '.';
      ul.appendChild(li);
    });

    code.className += ' has-numbering';
    parent.appendChild(ul);
  });

  var anchor = document.getElementById('nav-anchor');
  var nav = document.getElementById('nav');

  function showMenu() {
    nav.className = 'nav show';
  }

  function hideMenu() {
    setTimeout(function () {
      nav.className = 'nav';
    }, 250);
  }

  anchor.onclick = showMenu;

  each(nav.getElementsByTagName('a'), function (a) {
    a.onclick = function () {
      if (a.getAttribute('href') === '#') {
        document.body.scrollTo(0, 0);
      }
      hideMenu();
    };
  });

  each(document.getElementsByTagName('section'), function (section) {
    section.onclick = function () {
      nav.className = 'nav';
    };
  });

}(document.getElementsByTagName('code')));
