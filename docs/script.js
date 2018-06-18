(function () {
  var temp = document.createElement('div');
  var ie = window.ie = {};
  var cache = {};

  /**
   * Escape a regular expression string.
   * @param  {string} str
   * @return {string}
   */
  function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
  }

  function toRegExp(str) {
    if (cache.hasOwnProperty(str)) {
      return cache[str];
    }

    var pattern = '(^|\\s+)';
    pattern += escapeString(str);
    pattern += '(\\s+|$)';

    return (cache[str] = new RegExp(pattern, 'g'));
  }

  ie.toRegExp = toRegExp;

  if (temp.classList) {
    ie.addClass = function (el, name) {
      el.classList.add(name);
    };

    ie.removeClass = function (el, name) {
      el.classList.remove(name);
    };

    ie.toggleClass = function (el, name) {
      el.classList.toggle(name);
    };

    ie.hasClass = function (el, name) {
      return el.classList.contains(name);
    };
  } else {
    ie.hasClass = function (el, name) {
      return toRegExp(name).test(el.className);
    };

    ie.addClass = function (el, name) {
      if (!el.className) el.className = name;
      else if (!ie.hasClass(el, name)) el.className += ' ' + name;
    };

    ie.removeClass = function (el, name) {
      if (el.className && ie.hasClass(el, name)) {
        el.className = el.className
          .replace(toRegExp(name), '')
          .replace(/\s{2,}/g, '');
      }
    };

    ie.toggleClass = function (el, name) {
      var has = ie.hasClass(el, name);
      ie[has ? 'removeClass' : 'addClass'](el, name);
    };
  }

  ie.contains = function contains(container, el) {
    if (container === el) return true;
    while (el.parentNode) {
      if (el.parentNode === container) return true;
      el = el.parentNode;
    }
    return false;
  };

  ie.each = function each(arr, fn) {
    for (var i = 0; i < arr.length; i++) {
      fn(arr[i], i, arr);
    }
  };
}());

/*!
 * 导航条切换部分
 *
 * - 滚动条动画
 * - 设置标题
 */
(function () {

  var hamburger = document.querySelector('.nav-hamburger');
  var navbar = document.querySelector('.nav-main');
  var title = document.querySelector('.nav-title');
  var scrolledTop = document.body.scrollTop;
  var isShowDrawer = false;
  var scrollTimer = null;
  var titles = {};

  function getOffsetY(object, y) {
    if (y == null) y = 0;
    if (!object) return y;
    y += object.offsetTop;
    return getOffsetY(object.offsetParent, y);
  }

  function clearScrollTimer(hash) {
    if (scrollTimer) {
      clearInterval(scrollTimer);
      scrollTimer = null;
    }

    if (hash) {
      location.hash = hash;
      var el = document.getElementById(hash.substring(1));
      title.innerHTML = el.getAttribute('title') || el.getAttribute('data-title') || '';
    }

    scrolledTop = document.body.scrollTop;
  }

  function isScrollToTopOrBottom() {
    var clientHeight = document.body.clientHeight;
    var scrollTop = document.body.scrollTop;
    var scrollHeight = document.body.scrollHeight;
    if (scrollTop === 0) return true;// 到达顶端
    if (clientHeight + Math.floor(scrollTop) === scrollHeight) return;// 到达底部
    if (clientHeight + Math.ceil(scrollTop) === scrollHeight) return true;// 到达底部
  }

  function scrollToElement(el) {
    var hash = el.id ? '#' + el.id : null;
    var newScrollTop = getOffsetY(el);

    // 不需要滚动
    if (newScrollTop === scrolledTop) {
      clearScrollTimer(hash);
      return;
    }

    // 取消之前的滚动效果
    clearScrollTimer();

    // 记录滚动次数，防止进入死循环
    var maxScrollTimes = Math.ceil(Math.abs((newScrollTop - scrolledTop) / 10));
    var scrollTimes = 0;

    scrollTimer = setInterval(function () {
      scrolledTop += Math.floor((newScrollTop - scrolledTop) / 10);
      if (Math.abs(scrolledTop - newScrollTop) < 10) scrolledTop = newScrollTop;
      document.body.scrollTop = scrolledTop;
      if (scrolledTop === newScrollTop) clearScrollTimer(hash);
      else if (isScrollToTopOrBottom()) clearScrollTimer(hash);
      else if (++scrollTimes > maxScrollTimes) clearScrollTimer(hash);
    }, 10);
  }

  function showDrawer() {
    isShowDrawer = true;
    ie.addClass(navbar, 'is-show');
    ie.addClass(hamburger, 'is-active');
  }

  function hideDrawer() {
    isShowDrawer = false;
    ie.removeClass(navbar, 'is-show');
    ie.removeClass(hamburger, 'is-active');
  }

  hamburger.onclick = function () {
    isShowDrawer ? hideDrawer() : showDrawer();
  };

  document.body.onclick = function (e) {
    e = e || window.event;
    var target = e.target;
    if (ie.contains(hamburger, target)) return;
    if (!ie.contains(navbar, target)) return hideDrawer();
    if (target.nodeName === 'A') hideDrawer();
  };

  var links = document.getElementsByTagName('a');
  for (var i = 0; i < links.length; i++) {
    (function (link) {
      var href = link.getAttribute('href');
      if (!href || href[0] !== '#') return;
      var el = document.getElementById(href.substring(1));
      if (el) link.onclick = function (e) {
        e.preventDefault();
        scrollToElement(el);
      };
    }(links[i]));
  }

  clearScrollTimer(location.hash);

}());

/*!
 * 代码高亮
 */
(function () {
  var codes = document.getElementsByTagName('code');

  function createElement(tag, className) {
    var el = document.createElement(tag);
    el.className = className;
    return el;
  }

  ie.each(codes, function (code) {
    var parent = code.parentNode;
    if (parent.nodeName !== 'PRE') return;

    var ul = createElement('ul', 'pre-numbering');

    ie.each(code.innerHTML.split('\n'), function (_, i) {
      var li = createElement('li', '');
      li.innerHTML = (i + 1) + '.';
      ul.appendChild(li);
    });

    ie.addClass(code, 'has-numbering');
    parent.appendChild(ul);
  });

}());
