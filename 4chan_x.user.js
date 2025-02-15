// ==UserScript==
// @name           4chan x
// @version        2.40.77
// @namespace      aeosynth
// @description    Adds various features.
// @copyright      2009-2011 James Campos <james.r.campos@gmail.com>
// @copyright      2012-2013 Nicolas Stepien <stepien.nicolas@gmail.com>
// @license        MIT; http://en.wikipedia.org/wiki/Mit_license
// @include        http://boards.4chan.org/*
// @include        https://boards.4chan.org/*
// @include        http://boards.4channel.org/*
// @include        https://boards.4channel.org/*
// @include        http://sys.4chan.org/*
// @include        https://sys.4chan.org/*
// @include        http://a.4cdn.org/*
// @include        https://a.4cdn.org/*
// @include        http://i.4cdn.org/*
// @include        https://i.4cdn.org/*
// @include        http://is.4chan.org/*
// @include        https://is.4chan.org/*
// @include        http://is2.4chan.org/*
// @include        https://is2.4chan.org/*
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_openInTab
// @grant          GM_xmlhttpRequest
// @run-at         document-start
// @updateURL      https://github.com/loadletter/4chan-x/raw/master/4chan_x.meta.js
// @downloadURL    https://github.com/loadletter/4chan-x/raw/master/4chan_x.user.js
// @icon           data:image/gif;base64,R0lGODlhEAAQAKECAAAAAGbMM////////yH5BAEKAAIALAAAAAAQABAAAAIxlI+pq+D9DAgUoFkPDlbs7lGiI2bSVnKglnJMOL6omczxVZK3dH/41AG6Lh7i6qUoAAA7
// ==/UserScript==

/* LICENSE
 *
 * Copyright (c) 2009-2011 James Campos <james.r.campos@gmail.com>
 * Copyright (c) 2012-2013 Nicolas Stepien <stepien.nicolas@gmail.com>
 * http://mayhemydg.github.io/4chan-x/
 * 4chan X 2.39.7
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * HACKING
 *
 * 4chan X is written in CoffeeScript[1], and developed on GitHub[2].
 *
 * [1]: http://coffeescript.org/
 * [2]: https://github.com/MayhemYDG/4chan-x
 *
 * CONTRIBUTORS
 *
 * noface - unique ID fixes
 * desuwa - Firefox filename upload fix
 * seaweed - bottom padding for image hover
 * e000 - cooldown sanity check
 * ahodesuka - scroll back when unexpanding images, file info formatting
 * Shou- - pentadactyl fixes
 * ferongr - new favicons
 * xat- - new favicons
 * Zixaphir - fix qr textarea - captcha-image gap
 * Ongpot - sfw favicon
 * thisisanon - nsfw + 404 favicons
 * Anonymous - empty favicon
 * Seiba - chrome quick reply focusing
 * herpaderpderp - recaptcha fixes
 * WakiMiko - recaptcha tab order http://userscripts.org/scripts/show/82657
 * btmcsweeney - allow users to specify text for sauce links
 *
 * All the people who've taken the time to write bug reports.
 *
 * Thank you.
 */

(function() {
  var $, $$, AlwaysCdn, AlwaysHTTPS, Anonymize, ArchiveLink, AutoGif, Build, CatalogLinks, Conf, Config, DeleteLink, DownloadLink, ExpandComment, ExpandThread, Favicon, FileInfo, Filter, Get, ImageExpand, ImageHover, Keybinds, Main, Menu, Nav, Options, QR, QuoteBacklink, QuoteCT, QuoteInline, QuoteOP, QuoteYou, QuotePreview, Quotify, Redirect, RelativeDates, RemoveSlug, ReplaceJpg, ReplacePng, ReplyHiding, ReportLink, RevealSpoilers, Sauce, StrikethroughQuotes, ThreadHiding, ThreadStats, Time, TitlePost, UI, Unread, Updater, Watcher, d, g, _base, CaptchaIsSetup;
  CaptchaIsSetup = false;
  
  /* Your posts to add (You) backlinks to */
  var yourPosts = new Array();
  
  Config = {
    main: {
      Enhancing: {
        'Disable 4chan\'s extension': [true, 'Avoid conflicts between 4chan X and 4chan\'s inline extension'],
        'Catalog Links': [true, 'Turn Navigation links into links to each board\'s catalog'],
        '404 Redirect': [true, 'Redirect dead threads and images'],
        'Keybinds': [true, 'Binds actions to keys'],
        'Time Formatting': [true, 'Arbitrarily formatted timestamps, using your local time'],
        'Relative Post Dates': [false, 'Display dates as "3 minutes ago" f.e., tooltip shows the timestamp'],
        'File Info Formatting': [true, 'Reformats the file information'],
        'Comment Expansion': [true, 'Expand too long comments'],
        'Comment Auto-Expansion': [false, 'Autoexpand too long comments'],
        'Thread Expansion': [true, 'View all replies'],
        'Index Navigation': [true, 'Navigate to previous / next thread'],
        'Reply Navigation': [false, 'Navigate to top / bottom of thread'],
        'Remove Slug': [false, 'Cut useless comment/post from the URL'],
        'Always HTTPS': [false, 'Redirect pages to HTTPS'],
        'Check for Updates': [true, 'Check for updated versions of 4chan X']
      },
      Filtering: {
        'Anonymize': [false, 'Make everybody anonymous'],
        'Filter': [true, 'Self-moderation placebo'],
        'Recursive Filtering': [true, 'Filter replies of filtered posts, recursively'],
        'Reply Hiding': [true, 'Hide single replies'],
        'Thread Hiding': [true, 'Hide entire threads'],
        'Show Stubs': [true, 'Of hidden threads / replies']
      },
      Imaging: {
        'Always CDN': [false, 'Always use images from Cloudflare servers'],
        'Image Auto-Gif': [false, 'Animate gif thumbnails'],
        'Replace PNG': [false, 'Replace thumbnail with original PNG image'],
        'Replace JPG': [false, 'Replace thumbnail with original JPG image'],
        'Image Expansion': [true, 'Expand images'],
        'Expand All WebM': [true, 'Expand all WebMs too, can cause high resource usage!'],
        'Image Hover': [false, 'Show full image on mouseover'],
        'Sauce': [true, 'Add sauce to images'],
        'Reveal Spoilers': [false, 'Replace spoiler thumbnails by the original thumbnail'],
        'Expand From Current': [false, 'Expand images from current position to thread end']
      },
      Menu: {
        'Menu': [true, 'Add a drop-down menu in posts'],
        'Report Link': [true, 'Add a report link to the menu'],
        'Delete Link': [true, 'Add post and image deletion links to the menu'],
        'Download Link': [true, 'Add a download with original filename link to the menu'],
        'Archive Link': [true, 'Add an archive link to the menu']
      },
      Monitoring: {
        'Thread Updater': [true, 'Update threads. Has more options in its own dialog.'],
        'Unread Count': [true, 'Show unread post count in tab title'],
        'Unread Favicon': [true, 'Show a different favicon when there are unread posts'],
        'Post in Title': [true, 'Show the op\'s post in the tab title'],
        'Thread Stats': [true, 'Display reply, image and poster count'],
        'Current Page': [true, 'Display position of the thread in the page index'],
        'Current Page Position': [false, 'Also display position of the thread in index'],
        'Thread Watcher': [true, 'Bookmark threads'],
        'Auto Watch': [true, 'Automatically watch threads that you start'],
        'Auto Watch Reply': [false, 'Automatically watch threads that you reply to']
      },
      Posting: {
        'Quick Reply': [true, 'Reply without leaving the page'],
        'Cooldown': [true, 'Prevent "flood detected" errors'],
        'Alternative captcha': [false, 'Use the classic text recaptcha in replies and report window'],
        'Alt index captcha': [false, 'Also use text captcha in board index (might not allow creating new threads)'],
        'Auto Submit': [true, 'Submit automatically when captcha has been solved'],
        'Persistent QR': [false, 'The Quick reply won\'t disappear after posting'],
        'Auto Hide QR': [true, 'Automatically hide the quick reply when posting'],
        'Open Reply in New Tab': [false, 'Open replies in a new tab that are made from the main board'],
        'Remember QR size': [false, 'Remember the size of the Quick reply (Firefox only)'],
        'Remember Subject': [false, 'Remember the subject field, instead of resetting after posting'],
        'Remember Spoiler': [false, 'Remember the spoiler state, instead of resetting after posting'],
        'Hide Original Post Form': [true, 'Replace the normal post form with a shortcut to open the QR']
      },
      Quoting: {
        'Quote Backlinks': [true, 'Add quote backlinks'],
        'OP Backlinks': [false, 'Add backlinks to the OP'],
        'Quote Highlighting': [true, 'Highlight the previewed post'],
        'Quote Inline': [true, 'Show quoted post inline on quote click'],
        'Quote Preview': [true, 'Show quote content on hover'],
        'Resurrect Quotes': [true, 'Linkify dead quotes to archives'],
        'Indicate OP quote': [true, 'Add \'(OP)\' to OP quotes'],
        /* Add (You) feature */
        'Indicate You quote': [true, 'Add \'(You)\' to your quoted posts'],
        'Indicate Cross-thread Quotes': [true, 'Add \'(Cross-thread)\' to cross-threads quotes'],
        'Forward Hiding': [true, 'Hide original posts of inlined backlinks']
      }
    },
    filter: {
      name: ['# Filter any namefags:', '#/^(?!Anonymous$)/'].join('\n'),
      pass: [''].join('\n'),
      uniqueid: ['# Filter a specific ID:', '#/Txhvk1Tl/'].join('\n'),
      tripcode: ['# Filter any tripfags', '#/^!/'].join('\n'),
      mod: ['# Set a custom class for mods:', '#/Mod$/;highlight:mod;op:yes', '# Set a custom class for moot:', '#/Admin$/;highlight:moot;op:yes'].join('\n'),
      email: ['# Filter any e-mails that are not `sage` on /a/ and /jp/:', '#/^(?!sage$)/;boards:a,jp'].join('\n'),
      subject: ['# Filter Generals on /v/:', '#/general/i;boards:v;op:only'].join('\n'),
      comment: ['# Filter Stallman copypasta on /g/:', '#/what you\'re refer+ing to as linux/i;boards:g'].join('\n'),
      country: [''].join('\n'),
      filename: [''].join('\n'),
      dimensions: ['# Highlight potential wallpapers:', '#/1920x1080/;op:yes;highlight;top:no;boards:w,wg'].join('\n'),
      filesize: [''].join('\n'),
      md5: [''].join('\n')
    },
    sauces: ['http://iqdb.org/?url=$1', 'https://www.google.com/searchbyimage?image_url=$1', 'https://www.yandex.com/images/search?rpt=imageview&img_url=$1', '#http://tineye.com/search?url=$1', '#http://saucenao.com/search.php?db=999&url=$1', '#http://3d.iqdb.org/?url=$1', '#http://regex.info/exif.cgi?imgurl=$2', '# uploaders:', '#http://imgur.com/upload?url=$2;text:Upload to imgur', '#http://omploader.org/upload?url1=$2;text:Upload to omploader', '# "View Same" in archives:', '#https://archive.moe/_/search/image/$3/;text:View same on moe', '#https://archive.moe/$4/search/image/$3/;text:View same on moe /$4/', '#https://rbt.asia/$4/image/$3;text:View same on rbt /$4/'].join('\n'),
    time: '20%y-%m-%d(%a)%H:%M',
    backlink: '>>%id',
    fileInfo: '%l (%p%s, %r)',
    favicon: 'ferongr',
    hotkeys: {
      openQR: ['i', 'Open QR with post number inserted'],
      openEmptyQR: ['I', 'Open QR without post number inserted'],
      openOptions: ['ctrl+o', 'Open Options'],
      close: ['Esc', 'Close Options or QR'],
      spoiler: ['ctrl+s', 'Quick spoiler tags'],
      sageru: ['alt+n', 'Sage keybind'],
      code: ['alt+c', 'Quick code tags'],
      sjis: ['alt+a', 'SJIS tags'],
      submit: ['alt+s', 'Submit post'],
      watch: ['w', 'Watch thread'],
      update: ['u', 'Update now'],
      unreadCountTo0: ['z', 'Mark thread as read'],
      expandImage: ['m', 'Expand selected image'],
      expandAllImages: ['M', 'Expand all images'],
      zero: ['0', 'Jump to page 0'],
      nextPage: ['L', 'Jump to the next page'],
      previousPage: ['H', 'Jump to the previous page'],
      nextThread: ['n', 'See next thread'],
      previousThread: ['p', 'See previous thread'],
      expandThread: ['e', 'Expand thread'],
      openThreadTab: ['o', 'Open thread in current tab'],
      openThread: ['O', 'Open thread in new tab'],
      nextReply: ['J', 'Select next reply'],
      previousReply: ['K', 'Select previous reply'],
      hide: ['x', 'Hide thread']
    },
    updater: {
      checkbox: {
        'Beep': [false, 'Beep on new post to completely read thread'],
        'Scrolling': [false, 'Scroll updated posts into view. Only enabled at bottom of page.'],
        'Scroll BG': [false, 'Scroll background tabs'],
        'Verbose': [true, 'Show countdown timer, new post count'],
        'Auto Update': [true, 'Automatically fetch new posts']
      },
      'Interval': 30
    }
  };

  Conf = {};

  d = document;

  g = {};

  UI = {
    dialog: function(id, position, html) {
      var el;
      el = d.createElement('div');
      el.className = 'reply dialog';
      el.innerHTML = html;
      el.id = id;
      el.style.cssText = localStorage.getItem("" + Main.namespace + id + ".position") || position;
      el.querySelector('.move').addEventListener('mousedown', UI.dragstart, false);
      return el;
    },
    dragstart: function(e) {
      var el, rect;
      e.preventDefault();
      UI.el = el = this.parentNode;
      d.addEventListener('mousemove', UI.drag, false);
      d.addEventListener('mouseup', UI.dragend, false);
      rect = el.getBoundingClientRect();
      UI.dx = e.clientX - rect.left;
      UI.dy = e.clientY - rect.top;
      UI.width = d.documentElement.clientWidth - rect.width;
      return UI.height = d.documentElement.clientHeight - rect.height;
    },
    drag: function(e) {
      var left, style, top;
      left = e.clientX - UI.dx;
      top = e.clientY - UI.dy;
      left = left < 10 ? '0px' : UI.width - left < 10 ? null : left + 'px';
      top = top < 10 ? '0px' : UI.height - top < 10 ? null : top + 'px';
      style = UI.el.style;
      style.left = left;
      style.top = top;
      style.right = left === null ? '0px' : null;
      return style.bottom = top === null ? '0px' : null;
    },
    dragend: function() {
      localStorage.setItem("" + Main.namespace + UI.el.id + ".position", UI.el.style.cssText);
      d.removeEventListener('mousemove', UI.drag, false);
      d.removeEventListener('mouseup', UI.dragend, false);
      return delete UI.el;
    },
    hover: function(e) {
      var clientHeight, clientWidth, clientX, clientY, height, style, top, _ref;
      clientX = e.clientX, clientY = e.clientY;
      style = UI.el.style;
      _ref = d.documentElement, clientHeight = _ref.clientHeight, clientWidth = _ref.clientWidth;
      height = UI.el.offsetHeight;
      top = clientY - 120;
      style.top = clientHeight <= height || top <= 0 ? '0px' : top + height >= clientHeight ? clientHeight - height + 'px' : top + 'px';
      if (clientX <= clientWidth - 400) {
        style.left = clientX + 45 + 'px';
        return style.right = null;
      } else {
        style.left = null;
        return style.right = clientWidth - clientX + 45 + 'px';
      }
    },
    hoverend: function() {
      $.rm(UI.el);
      return delete UI.el;
    }
  };

  /*
  loosely follows the jquery api:
  http://api.jquery.com/
  not chainable
  */


  $ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return root.querySelector(selector);
  };

  $.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
  };

  $.extend($, {
    SECOND: 1000,
    MINUTE: 1000 * 60,
    HOUR: 1000 * 60 * 60,
    DAY: 1000 * 60 * 60 * 24,
    log: typeof (_base = console.log).bind === "function" ? _base.bind(console) : void 0,
    engine: /WebKit|Presto|Gecko/.exec(navigator.userAgent)[0].toLowerCase(),
    ready: function(fc) {
      var cb;
      if (/interactive|complete/.test(d.readyState)) {
        return setTimeout(fc);
      }
      cb = function() {
        $.off(d, 'DOMContentLoaded', cb);
        return fc();
      };
      return $.on(d, 'DOMContentLoaded', cb);
    },
    sync: function(key, cb) {
      key = Main.namespace + key;
      return $.on(window, 'storage', function(e) {
        if (e.key === key) {
          return cb(JSON.parse(e.newValue));
        }
      });
    },
    id: function(id) {
      return d.getElementById(id);
    },
    formData: function(arg) {
      var fd, key, val;
      if (arg instanceof HTMLFormElement) {
        fd = new FormData(arg);
      } else {
        fd = new FormData();
        for (key in arg) {
          val = arg[key];
          if (val) {
            fd.append(key, val);
          }
        }
      }
      return fd;
    },
    ajax: function(url, callbacks, opts) {
      var form, headers, key, r, type, upCallbacks, val;
      if (opts == null) {
        opts = {};
      }
      type = opts.type, headers = opts.headers, upCallbacks = opts.upCallbacks, form = opts.form;
      r = new XMLHttpRequest();
      type || (type = form && 'post' || 'get');
      r.open(type, url, true);
      for (key in headers) {
        val = headers[key];
        r.setRequestHeader(key, val);
      }
      $.extend(r, callbacks);
      $.extend(r.upload, upCallbacks);
      if (type === 'post') {
        r.withCredentials = true;
      }
      r.send(form);
      return r;
    },
    cache: function(url, cb) {
      var req;
      if (req = $.cache.requests[url]) {
        if (req.readyState === 4) {
          return cb.call(req);
        } else {
          return req.callbacks.push(cb);
        }
      } else {
        req = $.ajax(url, {
          onload: function() {
            var _i, _len, _ref, _results;
            _ref = this.callbacks;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              cb = _ref[_i];
              _results.push(cb.call(this));
            }
            return _results;
          },
          onabort: function() {
            return delete $.cache.requests[url];
          },
          onerror: function() {
            return delete $.cache.requests[url];
          }
        });
        req.callbacks = [cb];
        return $.cache.requests[url] = req;
      }
    },
    cb: {
      checked: function() {
        $.set(this.name, this.checked);
        return Conf[this.name] = this.checked;
      },
      value: function() {
        $.set(this.name, this.value.trim());
        return Conf[this.name] = this.value;
      }
    },
    addStyle: function(css) {
      var f, style;
      style = $.el('style', {
        textContent: css
      });
      f = function() {
        var root;
        if (root = d.head || d.documentElement) {
          return $.add(root, style);
        } else {
          return setTimeout(f, 20);
        }
      };
      f();
      return style;
    },
    x: function(path, root) {
      if (root == null) {
        root = d.body;
      }
      return d.evaluate(path, root, null, 8, null).singleNodeValue;
    },
    addClass: function(el, className) {
      return el.classList.add(className);
    },
    rmClass: function(el, className) {
      return el.classList.remove(className);
    },
    rm: function(el) {
      return el.parentNode.removeChild(el);
    },
    tn: function(s) {
      return d.createTextNode(s);
    },
    nodes: function(nodes) {
      var frag, node, _i, _len;
      if (!(nodes instanceof Array)) {
        return nodes;
      }
      frag = d.createDocumentFragment();
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        frag.appendChild(node);
      }
      return frag;
    },
    add: function(parent, children) {
      return parent.appendChild($.nodes(children));
    },
    prepend: function(parent, children) {
      return parent.insertBefore($.nodes(children), parent.firstChild);
    },
    after: function(root, el) {
      return root.parentNode.insertBefore($.nodes(el), root.nextSibling);
    },
    before: function(root, el) {
      return root.parentNode.insertBefore($.nodes(el), root);
    },
    replace: function(root, el) {
      return root.parentNode.replaceChild($.nodes(el), root);
    },
    el: function(tag, properties) {
      var el;
      el = d.createElement(tag);
      if (properties) {
        $.extend(el, properties);
      }
      return el;
    },
    on: function(el, events, handler) {
      var event, _i, _len, _ref;
      _ref = events.split(' ');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        el.addEventListener(event, handler, false);
      }
    },
    off: function(el, events, handler) {
      var event, _i, _len, _ref;
      _ref = events.split(' ');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        el.removeEventListener(event, handler, false);
      }
    },
    open: function(url) {
      return (GM_openInTab || window.open)(location.protocol + url, '_blank');
    },
    event: function(event, detail, root) {
      if (root == null) {
        root = d;
      }
      if ((detail != null) && typeof cloneInto === 'function') {
        detail = cloneInto(detail, document.defaultView);
      }
      return root.dispatchEvent(new CustomEvent(event, {
        bubbles: true,
        detail: detail
      }));
    },
    globalEval: function(code) {
      var script;
      script = $.el('script', {
        textContent: code
      });
      $.add(d.head, script);
      return $.rm(script);
    },
    bytesToString: function(size) {
      var unit;
      unit = 0;
      while (size >= 1024) {
        size /= 1024;
        unit++;
      }
      size = unit > 1 ? Math.round(size * 100) / 100 : Math.round(size);
      return "" + size + " " + ['B', 'KB', 'MB', 'GB'][unit];
    },
    debounce: function(wait, fn) {
      var timeout;
      timeout = null;
      return function() {
        if (timeout) {
          clearTimeout(timeout);
        } else {
          fn.apply(this, arguments);
        }
        return timeout = setTimeout((function() {
          return timeout = null;
        }), wait);
      };
    }
  });

  $.cache.requests = {};

  $.extend($, typeof GM_deleteValue !== "undefined" && GM_deleteValue !== null ? {
    "delete": function(name) {
      name = Main.namespace + name;
      return GM_deleteValue(name);
    },
    get: function(name, defaultValue) {
      var value;
      name = Main.namespace + name;
      if (value = GM_getValue(name)) {
        return JSON.parse(value);
      } else {
        return defaultValue;
      }
    },
    set: function(name, value) {
      name = Main.namespace + name;
      localStorage.setItem(name, JSON.stringify(value));
      return GM_setValue(name, JSON.stringify(value));
    }
  } : {
    "delete": function(name) {
      return localStorage.removeItem(Main.namespace + name);
    },
    get: function(name, defaultValue) {
      var value;
      if (value = localStorage.getItem(Main.namespace + name)) {
        return JSON.parse(value);
      } else {
        return defaultValue;
      }
    },
    set: function(name, value) {
      return localStorage.setItem(Main.namespace + name, JSON.stringify(value));
    }
  });

  $$ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  };

  Filter = {
    filters: {},
    init: function() {
      var boards, err, filter, hl, key, op, regexp, stub, top, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4;
      for (key in Config.filter) {
        this.filters[key] = [];
        _ref = Conf[key].split('\n');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          filter = _ref[_i];
          if (filter[0] === '#') {
            continue;
          }
          if (!(regexp = filter.match(/\/(.+)\/(\w*)/))) {
            continue;
          }
          filter = filter.replace(regexp[0], '');
          boards = ((_ref1 = filter.match(/boards:([^;]+)/)) != null ? _ref1[1].toLowerCase() : void 0) || 'global';
          if (boards !== 'global' && boards.split(',').indexOf(g.BOARD) === -1) {
            continue;
          }
          if (key === 'md5') {
            regexp = regexp[1];
          } else {
            try {
              regexp = RegExp(regexp[1], regexp[2]);
            } catch (_error) {
              err = _error;
              alert(err.message);
              continue;
            }
          }
          op = ((_ref2 = filter.match(/[^t]op:(yes|no|only)/)) != null ? _ref2[1] : void 0) || 'no';
          stub = (function() {
            var _ref3;
            switch ((_ref3 = filter.match(/stub:(yes|no)/)) != null ? _ref3[1] : void 0) {
              case 'yes':
                return true;
              case 'no':
                return false;
              default:
                return Conf['Show Stubs'];
            }
          })();
          if (hl = /highlight/.test(filter)) {
            hl = ((_ref3 = filter.match(/highlight:(\w+)/)) != null ? _ref3[1] : void 0) || 'filter_highlight';
            top = ((_ref4 = filter.match(/top:(yes|no)/)) != null ? _ref4[1] : void 0) || 'yes';
            top = top === 'yes';
          }
          this.filters[key].push(this.createFilter(regexp, op, stub, hl, top));
        }
        if (!this.filters[key].length) {
          delete this.filters[key];
        }
      }
      if (Object.keys(this.filters).length) {
        return Main.callbacks.push(this.node);
      }
    },
    createFilter: function(regexp, op, stub, hl, top) {
      var settings, test;
      test = typeof regexp === 'string' ? function(value) {
        return regexp === value;
      } : function(value) {
        return regexp.test(value);
      };
      settings = {
        hide: !hl,
        stub: stub,
        "class": hl,
        top: top
      };
      return function(value, isOP) {
        if (isOP && op === 'no' || !isOP && op === 'only') {
          return false;
        }
        if (!test(value)) {
          return false;
        }
        return settings;
      };
    },
    node: function(post) {
      var filter, firstThread, isOP, key, result, root, thisThread, value, _i, _len, _ref;
      if (post.isInlined) {
        return;
      }
      isOP = post.ID === post.threadID;
      root = post.root;
      for (key in Filter.filters) {
        value = Filter[key](post);
        if (value === false) {
          continue;
        }
        _ref = Filter.filters[key];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          filter = _ref[_i];
          if (!(result = filter(value, isOP))) {
            continue;
          }
          if (result.hide) {
            if (isOP) {
              if (!g.REPLY) {
                ThreadHiding.hide(root.parentNode, result.stub);
              } else {
                continue;
              }
            } else {
              ReplyHiding.hide(root, result.stub);
            }
            return;
          }
          $.addClass(root, result["class"]);
          if (isOP && result.top && !g.REPLY) {
            thisThread = root.parentNode;
            if (firstThread = $('div[class="postContainer opContainer"]')) {
              if (firstThread !== root) {
                $.before(firstThread.parentNode, [thisThread, thisThread.nextElementSibling]);
              }
            }
          }
        }
      }
    },
    name: function(post) {
      return $('.name', post.el).textContent;
    },
    pass: function(post) {
      var since4pass;
      if (since4pass = $('.n-pu', post.el)) {
        return since4pass.title;
      }
      return false;
    },
    uniqueid: function(post) {
      var uid;
      if (uid = $('.posteruid', post.el)) {
        return uid.firstElementChild.textContent;
      }
      return false;
    },
    tripcode: function(post) {
      var trip;
      if (trip = $('.postertrip', post.el)) {
        return trip.textContent;
      }
      return false;
    },
    mod: function(post) {
      var mod;
      if (mod = $('.capcode.hand', post.el)) {
        return mod.textContent.replace('## ', '');
      }
      return false;
    },
    subject: function(post) {
      var subject;
      if (subject = $('.postInfo .subject', post.el)) {
        return subject.textContent;
      }
      return false;
    },
    comment: function(post) {
      var data, i, nodes, text, _i, _ref;
      text = [];
      nodes = d.evaluate('.//br|.//text()', post.blockquote, null, 7, null);
      for (i = _i = 0, _ref = nodes.snapshotLength; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        text.push((data = nodes.snapshotItem(i).data) ? data : '\n');
      }
      return text.join('');
    },
    country: function(post) {
      var flag;
      if (flag = $('.flag', post.el)) {
        return flag.title;
      }
      return false;
    },
    filename: function(post) {
      var fileInfo, nameNode, fname;
      if (post.fileInfo && (nameNode = $('a', post.fileInfo)) && (fname = nameNode.title || post.fileInfo.title || nameNode.textContent)) {
        return fname;
      }
      return false;
    },
    dimensions: function(post) {
      var fileInfo, match;
      fileInfo = post.fileInfo;
      if (fileInfo && (match = fileInfo.lastChild.textContent.match(/\d+x\d+/))) {
        return match[0];
      }
      return false;
    },
    filesize: function(post) {
      var img;
      img = post.img;
      if (img) {
        return img.alt;
      }
      return false;
    },
    md5: function(post) {
      var img;
      img = post.img;
      if (img) {
        return img.dataset.md5;
      }
      return false;
    },
    menuInit: function() {
      var div, entry, type, _i, _len, _ref;
      div = $.el('div', {
        textContent: 'Filter'
      });
      entry = {
        el: div,
        open: function() {
          return true;
        },
        children: []
      };
      _ref = [['Name', 'name'], ['Pass user', 'pass'], ['Unique ID', 'uniqueid'], ['Tripcode', 'tripcode'], ['Admin/Mod', 'mod'], ['Subject', 'subject'], ['Comment', 'comment'], ['Country', 'country'], ['Filename', 'filename'], ['Image dimensions', 'dimensions'], ['Filesize', 'filesize'], ['Image MD5', 'md5']];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        entry.children.push(Filter.createSubEntry(type[0], type[1]));
      }
      return Menu.addEntry(entry);
    },
    createSubEntry: function(text, type) {
      var el, onclick, open;
      el = $.el('a', {
        href: 'javascript:;',
        textContent: text
      });
      onclick = null;
      open = function(post) {
        var value;
        value = Filter[type](post);
        if (value === false) {
          return false;
        }
        $.off(el, 'click', onclick);
        onclick = function() {
          var re, save, select, ta, tl;
          re = type === 'md5' ? value : value.replace(/\/|\\|\^|\$|\n|\.|\(|\)|\{|\}|\[|\]|\?|\*|\+|\|/g, function(c) {
            if (c === '\n') {
              return '\\n';
            } else if (c === '\\') {
              return '\\\\';
            } else {
              return "\\" + c;
            }
          });
          re = type === 'md5' ? "/" + value + "/" : "/^" + re + "$/";
          if (/\bop\b/.test(post["class"])) {
            re += ';op:yes';
          }
          save = (save = $.get(type, '')) ? "" + save + "\n" + re : re;
          $.set(type, save);
          Options.dialog();
          select = $('select[name=filter]', $.id('options'));
          select.value = type;
          select.dispatchEvent(new Event('change'));
          $.id('filter_tab').checked = true;
          ta = select.nextElementSibling;
          tl = ta.textLength;
          ta.setSelectionRange(tl, tl);
          return ta.focus();
        };
        $.on(el, 'click', onclick);
        return true;
      };
      return {
        el: el,
        open: open
      };
    }
  };

  StrikethroughQuotes = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var el, quote, show_stub, _i, _len, _ref;
      if (post.isInlined) {
        return;
      }
      _ref = post.quotes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        if (!((el = $.id(quote.hash.slice(1))) && (quote.hostname === 'boards.4chan.org' || quote.hostname === 'boards.4channel.org') && !/catalog$/.test(quote.pathname) && el.hidden)) {
          continue;
        }
        $.addClass(quote, 'filtered');
        if (Conf['Recursive Filtering'] && post.ID !== post.threadID) {
          show_stub = !!$.x('preceding-sibling::div[contains(@class,"stub")]', el);
          ReplyHiding.hide(post.root, show_stub);
        }
      }
    }
  };

  ExpandComment = {
    init: function() {
      var a, _i, _len, _ref;
      _ref = $$('.abbr');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        $.on(a.firstElementChild, 'click', ExpandComment.expand);
        if (Conf['Comment Auto-Expansion']) {
          a.firstElementChild.click();
        }
      }
    },
    expand: function(e) {
      var a, replyID, threadID, _, _ref;
      e.preventDefault();
      _ref = this.href.match(/(\d+)#p(\d+)/), _ = _ref[0], threadID = _ref[1], replyID = _ref[2];
      this.textContent = "Loading No." + replyID + "...";
      a = this;
      return $.cache("//a.4cdn.org" + this.pathname + ".json", function() {
        return ExpandComment.parse(this, a, threadID, replyID);
      });
    },
    parse: function(req, a, threadID, replyID) {
      var bq, clone, href, post, posts, quote, quotes, spoilerRange, _i, _j, _len, _len1;
      if (req.status !== 200) {
        a.textContent = "" + req.status + " " + req.statusText;
        return;
      }
      posts = JSON.parse(req.response).posts;
      if (spoilerRange = posts[0].custom_spoiler) {
        Build.spoilerRange[g.BOARD] = spoilerRange;
      }
      replyID = +replyID;
      for (_i = 0, _len = posts.length; _i < _len; _i++) {
        post = posts[_i];
        if (post.no === replyID) {
          break;
        }
      }
      if (post.no !== replyID) {
        a.textContent = 'No.#{replyID} not found.';
        return;
      }
      bq = $.id("m" + replyID);
      clone = bq.cloneNode(false);
      clone.innerHTML = post.com;
      quotes = clone.getElementsByClassName('quotelink');
      for (_j = 0, _len1 = quotes.length; _j < _len1; _j++) {
        quote = quotes[_j];
        href = quote.getAttribute('href');
        if (href[0] === '/') {
          continue;
        }
        quote.href = "thread/" + href;
      }
      post = {
        blockquote: clone,
        threadID: threadID,
        quotes: quotes,
        backlinks: []
      };
      if (Conf['Resurrect Quotes']) {
        Quotify.node(post);
      }
      if (Conf['Quote Preview']) {
        QuotePreview.node(post);
      }
      if (Conf['Quote Inline']) {
        QuoteInline.node(post);
      }
      if (Conf['Indicate OP quote']) {
        QuoteOP.node(post);
      }
      if (Conf['Indicate You quote']) {
        QuoteYou.node(post);
      }
      if (Conf['Indicate Cross-thread Quotes']) {
        QuoteCT.node(post);
      }
      $.replace(bq, clone);
      return Main.prettify(clone);
    }
  };

  ExpandThread = {
    init: function() {
      var a, span, _i, _len, _ref, _results;
      _ref = $$('.summary');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        span = _ref[_i];
        a = $.el('a', {
          textContent: "+ " + span.textContent,
          className: 'summary desktop',
          href: 'javascript:;'
        });
        $.on(a, 'click', function() {
          return ExpandThread.toggle(this.parentNode);
        });
        _results.push($.replace(span, a));
      }
      return _results;
    },
    toggle: function(thread) {
      var a, num, replies, reply, url, _i, _len;
      url = "//a.4cdn.org/" + g.BOARD + "/thread/" + thread.id.slice(1) + ".json";
      a = $('.summary', thread);
      switch (a.textContent[0]) {
        case '+':
          a.textContent = a.textContent.replace('+', '× Loading...');
          $.cache(url, function() {
            return ExpandThread.parse(this, thread, a);
          });
          break;
        case '×':
          a.textContent = a.textContent.replace('× Loading...', '+');
          $.cache.requests[url].abort();
          break;
        case '-':
          a.textContent = a.textContent.replace('-', '+');
          num = (function() {
            switch (g.BOARD) {
              case 'b':
              case 'vg':
                return 3;
              case 't':
                return 1;
              default:
                return 5;
            }
          })();
          replies = $$('.replyContainer', thread);
          replies.splice(replies.length - num, num);
          for (_i = 0, _len = replies.length; _i < _len; _i++) {
            reply = replies[_i];
            $.rm(reply);
          }
      }
    },
    parse: function(req, thread, a) {
      var backlink, id, link, nodes, post, posts, replies, reply, spoilerRange, threadID, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      if (req.status !== 200) {
        a.textContent = "" + req.status + " " + req.statusText;
        $.off(a, 'click', ExpandThread.cb.toggle);
        return;
      }
      a.textContent = a.textContent.replace('× Loading...', '-');
      posts = JSON.parse(req.response).posts;
      if (spoilerRange = posts[0].custom_spoiler) {
        Build.spoilerRange[g.BOARD] = spoilerRange;
      }
      replies = posts.slice(1);
      threadID = thread.id.slice(1);
      nodes = [];
      for (_i = 0, _len = replies.length; _i < _len; _i++) {
        reply = replies[_i];
        post = Build.postFromObject(reply, g.BOARD);
        id = reply.no;
        link = $('a[title="Link to this post"]', post);
        link.href = "thread/" + threadID + "#p" + id;
        link.nextSibling.href = "thread/" + threadID + "#q" + id;
        nodes.push(post);
      }
      _ref = $$('.summary ~ .replyContainer', a.parentNode);
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        post = _ref[_j];
        $.rm(post);
      }
      _ref1 = $$('.backlink', a.previousElementSibling);
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        backlink = _ref1[_k];
        if (!$.id(backlink.hash.slice(1))) {
          $.rm(backlink);
        }
      }
      return $.after(a, nodes);
    }
  };

  ThreadHiding = {
    init: function() {
      var a, hiddenThreads, thread, _i, _len, _ref;
      hiddenThreads = ThreadHiding.sync();
      if (g.CATALOG) {
        return;
      }
      _ref = $$('.thread');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        thread = _ref[_i];
        a = $.el('a', {
          className: 'hide_thread_button',
          innerHTML: '<span>[ - ]</span>',
          href: 'javascript:;'
        });
        $.on(a, 'click', ThreadHiding.cb);
        $.prepend(thread, a);
        if (thread.id.slice(1) in hiddenThreads) {
          ThreadHiding.hide(thread);
        }
      }
    },
    sync: function() {
      var hiddenThreads, hiddenThreadsCatalog, id;
      hiddenThreads = $.get("hiddenThreads/" + g.BOARD + "/", {});
      hiddenThreadsCatalog = JSON.parse(localStorage.getItem("4chan-hide-t-" + g.BOARD)) || {};
      if (g.CATALOG) {
        for (id in hiddenThreads) {
          hiddenThreadsCatalog[id] = true;
        }
        localStorage.setItem("4chan-hide-t-" + g.BOARD, JSON.stringify(hiddenThreadsCatalog));
      } else {
        for (id in hiddenThreadsCatalog) {
          if (!(id in hiddenThreads)) {
            hiddenThreads[id] = Date.now();
          }
        }
        $.set("hiddenThreads/" + g.BOARD + "/", hiddenThreads);
      }
      return hiddenThreads;
    },
    cb: function() {
      return ThreadHiding.toggle($.x('ancestor::div[parent::div[@class="board"]]', this));
    },
    toggle: function(thread) {
      var hiddenThreads, id;
      hiddenThreads = $.get("hiddenThreads/" + g.BOARD + "/", {});
      id = thread.id.slice(1);
      if (thread.hidden || /\bhidden_thread\b/.test(thread.firstChild.className)) {
        ThreadHiding.show(thread);
        delete hiddenThreads[id];
      } else {
        ThreadHiding.hide(thread);
        hiddenThreads[id] = Date.now();
      }
      return $.set("hiddenThreads/" + g.BOARD + "/", hiddenThreads);
    },
    hide: function(thread, show_stub) {
      var a, menuButton, num, opInfo, span, stub, text;
      if (show_stub == null) {
        show_stub = Conf['Show Stubs'];
      }
      if (!show_stub) {
        thread.hidden = true;
        thread.nextElementSibling.hidden = true;
        return;
      }
      if (/\bhidden_thread\b/.test(thread.firstChild.className)) {
        return;
      }
      num = 0;
      if (span = $('.summary', thread)) {
        num = Number(span.textContent.match(/\d+/));
      }
      num += $$('.opContainer ~ .replyContainer', thread).length;
      text = num === 1 ? '1 reply' : "" + num + " replies";
      opInfo = $('.desktop > .nameBlock', thread).textContent;
      stub = $.el('div', {
        className: 'hide_thread_button hidden_thread',
        innerHTML: '<a href="javascript:;"><span>[ + ]</span> </a>'
      });
      a = stub.firstChild;
      $.on(a, 'click', ThreadHiding.cb);
      $.add(a, $.tn("" + opInfo + " (" + text + ")"));
      if (Conf['Menu']) {
        menuButton = Menu.a.cloneNode(true);
        $.on(menuButton, 'click', Menu.toggle);
        $.add(stub, [$.tn(' '), menuButton]);
      }
      return $.prepend(thread, stub);
    },
    show: function(thread) {
      var stub;
      if (stub = $('.hidden_thread', thread)) {
        $.rm(stub);
      }
      thread.hidden = false;
      return thread.nextElementSibling.hidden = false;
    }
  };

  ReplyHiding = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var side;
      if (post.isInlined || post.ID === post.threadID) {
        return;
      }
      side = $('.sideArrows', post.root);
      $.addClass(side, 'hide_reply_button');
      side.innerHTML = '<a href="javascript:;"><span>[ - ]</span></a>';
      $.on(side.firstChild, 'click', ReplyHiding.toggle);
      if (post.ID in g.hiddenReplies) {
        return ReplyHiding.hide(post.root);
      }
    },
    toggle: function() {
      var button, id, quote, quotes, root, _i, _j, _len, _len1;
      button = this.parentNode;
      root = button.parentNode;
      id = root.id.slice(2);
      quotes = $$(".quotelink[href$='#p" + id + "'], .backlink[href$='#p" + id + "']");
      if (/\bstub\b/.test(button.className)) {
        ReplyHiding.show(root);
        for (_i = 0, _len = quotes.length; _i < _len; _i++) {
          quote = quotes[_i];
          $.rmClass(quote, 'filtered');
        }
        delete g.hiddenReplies[id];
      } else {
        ReplyHiding.hide(root);
        for (_j = 0, _len1 = quotes.length; _j < _len1; _j++) {
          quote = quotes[_j];
          $.addClass(quote, 'filtered');
        }
        g.hiddenReplies[id] = Date.now();
      }
      return $.set("hiddenReplies/" + g.BOARD + "/", g.hiddenReplies);
    },
    hide: function(root, show_stub) {
      var a, el, menuButton, side, stub;
      if (show_stub == null) {
        show_stub = Conf['Show Stubs'];
      }
      side = $('.sideArrows', root);
      if (side.hidden) {
        return;
      }
      side.hidden = true;
      el = side.nextElementSibling;
      el.hidden = true;
      if (!show_stub) {
        return;
      }
      stub = $.el('div', {
        className: 'hide_reply_button stub',
        innerHTML: '<a href="javascript:;"><span>[ + ]</span> </a>'
      });
      a = stub.firstChild;
      $.on(a, 'click', ReplyHiding.toggle);
      $.add(a, $.tn(Conf['Anonymize'] ? 'Anonymous' : $('.desktop > .nameBlock', el).textContent));
      if (Conf['Menu']) {
        menuButton = Menu.a.cloneNode(true);
        $.on(menuButton, 'click', Menu.toggle);
        $.add(stub, [$.tn(' '), menuButton]);
      }
      return $.prepend(root, stub);
    },
    show: function(root) {
      var stub;
      if (stub = $('.stub', root)) {
        $.rm(stub);
      }
      $('.sideArrows', root).hidden = false;
      return $('.post', root).hidden = false;
    }
  };

  Menu = {
    entries: [],
    init: function() {
      this.a = $.el('a', {
        className: 'menu_button',
        href: 'javascript:;',
        innerHTML: '[<span></span>]'
      });
      this.el = $.el('div', {
        className: 'reply dialog',
        id: 'menu',
        tabIndex: 0
      });
      $.on(this.el, 'click', function(e) {
        return e.stopPropagation();
      });
      $.on(this.el, 'keydown', this.keybinds);
      $.on(d, 'AddMenuEntry', function(e) {
        return Menu.addEntry(e.detail);
      });
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var a;
      if (post.isInlined && !post.isCrosspost) {
        a = $('.menu_button', post.el);
      } else {
        a = Menu.a.cloneNode(true);
        $.add($('.postInfo', post.el), [$.tn('\u00A0'), a]);
      }
      return $.on(a, 'click', Menu.toggle);
    },
    toggle: function(e) {
      var lastOpener, post;
      e.preventDefault();
      e.stopPropagation();
      if (Menu.el.parentNode) {
        lastOpener = Menu.lastOpener;
        Menu.close();
        if (lastOpener === this) {
          return;
        }
      }
      Menu.lastOpener = this;
      post = /\bhidden_thread\b/.test(this.parentNode.className) ? $.x('ancestor::div[parent::div[@class="board"]]/child::div[contains(@class,"opContainer")]', this) : $.x('ancestor::div[contains(@class,"postContainer")][1]', this);
      return Menu.open(this, Main.preParse(post));
    },
    open: function(button, post) {
      var bLeft, bRect, bTop, el, entry, funk, mRect, _i, _len, _ref;
      el = Menu.el;
      el.setAttribute('data-id', post.ID);
      el.setAttribute('data-rootid', post.root.id);
      funk = function(entry, parent) {
        var child, children, subMenu, _i, _len;
        children = entry.children;
        if (!entry.open(post)) {
          return;
        }
        $.add(parent, entry.el);
        if (!children) {
          return;
        }
        if (subMenu = $('.subMenu', entry.el)) {
          $.rm(subMenu);
        }
        subMenu = $.el('div', {
          className: 'reply dialog subMenu'
        });
        $.add(entry.el, subMenu);
        for (_i = 0, _len = children.length; _i < _len; _i++) {
          child = children[_i];
          funk(child, subMenu);
        }
      };
      _ref = Menu.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        funk(entry, el);
      }
      Menu.focus($('.entry', Menu.el));
      $.on(d, 'click', Menu.close);
      $.add(d.body, el);
      mRect = el.getBoundingClientRect();
      bRect = button.getBoundingClientRect();
      bTop = d.documentElement.scrollTop + d.body.scrollTop + bRect.top;
      bLeft = d.documentElement.scrollLeft + d.body.scrollLeft + bRect.left;
      el.style.top = bRect.top + bRect.height + mRect.height < d.documentElement.clientHeight ? bTop + bRect.height + 2 + 'px' : bTop - mRect.height - 2 + 'px';
      el.style.left = bRect.left + mRect.width < d.documentElement.clientWidth ? bLeft + 'px' : bLeft + bRect.width - mRect.width + 'px';
      return el.focus();
    },
    close: function() {
      var el, focused, _i, _len, _ref;
      el = Menu.el;
      $.rm(el);
      _ref = $$('.focused.entry', el);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        focused = _ref[_i];
        $.rmClass(focused, 'focused');
      }
      el.innerHTML = null;
      el.removeAttribute('style');
      delete Menu.lastOpener;
      delete Menu.focusedEntry;
      return $.off(d, 'click', Menu.close);
    },
    keybinds: function(e) {
      var el, next, subMenu;
      el = Menu.focusedEntry;
      switch (Keybinds.keyCode(e) || e.keyCode) {
        case 'Esc':
          Menu.lastOpener.focus();
          Menu.close();
          break;
        case 13:
        case 32:
          el.click();
          break;
        case 'Up':
          if (next = el.previousElementSibling) {
            Menu.focus(next);
          }
          break;
        case 'Down':
          if (next = el.nextElementSibling) {
            Menu.focus(next);
          }
          break;
        case 'Right':
          if ((subMenu = $('.subMenu', el)) && (next = subMenu.firstElementChild)) {
            Menu.focus(next);
          }
          break;
        case 'Left':
          if (next = $.x('parent::*[contains(@class,"subMenu")]/parent::*', el)) {
            Menu.focus(next);
          }
          break;
        default:
          return;
      }
      e.preventDefault();
      return e.stopPropagation();
    },
    focus: function(el) {
      var focused, _i, _len, _ref;
      if (focused = $.x('parent::*/child::*[contains(@class,"focused")]', el)) {
        $.rmClass(focused, 'focused');
      }
      _ref = $$('.focused', el);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        focused = _ref[_i];
        $.rmClass(focused, 'focused');
      }
      Menu.focusedEntry = el;
      return $.addClass(el, 'focused');
    },
    addEntry: function(entry) {
      var funk;
      funk = function(entry) {
        var child, children, el, _i, _len;
        el = entry.el, children = entry.children;
        $.addClass(el, 'entry');
        $.on(el, 'focus mouseover', function(e) {
          e.stopPropagation();
          return Menu.focus(this);
        });
        if (!children) {
          return;
        }
        $.addClass(el, 'hasSubMenu');
        for (_i = 0, _len = children.length; _i < _len; _i++) {
          child = children[_i];
          funk(child);
        }
      };
      funk(entry);
      return Menu.entries.push(entry);
    }
  };

  Keybinds = {
    init: function() {
      var node, _i, _len, _ref;
      _ref = $$('[accesskey]');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        node.removeAttribute('accesskey');
      }
      return $.on(d, 'keydown', Keybinds.keydown);
    },
    keydown: function(e) {
      var form, key, o, target, thread;
      if (!(key = Keybinds.keyCode(e))) {
        return;
      }
      target = e.target;
      if (/TEXTAREA|INPUT/.test(target.nodeName)) {
        if (!((key === 'Esc') || (/\+/.test(key)))) {
          return;
        }
      }
      thread = Nav.getThread();
      switch (key) {
        case Conf.openQR:
          Keybinds.qr(thread, true);
          break;
        case Conf.openEmptyQR:
          Keybinds.qr(thread);
          break;
        case Conf.openOptions:
          if (!$.id('overlay')) {
            Options.dialog();
          }
          break;
        case Conf.close:
          if (o = $.id('overlay')) {
            Options.close.call(o);
          } else if (QR.el) {
            QR.close();
          }
          break;
        case Conf.submit:
          if (QR.el && !QR.status()) {
            QR.submit();
          }
          break;
        case Conf.spoiler:
          if (target.nodeName !== 'TEXTAREA') {
            return;
          }
          Keybinds.tags('spoiler', target);
          break;
        case Conf.code:
          if (target.nodeName !== 'TEXTAREA') {
            return;
          }
          Keybinds.tags('code', target);
          break;
        case Conf.sjis﻿:
          if (target.nodeName !== 'TEXTAREA') {
            return;
          }
          Keybinds.tags('sjis﻿', target);
          $.addClass(QR.el, 'sjis-preview');
          break;
        case Conf.sageru:
          $("[name=email]", QR.el).value = "sage";
          QR.selected.email = "sage";
          break;
        case Conf.watch:
          Watcher.toggle(thread);
          break;
        case Conf.update:
          Updater.update();
          break;
        case Conf.unreadCountTo0:
          Unread.replies = [];
          Unread.update(true);
          break;
        case Conf.expandImage:
          Keybinds.img(thread);
          break;
        case Conf.expandAllImages:
          Keybinds.img(thread, true);
          break;
        case Conf.zero:
          window.location = "/" + g.BOARD + "/0#delform";
          break;
        case Conf.nextPage:
          if (form = $('.next form')) {
            window.location = form.action;
          }
          break;
        case Conf.previousPage:
          if (form = $('.prev form')) {
            window.location = form.action;
          }
          break;
        case Conf.nextThread:
          if (g.REPLY) {
            return;
          }
          Nav.scroll(+1);
          break;
        case Conf.previousThread:
          if (g.REPLY) {
            return;
          }
          Nav.scroll(-1);
          break;
        case Conf.expandThread:
          ExpandThread.toggle(thread);
          break;
        case Conf.openThread:
          Keybinds.open(thread);
          break;
        case Conf.openThreadTab:
          Keybinds.open(thread, true);
          break;
        case Conf.nextReply:
          Keybinds.hl(+1, thread);
          break;
        case Conf.previousReply:
          Keybinds.hl(-1, thread);
          break;
        case Conf.hide:
          if (/\bthread\b/.test(thread.className)) {
            ThreadHiding.toggle(thread);
          }
          break;
        default:
          return;
      }
      return e.preventDefault();
    },
    keyCode: function(e) {
      var c, kc, key;
      key = (function() {
        switch (kc = e.keyCode) {
          case 8:
            return '';
          case 13:
            return 'Enter';
          case 27:
            return 'Esc';
          case 37:
            return 'Left';
          case 38:
            return 'Up';
          case 39:
            return 'Right';
          case 40:
            return 'Down';
          case 48:
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57:
          case 65:
          case 66:
          case 67:
          case 68:
          case 69:
          case 70:
          case 71:
          case 72:
          case 73:
          case 74:
          case 75:
          case 76:
          case 77:
          case 78:
          case 79:
          case 80:
          case 81:
          case 82:
          case 83:
          case 84:
          case 85:
          case 86:
          case 87:
          case 88:
          case 89:
          case 90:
            c = String.fromCharCode(kc);
            if (e.shiftKey) {
              return c;
            } else {
              return c.toLowerCase();
            }
            break;
          default:
            return null;
        }
      })();
      if (key) {
        if (e.altKey) {
          key = 'alt+' + key;
        }
        if (e.ctrlKey) {
          key = 'ctrl+' + key;
        }
        if (e.metaKey) {
          key = 'meta+' + key;
        }
      }
      return key;
    },
    tags: function(tag, ta) {
      var range, selEnd, selStart, value;
      value = ta.value;
      selStart = ta.selectionStart;
      selEnd = ta.selectionEnd;
      ta.value = value.slice(0, selStart) + ("[" + tag + "]") + value.slice(selStart, selEnd) + ("[/" + tag + "]") + value.slice(selEnd);
      range = ("[" + tag + "]").length + selEnd;
      ta.setSelectionRange(range, range);
      return ta.dispatchEvent(new Event('input'));
    },
    img: function(thread, all) {
      var thumb;
      if (all) {
        return $.id('imageExpand').click();
      } else {
        thumb = $('img[data-md5]', $('.post.highlight', thread) || thread);
        return ImageExpand.toggle(thumb.parentNode);
      }
    },
    qr: function(thread, quote) {
      if (quote) {
        QR.quote.call($('a[title="Reply to this post"]', $('.post.highlight', thread) || thread));
      } else {
        QR.open();
      }
      return $('textarea', QR.el).focus();
    },
    open: function(thread, tab) {
      var id, url;
      if (g.REPLY) {
        return;
      }
      id = thread.id.slice(1);
      url = "//boards.4chan.org/" + g.BOARD + "/thread/" + id;
      if (tab) {
        return $.open(url);
      } else {
        return location.href = url;
      }
    },
    hl: function(delta, thread) {
      var next, post, rect, replies, reply, _i, _len;
      if (post = $('.reply.highlight', thread)) {
        $.rmClass(post, 'highlight');
        post.removeAttribute('tabindex');
        rect = post.getBoundingClientRect();
        if (rect.bottom >= 0 && rect.top <= d.documentElement.clientHeight) {
          next = $.x('child::div[contains(@class,"post reply")]', delta === +1 ? post.parentNode.nextElementSibling : post.parentNode.previousElementSibling);
          if (!next) {
            this.focus(post);
            return;
          }
          if (!(g.REPLY || $.x('ancestor::div[parent::div[@class="board"]]', next) === thread)) {
            return;
          }
          rect = next.getBoundingClientRect();
          if (rect.top < 0 || rect.bottom > d.documentElement.clientHeight) {
            next.scrollIntoView(delta === -1);
          }
          this.focus(next);
          return;
        }
      }
      replies = $$('.reply', thread);
      if (delta === -1) {
        replies.reverse();
      }
      for (_i = 0, _len = replies.length; _i < _len; _i++) {
        reply = replies[_i];
        rect = reply.getBoundingClientRect();
        if (delta === +1 && rect.top >= 0 || delta === -1 && rect.bottom <= d.documentElement.clientHeight) {
          this.focus(reply);
          return;
        }
      }
    },
    focus: function(post) {
      $.addClass(post, 'highlight');
      post.tabIndex = 0;
      return post.focus();
    }
  };

  Nav = {
    init: function() {
      var next, prev, span;
      span = $.el('span', {
        id: 'navlinks'
      });
      prev = $.el('a', {
        textContent: '▲',
        href: 'javascript:;'
      });
      next = $.el('a', {
        textContent: '▼',
        href: 'javascript:;'
      });
      openQR = $.el('a', {
        textContent: 'QR',
        href: 'javascript:;'
      });
      $.on(prev, 'click', this.prev);
      $.on(next, 'click', this.next);
      $.on(openQR, 'click', this.openQR);
      $.add(span, [openQR, $.tn(' '), prev, $.tn(' '), next]);
      return $.add(d.body, span);
    },
    prev: function() {
      if (g.REPLY) {
        return window.scrollTo(0, 0);
      } else {
        return Nav.scroll(-1);
      }
    },
    next: function() {
      if (g.REPLY) {
        return window.scrollTo(0, d.body.scrollHeight);
      } else {
        return Nav.scroll(+1);
      }
    },
    openQR: function() {
      QR.open();
      if (!g.REPLY) {
        QR.threadSelector.value = g.BOARD === 'f' ? '9999' : 'new';
      }
      return $('textarea', QR.el).focus();
    },
    getThread: function(full) {
      var bottom, i, rect, thread, _i, _len, _ref;
      Nav.threads = $$('.thread:not([hidden])');
      _ref = Nav.threads;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        thread = _ref[i];
        rect = thread.getBoundingClientRect();
        bottom = rect.bottom;
        if (bottom > 0) {
          if (full) {
            return [thread, i, rect];
          }
          return thread;
        }
      }
      return $('.board');
    },
    scroll: function(delta) {
      var i, rect, thread, top, _ref, _ref1;
      _ref = Nav.getThread(true), thread = _ref[0], i = _ref[1], rect = _ref[2];
      top = rect.top;
      if (!((delta === -1 && Math.ceil(top) < 0) || (delta === +1 && top > 1))) {
        i += delta;
      }
      top = (_ref1 = Nav.threads[i]) != null ? _ref1.getBoundingClientRect().top : void 0;
      return window.scrollBy(0, top);
    }
  };

  QR = {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/x-shockwave-flash', 'video/webm', ''],
    init: function() {
      if (!$.id('postForm')) {
        return;
      }
      Main.callbacks.push(this.node);
      return setTimeout(this.asyncInit);
    },
    asyncInit: function() {
      var link;
      if (Conf['Hide Original Post Form']) {
        link = $.el('h1', {
          innerHTML: "<a href=javascript:;>" + (g.REPLY ? 'Reply to Thread' : 'Start a Thread') + "</a>"
        });
        $.on(link.firstChild, 'click', function() {
          QR.open();
          if (!g.REPLY) {
            QR.threadSelector.value = g.BOARD === 'f' ? '9999' : 'new';
          }
          return $('textarea', QR.el).focus();
        });
        $.before($.id('postForm'), link);
        $.id('postForm').style.display = "none";
        $.id('togglePostFormLink').style.display = "none";
      }
      if (Conf['Persistent QR']) {
        QR.dialog();
        if (Conf['Auto Hide QR']) {
          QR.hide();
        }
      }
      $.on(d, 'dragover', QR.dragOver);
      $.on(d, 'drop', QR.dropFile);
      return $.on(d, 'dragstart dragend', QR.drag);
    },
    node: function(post) {
      return $.on($('a[title="Reply to this post"]', $('.postInfo', post.el)), 'click', QR.quote);
    },
    open: function() {
      if (QR.el) {
        QR.el.hidden = false;
        return QR.unhide();
      } else {
        return QR.dialog();
      }
    },
    close: function() {
      var i, spoiler, _i, _len, _ref;
      QR.el.hidden = true;
      QR.abort();
      d.activeElement.blur();
      $.rmClass(QR.el, 'dump');
      _ref = QR.replies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        QR.replies[0].rm();
      }
      QR.cooldown.auto = false;
      QR.status();
      QR.resetFileInput();
      if (!Conf['Remember Spoiler'] && (spoiler = $.id('spoiler')).checked) {
        spoiler.click();
      }
      return QR.cleanError();
    },
    hide: function() {
      d.activeElement.blur();
      $.addClass(QR.el, 'autohide');
      return $.id('autohide').checked = true;
    },
    unhide: function() {
      $.rmClass(QR.el, 'autohide');
      return $.id('autohide').checked = false;
    },
    toggleHide: function() {
      return this.checked && QR.hide() || QR.unhide();
    },
    error: function(err) {
      var el;
      el = $('.warning', QR.el);
      if (typeof err === 'string') {
        el.textContent = err;
      } else {
        el.innerHTML = null;
        $.add(el, err);
      }
      QR.open();
      if (d.hidden) {
        return alert(el.textContent);
      }
    },
    cleanError: function() {
      return $('.warning', QR.el).textContent = null;
    },
    status: function(data) {
      var disabled, input, value;
      if (data == null) {
        data = {};
      }
      if (!QR.el) {
        return;
      }
      if (g.dead) {
        value = 404;
        disabled = true;
        QR.cooldown.auto = false;
      }
      value = data.progress || QR.cooldown.seconds || value;
      input = QR.status.input;
      input.value = QR.cooldown.auto && Conf['Cooldown'] ? value ? "Auto " + value : 'Auto' : value || 'Submit';
      return input.disabled = disabled || false;
    },
    cooldown: {
      init: function() {
        if (!Conf['Cooldown']) {
          return;
        }
        QR.cooldown.types = {
          thread: (function() {
            switch (g.BOARD) {
              case 'jp':
                return 3600;
              case 'b':
              case 'soc':
              case 'r9k':
                return 600;
              default:
                return 300;
            }
          })(),
          sage: 60,
          file: g.BOARD === 'vg' ? 120 : 60,
          post: g.BOARD === 'vg' ? 90 : 60
        };
        QR.cooldown.cooldowns = $.get("" + g.BOARD + ".cooldown", {});
        QR.cooldown.start();
        return $.sync("" + g.BOARD + ".cooldown", QR.cooldown.sync);
      },
      start: function() {
        if (QR.cooldown.isCounting) {
          return;
        }
        QR.cooldown.isCounting = true;
        return QR.cooldown.count();
      },
      sync: function(cooldowns) {
        var id;
        for (id in cooldowns) {
          QR.cooldown.cooldowns[id] = cooldowns[id];
        }
        return QR.cooldown.start();
      },
      set: function(data) {
        var cooldown, hasFile, isReply, isSage, start, type;
        if (!Conf['Cooldown']) {
          return;
        }
        start = Date.now();
        if (data.delay) {
          cooldown = {
            delay: data.delay
          };
        } else {
          isSage = /sage/i.test(data.post.email);
          hasFile = !!data.post.file;
          isReply = data.isReply;
          type = !isReply ? 'thread' : isSage ? 'sage' : hasFile ? 'file' : 'post';
          cooldown = {
            isReply: isReply,
            isSage: isSage,
            hasFile: hasFile,
            timeout: start + QR.cooldown.types[type] * $.SECOND
          };
        }
        QR.cooldown.cooldowns[start] = cooldown;
        $.set("" + g.BOARD + ".cooldown", QR.cooldown.cooldowns);
        return QR.cooldown.start();
      },
      unset: function(id) {
        delete QR.cooldown.cooldowns[id];
        return $.set("" + g.BOARD + ".cooldown", QR.cooldown.cooldowns);
      },
      count: function() {
        var cooldown, cooldowns, elapsed, hasFile, isReply, isSage, now, post, seconds, start, type, types, update, _ref;
        if (Object.keys(QR.cooldown.cooldowns).length) {
          setTimeout(QR.cooldown.count, 1000);
        } else {
          $["delete"]("" + g.BOARD + ".cooldown");
          delete QR.cooldown.isCounting;
          delete QR.cooldown.seconds;
          QR.status();
          return;
        }
        if ((isReply = g.REPLY ? true : QR.threadSelector.value !== 'new')) {
          post = QR.replies[0];
          isSage = /sage/i.test(post.email);
          hasFile = !!post.file;
        }
        now = Date.now();
        seconds = null;
        _ref = QR.cooldown, types = _ref.types, cooldowns = _ref.cooldowns;
        for (start in cooldowns) {
          cooldown = cooldowns[start];
          if ('delay' in cooldown) {
            if (cooldown.delay) {
              seconds = Math.max(seconds, cooldown.delay--);
            } else {
              seconds = Math.max(seconds, 0);
              QR.cooldown.unset(start);
            }
            continue;
          }
          if (isReply === cooldown.isReply) {
            type = !isReply ? 'thread' : isSage && cooldown.isSage ? 'sage' : hasFile && cooldown.hasFile ? 'file' : 'post';
            elapsed = Math.floor((now - start) / 1000);
            if (elapsed >= 0) {
              seconds = Math.max(seconds, types[type] - elapsed);
            }
          }
          if (!((start <= now && now <= cooldown.timeout))) {
            QR.cooldown.unset(start);
          }
        }
        update = seconds !== null || !!QR.cooldown.seconds;
        QR.cooldown.seconds = seconds;
        if (update) {
          QR.status();
        }
        if (seconds === 0 && QR.cooldown.auto) {
          return QR.submit();
        }
      }
    },
    quote: function(e) {
      var caretPos, id, range, s, sel, ta, text, _ref;
      if (e != null) {
        e.preventDefault();
      }
      QR.open();
      ta = $('textarea', QR.el);
      if (!(g.REPLY || ta.value)) {
        QR.threadSelector.value = $.x('ancestor::div[parent::div[@class="board"]]', this).id.slice(1);
      }
      id = this.previousSibling.hash.slice(2);
      text = ">>" + id + "\n";
      sel = d.getSelection();
      if ((s = sel.toString().trim()) && id === ((_ref = $.x('ancestor-or-self::blockquote', sel.anchorNode)) != null ? _ref.id.match(/\d+$/)[0] : void 0)) {
        s = s.replace(/\n/g, '\n>');
        text += ">" + s + "\n";
      }
      caretPos = ta.selectionStart;
      ta.value = ta.value.slice(0, caretPos) + text + ta.value.slice(ta.selectionEnd);
      range = caretPos + text.length;
      ta.setSelectionRange(range, range);
      ta.focus();
      return ta.dispatchEvent(new Event('input'));
    },
    characterCount: function() {
      var count, counter;
      counter = QR.charaCounter;
      count = this.textLength;
      counter.textContent = count;
      counter.hidden = count < (QR.maxComment / 2);
      return (count > QR.maxComment ? $.addClass : $.rmClass)(counter, 'warning');
    },
    drag: function(e) {
      var toggle;
      toggle = e.type === 'dragstart' ? $.off : $.on;
      toggle(d, 'dragover', QR.dragOver);
      return toggle(d, 'drop', QR.dropFile);
    },
    dragOver: function(e) {
      e.preventDefault();
      return e.dataTransfer.dropEffect = 'copy';
    },
    dropFile: function(e) {
      if (!e.dataTransfer.files.length) {
        return;
      }
      e.preventDefault();
      QR.open();
      QR.fileInput.call(e.dataTransfer);
      return $.addClass(QR.el, 'dump');
    },
    fileInput: function() {
      var file, _i, _len, _ref;
      QR.cleanError();
      if (this.files.length === 1) {
        file = this.files[0];
        if (file.size > this.max) {
          QR.error('File too large.');
          QR.resetFileInput();
        } else if (-1 === QR.mimeTypes.indexOf(file.type)) {
          QR.error('Unsupported file type.');
          QR.resetFileInput();
        } else {
          QR.selected.setFile(file);
        }
        return;
      }
      _ref = this.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.size > this.max) {
          QR.error("File " + file.name + " is too large.");
          break;
        } else if (-1 === QR.mimeTypes.indexOf(file.type)) {
          QR.error("" + file.name + ": Unsupported file type.");
          break;
        }
        if (!QR.replies[QR.replies.length - 1].file) {
          QR.replies[QR.replies.length - 1].setFile(file);
        } else {
          new QR.reply().setFile(file);
        }
      }
      $.addClass(QR.el, 'dump');
      return QR.resetFileInput();
    },
    resetFileInput: function() {
      return $('[type=file]', QR.el).value = null;
    },
    replies: [],
    reply: (function() {
      function _Class() {
        var persona, prev,
          _this = this;
        prev = QR.replies[QR.replies.length - 1];
        persona = $.get('QR.persona', {});
        this.name = prev ? prev.name : persona.name || null;
        this.email = prev && !/^sage$/.test(prev.email) ? prev.email : persona.email || null;
        this.sub = prev && Conf['Remember Subject'] ? prev.sub : Conf['Remember Subject'] ? persona.sub : null;
        this.spoiler = prev && Conf['Remember Spoiler'] ? prev.spoiler : false;
        this.com = null;
        this.el = $.el('a', {
          className: 'thumbnail',
          draggable: true,
          href: 'javascript:;',
          innerHTML: '<a class=remove>×</a><label hidden><input type=checkbox> Spoiler</label><span></span>'
        });
        $('input', this.el).checked = this.spoiler;
        $.on(this.el, 'click', function() {
          return _this.select();
        });
        $.on($('.remove', this.el), 'click', function(e) {
          e.stopPropagation();
          return _this.rm();
        });
        $.on($('label', this.el), 'click', function(e) {
          return e.stopPropagation();
        });
        $.on($('input', this.el), 'change', function(e) {
          _this.spoiler = e.target.checked;
          if (_this.el.id === 'selected') {
            return $.id('spoiler').checked = _this.spoiler;
          }
        });
        $.before($('#addReply', QR.el), this.el);
        $.on(this.el, 'dragstart', this.dragStart);
        $.on(this.el, 'dragenter', this.dragEnter);
        $.on(this.el, 'dragleave', this.dragLeave);
        $.on(this.el, 'dragover', this.dragOver);
        $.on(this.el, 'dragend', this.dragEnd);
        $.on(this.el, 'drop', this.drop);
        QR.replies.push(this);
      }

      _Class.prototype.setFile = function(file) {
        var fileUrl, img, url,
          _this = this;
        this.file = file;
        this.el.title = "" + file.name + " (" + ($.bytesToString(file.size)) + ")";
        if (QR.spoiler) {
          $('label', this.el).hidden = false;
        }
        if (!/^image/.test(file.type)) {
          this.el.style.backgroundImage = null;
          return;
        }
        if (!(url = window.URL || window.webkitURL)) {
          return;
        }
        url.revokeObjectURL(this.url);
        fileUrl = url.createObjectURL(file);
        img = $.el('img');
        $.on(img, 'load', function() {
          var c, data, i, l, s, ui8a, _i;
          s = 90 * 3;
          if (img.height < s || img.width < s) {
            _this.url = fileUrl;
            _this.el.style.backgroundImage = "url(" + _this.url + ")";
            return;
          }
          if (img.height <= img.width) {
            img.width = s / img.height * img.width;
            img.height = s;
          } else {
            img.height = s / img.width * img.height;
            img.width = s;
          }
          c = $.el('canvas');
          c.height = img.height;
          c.width = img.width;
          c.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
          data = atob(c.toDataURL().split(',')[1]);
          l = data.length;
          ui8a = new Uint8Array(l);
          for (i = _i = 0; 0 <= l ? _i < l : _i > l; i = 0 <= l ? ++_i : --_i) {
            ui8a[i] = data.charCodeAt(i);
          }
          _this.url = url.createObjectURL(new Blob([ui8a], {
            type: 'image/png'
          }));
          _this.el.style.backgroundImage = "url(" + _this.url + ")";
          return typeof url.revokeObjectURL === "function" ? url.revokeObjectURL(fileUrl) : void 0;
        });
        return img.src = fileUrl;
      };

      _Class.prototype.rmFile = function() {
        var _base1;
        QR.resetFileInput();
        delete this.file;
        this.el.title = null;
        this.el.style.backgroundImage = null;
        if (QR.spoiler) {
          $('label', this.el).hidden = true;
        }
        return typeof (_base1 = window.URL || window.webkitURL).revokeObjectURL === "function" ? _base1.revokeObjectURL(this.url) : void 0;
      };

      _Class.prototype.select = function() {
        var data, rectEl, rectList, _i, _len, _ref, _ref1;
        if ((_ref = QR.selected) != null) {
          _ref.el.id = null;
        }
        QR.selected = this;
        this.el.id = 'selected';
        rectEl = this.el.getBoundingClientRect();
        rectList = this.el.parentNode.getBoundingClientRect();
        this.el.parentNode.scrollLeft += rectEl.left + rectEl.width / 2 - rectList.left - rectList.width / 2;
        _ref1 = ['name', 'email', 'sub', 'com'];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          data = _ref1[_i];
          $("[name=" + data + "]", QR.el).value = this[data];
        }
        QR.characterCount.call($('textarea', QR.el));
        return $('#spoiler', QR.el).checked = this.spoiler;
      };

      _Class.prototype.dragStart = function() {
        return $.addClass(this, 'drag');
      };

      _Class.prototype.dragEnter = function() {
        return $.addClass(this, 'over');
      };

      _Class.prototype.dragLeave = function() {
        return $.rmClass(this, 'over');
      };

      _Class.prototype.dragOver = function(e) {
        e.preventDefault();
        return e.dataTransfer.dropEffect = 'move';
      };

      _Class.prototype.drop = function() {
        var el, index, newIndex, oldIndex, reply;
        el = $('.drag', this.parentNode);
        index = function(el) {
          return Array.prototype.slice.call(el.parentNode.children).indexOf(el);
        };
        oldIndex = index(el);
        newIndex = index(this);
        if (oldIndex < newIndex) {
          $.after(this, el);
        } else {
          $.before(this, el);
        }
        reply = QR.replies.splice(oldIndex, 1)[0];
        return QR.replies.splice(newIndex, 0, reply);
      };

      _Class.prototype.dragEnd = function() {
        var el;
        $.rmClass(this, 'drag');
        if (el = $('.over', this.parentNode)) {
          return $.rmClass(el, 'over');
        }
      };

      _Class.prototype.rm = function() {
        var index, _base1;
        QR.resetFileInput();
        $.rm(this.el);
        index = QR.replies.indexOf(this);
        if (QR.replies.length === 1) {
          new QR.reply().select();
        } else if (this.el.id === 'selected') {
          (QR.replies[index - 1] || QR.replies[index + 1]).select();
        }
        QR.replies.splice(index, 1);
        return typeof (_base1 = window.URL || window.webkitURL).revokeObjectURL === "function" ? _base1.revokeObjectURL(this.url) : void 0;
      };

      return _Class;

    })(),
    captcha: {
      init: function() {
        if (-1 !== d.cookie.indexOf('pass_enabled=')) {
          return;
        }
        if (!(this.isEnabled = !!$.id('g-recaptcha'))) {
          return;
        }
        return this.ready();
      },
      ready: function() {
        if(!CaptchaIsSetup) {
          if(!Conf['Alternative captcha'] || (!g.REPLY && !Conf['Alt index captcha'])) {
            $.after($('.textarea', QR.el), $.el('input', {
              type: 'hidden',
              id: 'recaptcha_response_field',
              value: ''
            }));
            $.addClass(QR.el, 'captcha');
            $.globalEval('(function () {window.grecaptcha.render(document.getElementById("g-recaptcha"), {sitekey: "6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc", theme: "light", callback: (' + (Conf['Auto Submit'] ? 'function (res) {var sb = document.getElementById("x_QR_Submit"); if(sb) sb.click(); }' : 'function (res) {}') + ') });})()');
            $.after($('.textarea', QR.el), $.id('g-recaptcha'));
          } else {
            $.addClass(QR.el, 'captcha');
            $.after($('.textarea', QR.el), $.el('div', {
              id: 'recaptcha_widget',
            }));
            $.globalEval("Recaptcha.create('6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc', 'recaptcha_widget', {theme: 'clean'});");
            var asap = function () {
              if (!($.id('recaptcha_response_field'))) {
                setTimeout(asap, 200);
                return;
              }
              $.on($.id('recaptcha_response_field'), 'keydown', QR.captcha.keydown);
              $.globalEval('(function () {window.onunload=function () {window.Recaptcha.destroy();};})();');
            };
            asap();
          }
          CaptchaIsSetup = true;
        }
      },
      getResponse: function() {
        if(!Conf['Alternative captcha'] || (!g.REPLY && !Conf['Alt index captcha'])) {
          $.globalEval('document.getElementById("recaptcha_response_field").value = window.grecaptcha.getResponse();');
        }
        return $.id('recaptcha_response_field').value;
      },
      getChallenge: function() {
        return $.id('recaptcha_challenge_field').value;
      },
      reset: function() {
        if(!Conf['Alternative captcha'] || (!g.REPLY && !Conf['Alt index captcha'])) {
          $.globalEval('window.grecaptcha.reset();');
        } else {
          $.globalEval('window.Recaptcha.reload(); Recaptcha.should_focus = false;');
        }
      },
      keydown: function(e) {
        var respfield = $.id('recaptcha_response_field');
        if (e.keyCode === 8 && !respfield.value) {
          QR.captcha.reset();
        } else {
          return;
        }
        return e.preventDefault();
      }
    },
    dialog: function() {
      var fileInput, id, mimeTypes, name, spoiler, ta, thread, threads, _i, _j, _len, _len1, _ref, _ref1;
      QR.el = UI.dialog('qr', 'top:0;right:0;', '\
<div class=move>\
  Quick Reply <input type=checkbox id=autohide title=Auto-hide>\
  <span> <a class=close title=Close>×</a></span>\
</div>\
<form>\
  <div><input id=dump type=button title="Dump list" value=+ class=field><input name=name title=Name placeholder=Name class=field size=1><input name=email title=E-mail placeholder=E-mail class=field size=1><input name=sub title=Subject placeholder=Subject class=field size=1></div>\
  <div id=replies><div><a id=addReply href=javascript:; title="Add a reply">+</a></div></div>\
  <div class=textarea><textarea name=com title=Comment placeholder=Comment class=field id=commentTextArea></textarea><span id=charCount></span></div>\
  <div><input type=file title="Shift+Click to remove the selected file." multiple size=16><input type=submit id="x_QR_Submit"></div>\
  <label id=spoilerLabel><input type=checkbox id=spoiler> Spoiler Image</label>\
  <div class=warning></div>\
</form>');
      if (Conf['Remember QR size'] && $.engine === 'gecko') {
        $.on(ta = $('textarea', QR.el), 'mouseup', function() {
          return $.set('QR.size', this.style.cssText);
        });
        ta.style.cssText = $.get('QR.size', '');
      }
      fileInput = $('input[type=file]', QR.el);
      fileInput.max = $('input[name=MAX_FILE_SIZE]').value;
      if ($.engine !== 'presto') {
        fileInput.accept = mimeTypes;
      }
      QR.spoiler = !!$('input[name=spoiler]');
      spoiler = $('#spoilerLabel', QR.el);
      spoiler.hidden = !QR.spoiler;
      QR.maxComment = g.BOARD === 'jp' ? 5000 : 2000;
      QR.charaCounter = $('#charCount', QR.el);
      ta = $('textarea', QR.el);
      if (!g.REPLY) {
        threads = '<option value=new>New thread</option>';
        _ref = $$('.thread');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          thread = _ref[_i];
          id = thread.id.slice(1);
          threads += "<option value=" + id + ">Thread " + id + "</option>";
        }
        QR.threadSelector = g.BOARD === 'f' ? $('select[name=filetag]').cloneNode(true) : $.el('select', {
          innerHTML: threads,
          title: 'Create a new thread / Reply to a thread'
        });
        $.prepend($('.move > span', QR.el), QR.threadSelector);
        $.on(QR.threadSelector, 'mousedown', function(e) {
          return e.stopPropagation();
        });
      }
      $.on($('#autohide', QR.el), 'change', QR.toggleHide);
      $.on($('.close', QR.el), 'click', QR.close);
      $.on($('#dump', QR.el), 'click', function() {
        return QR.el.classList.toggle('dump');
      });
      $.on($('#addReply', QR.el), 'click', function() {
        return new QR.reply().select();
      });
      $.on($('form', QR.el), 'submit', QR.submit);
      $.on(ta, 'input', function() {
        return QR.selected.el.lastChild.textContent = this.value;
      });
      $.on(ta, 'input', QR.characterCount);
      $.on(fileInput, 'change', QR.fileInput);
      $.on(fileInput, 'click', function(e) {
        if (e.shiftKey) {
          return QR.selected.rmFile() || e.preventDefault();
        }
      });
      $.on(spoiler.firstChild, 'change', function() {
        return $('input', QR.selected.el).click();
      });
      $.on($('.warning', QR.el), 'click', QR.cleanError);
      new QR.reply().select();
      _ref1 = ['name', 'email', 'sub', 'com'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        name = _ref1[_j];
        $.on($("[name=" + name + "]", QR.el), 'input', function() {
          var _ref2;
          QR.selected[this.name] = this.value;
          if (QR.cooldown.auto && QR.selected === QR.replies[0] && (0 < (_ref2 = QR.cooldown.seconds) && _ref2 <= 5)) {
            return QR.cooldown.auto = false;
          }
        });
      }
      QR.status.input = $('input[type=submit]', QR.el);
      QR.status();
      QR.cooldown.init();
      QR.captcha.init();
      $.add(d.body, QR.el);
      return $.event('QRDialogCreation', null, QR.el);
    },
    submit: function(e) {
      var callbacks, err, filetag, m, opts, post, reply, response, textOnly, threadID;
      if (e != null) {
        e.preventDefault();
      }
      if (QR.cooldown.seconds) {
        QR.cooldown.auto = !QR.cooldown.auto;
        QR.status();
        return;
      }
      QR.abort();
      reply = QR.replies[0];
      if (g.BOARD === 'f' && !g.REPLY) {
        filetag = QR.threadSelector.value;
        threadID = 'new';
      } else {
        threadID = g.THREAD_ID || QR.threadSelector.value;
      }
      if (threadID === 'new') {
        threadID = null;
        if (g.BOARD === 'vg' && !reply.sub) {
          err = 'New threads require a subject.';
        } else if (!(reply.file || (textOnly = !!$('input[name=textonly]', $.id('postForm'))))) {
          err = 'No file selected.';
        } else if (g.BOARD === 'f' && filetag === '9999') {
          err = 'Invalid tag specified.';
        }
      } else if (!(reply.com || reply.file)) {
        err = 'No file selected.';
      }
      if (QR.captcha.isEnabled && !err) {
        response = QR.captcha.getResponse();
        if (!response) {
          err = 'No valid captcha.';
        }
      }
      if (err) {
        QR.cooldown.auto = false;
        QR.status();
        QR.error(err);
        return;
      }
      QR.cleanError();
      QR.cooldown.auto = QR.replies.length > 1;
      if (Conf['Auto Hide QR'] && !QR.cooldown.auto) {
        QR.hide();
      }
      if (!QR.cooldown.auto && $.x('ancestor::div[@id="qr"]', d.activeElement)) {
        d.activeElement.blur();
      }
      QR.status({
        progress: '...'
      });
      post = {
        resto: threadID,
        name: reply.name,
        email: reply.email,
        sub: reply.sub,
        com: reply.com,
        upfile: reply.file,
        filetag: filetag,
        spoiler: reply.spoiler,
        textonly: textOnly,
        mode: 'regist',
        pwd: (m = d.cookie.match(/4chan_pass=([^;]+)/)) ? decodeURIComponent(m[1]) : $('input[name=pwd]').value,
      };
      if (QR.captcha.isEnabled) {
        if(!Conf['Alternative captcha'] || (!g.REPLY && !Conf['Alt index captcha'])) {
          post['g-recaptcha-response'] = response;
        } else {
          post['recaptcha_response_field'] = response;
          post['recaptcha_challenge_field'] = QR.captcha.getChallenge();
        }
      }
      
      callbacks = {
        onload: function() {
          return QR.response(this.response);
        },
        onerror: function() {
          if (QR.captcha.isEnabled) {
            QR.captcha.reset();
          }
          QR.cooldown.auto = false;
          QR.status();
          return QR.error($.el('a', {
            href: '//www.4chan.org/banned',
            target: '_blank',
            textContent: 'Connection error, or you are banned.'
          }));
        }
      };
      opts = {
        form: $.formData(post),
        upCallbacks: {
          onload: function() {
            return QR.status({
              progress: '...'
            });
          },
          onprogress: function(e) {
            return QR.status({
              progress: "" + (Math.round(e.loaded / e.total * 100)) + "%"
            });
          }
        }
      };
      return QR.ajax = $.ajax($.id('postForm').parentNode.action, callbacks, opts);
    },
    response: function(html) {
      var ban, board, clone, doc, err, obj, persona, postID, reply, threadID, _, _ref, _ref1;
      if (QR.captcha.isEnabled) {
        QR.captcha.reset();
      }
      doc = d.implementation.createHTMLDocument('');
      doc.documentElement.innerHTML = html;
      if (ban = $('.banType', doc)) {
        board = $('.board', doc).innerHTML;
        err = $.el('span', {
          innerHTML: ban.textContent.toLowerCase() === 'banned' ? ("You are banned on " + board + "! ;_;<br>") + "Click <a href=//www.4chan.org/banned target=_blank>here</a> to see the reason." : ("You were issued a warning on " + board + " as " + ($('.nameBlock', doc).innerHTML) + ".<br>") + ("Reason: " + ($('.reason', doc).innerHTML))
        });
      } else if (err = doc.getElementById('errmsg')) {
        if ((_ref = $('a', err)) != null) {
          _ref.target = '_blank';
        }
      } else if (doc.title !== 'Post successful!') {
        err = 'Connection error with sys.4chan.org.';
      }
      if (err) {
        if (/captcha|verification/i.test(err.textContent) || err === 'Connection error with sys.4chan.org.') {
          if (/mistyped/i.test(err.textContent)) {
            err = 'Error: You seem to have mistyped the CAPTCHA.';
          }
          QR.cooldown.auto = false;
          QR.cooldown.set({
            delay: 2
          });
        } else {
          QR.cooldown.auto = false;
        }
        QR.status();
        QR.error(err);
        return;
      }
      reply = QR.replies[0];
      persona = $.get('QR.persona', {});
      persona = {
        name: reply.name,
        email: /^sage$/.test(reply.email) ? persona.email : reply.email,
        sub: Conf['Remember Subject'] ? reply.sub : null
      };
      $.set('QR.persona', persona);
      _ref1 = doc.body.lastChild.textContent.match(/thread:(\d+),no:(\d+)/), _ = _ref1[0], threadID = _ref1[1], postID = _ref1[2];
      obj = {boardID: g.BOARD, threadID: threadID, postID: postID};
      clone = (typeof(cloneInto) === 'function' && cloneInto(obj, document.defaultView)) || obj;
      $.event('QRPostSuccessful', clone, QR.el);
      
      /* Add your own replies to yourPosts and storage to watch for replies */
      if (Conf['Indicate You quote']) {
        yourPosts.push(postID);
        sessionStorage.setItem('yourPosts', JSON.stringify(yourPosts));
      }
      
      QR.cooldown.set({
        post: reply,
        isReply: threadID !== '0'
      });
      if (threadID === '0') {
        setTimeout(function () {
          location.pathname = "/" + g.BOARD + "/thread/" + postID;
        }, 3000);
      } else {
        QR.cooldown.auto = QR.replies.length > 1;
        if (Conf['Open Reply in New Tab'] && !g.REPLY && !QR.cooldown.auto) {
          $.open("//boards.4chan.org/" + g.BOARD + "/thread/" + threadID + "#p" + postID);
        }
      }
      if (Conf['Persistent QR'] || QR.cooldown.auto) {
        reply.rm();
      } else {
        QR.close();
      }
      QR.status();
      return QR.resetFileInput();
    },
    abort: function() {
      var _ref;
      if ((_ref = QR.ajax) != null) {
        _ref.abort();
      }
      delete QR.ajax;
      return QR.status();
    }
  };

  Options = {
    init: function() {
      return $.ready(Options.initReady);
    },
    initReady: function() {
      var a, notice, setting;
      a = $.el('a', {
        href: 'javascript:;',
        className: 'settingsWindowLink',
        textContent: '4chan X Settings'
      });
      $.on(a, 'click', Options.dialog);
      setting = $.id('navtopright');
      if (Conf['Disable 4chan\'s extension']) {
        $.replace(setting.firstElementChild, a);
      } else {
        $.prepend(setting, [$.tn('['), a, $.tn('] ')]);
      }
      notice = $.el('a', {
        textContent: 'v2 is never outdated.',
        href: 'https://github.com/loadletter/4chan-x',
        target: '_blank'
      });
      notice.style.color = 'red';
      $.prepend(setting, [$.tn('['), notice, $.tn('] ')]);
      $.ready(function () {
        setTimeout(function () {
          var navbotLink = $('#navbotright > .settingsWindowLink');
          if (navbotLink) {
            $.on(navbotLink, 'click', Options.dialog);
          }
        }, 0);
      });
      if (!$.get('firstrun')) {
        $.set('firstrun', true);
        if (!Favicon.el) {
          Favicon.init();
        }
        return Options.dialog();
      }
    },
    dialog: function() {
      var arr, back, checked, description, dialog, favicon, fileInfo, filter, hiddenNum, hiddenThreads, indicator, indicators, input, key, li, obj, overlay, sauce, time, tr, ul, _i, _len, _ref, _ref1, _ref2;
      dialog = $.el('div', {
        id: 'options',
        className: 'reply dialog',
        innerHTML: '<div id=optionsbar>\
  <div id=credits>\
    <a target=_blank href=https://github.com/loadletter/4chan-x>4chan X</a>\
    | <a target=_blank href=https://github.com/loadletter/4chan-x/commits/master>' + Main.version + '</a>\
    | <a target=_blank href=https://github.com/loadletter/4chan-x/issues>Issues</a>\
  </div>\
  <div>\
    <label for=main_tab>Main</label>\
    | <label for=filter_tab>Filter</label>\
    | <label for=sauces_tab>Sauce</label>\
    | <label for=rice_tab>Rice</label>\
    | <label for=keybinds_tab>Keybinds</label>\
  </div>\
</div>\
<hr>\
<div id=content>\
  <input type=radio name=tab hidden id=main_tab checked>\
  <div>\
    <div class=imp-exp>\
      <button class=export>Export settings</button>\
      <button class=import>Import settings</button>\
      <input type=file style="visibility:hidden">\
    </div>\
    <p class=imp-exp-result></p>\
  </div>\
  <input type=radio name=tab hidden id=sauces_tab>\
  <div>\
    <div class=warning><code>Sauce</code> is disabled.</div>\
    Lines starting with a <code>#</code> will be ignored.<br>\
    You can specify a certain display text by appending <code>;text:[text]</code> to the url.\
    <ul>These parameters will be replaced by their corresponding values:\
      <li>$1: Thumbnail url.</li>\
      <li>$2: Full image url.</li>\
      <li>$3: MD5 hash.</li>\
      <li>$4: Current board.</li>\
    </ul>\
    <textarea name=sauces id=sauces class=field></textarea>\
  </div>\
  <input type=radio name=tab hidden id=filter_tab>\
  <div>\
    <div class=warning><code>Filter</code> is disabled.</div>\
    <select name=filter>\
      <option value=guide>Guide</option>\
      <option value=name>Name</option>\
      <option value=pass>Pass User</option>\
      <option value=uniqueid>Unique ID</option>\
      <option value=tripcode>Tripcode</option>\
      <option value=mod>Admin/Mod</option>\
      <option value=subject>Subject</option>\
      <option value=comment>Comment</option>\
      <option value=country>Country</option>\
      <option value=filename>Filename</option>\
      <option value=dimensions>Image dimensions</option>\
      <option value=filesize>Filesize</option>\
      <option value=md5>Image MD5 (uses exact string matching, not regular expressions)</option>\
    </select>\
  </div>\
  <input type=radio name=tab hidden id=rice_tab>\
  <div>\
    <div class=warning><code>Quote Backlinks</code> are disabled.</div>\
    <ul>\
      Backlink formatting\
      <li><input name=backlink class=field> : <span id=backlinkPreview></span></li>\
    </ul>\
    <div class=warning><code>Time Formatting</code> is disabled.</div>\
    <ul>\
      Time formatting\
      <li><input name=time class=field> : <span id=timePreview></span></li>\
      <li>Supported <a href=http://en.wikipedia.org/wiki/Date_%28Unix%29#Formatting>format specifiers</a>:</li>\
      <li>Day: %a, %A, %d, %e</li>\
      <li>Month: %m, %b, %B</li>\
      <li>Year: %y</li>\
      <li>Hour: %k, %H, %l (lowercase L), %I (uppercase i), %p, %P</li>\
      <li>Minutes: %M</li>\
      <li>Seconds: %S</li>\
    </ul>\
    <div class=warning><code>File Info Formatting</code> is disabled.</div>\
    <ul>\
      File Info Formatting\
      <li><input name=fileInfo class=field> : <span id=fileInfoPreview class=fileText></span></li>\
      <li>Link: %l (lowercase L, truncated), %L (untruncated), %T (Unix timestamp)</li>\
      <li>Original file name: %n (truncated), %N (untruncated), %t (Unix timestamp)</li>\
      <li>Spoiler indicator: %p</li>\
      <li>Size: %B (Bytes), %K (KB), %M (MB), %s (4chan default)</li>\
      <li>Resolution: %r (Displays PDF on /po/, for PDFs)</li>\
    </ul>\
    <div class=warning><code>Unread Favicon</code> is disabled.</div>\
    Unread favicons<br>\
    <select name=favicon>\
      <option value=ferongr>ferongr</option>\
      <option value=xat->xat-</option>\
      <option value=Mayhem>Mayhem</option>\
      <option value=Original>Original</option>\
    </select>\
    <span></span>\
  </div>\
  <input type=radio name=tab hidden id=keybinds_tab>\
  <div>\
    <div class=warning><code>Keybinds</code> are disabled.</div>\
    <div>Allowed keys: Ctrl, Alt, Meta, a-z, A-Z, 0-9, Up, Down, Right, Left.</div>\
    <table><tbody>\
      <tr><th>Actions</th><th>Keybinds</th></tr>\
    </tbody></table>\
  </div>\
</div>'
      });
      $.on($('#main_tab + div .export', dialog), 'click', Options["export"]);
      $.on($('#main_tab + div .import', dialog), 'click', Options["import"]);
      $.on($('#main_tab + div input', dialog), 'change', Options.onImport);
      _ref = Config.main;
      for (key in _ref) {
        obj = _ref[key];
        ul = $.el('ul', {
          textContent: key
        });
        for (key in obj) {
          arr = obj[key];
          checked = $.get(key, Conf[key]) ? 'checked' : '';
          description = arr[1];
          li = $.el('li', {
            innerHTML: "<label><input type=checkbox name=\"" + key + "\" " + checked + ">" + key + "</label><span class=description>: " + description + "</span>"
          });
          $.on($('input', li), 'click', $.cb.checked);
          $.add(ul, li);
        }
        $.add($('#main_tab + div', dialog), ul);
      }
      hiddenThreads = $.get("hiddenThreads/" + g.BOARD + "/", {});
      hiddenNum = Object.keys(g.hiddenReplies).length + Object.keys(hiddenThreads).length;
      li = $.el('li', {
        innerHTML: "<button>hidden: " + hiddenNum + "</button> <span class=description>: Forget all hidden posts. Useful if you accidentally hide a post and have \"Show Stubs\" disabled."
      });
      $.on($('button', li), 'click', Options.clearHidden);
      $.add($('ul:nth-child(2)', dialog), li);
      filter = $('select[name=filter]', dialog);
      $.on(filter, 'change', Options.filter);
      sauce = $('#sauces', dialog);
      sauce.value = $.get(sauce.name, Conf[sauce.name]);
      $.on(sauce, 'change', $.cb.value);
      (back = $('[name=backlink]', dialog)).value = $.get('backlink', Conf['backlink']);
      (time = $('[name=time]', dialog)).value = $.get('time', Conf['time']);
      (fileInfo = $('[name=fileInfo]', dialog)).value = $.get('fileInfo', Conf['fileInfo']);
      $.on(back, 'input', $.cb.value);
      $.on(back, 'input', Options.backlink);
      $.on(time, 'input', $.cb.value);
      $.on(time, 'input', Options.time);
      $.on(fileInfo, 'input', $.cb.value);
      $.on(fileInfo, 'input', Options.fileInfo);
      favicon = $('select[name=favicon]', dialog);
      favicon.value = $.get('favicon', Conf['favicon']);
      $.on(favicon, 'change', $.cb.value);
      $.on(favicon, 'change', Options.favicon);
      _ref1 = Config.hotkeys;
      for (key in _ref1) {
        arr = _ref1[key];
        tr = $.el('tr', {
          innerHTML: "<td>" + arr[1] + "</td><td><input name=" + key + " class=field></td>"
        });
        input = $('input', tr);
        input.value = $.get(key, Conf[key]);
        $.on(input, 'keydown', Options.keybind);
        $.add($('#keybinds_tab + div tbody', dialog), tr);
      }
      indicators = {};
      _ref2 = $$('.warning', dialog);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        indicator = _ref2[_i];
        key = indicator.firstChild.textContent;
        indicator.hidden = $.get(key, Conf[key]);
        indicators[key] = indicator;
        $.on($("[name='" + key + "']", dialog), 'click', function() {
          return indicators[this.name].hidden = this.checked;
        });
      }
      overlay = $.el('div', {
        id: 'overlay'
      });
      $.on(overlay, 'click', Options.close);
      $.on(dialog, 'click', function(e) {
        return e.stopPropagation();
      });
      $.add(overlay, dialog);
      $.add(d.body, overlay);
      d.body.style.setProperty('width', "" + d.body.clientWidth + "px", null);
      $.addClass(d.body, 'unscroll');
      Options.filter.call(filter);
      Options.backlink.call(back);
      Options.time.call(time);
      Options.fileInfo.call(fileInfo);
      return Options.favicon.call(favicon);
    },
    close: function() {
      $.rm(this);
      d.body.style.removeProperty('width');
      return $.rmClass(d.body, 'unscroll');
    },
    clearHidden: function() {
      $["delete"]("hiddenReplies/" + g.BOARD + "/");
      $["delete"]("hiddenThreads/" + g.BOARD + "/");
      this.textContent = "hidden: 0";
      return g.hiddenReplies = {};
    },
    keybind: function(e) {
      var key;
      if (e.keyCode === 9) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if ((key = Keybinds.keyCode(e)) == null) {
        return;
      }
      this.value = key;
      return $.cb.value.call(this);
    },
    filter: function() {
      var el, name, ta;
      el = this.nextSibling;
      if ((name = this.value) !== 'guide') {
        ta = $.el('textarea', {
          name: name,
          className: 'field',
          value: $.get(name, Conf[name])
        });
        $.on(ta, 'change', $.cb.value);
        $.replace(el, ta);
        return;
      }
      if (el) {
        $.rm(el);
      }
      return $.after(this, $.el('article', {
        innerHTML: '<p>Use <a href=https://developer.mozilla.org/en/JavaScript/Guide/Regular_Expressions>regular expressions</a>, one per line.<br>\
  Lines starting with a <code>#</code> will be ignored.<br>\
  For example, <code>/weeaboo/i</code> will filter posts containing the string `<code>weeaboo</code>`, case-insensitive.</p>\
  <ul>You can use these settings with each regular expression, separate them with semicolons:\
    <li>\
      Per boards, separate them with commas. It is global if not specified.<br>\
      For example: <code>boards:a,jp;</code>.\
    </li>\
    <li>\
      Filter OPs only along with their threads (`only`), replies only (`no`, this is default), or both (`yes`).<br>\
      For example: <code>op:only;</code>, <code>op:no;</code> or <code>op:yes;</code>.\
    </li>\
    <li>\
      Overrule the `Show Stubs` setting if specified: create a stub (`yes`) or not (`no`).<br>\
      For example: <code>stub:yes;</code> or <code>stub:no;</code>.\
    </li>\
    <li>\
      Highlight instead of hiding. You can specify a class name to use with a userstyle.<br>\
      For example: <code>highlight;</code> or <code>highlight:wallpaper;</code>.\
    </li>\
    <li>\
      Highlighted OPs will have their threads put on top of board pages by default.<br>\
      For example: <code>top:yes;</code> or <code>top:no;</code>.\
    </li>\
  </ul>'
      }));
    },
    time: function() {
      Time.date = new Date();
      return $.id('timePreview').textContent = Time.funk();
    },
    backlink: function() {
      return $.id('backlinkPreview').textContent = Conf['backlink'].replace(/%id/, '123456789');
    },
    fileInfo: function() {
      FileInfo.data = {
        link: '//i.4cdn.org/g/1334437723720.jpg',
        spoiler: true,
        size: '276',
        unit: 'KB',
        resolution: '1280x720',
        fullname: 'd9bb2efc98dd0df141a94399ff5880b7.jpg',
        shortname: 'd9bb2efc98dd0df141a94399ff5880(...).jpg'
      };
      return $.id('fileInfoPreview').innerHTML = FileInfo.funk();
    },
    favicon: function() {
      Favicon["switch"]();
      Unread.update(true);
      return this.nextElementSibling.innerHTML = "<img src=" + Favicon.unreadSFW + "> <img src=" + Favicon.unreadNSFW + "> <img src=" + Favicon.unreadDead + ">";
    },
    "export": function() {
      var a, data, now, output;
      now = Date.now();
      data = {
        version: Main.version,
        date: now,
        Conf: Conf,
        WatchedThreads: $.get('watched', {})
      };
      a = $.el('a', {
        className: 'warning',
        textContent: 'Save me!',
        download: "4chan X v" + Main.version + "-" + now + ".json",
        href: "data:application/json;base64," + (btoa(unescape(encodeURIComponent(JSON.stringify(data))))),
        target: '_blank'
      });
      if ($.engine !== 'gecko') {
        a.click();
        return;
      }
      output = this.parentNode.nextElementSibling;
      output.innerHTML = null;
      return $.add(output, a);
    },
    "import": function() {
      return this.nextElementSibling.click();
    },
    onImport: function() {
      var file, output, reader;
      if (!(file = this.files[0])) {
        return;
      }
      output = this.parentNode.nextElementSibling;
      if (!confirm('Your current settings will be entirely overwritten, are you sure?')) {
        output.textContent = 'Import aborted.';
        return;
      }
      reader = new FileReader();
      reader.onload = function(e) {
        var data, err;
        try {
          data = JSON.parse(e.target.result);
          Options.loadSettings(data);
          if (confirm('Import successful. Refresh now?')) {
            return window.location.reload();
          }
        } catch (_error) {
          err = _error;
          return output.textContent = 'Import failed due to an error.';
        }
      };
      return reader.readAsText(file);
    },
    loadSettings: function(data) {
      var key, val, _ref;
      _ref = data.Conf;
      for (key in _ref) {
        val = _ref[key];
        $.set(key, val);
      }
      return $.set('watched', data.WatchedThreads);
    }
  };

  Updater = {
    init: function() {
      var checkbox, checked, dialog, html, input, name, title, _i, _len, _ref;
      html = '<div class=move><span id=count></span> <span id=timer></span></div>';
      checkbox = Config.updater.checkbox;
      for (name in checkbox) {
        title = checkbox[name][1];
        checked = Conf[name] ? 'checked' : '';
        html += "<div><label title='" + title + "'>" + name + "<input name='" + name + "' type=checkbox " + checked + "></label></div>";
      }
      checked = Conf['Auto Update'] ? 'checked' : '';
      html += "      <div><label title='Controls whether *this* thread automatically updates or not'>Auto Update This<input name='Auto Update This' type=checkbox " + checked + "></label></div>      <div><label>Interval (s)<input type=number name=Interval class=field min=5></label></div>      <div><input value='Update Now' type=button name='Update Now'></div>";
      dialog = UI.dialog('updater', 'bottom: 0; right: 0;', html);
      this.count = $('#count', dialog);
      this.timer = $('#timer', dialog);
      this.thread = $.id("t" + g.THREAD_ID);
      this.lastModified = '0';
      _ref = $$('input', dialog);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        if (input.type === 'checkbox') {
          $.on(input, 'click', $.cb.checked);
        }
        switch (input.name) {
          case 'Scroll BG':
            $.on(input, 'click', this.cb.scrollBG);
            this.cb.scrollBG.call(input);
            break;
          case 'Verbose':
            $.on(input, 'click', this.cb.verbose);
            this.cb.verbose.call(input);
            break;
          case 'Auto Update This':
            $.on(input, 'click', this.cb.autoUpdate);
            this.cb.autoUpdate.call(input);
            break;
          case 'Interval':
            input.value = Conf['Interval'];
            $.on(input, 'change', this.cb.interval);
            this.cb.interval.call(input);
            break;
          case 'Update Now':
            $.on(input, 'click', this.update);
        }
      }
      $.add(d.body, dialog);
      $.on(d, 'QRPostSuccessful', this.cb.post);
      return $.on(d, 'visibilitychange', this.cb.visibility);
    },
    /*
    http://freesound.org/people/pierrecartoons1979/sounds/90112/
    cc-by-nc-3.0
    */

    audio: $.el('audio', {
      src: 'data:audio/wav;base64,UklGRjQDAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAc21wbDwAAABBAAADAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkYXRhzAIAAGMms8em0tleMV4zIpLVo8nhfSlcPR102Ki+5JspVEkdVtKzs+K1NEhUIT7DwKrcy0g6WygsrM2k1NpiLl0zIY/WpMrjgCdbPhxw2Kq+5Z4qUkkdU9K1s+K5NkVTITzBwqnczko3WikrqM+l1NxlLF0zIIvXpsnjgydZPhxs2ay95aIrUEkdUdC3suK8N0NUIjq+xKrcz002WioppdGm091pK1w0IIjYp8jkhydXPxxq2K295aUrTkoeTs65suK+OUFUIzi7xqrb0VA0WSoootKm0t5tKlo1H4TYqMfkiydWQBxm16+85actTEseS8y7seHAPD9TIza5yKra01QyWSson9On0d5wKVk2H4DYqcfkjidUQB1j1rG75KsvSkseScu8seDCPz1TJDW2yara1FYxWSwnm9Sn0N9zKVg2H33ZqsXkkihSQR1g1bK65K0wSEsfR8i+seDEQTxUJTOzy6rY1VowWC0mmNWoz993KVc3H3rYq8TklSlRQh1d1LS647AyR0wgRMbAsN/GRDpTJTKwzKrX1l4vVy4lldWpzt97KVY4IXbUr8LZljVPRCxhw7W3z6ZISkw1VK+4sMWvXEhSPk6buay9sm5JVkZNiLWqtrJ+TldNTnquqbCwilZXU1BwpKirrpNgWFhTaZmnpquZbFlbVmWOpaOonHZcXlljhaGhpZ1+YWBdYn2cn6GdhmdhYGN3lp2enIttY2Jjco+bnJuOdGZlZXCImJqakHpoZ2Zug5WYmZJ/bGlobX6RlpeSg3BqaW16jZSVkoZ0bGtteImSk5KIeG5tbnaFkJKRinxxbm91gY2QkIt/c3BwdH6Kj4+LgnZxcXR8iI2OjIR5c3J0e4WLjYuFe3VzdHmCioyLhn52dHR5gIiKioeAeHV1eH+GiYqHgXp2dnh9hIiJh4J8eHd4fIKHiIeDfXl4eHyBhoeHhH96eHmA'
    }),
    cb: {
      post: function() {
        if (!Conf['Auto Update This']) {
          return;
        }
        return setTimeout(Updater.update, 500);
      },
      visibility: function() {
        if (d.hidden) {
          return;
        }
        if (Updater.timer.textContent < -Conf['Interval']) {
          return Updater.set('timer', -Conf['Interval']);
        }
      },
      interval: function() {
        var val;
        val = parseInt(this.value, 10);
        this.value = val > 5 ? val : 5;
        $.cb.value.call(this);
        return Updater.set('timer', -Conf['Interval']);
      },
      verbose: function() {
        if (Conf['Verbose']) {
          Updater.set('count', '+0');
          return Updater.timer.hidden = false;
        } else {
          Updater.set('count', 'Thread Updater');
          Updater.count.className = '';
          return Updater.timer.hidden = true;
        }
      },
      autoUpdate: function() {
        if (Conf['Auto Update This'] = this.checked) {
          return Updater.timeoutID = setTimeout(Updater.timeout, 1000);
        } else {
          return clearTimeout(Updater.timeoutID);
        }
      },
      scrollBG: function() {
        return Updater.scrollBG = this.checked ? function() {
          return true;
        } : function() {
          return !d.hidden;
        };
      },
      buryDead: function() {
        Updater.set('timer', '');
        Updater.set('count', 404);
        Updater.count.className = 'warning';
        clearTimeout(Updater.timeoutID);
        g.dead = true;
        if (Conf['Unread Count']) {
          Unread.title = Unread.title.match(/^.+-/)[0] + ' 404';
        } else {
          d.title = d.title.match(/^.+-/)[0] + ' 404';
        }
        Unread.update(true);
        QR.abort();
        return $.event('ThreadUpdate', {
          404: true,
          threadID: g.THREAD_ID
        });
      },
      load: function() {
        switch (this.status) {
          case 404:
            Updater.cb.buryDead();
            break;
          case 0:
          case 304:
            /*
            Status Code 304: Not modified
            By sending the `If-Modified-Since` header we get a proper status code, and no response.
            This saves bandwidth for both the user and the servers and avoid unnecessary computation.
            */

            Updater.set('timer', -Conf['Interval']);
            if (Conf['Verbose']) {
              Updater.set('count', '+0');
              Updater.count.className = null;
            }
            break;
          case 200:
            Updater.lastModified = this.getResponseHeader('Last-Modified');
            var parsed_posts = JSON.parse(this.response).posts;
            if ('archived' in parsed_posts[0] && parsed_posts[0].archived === 1) {
              Updater.cb.buryDead();
            } else {
              Updater.cb.update(parsed_posts);
              Updater.set('timer', -Conf['Interval']);
            }
            break;
          default:
            Updater.set('timer', -Conf['Interval']);
            if (Conf['Verbose']) {
              Updater.set('count', this.statusText);
              Updater.count.className = 'warning';
            }
        }
        return delete Updater.request;
      },
      update: function(posts) {
        var count, id, lastPost, nodes, post, posterCount, scroll, spoilerRange, _i, _len, _ref;
        if (spoilerRange = posts[0].custom_spoiler) {
          Build.spoilerRange[g.BOARD] = spoilerRange;
        }
        if (Conf['Thread Stats'] && (posterCount = posts[0].unique_ips)) {
          ThreadStats.posterCount(posterCount);
        }
        lastPost = Updater.thread.lastElementChild;
        id = +lastPost.id.slice(2);
        nodes = [];
        _ref = posts.reverse();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          post = _ref[_i];
          if (post.no <= id) {
            break;
          }
          nodes.push(Build.postFromObject(post, g.BOARD));
        }
        count = nodes.length;
        if (Conf['Verbose']) {
          Updater.set('count', "+" + count);
          Updater.count.className = count ? 'new' : null;
        }
        
        if (count && Conf['Beep'] && d.hidden && (Unread.replies.length === 0)) {
          Updater.audio.play();
          //return;
        }
        scroll = Conf['Scrolling'] && Updater.scrollBG() && lastPost.getBoundingClientRect().bottom - d.documentElement.clientHeight < 25;
        $.add(Updater.thread, nodes.reverse());
        if (scroll) {
          nodes[0].scrollIntoView();
        }

        return $.event('ThreadUpdate', {
          404: false,
          threadID: g.THREAD_ID,
          newPosts: nodes.map(function(data) {
            return data.id.replace('pc', g.BOARD + '.');
          })
        });
      }
    },
    set: function(name, text) {
      var el, node;
      el = Updater[name];
      if (node = el.firstChild) {
        return node.data = text;
      } else {
        return el.textContent = text;
      }
    },
    timeout: function() {
      var n;
      Updater.timeoutID = setTimeout(Updater.timeout, 1000);
      n = 1 + Number(Updater.timer.firstChild.data);
      if (n === 0) {
        return Updater.update();
      } else if (n >= Conf['Interval']) {
        Updater.set('count', 'Retry');
        Updater.count.className = null;
        return Updater.update();
      } else {
        return Updater.set('timer', n);
      }
    },
    update: function() {
      var request, url;
      Updater.set('timer', 0);
      request = Updater.request;
      if (request) {
        request.onloadend = null;
        request.abort();
      }
      url = "//a.4cdn.org/" + g.BOARD + "/thread/" + g.THREAD_ID + ".json";
      return Updater.request = $.ajax(url, {
        onloadend: Updater.cb.load
      }, {
        headers: {
          'If-Modified-Since': Updater.lastModified
        }
      });
    }
  };

  Watcher = {
    init: function() {
      var favicon, html, input, _i, _len, _ref;
      html = '<div class=move>Thread Watcher</div>';
      this.dialog = UI.dialog('watcher', 'top: 50px; left: 0px;', html);
      $.add(d.body, this.dialog);
      _ref = $$('.op input');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        favicon = $.el('img', {
          className: 'favicon'
        });
        $.on(favicon, 'click', this.cb.toggle);
        $.before(input, favicon);
      }
      if (g.THREAD_ID === $.get('autoWatch', 0)) {
        this.watch(g.THREAD_ID);
        $["delete"]('autoWatch');
      } else {
        this.refresh();
      }
      $.on(d, 'QRPostSuccessful', this.cb.post);
      return $.sync('watched', this.refresh);
    },
    refresh: function(watched) {
      var board, div, favicon, id, link, nodes, props, watchedBoard, x, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      watched || (watched = $.get('watched', {}));
      nodes = [];
      for (board in watched) {
        _ref = watched[board];
        for (id in _ref) {
          props = _ref[id];
          x = $.el('a', {
            textContent: '×',
            href: 'javascript:;'
          });
          $.on(x, 'click', Watcher.cb.x);
          link = $.el('a', props);
          link.title = link.textContent;
          div = $.el('div');
          $.add(div, [x, $.tn(' '), link]);
          nodes.push(div);
        }
      }
      _ref1 = $$('div:not(.move)', Watcher.dialog);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        div = _ref1[_i];
        $.rm(div);
      }
      $.add(Watcher.dialog, nodes);
      watchedBoard = watched[g.BOARD] || {};
      _ref2 = $$('.favicon');
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        favicon = _ref2[_j];
        id = favicon.nextSibling.name;
        if (id in watchedBoard) {
          favicon.src = Favicon["default"];
        } else {
          favicon.src = Favicon.empty;
        }
      }
    },
    cb: {
      toggle: function() {
        return Watcher.toggle(this.parentNode);
      },
      x: function() {
        var thread;
        thread = this.nextElementSibling.pathname.split('/');
        return Watcher.unwatch(thread[3], thread[1]);
      },
      post: function(e) {
        var postID, threadID, _ref;
        _ref = e.detail, postID = _ref.postID, threadID = _ref.threadID;
        if (threadID === '0') {
          if (Conf['Auto Watch']) {
            return $.set('autoWatch', postID);
          }
        } else if (Conf['Auto Watch Reply']) {
          return Watcher.watch(threadID);
        }
      }
    },
    toggle: function(thread) {
      var id;
      id = $('.favicon + input', thread).name;
      return Watcher.watch(id) || Watcher.unwatch(id, g.BOARD);
    },
    unwatch: function(id, board) {
      var watched;
      watched = $.get('watched', {});
      delete watched[board][id];
      $.set('watched', watched);
      return Watcher.refresh();
    },
    watch: function(id) {
      var thread, watched, _name;
      thread = $.id("t" + id);
      if ($('.favicon', thread).src === Favicon["default"]) {
        return false;
      }
      watched = $.get('watched', {});
      watched[_name = g.BOARD] || (watched[_name] = {});
      watched[g.BOARD][id] = {
        href: "/" + g.BOARD + "/thread/" + id,
        textContent: Get.title(thread)
      };
      $.set('watched', watched);
      Watcher.refresh();
      return true;
    }
  };

  Anonymize = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var name, parent, trip;
      if (post.isInlined && !post.isCrosspost) {
        return;
      }
      name = $('.postInfo .name', post.el);
      name.textContent = 'Anonymous';
      if ((trip = name.nextElementSibling) && trip.className === 'postertrip') {
        $.rm(trip);
      }
      if ((parent = name.parentNode).className === 'useremail' && !/^mailto:sage$/i.test(parent.href)) {
        return $.replace(parent, name);
      }
    }
  };

  Sauce = {
    init: function() {
      var link, _i, _len, _ref;
      if (g.BOARD === 'f') {
        return;
      }
      this.links = [];
      _ref = Conf['sauces'].split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        if (link[0] === '#' || link.trim() === '') {
          continue;
        }
        this.links.push(this.createSauceLink(link.trim()));
      }
      if (!this.links.length) {
        return;
      }
      return Main.callbacks.push(this.node);
    },
    createSauceLink: function(link) {
      var domain, el, href, m;
      link = link.replace(/\$4/g, g.BOARD);
      domain = (m = link.match(/;text:(.+)$/)) ? m[1] : link.match(/(\w+)\.\w+\//)[1];
      href = link.replace(/;text:.+$/, '');
      el = $.el('a', {
        target: '_blank',
        textContent: domain
      });
      return function(img, isArchived) {
        var a;
        a = el.cloneNode(true);
        a.href = href.replace(/(\$\d)/g, function(parameter) {
          switch (parameter) {
            case '$1':
              return isArchived ? img.firstChild.src : 'http://i.4cdn.org' + img.pathname.replace(/(\d+)\..+$/, '$1s.jpg');
            case '$2':
              return img.href;
            case '$3':
              return encodeURIComponent(img.firstChild.dataset.md5);
            default:
              return parameter;
          }
        });
        return a;
      };
    },
    node: function(post) {
      var img, link, nodes, _i, _len, _ref;
      img = post.img;
      if (post.isInlined && !post.isCrosspost || !img) {
        return;
      }
      img = img.parentNode;
      nodes = [];
      _ref = Sauce.links;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        nodes.push($.tn('\u00A0'), link(img, post.isArchived));
      }
      return $.add(post.fileInfo, nodes);
    }
  };

  RevealSpoilers = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var img, s;
      img = post.img;
      if (!(img && $('.imgspoiler', post.el)) || post.isInlined && !post.isCrosspost || post.isArchived) {
        return;
      }
      img.removeAttribute('style');
      s = img.style;
      s.maxHeight = s.maxWidth = /\bop\b/.test(post["class"]) ? '250px' : '125px';
      /*if (post.fileInfo.firstElementChild) {
        post.fileInfo.firstElementChild.textContent = post.el.getElementsByClassName('fileText')[0].title;
      } else {
        post.fileInfo.textContent = post.fileInfo.textContent.replace('Spoiler Image', post.el.getElementsByClassName('fileText')[0].title);
      }*/
      return img.src = "//i.4cdn.org" + (img.parentNode.pathname.replace(/(\d+).+$/, '$1s.jpg'));
    }
  };

  Time = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var node;
      if (post.isInlined && !post.isCrosspost) {
        return;
      }
      node = $('.postInfo > .dateTime', post.el);
      Time.date = new Date(node.dataset.utc * 1000);
      return node.textContent = Time.funk();
    },
    funk: function() {
      return Conf['time'].replace(/%([A-Za-z])/g, function(s, c) {
        if (c in Time.formatters) {
          return Time.formatters[c]();
        } else {
          return s;
        }
      });
    },
    day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    zeroPad: function(n) {
      if (n < 10) {
        return '0' + n;
      } else {
        return n;
      }
    },
    formatters: {
      a: function() {
        return Time.day[Time.date.getDay()].slice(0, 3);
      },
      A: function() {
        return Time.day[Time.date.getDay()];
      },
      b: function() {
        return Time.month[Time.date.getMonth()].slice(0, 3);
      },
      B: function() {
        return Time.month[Time.date.getMonth()];
      },
      d: function() {
        return Time.zeroPad(Time.date.getDate());
      },
      e: function() {
        return Time.date.getDate();
      },
      H: function() {
        return Time.zeroPad(Time.date.getHours());
      },
      I: function() {
        return Time.zeroPad(Time.date.getHours() % 12 || 12);
      },
      k: function() {
        return Time.date.getHours();
      },
      l: function() {
        return Time.date.getHours() % 12 || 12;
      },
      m: function() {
        return Time.zeroPad(Time.date.getMonth() + 1);
      },
      M: function() {
        return Time.zeroPad(Time.date.getMinutes());
      },
      p: function() {
        if (Time.date.getHours() < 12) {
          return 'AM';
        } else {
          return 'PM';
        }
      },
      P: function() {
        if (Time.date.getHours() < 12) {
          return 'am';
        } else {
          return 'pm';
        }
      },
      S: function() {
        return Time.zeroPad(Time.date.getSeconds());
      },
      y: function() {
        return Time.date.getFullYear() - 2000;
      }
    }
  };

  RelativeDates = {
    INTERVAL: $.MINUTE,
    init: function() {
      Main.callbacks.push(this.node);
      return $.on(d, 'visibilitychange', this.flush);
    },
    node: function(post) {
      var dateEl, diff, utc;
      dateEl = $('.postInfo > .dateTime', post.el);
      dateEl.title = dateEl.textContent;
      utc = dateEl.dataset.utc * 1000;
      diff = Date.now() - utc;
      dateEl.textContent = RelativeDates.relative(diff);
      RelativeDates.setUpdate(dateEl, utc, diff);
      return RelativeDates.flush();
    },
    relative: function(diff) {
      var number, rounded, unit;
      unit = (number = diff / $.DAY) > 1 ? 'day' : (number = diff / $.HOUR) > 1 ? 'hour' : (number = diff / $.MINUTE) > 1 ? 'minute' : (number = diff / $.SECOND, 'second');
      rounded = Math.round(number);
      if (rounded !== 1) {
        unit += 's';
      }
      return "" + rounded + " " + unit + " ago";
    },
    stale: [],
    flush: $.debounce($.SECOND, function() {
      var now, update, _i, _len, _ref;
      if (d.hidden) {
        return;
      }
      now = Date.now();
      _ref = RelativeDates.stale;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        update = _ref[_i];
        update(now);
      }
      RelativeDates.stale = [];
      clearTimeout(RelativeDates.timeout);
      return RelativeDates.timeout = setTimeout(RelativeDates.flush, RelativeDates.INTERVAL);
    }),
    setUpdate: function(dateEl, utc, diff) {
      var markStale, setOwnTimeout, update;
      setOwnTimeout = function(diff) {
        var delay;
        delay = diff < $.MINUTE ? $.SECOND - (diff + $.SECOND / 2) % $.SECOND : diff < $.HOUR ? $.MINUTE - (diff + $.MINUTE / 2) % $.MINUTE : $.HOUR - (diff + $.HOUR / 2) % $.HOUR;
        return setTimeout(markStale, delay);
      };
      update = function(now) {
        if (d.contains(dateEl)) {
          diff = now - utc;
          dateEl.textContent = RelativeDates.relative(diff);
          return setOwnTimeout(diff);
        }
      };
      markStale = function() {
        return RelativeDates.stale.push(update);
      };
      return setOwnTimeout(diff);
    }
  };

  FileInfo = {
    init: function() {
      if (g.BOARD === 'f') {
        return;
      }
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var alt, filename, _ref, nameNode;
      if (post.isInlined && !post.isCrosspost || !post.fileInfo) {
        return;
      }
      alt = post.img.alt;
      nameNode = $('a', post.fileInfo);
      filename = nameNode.title || post.fileInfo.title || nameNode.textContent;
      FileInfo.data = {
        link: post.img.parentNode.href,
        spoiler: /^Spoiler/.test(nameNode.textContent),
        size: alt.match(/\d+\.?\d*/)[0],
        unit: alt.match(/\w+$/)[0],
        resolution: post.fileInfo.childNodes[2].textContent.match(/\d+x\d+|PDF/)[0],
        fullname: filename,
        shortname: Build.shortFilename(filename, post.ID === post.threadID)
      };
      post.fileInfo.setAttribute('data-filename', filename);
      return post.fileInfo.innerHTML = FileInfo.funk();
    },
    funk: function() {
      return Conf['fileInfo'].replace(/%(.)|[^%]+/g, function(s, c) {
        if (c in FileInfo.formatters) {
          return FileInfo.formatters[c]();
        } else {
          return Build.escape(s);
        }
      });
    },
    convertUnit: function(unitT) {
      var i, size, unitF, units;
      size = this.data.size;
      unitF = this.data.unit;
      if (unitF !== unitT) {
        units = ['B', 'KB', 'MB'];
        i = units.indexOf(unitF) - units.indexOf(unitT);
        if (unitT === 'B') {
          unitT = 'Bytes';
        }
        if (i > 0) {
          while (i-- > 0) {
            size *= 1024;
          }
        } else if (i < 0) {
          while (i++ < 0) {
            size /= 1024;
          }
        }
        if (size < 1 && size.toString().length > size.toFixed(2).length) {
          size = size.toFixed(2);
        }
      }
      return "" + size + " " + unitT;
    },
    formatters: {
      t: function() {
        return FileInfo.data.link.match(/\d+\.\w+$/)[0];
      },
      T: function() {
        return '<a href="' + Build.escape(FileInfo.data.link) + '" target="_blank">' + (this.t()) + '</a>';
      },
      l: function() {
        return '<a href="' + Build.escape(FileInfo.data.link) + '" target="_blank">' + (this.n()) + '</a>';
      },
      L: function() {
        return '<a href="' + Build.escape(FileInfo.data.link) + '" target="_blank">' + (this.N()) + '</a>';
      },
      n: function() {
        if (FileInfo.data.fullname === FileInfo.data.shortname) {
          return Build.escape(FileInfo.data.fullname);
        } else {
          return '<span class="fntrunc">' + Build.escape(FileInfo.data.shortname) + '</span><span class="fnfull">' + Build.escape(FileInfo.data.fullname) + '</span>';
        }
      },
      N: function() {
        return Build.escape(FileInfo.data.fullname);
      },
      p: function() {
        if (FileInfo.data.spoiler) {
          return 'Spoiler, ';
        } else {
          return '';
        }
      },
      s: function() {
        return "" + FileInfo.data.size + " " + FileInfo.data.unit;
      },
      B: function() {
        return FileInfo.convertUnit('B');
      },
      K: function() {
        return FileInfo.convertUnit('KB');
      },
      M: function() {
        return FileInfo.convertUnit('MB');
      },
      r: function() {
        return FileInfo.data.resolution;
      }
    }
  };

  Get = {
    cloneWithoutVideo: function(node) {
      var child, clone, k, len1, ref;
      if (node.tagName === 'VIDEO' && !node.dataset.md5) {
        return [];
      } else if (node.nodeType === Node.ELEMENT_NODE && $('video', node)) {
        clone = node.cloneNode(false);
        ref = node.childNodes;
        for (k = 0, len1 = ref.length; k < len1; k++) {
          child = ref[k];
          $.add(clone, this.cloneWithoutVideo(child));
        }
        return clone;
      } else {
        return node.cloneNode(true);
      }
    },
    postWithoutVideo: function(board, threadID, postID, root, cb) {
      var post, url;
      if (board === g.BOARD && (post = $.id("pc" + postID))) {
        $.add(root, Get.cleanPost(Get.cloneWithoutVideo(post)));
        return;
      }
      root.textContent = "Loading post No." + postID + "...";
      if (threadID) {
        return $.cache("//a.4cdn.org/" + board + "/thread/" + threadID + ".json", function() {
          return Get.parsePost(this, board, threadID, postID, root, cb);
        });
      } else if (url = Redirect.post(board, postID)) {
        return $.cache(url, function() {
          return Get.parseArchivedPost(this, board, postID, root, cb);
        });
      }
    },
    post: function(board, threadID, postID, root, cb) {
      var post, url;
      if (board === g.BOARD && (post = $.id("pc" + postID))) {
        $.add(root, Get.cleanPost(post.cloneNode(true)));
        return;
      }
      root.textContent = "Loading post No." + postID + "...";
      if (threadID) {
        return $.cache("//a.4cdn.org/" + board + "/thread/" + threadID + ".json", function() {
          return Get.parsePost(this, board, threadID, postID, root, cb);
        });
      } else if (url = Redirect.post(board, postID)) {
        return $.cache(url, function() {
          return Get.parseArchivedPost(this, board, postID, root, cb);
        });
      }
    },
    parsePost: function(req, board, threadID, postID, root, cb) {
      var post, posts, spoilerRange, status, url, _i, _len;
      status = req.status;
      if (status !== 200) {
        if (url = Redirect.post(board, postID)) {
          $.cache(url, function() {
            return Get.parseArchivedPost(this, board, postID, root, cb);
          });
        } else {
          $.addClass(root, 'warning');
          root.textContent = status === 404 ? "Thread No." + threadID + " 404'd." : "Error " + req.status + ": " + req.statusText + ".";
        }
        return;
      }
      posts = JSON.parse(req.response).posts;
      if (spoilerRange = posts[0].custom_spoiler) {
        Build.spoilerRange[board] = spoilerRange;
      }
      postID = +postID;
      for (_i = 0, _len = posts.length; _i < _len; _i++) {
        post = posts[_i];
        if (post.no === postID) {
          break;
        }
        if (post.no > postID) {
          if (url = Redirect.post(board, postID)) {
            $.cache(url, function() {
              return Get.parseArchivedPost(this, board, postID, root, cb);
            });
          } else {
            $.addClass(root, 'warning');
            root.textContent = "Post No." + postID + " was not found.";
          }
          return;
        }
      }
      $.replace(root.firstChild, Get.cleanPost(Build.postFromObject(post, board)));
      if (cb) {
        return cb();
      }
    },
    escape: function(text) {
      return (text == null) ? null : Build.escape(text);
    },
    parseArchivedPost: function(req, board, postID, root, cb) {
      var bq, comment, data, o, _ref;
      data = JSON.parse(req.response);
      if (data.error) {
        $.addClass(root, 'warning');
        root.textContent = data.error;
        return;
      }
      bq = $.el('blockquote', {
        textContent: data.comment
      });
      bq.innerHTML = bq.innerHTML.replace(/\n|\[\/?b\]|\[\/?spoiler\]|\[\/?code\]|\[\/?moot\]|\[\/?banned\]/g, function(text) {
        switch (text) {
          case '\n':
            return '<br>';
          case '[b]':
            return '<b>';
          case '[/b]':
            return '</b>';
          case '[spoiler]':
            return '<span class=spoiler>';
          case '[/spoiler]':
            return '</span>';
          case '[code]':
            return '<pre class=prettyprint>';
          case '[/code]':
            return '</pre>';
          case '[moot]':
            return '<div style="padding:5px;margin-left:.5em;border-color:#faa;border:2px dashed rgba(255,0,0,.1);border-radius:2px">';
          case '[/moot]':
            return '</div>';
          case '[banned]':
            return '<b style="color: red;">';
          case '[/banned]':
            return '</b>';
        }
      });
      comment = bq.innerHTML.replace(/(^|>)(&gt;[^<$]*)(<|$)/g, '$1<span class=quote>$2</span>$3');
      comment = comment.replace(/((&gt;){2}(&gt;\/[a-z\d]+\/)?\d+)/g, '<span class=deadlink>$1</span>');
      o = {
        postID: postID,
        threadID: Get.escape(data.thread_num),
        board: board,
        name: Get.escape(data.name),
        capcode: (function() {
          switch (data.capcode) {
            case 'M':
              return 'mod';
            case 'A':
              return 'admin';
            case 'D':
              return 'developer';
          }
        })(),
        tripcode: Get.escape(data.trip),
        uniqueID: Get.escape(data.poster_hash),
        email: data.email ? Get.escape(encodeURI(data.email)) : '',
        subject: Get.escape(data.title),
        flagCode: Get.escape(data.poster_country),
        flagName: data.poster_country_name ? Get.escape(data.poster_country_name) : '',
        date: Get.escape(data.fourchan_date),
        dateUTC: +data.timestamp,
        comment: comment
      };
      if ((_ref = data.media) != null ? _ref.media_filename : void 0) {
        o.file = {
          name: Get.escape(data.media.media_filename),
          timestamp: Get.escape(data.media.media_orig),
          url: Get.escape(data.media.media_link || data.media.remote_media_link),
          height: Get.escape(data.media.media_h),
          width: Get.escape(data.media.media_w),
          MD5: Get.escape(data.media.media_hash),
          size: Get.escape(data.media.media_size),
          turl: Get.escape(data.media.thumb_link || ("//i.4cdn.org/" + board + "/" + data.media.preview_orig)),
          theight: Get.escape(data.media.preview_h),
          twidth: Get.escape(data.media.preview_w),
          isSpoiler: data.media.spoiler === '1'
        };
      }
      $.replace(root.firstChild, Get.cleanPost(Build.post(o, true)));
      if (cb) {
        return cb();
      }
    },
    cleanPost: function(root) {
      var child, el, els, inline, inlined, now, post, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2;
      post = $('.post', root);
      _ref = Array.prototype.slice.call(root.childNodes);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child !== post) {
          $.rm(child);
        }
      }
      _ref1 = $$('.inline', post);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        inline = _ref1[_j];
        $.rm(inline);
      }
      _ref2 = $$('.inlined', post);
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        inlined = _ref2[_k];
        $.rmClass(inlined, 'inlined');
      }
      now = Date.now();
      els = $$('[id]', root);
      els.push(root);
      for (_l = 0, _len3 = els.length; _l < _len3; _l++) {
        el = els[_l];
        el.id = "" + now + "_" + el.id;
      }
      $.rmClass(root, 'forwarded');
      $.rmClass(root, 'qphl');
      $.rmClass(post, 'highlight');
      $.rmClass(post, 'qphl');
      root.hidden = post.hidden = false;
      return root;
    },
    title: function(thread) {
      var el, op, span;
      op = $('.op', thread);
      el = $('.postInfo .subject', op);
      if (!el.textContent) {
        el = $('blockquote', op);
        if (!el.textContent) {
          el = $('.nameBlock', op);
        }
      }
      span = $.el('span', {
        innerHTML: el.innerHTML.replace(/<br>/g, ' ')
      });
      return "/" + g.BOARD + "/ - " + (span.textContent.trim());
    }
  };

  Build = {
    escape: function(text) {
      return (text + '').replace(/[&"'<>]/g, function(c) {
        return {'&': '&amp;', "'": '&#039;', '"': '&quot;', '<': '&lt;', '>': '&gt;'}[c];
      });
    },
    spoilerRange: {},
    shortFilename: function(filename, isOP) {
      var threshold;
      threshold = isOP ? 40 : 30;
      if (filename.length - 4 > threshold) {
        return "" + filename.slice(0, threshold - 5) + "(...)." + filename.slice(-3);
      } else {
        return filename;
      }
    },
    postFromObject: function(data, board) {
      var o;
      o = {
        postID: data.no,
        threadID: data.resto || data.no,
        board: board,
        name: data.name,
        capcode: data.capcode,
        tripcode: data.trip,
        since4pass: data.since4pass,
        uniqueID: data.id,
        email: data.email ? encodeURI(data.email.replace(/&quot;/g, '"')) : '',
        subject: data.sub,
        flagCode: data.country,
        flagName: data.country_name,
        date: data.now,
        dateUTC: data.time,
        comment: data.com,
        isSticky: !!data.sticky,
        isClosed: !!data.closed
      };
      if (data.ext || data.filedeleted) {
        o.file = {
          name: data.filename + data.ext,
          timestamp: "" + data.tim + data.ext,
          url: board === 'f' ? "//i.4cdn.org/" + board + "/" + (encodeURIComponent(data.filename)) + data.ext : "//i.4cdn.org/" + board + "/" + data.tim + data.ext,
          height: data.h,
          width: data.w,
          MD5: data.md5,
          size: data.fsize,
          turl: "//i.4cdn.org/" + board + "/" + data.tim + "s.jpg",
          theight: data.tn_h,
          twidth: data.tn_w,
          isSpoiler: !!data.spoiler,
          isDeleted: !!data.filedeleted
        };
      }
      return Build.post(o);
    },
    post: function(o, isArchived) {
      /*
      This function contains code from 4chan-JS (https://github.com/4chan/4chan-JS).
      @license: https://github.com/4chan/4chan-JS/blob/master/LICENSE
      */

      var a, board, capcode, capcodeClass, capcodeStart, closed, comment, container, date, dateUTC, email, emailEnd, emailStart, ext, file, fileDims, fileHTML, fileInfo, fileSize, fileThumb, filename, flag, flagCode, flagName, href, imgSrc, isClosed, isOP, isSticky, name, postID, quote, shortFilename, spoilerRange, staticPath, sticky, since4pass, subject, threadID, tripcode, uniqueID, userID, _i, _len, _ref;
      postID = o.postID, threadID = o.threadID, board = o.board, name = o.name, capcode = o.capcode, tripcode = o.tripcode, since4pass = o.since4pass, uniqueID = o.uniqueID, email = o.email, subject = o.subject, flagCode = o.flagCode, flagName = o.flagName, date = o.date, dateUTC = o.dateUTC, isSticky = o.isSticky, isClosed = o.isClosed, comment = o.comment, file = o.file;
      isOP = postID === threadID;
      staticPath = '//s.4cdn.org';
      if (email) {
        emailStart = '<a href="mailto:' + email + '" class="useremail">';
        emailEnd = '</a>';
      } else {
        emailStart = '';
        emailEnd = '';
      }
      subject = '<span class="subject">' + (subject || '') + '</span>';
      userID = !capcode && uniqueID ? ' <span class="posteruid id_' + uniqueID + '">(ID: <span class="hand" title="Highlight posts by this ID">' + uniqueID + '</span>)</span> ' : '';
      switch (capcode) {
        case 'admin':
        case 'admin_highlight':
          capcodeClass = ' capcodeAdmin';
          capcodeStart = ' <strong class="capcode hand id_admin" title="Highlight posts by the Administrator">## Admin</strong>';
          capcode = ' <img src="' + staticPath + '/image/adminicon.gif" alt="This user is the 4chan Administrator." title="This user is the 4chan Administrator." class="identityIcon">';
          break;
        case 'mod':
          capcodeClass = ' capcodeMod';
          capcodeStart = ' <strong class="capcode hand id_mod" title="Highlight posts by Moderators">## Mod</strong>';
          capcode = ' <img src="' + staticPath + '/image/modicon.gif" alt="This user is a 4chan Moderator." title="This user is a 4chan Moderator." class="identityIcon">';
          break;
        case 'developer':
          capcodeClass = ' capcodeDeveloper';
          capcodeStart = ' <strong class="capcode hand id_developer" title="Highlight posts by Developers">## Developer</strong>';
          capcode = ' <img src="' + staticPath + '/image/developericon.gif" alt="This user is a 4chan Developer." title="This user is a 4chan Developer." class="identityIcon">';
          break;
        default:
          capcodeClass = '';
          capcodeStart = '';
          capcode = '';
      }
      flag = flagCode ? ' <span title="' + flagName + '" class="flag flag-' + flagCode.toLowerCase() + '"> </span>' : '';
      if (file != null ? file.isDeleted : void 0) {
        fileHTML = isOP ? '<div class="file" id="f' + postID + '"><div class="fileInfo"></div><span class="fileThumb"><img src="' + staticPath + '/image/filedeleted.gif" alt="File deleted." class="fileDeleted retina"></span></div>' : '<div id="f' + postID + '" class="file"><span class="fileThumb"><img src="' + staticPath + '/image/filedeleted-res.gif" alt="File deleted." class="fileDeletedRes retina"></span></div>';
      } else if (file) {
        ext = file.name.slice(-3);
        if (!file.twidth && !file.theight && ext === 'gif') {
          file.twidth = file.width;
          file.theight = file.height;
        }
        fileSize = $.bytesToString(file.size);
        fileThumb = file.turl;
        if (file.isSpoiler) {
          fileSize = 'Spoiler Image, ' + fileSize;
          if (!isArchived) {
            fileThumb = '//s.4cdn.org/image/spoiler';
            if (spoilerRange = Build.spoilerRange[board]) {
              fileThumb += '-' + board + Math.floor(1 + spoilerRange * Math.random());
            }
            fileThumb += '.png';
            file.twidth = file.theight = 100;
          }
        }
        imgSrc = board === 'f' ? '' : '<a class="fileThumb' + (file.isSpoiler ? ' imgspoiler' : '') + '" href="' + file.url + '" target="_blank"><img src="' + fileThumb + '" alt="' + fileSize + '" data-md5="' + file.MD5 + '" style="width:' + file.twidth + 'px;height:' + file.theight + 'px"></a>';
        filename = file.name.replace(/&(amp|#039|quot|lt|gt);/g, function (c) {
          return {'&amp;': '&', '&#039;': "'", '&quot;': '"', '&lt;': '<', '&gt;': '>'}[c];
        }).replace(/%22/g, '"');
        shortFilename = Build.escape(Build.shortFilename(filename));
        filename = Build.escape(filename);
        fileDims = ext === 'pdf' ? 'PDF' : '' + file.width + 'x' + file.height;
        fileInfo = '<div class="fileText" id="fT' + postID + '"' + (file.isSpoiler ? ' title="' + filename + '"' : '') + '>File: <a' + ((filename !== shortFilename && !file.isSpoiler) ? ' title="' + filename + '"' : '') + ' href="' + file.url + '" target="_blank">' + (file.isSpoiler ? 'Spoiler Image' : shortFilename) + '</a>-(' + fileSize + ', ' + fileDims + ')</div>';
        fileHTML = '<div class="file" id="f' + postID + '">' + fileInfo + imgSrc + '</div>';
      } else {
        fileHTML = '';
      }
      since4pass = since4pass ? ' <span title="Pass user since ' + since4pass + '" class="n-pu"></span>' : '';
      tripcode = tripcode ? ' <span class="postertrip">' + tripcode + '</span>' : '';
      sticky = isSticky ? ' <img src="//s.4cdn.org/image/sticky.gif" alt="Sticky" title="Sticky" style="height:16px;width:16px">' : '';
      closed = isClosed ? ' <img src="//s.4cdn.org/image/closed.gif" alt="Closed" title="Closed" style="height:16px;width:16px">' : '';
      container = $.el('div', {
        id: 'pc' + postID,
        className: 'postContainer ' + (isOP ? 'op' : 'reply') + 'Container',
        innerHTML: (isOP ? '' : '<div class="sideArrows" id="sa' + postID + '">&gt;&gt;</div>') + '<div id="p' + postID + '" class="post ' + (isOP ? 'op' : 'reply') + (capcode === 'admin_highlight' ? ' highlightPost' : '') + '"><div class="postInfoM mobile" id="pim' + postID + '"><span class="nameBlock' + capcodeClass + '"><span class="name">' + (name || '') + '</span>' + tripcode + capcodeStart + capcode + since4pass + userID + flag + sticky + closed + '<br>' + subject + '</span><span class="dateTime postNum" data-utc="' + dateUTC + '">' + date + '<br><em><a href="/' + board + '/thread/' + threadID + '#p' + postID + '">No.</a><a href="' + (g.REPLY && g.THREAD_ID === threadID ? 'javascript:quote(' + postID + ')' : '/' + board + '/thread/' + threadID + '#q' + postID) + '">' + postID + '</a></em></span></div>' + (isOP ? fileHTML : '') + '<div class="postInfo desktop" id="pi' + postID + '"><input type="checkbox" name="' + postID + '" value="delete"> ' + subject + ' <span class="nameBlock' + capcodeClass + '">' + emailStart + '<span class="name">' + (name || '') + '</span>' + tripcode + capcodeStart + emailEnd + capcode + since4pass + userID + flag + sticky + closed + ' </span> <span class="dateTime" data-utc="' + dateUTC + '">' + date + '</span> <span class="postNum desktop"><a href="/' + board + '/thread/' + threadID + '#p' + postID + '" title="Link to this post">No.</a><a href="' + (g.REPLY && +g.THREAD_ID === threadID ? 'javascript:quote(' + postID + ')' : '/' + board + '/thread/' + threadID + '#q' + postID) + '" title="Reply to this post">' + postID + '</a></span></div>' + (isOP ? '' : fileHTML) + '<blockquote class="postMessage" id="m' + postID + '">' + (comment || '') + '</blockquote> </div>'
      });
      _ref = $$('.quotelink', container);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        href = quote.getAttribute('href');
        if (href[0] === '/') {
          continue;
        }
        quote.href = '/' + board + '/thread/' + threadID + href;
      }
      return container;
    }
  };

  TitlePost = {
    init: function() {
      if(Conf['Post in Title']) {
        return d.title = Get.title();
      }
      var boardTitle;
      return d.title = ((boardTitle = $('.boardTitle', d)) && boardTitle.textContent) || ((boardTitle = $('#boardNavDesktop .current', d)) && "/" + g.BOARD + "/ - " + boardTitle.title) || ("/" + g.BOARD + "/");
    }
  };

  QuoteBacklink = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    funk: function(id) {
      return Conf['backlink'].replace(/%id/g, id);
    },
    node: function(post) {
      var a, container, el, link, qid, quote, quotes, _i, _len, _ref;
      if (post.isInlined) {
        return;
      }
      quotes = {};
      _ref = post.quotes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        if (quote.parentNode.parentNode.className === 'capcodeReplies') {
          break;
        }
        if ((quote.hostname === 'boards.4chan.org' || quote.hostname === 'boards.4channel.org') && !/catalog$/.test(quote.pathname) && (qid = quote.hash.slice(2))) {
          quotes[qid] = true;
        }
      }
      a = $.el('a', {
        href: "/" + g.BOARD + "/thread/" + post.threadID + "#p" + post.ID,
        className: post.el.hidden ? 'filtered backlink' : 'backlink',
        textContent: QuoteBacklink.funk(post.ID)
      });
      for (qid in quotes) {
        if (!(el = $.id("pi" + qid)) || !Conf['OP Backlinks'] && /\bop\b/.test(el.parentNode.className)) {
          continue;
        }
        link = a.cloneNode(true);
        if (Conf['Quote Preview']) {
          $.on(link, 'mouseover', QuotePreview.mouseover);
        }
        if (Conf['Quote Inline']) {
          $.on(link, 'click', QuoteInline.toggle);
        }
        if (!(container = $.id("blc" + qid))) {
          container = $.el('span', {
            className: 'container',
            id: "blc" + qid
          });
          $.add(el, container);
        }
        $.add(container, [$.tn(' '), link]);
      }
    }
  };

  QuoteInline = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var quote, _i, _j, _len, _len1, _ref, _ref1;
      _ref = post.quotes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        if (!(quote.hash && (quote.hostname === 'boards.4chan.org' || quote.hostname === 'boards.4channel.org') && !/catalog$/.test(quote.pathname) || /\bdeadlink\b/.test(quote.className))) {
          continue;
        }
        $.on(quote, 'click', QuoteInline.toggle);
      }
      _ref1 = post.backlinks;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        quote = _ref1[_j];
        $.on(quote, 'click', QuoteInline.toggle);
      }
    },
    toggle: function(e) {
      var id;
      if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.button !== 0) {
        return;
      }
      e.preventDefault();
      id = this.dataset.id || this.hash.slice(2);
      if (/\binlined\b/.test(this.className)) {
        QuoteInline.rm(this, id);
      } else {
        if ($.x("ancestor::div[contains(@id,'p" + id + "')]", this)) {
          return;
        }
        QuoteInline.add(this, id);
      }
      return this.classList.toggle('inlined');
    },
    add: function(q, id) {
      var board, el, i, inline, isBacklink, path, postID, root, threadID;
      if (q.host === 'boards.4chan.org' || q.host === 'boards.4channel.org') {
        path = q.pathname.split('/');
        board = path[1];
        threadID = path[3];
        postID = id;
      } else {
        board = q.dataset.board;
        threadID = 0;
        postID = q.dataset.id;
      }
      el = board === g.BOARD ? $.id("p" + postID) : false;
      inline = $.el('div', {
        id: "i" + postID,
        className: el ? 'inline' : 'inline crosspost'
      });
      root = (isBacklink = /\bbacklink\b/.test(q.className)) ? q.parentNode : $.x('ancestor-or-self::*[parent::blockquote][1]', q);
      $.after(root, inline);
      Get.post(board, threadID, postID, inline);
      if (!el) {
        return;
      }
      if (isBacklink && Conf['Forward Hiding']) {
        $.addClass(el.parentNode, 'forwarded');
        ++el.dataset.forwarded || (el.dataset.forwarded = 1);
      }
      if ((i = Unread.replies.indexOf(el)) !== -1) {
        Unread.replies.splice(i, 1);
        return Unread.update(true);
      }
    },
    rm: function(q, id) {
      var div, inlined, _i, _len, _ref;
      div = $.x("following::div[@id='i" + id + "']", q);
      $.rm(div);
      if (!Conf['Forward Hiding']) {
        return;
      }
      _ref = $$('.backlink.inlined', div);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        inlined = _ref[_i];
        div = $.id(inlined.hash.slice(1));
        if (!--div.dataset.forwarded) {
          $.rmClass(div.parentNode, 'forwarded');
        }
      }
      if (/\bbacklink\b/.test(q.className)) {
        div = $.id("p" + id);
        if (!--div.dataset.forwarded) {
          return $.rmClass(div.parentNode, 'forwarded');
        }
      }
    }
  };

  QuotePreview = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var quote, _i, _j, _len, _len1, _ref, _ref1;
      _ref = post.quotes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        if (!(quote.hash && (quote.hostname === 'boards.4chan.org' || quote.hostname === 'boards.4channel.org') && !/catalog$/.test(quote.pathname) || /\bdeadlink\b/.test(quote.className))) {
          continue;
        }
        $.on(quote, 'mouseover', QuotePreview.mouseover);
      }
      _ref1 = post.backlinks;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        quote = _ref1[_j];
        $.on(quote, 'mouseover', QuotePreview.mouseover);
      }
    },
    mouseover: function(e) {
      var board, el, path, postID, qp, quote, quoterID, threadID, _i, _len, _ref;
      if (/\binlined\b/.test(this.className)) {
        return;
      }
      if (qp = $.id('qp')) {
        if (qp === UI.el) {
          delete UI.el;
        }
        $.rm(qp);
      }
      if (UI.el) {
        return;
      }
      if (this.host === 'boards.4chan.org' || this.host === 'boards.4channel.org') {
        path = this.pathname.split('/');
        board = path[1];
        threadID = path[3];
        postID = this.hash.slice(2);
      } else {
        board = this.dataset.board;
        threadID = 0;
        postID = this.dataset.id;
      }
      qp = UI.el = $.el('div', {
        id: 'qp',
        className: 'reply dialog'
      });
      UI.hover(e);
      $.add(d.body, qp);
      if (board === g.BOARD) {
        el = $.id("p" + postID);
      }
      Get.postWithoutVideo(board, threadID, postID, qp, function() {
        var bq, img, post;
        bq = $('blockquote', qp);
        Main.prettify(bq);
        post = {
          el: qp,
          blockquote: bq,
          isArchived: /\barchivedPost\b/.test(qp.className)
        };
        if (img = $('img[data-md5]', qp)) {
          post.fileInfo = img.parentNode.previousElementSibling;
          post.img = img;
        }
        if (Conf['Always CDN']) {
          AlwaysCdn.node(post);
        }
        if (Conf['Reveal Spoilers']) {
          RevealSpoilers.node(post);
        }
        if (Conf['Image Auto-Gif']) {
          AutoGif.node(post);
        }
        if (Conf['Replace PNG']) {
          ReplacePng.node(post);
        }
        if (Conf['Replace JPG']) {
          ReplaceJpg.node(post);
        }
        if (Conf['Time Formatting']) {
          Time.node(post);
        }
        if (Conf['File Info Formatting']) {
          FileInfo.node(post);
        }
        if (Conf['Resurrect Quotes']) {
          Quotify.node(post);
        }
        if (Conf['Anonymize']) {
          return Anonymize.node(post);
        }
      });
      $.on(this, 'mousemove', UI.hover);
      $.on(this, 'mouseout click', QuotePreview.mouseout);
      if (!el) {
        return;
      }
      if (Conf['Quote Highlighting']) {
        if (/\bop\b/.test(el.className)) {
          $.addClass(el.parentNode, 'qphl');
        } else {
          $.addClass(el, 'qphl');
        }
      }
      quoterID = $.x('ancestor::*[@id][1]', this).id.match(/\d+$/)[0];
      _ref = $$('.quotelink, .backlink', qp);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        if (quote.hash.slice(2) === quoterID) {
          $.addClass(quote, 'forwardlink');
        }
      }
    },
    mouseout: function(e) {
      var el;
      UI.hoverend();
      if (el = $.id(this.hash.slice(1))) {
        $.rmClass(el, 'qphl');
        $.rmClass(el.parentNode, 'qphl');
      }
      $.off(this, 'mousemove', UI.hover);
      return $.off(this, 'mouseout click', QuotePreview.mouseout);
    }
  };
  
  /* Add (You) to posts function */
  QuoteYou = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var quote, _i, _len, _ref;
      if (post.isInlined && !post.isCrosspost) {
        return;
      }
      _ref = post.quotes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        yourPostsFromStorage = JSON.parse(sessionStorage.getItem('yourPosts'));
        if (yourPostsFromStorage) {
			var yourPostsFromStorageLength = yourPostsFromStorage.length;
			for (var tempI = 0; tempI < yourPostsFromStorageLength; tempI++) {
				if (quote.hash.slice(2) === yourPostsFromStorage[tempI]) {
					$.add(quote, $.tn('\u00A0(You)'));
				}
			}
		}
	  }
    }
  };

  QuoteOP = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var quote, _i, _len, _ref;
      if (post.isInlined && !post.isCrosspost) {
        return;
      }
      _ref = post.quotes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        if (quote.hash.slice(2) === post.threadID) {
          $.add(quote, $.tn('\u00A0(OP)'));
        }
      }
    }
  };

  QuoteCT = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var path, quote, _i, _len, _ref;
      if (post.isInlined && !post.isCrosspost) {
        return;
      }
      _ref = post.quotes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        if (!(quote.hash && (quote.hostname === 'boards.4chan.org' || quote.hostname === 'boards.4channel.org') && !/catalog$/.test(quote.pathname))) {
          continue;
        }
        path = quote.pathname.split('/');
        if (path[1] === g.BOARD && path[3] !== post.threadID) {
          $.add(quote, $.tn('\u00A0(Cross-thread)'));
        }
      }
    }
  };

  Quotify = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var a, board, deadlink, id, m, postBoard, quote, _i, _len, _ref, _ref1;
      if (post.isInlined && !post.isCrosspost) {
        return;
      }
      _ref = $$('.deadlink', post.blockquote);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        deadlink = _ref[_i];
        if (deadlink.parentNode.className === 'prettyprint') {
          $.replace(deadlink, Array.prototype.slice.call(deadlink.childNodes));
          continue;
        }
        quote = deadlink.textContent;
        a = $.el('a', {
          textContent: "" + quote + "\u00A0(Dead)"
        });
        if (!(id = (_ref1 = quote.match(/\d+$/)) != null ? _ref1[0] : void 0)) {
          continue;
        }
        if (m = quote.match(/^>>>\/([a-z\d]+)/)) {
          board = m[1];
        } else if (postBoard) {
          board = postBoard;
        } else {
          board = postBoard = $('a[title="Link to this post"]', post.el).pathname.split('/')[1];
        }
        if (board === g.BOARD && $.id("p" + id)) {
          a.href = "#p" + id;
          a.className = 'quotelink';
        } else {
          a.href = Redirect.to({
            board: board,
            threadID: 0,
            postID: id
          });
          a.className = 'deadlink';
          a.target = '_blank';
          if (Redirect.post(board, id)) {
            $.addClass(a, 'quotelink');
            a.setAttribute('data-board', board);
            a.setAttribute('data-id', id);
          }
        }
        $.replace(deadlink, a);
      }
    }
  };

  DeleteLink = {
    init: function() {
      var aImage, aPost, children, div;
      div = $.el('div', {
        className: 'delete_link',
        textContent: 'Delete'
      });
      aPost = $.el('a', {
        className: 'delete_post',
        href: 'javascript:;'
      });
      aImage = $.el('a', {
        className: 'delete_image',
        href: 'javascript:;'
      });
      children = [];
      children.push({
        el: aPost,
        open: function() {
          aPost.textContent = 'Post';
          $.on(aPost, 'click', DeleteLink["delete"]);
          return true;
        }
      });
      children.push({
        el: aImage,
        open: function(post) {
          if (!post.img) {
            return false;
          }
          aImage.textContent = 'Image';
          $.on(aImage, 'click', DeleteLink["delete"]);
          return true;
        }
      });
      Menu.addEntry({
        el: div,
        open: function(post) {
          var node, seconds;
          if (post.isArchived) {
            return false;
          }
          node = div.firstChild;
          if (seconds = DeleteLink.cooldown[post.ID]) {
            node.textContent = "Delete (" + seconds + ")";
            DeleteLink.cooldown.el = node;
          } else {
            node.textContent = 'Delete';
            delete DeleteLink.cooldown.el;
          }
          return true;
        },
        children: children
      });
      return $.on(d, 'QRPostSuccessful', this.cooldown.start);
    },
    "delete": function() {
      var board, form, id, m, menu, pwd, self;
      menu = $.id('menu');
      id = menu.dataset.id;
      if (DeleteLink.cooldown[id]) {
        return;
      }
      $.off(this, 'click', DeleteLink["delete"]);
      this.textContent = 'Deleting...';
      pwd = (m = d.cookie.match(/4chan_pass=([^;]+)/)) ? decodeURIComponent(m[1]) : $.id('delPassword').value;
      board = $('a[title="Link to this post"]', $.id(menu.dataset.rootid)).pathname.split('/')[1];
      self = this;
      form = {
        mode: 'usrdel',
        onlyimgdel: /\bdelete_image\b/.test(this.className),
        pwd: pwd
      };
      form[id] = 'delete';
      return $.ajax($.id('delform').action.replace("/" + g.BOARD + "/", "/" + board + "/"), {
        onload: function() {
          return DeleteLink.load(self, this.response);
        },
        onerror: function() {
          return DeleteLink.error(self);
        }
      }, {
        form: $.formData(form)
      });
    },
    load: function(self, html) {
      var doc, msg, s;
      doc = d.implementation.createHTMLDocument('');
      doc.documentElement.innerHTML = html;
      if (doc.title === '4chan - Banned') {
        s = 'Banned!';
      } else if (msg = doc.getElementById('errmsg')) {
        s = msg.textContent;
        $.on(self, 'click', DeleteLink["delete"]);
      } else {
        s = 'Deleted';
      }
      return self.textContent = s;
    },
    error: function(self) {
      self.textContent = 'Connection error, please retry.';
      return $.on(self, 'click', DeleteLink["delete"]);
    },
    cooldown: {
      start: function(e) {
        var seconds;
        seconds = 60;
        return DeleteLink.cooldown.count(e.detail.postID, seconds, seconds);
      },
      count: function(postID, seconds, length) {
        var el;
        if (!((0 <= seconds && seconds <= length))) {
          return;
        }
        setTimeout(DeleteLink.cooldown.count, 1000, postID, seconds - 1, length);
        el = DeleteLink.cooldown.el;
        if (seconds === 0) {
          if (el != null) {
            el.textContent = 'Delete';
          }
          delete DeleteLink.cooldown[postID];
          delete DeleteLink.cooldown.el;
          return;
        }
        if (el != null) {
          el.textContent = "Delete (" + seconds + ")";
        }
        return DeleteLink.cooldown[postID] = seconds;
      }
    }
  };

  ReportLink = {
    init: function() {
      var a;
      a = $.el('a', {
        className: 'report_link',
        href: 'javascript:;',
        textContent: 'Report this post'
      });
      $.on(a, 'click', this.report);
      return Menu.addEntry({
        el: a,
        open: function(post) {
          return post.isArchived === false;
        }
      });
    },
    report: function() {
      var a, id, set, url;
      a = $('a[title="Link to this post"]', $.id(this.parentNode.dataset.rootid));
      url = "//sys.4chan.org/" + (a.pathname.split('/')[1]) + "/imgboard.php?mode=report&no=" + this.parentNode.dataset.id;
      id = Date.now();
      set = "toolbar=0,scrollbars=1,location=0,status=1,menubar=0,resizable=1,";
      if (Conf['Alternative captcha']) {
          url += "&altc=1";
          set += 'width=350,height=275';
      } else {
          set += 'width=400,height=550';
      }
      return window.open(url, id, set);
    }
  };

  DownloadLink = {
    init: function() {
      var a;
      if ($.el('a').download === void 0) {
        return;
      }
      a = $.el('a', {
        className: 'download_link',
        textContent: 'Download file'
      });
      if($.engine === "gecko" || $.engine === "webkit") {
        $.on(a, 'click', function(e) {
          if (this.protocol === 'blob:') {
            return true;
          }
          e.preventDefault();
          return DownloadLink.firefoxDL(this.href, (function(_this) {
            return function(blob) {
              if (blob) {
                _this.href = URL.createObjectURL(blob);
                return _this.click();
              }
            };
          })(this));
        });
      }
      return Menu.addEntry({
        el: a,
        open: function(post) {
          if (!post.img) {
            return false;
          }
          a.href = post.img.parentNode.href;
          a.download = (post.fileInfo && post.fileInfo.getAttribute('data-filename'));
          return true;
        }
      });
    },
    firefoxDL: (function() {
        var makeBlob;
        makeBlob = function(urlBlob, contentType, contentDisposition, url) {
          var blob, match, mime, name, _ref, _ref1, _ref2;
          name = (_ref = url.match(/([^\/]+)\/*$/)) != null ? _ref[1] : void 0;
          mime = (contentType != null ? contentType.match(/[^;]*/)[0] : void 0) || 'application/octet-stream';
          match = (contentDisposition != null ? (_ref1 = contentDisposition.match(/\bfilename\s*=\s*"((\\"|[^"])+)"/i)) != null ? _ref1[1] : void 0 : void 0) || (contentType != null ? (_ref2 = contentType.match(/\bname\s*=\s*"((\\"|[^"])+)"/i)) != null ? _ref2[1] : void 0 : void 0);
          if (match) {
            name = match.replace(/\\"/g, '"');
          }
          blob = new Blob([urlBlob], {
            type: mime
          });
          blob.name = name;
          return blob;
        };
        return function(url, cb) {
          return GM_xmlhttpRequest({
            method: "GET",
            url: url,
            overrideMimeType: "text/plain; charset=x-user-defined",
            onload: function(xhr) {
              var contentDisposition, contentType, data, i, r, _ref, _ref1;
              r = xhr.responseText;
              data = new Uint8Array(r.length);
              i = 0;
              while (i < r.length) {
                data[i] = r.charCodeAt(i);
                i++;
              }
              contentType = (_ref = xhr.responseHeaders.match(/Content-Type:\s*(.*)/i)) != null ? _ref[1] : void 0;
              contentDisposition = (_ref1 = xhr.responseHeaders.match(/Content-Disposition:\s*(.*)/i)) != null ? _ref1[1] : void 0;
              return cb(makeBlob(data, contentType, contentDisposition, url));
            },
            onerror: function() {
              return cb(null);
            }
          });
        };
      })()
  };

  ArchiveLink = {
    init: function() {
      var div, entry, type, _i, _len, _ref;
      div = $.el('div', {
        textContent: 'Archive'
      });
      entry = {
        el: div,
        open: function(post) {
          var path;
          path = $('a[title="Link to this post"]', post.el).pathname.split('/');
          if ((Redirect.to({
            board: path[1],
            threadID: path[3],
            postID: post.ID
          })) === ("//boards.4chan.org/" + path[1] + "/")) {
            return false;
          }
          post.info = [path[1], path[3]];
          return true;
        },
        children: []
      };
      _ref = [['Post', 'apost'], ['Name', 'name'], ['Tripcode', 'tripcode'], ['Subject', 'subject'], ['Filename', 'filename'], ['Image MD5', 'md5']];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        entry.children.push(this.createSubEntry(type[0], type[1]));
      }
      return Menu.addEntry(entry);
    },
    createSubEntry: function(text, type) {
      var el, open;
      el = $.el('a', {
        textContent: text,
        target: '_blank'
      });
      open = function(post) {
        var value;
        if (type === 'apost') {
          el.href = Redirect.to({
            board: post.info[0],
            threadID: post.info[1],
            postID: post.ID
          });
          return true;
        }
        value = Filter[type](post);
        if (!value) {
          return false;
        }
        return el.href = Redirect.to({
          board: post.info[0],
          type: type,
          value: value,
          isSearch: true
        });
      };
      return {
        el: el,
        open: open
      };
    }
  };

  ThreadStats = {
    init: function() {
      var dialog;
      dialog = UI.dialog('stats', 'bottom: 0; left: 0;', '<div class=move><span id=postcount>0</span> / <span id=imagecount>0</span><span id=postercount></span><span id=currentpage></span></div>');
      dialog.className = 'dialog';
      $.add(d.body, dialog);
      this.posts = this.images = 0;
      this.imgLimit = (function() {
        switch (g.BOARD) {
          case 'a':
          case 'b':
          case 'v':
          case 'co':
          case 'mlp':
            return 251;
          case 'jp':
            return 301;
          case 'vg':
            return 376;
          default:
            return 151;
        }
      })();
      this.pageGradients = {
        10 : 'FF0000',
        9 : 'E50019',
        8 : 'CC0033',
        7 : 'B2004C',
        6 : '990066',
        5 : '7F007F',
        4 : '650099',
        3 : '4C00B2',
        2 : '3300CC',
        1 : '1900E5'
      };
      this.pageposGradients = {
        15 : 'FF0011',
        14 : 'EE0022',
        13 : 'DD0033',
        12 : 'CC0044',
        11 : 'BB0055',
        10 : 'AA0066',
        9 : '990077',
        8 : '880088',
        7 : '770099',
        6 : '6600AA',
        5 : '5500BB',
        4 : '4400CC',
        3 : '3300DD',
        2 : '2200EE',
        1 : '1100FF'
      };
      if (Conf['Current Page']) {
        this.pageInterval = setInterval(ThreadStats.fetchPages, 2 * $.MINUTE);
        setTimeout(ThreadStats.fetchPages, 2 * $.SECOND); /* Interval starts with the timeout, so execute it this way the first time */
      }
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var imgcount;
      if (post.isInlined) {
        return;
      }
      $.id('postcount').textContent = ++ThreadStats.posts;
      if (!post.img) {
        return;
      }
      imgcount = $.id('imagecount');
      imgcount.textContent = ++ThreadStats.images;
      if (ThreadStats.images > ThreadStats.imgLimit) {
        return $.addClass(imgcount, 'warning');
      }
    },
    posterCount: function(poster_count) {
      $.id('postercount').textContent = ' / ' + poster_count;
    },
    fetchPages: function() {
      var request, url;
      request = ThreadStats.request;
      if (request) {
        request.onloadend = null;
        request.abort();
      }
      url = "//a.4cdn.org/" + g.BOARD + "/threads.json";
      return ThreadStats.request = $.ajax(url, {
        onloadend: ThreadStats.updatePage
      });
    },
    updatePage: function() {
      if (!(Conf['Current Page'] && this.status === 200)) {
        return delete ThreadStats.request;
      }
      var newcontent, page, page_color, pagepos, pagepos_color, thread, _i, _j, _len, _len1, _ref1;
      var parsed_threads = JSON.parse(this.response);
      for (_i = 0, _len = parsed_threads.length; _i < _len; _i++) {
        page = parsed_threads[_i];
        _ref1 = page.threads;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          thread = _ref1[_j];
          if (!(thread.no == g.THREAD_ID)) {
            continue; /* == because g.THREAD_ID is a string */
          }
          page_color = page.page in ThreadStats.pageGradients ? ThreadStats.pageGradients[page.page] : '000000';
          newcontent = ' / ' + '<span style="color:#' + page_color + ';">' + parseInt(page.page) + '</span>'; /* parseInt just to escape */
          if (Conf['Current Page Position']) {
            pagepos = _j + 1;
            pagepos_color = pagepos in ThreadStats.pageposGradients ? ThreadStats.pageposGradients[pagepos] : '000000';
            newcontent += ' (' + '<span style="color:#' + pagepos_color + ';">' + pagepos + '</span>' + '∕' + _ref1.length + ')';
          }
          $.id('currentpage').innerHTML = newcontent;
          return delete ThreadStats.request;
        }
      }
      /* If we get here the thread was not found in the catalog, stop updating */
      clearInterval(ThreadStats.pageInterval);
      $.id('currentpage').textContent = ' / X';
      delete ThreadStats.request;
    }
  };

  Unread = {
    init: function() {
      this.title = d.title;
      $.on(d, 'QRPostSuccessful', this.post);
      this.update();
      $.on(window, 'scroll', Unread.scroll);
      return Main.callbacks.push(this.node);
    },
    replies: [],
    foresee: [],
    post: function(e) {
      return Unread.foresee.push(e.detail.postID);
    },
    node: function(post) {
      var count, el, index;
      if ((index = Unread.foresee.indexOf(post.ID)) !== -1) {
        Unread.foresee.splice(index, 1);
        return;
      }
      el = post.el;
      if (el.hidden || /\bop\b/.test(post["class"]) || post.isInlined) {
        return;
      }
      count = Unread.replies.push(el);
      return Unread.update(count === 1);
    },
    scroll: function() {
      var bottom, height, i, reply, _i, _len, _ref;
      height = d.documentElement.clientHeight;
      _ref = Unread.replies;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        reply = _ref[i];
        bottom = reply.getBoundingClientRect().bottom;
        if (bottom > height) {
          break;
        }
      }
      if (i === 0) {
        return;
      }
      Unread.replies = Unread.replies.slice(i);
      return Unread.update(Unread.replies.length === 0);
    },
    setTitle: function(count) {
      if (this.scheduled) {
        clearTimeout(this.scheduled);
        delete Unread.scheduled;
        this.setTitle(count);
        return;
      }
      return this.scheduled = setTimeout((function() {
        return d.title = "(" + count + ") " + Unread.title;
      }), 5);
    },
    update: function(updateFavicon) {
      var count;
      if (!g.REPLY) {
        return;
      }
      count = this.replies.length;
      if (Conf['Unread Count']) {
        this.setTitle(count);
      }
      if (!(Conf['Unread Favicon'] && updateFavicon)) {
        return;
      }
      if ($.engine === 'presto') {
        $.rm(Favicon.el);
      }
      Favicon.el.href = g.dead ? count ? Favicon.unreadDead : Favicon.dead : count ? Favicon.unread : Favicon["default"];
      if (g.dead) {
        $.addClass(Favicon.el, 'dead');
      } else {
        $.rmClass(Favicon.el, 'dead');
      }
      if (count) {
        $.addClass(Favicon.el, 'unread');
      } else {
        $.rmClass(Favicon.el, 'unread');
      }
      if ($.engine !== 'webkit') {
        return $.add(d.head, Favicon.el);
      }
    }
  };

  Favicon = {
    init: function() {
      var href;
      if (this.el) {
        return;
      }
      this.el = $('link[rel="shortcut icon"]', d.head);
      this.el.type = 'image/x-icon';
      href = this.el.href;
      this.SFW = /ws.ico$/.test(href);
      this["default"] = href;
      return this["switch"]();
    },
    "switch": function() {
      switch (Conf['favicon']) {
        case 'ferongr':
          this.unreadDead = 'data:image/gif;base64,R0lGODlhEAAQAOMHAOgLAnMFAL8AAOgLAukMA/+AgP+rq////////////////////////////////////yH5BAEKAAcALAAAAAAQABAAAARZ8MhJ6xwDWIBv+AM1fEEIBIVRlNKYrtpIECuGzuwpCLg974EYiXUYkUItjGbC6VQ4omXFiKROA6qSy0A8nAo9GS3YCswIWnOvLAi0be23Z1QtdSUaqXcviQAAOw==';
          this.unreadSFW = 'data:image/gif;base64,R0lGODlhEAAQAOMHAADX8QBwfgC2zADX8QDY8nnl8qLp8v///////////////////////////////////yH5BAEKAAcALAAAAAAQABAAAARZ8MhJ6xwDWIBv+AM1fEEIBIVRlNKYrtpIECuGzuwpCLg974EYiXUYkUItjGbC6VQ4omXFiKROA6qSy0A8nAo9GS3YCswIWnOvLAi0be23Z1QtdSUaqXcviQAAOw==';
          this.unreadNSFW = 'data:image/gif;base64,R0lGODlhEAAQAOMHAFT+ACh5AEncAFT+AFX/Acz/su7/5v///////////////////////////////////yH5BAEKAAcALAAAAAAQABAAAARZ8MhJ6xwDWIBv+AM1fEEIBIVRlNKYrtpIECuGzuwpCLg974EYiXUYkUItjGbC6VQ4omXFiKROA6qSy0A8nAo9GS3YCswIWnOvLAi0be23Z1QtdSUaqXcviQAAOw==';
          break;
        case 'xat-':
          this.unreadDead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA2ElEQVQ4y61TQQrCMBDMQ8WDIEV6LbT2A4og2Hq0veo7fIAH04dY9N4xmyYlpGmI2MCQTWYy3Wy2DAD7B2wWAzWgcTgVeZKlZRxHNYFi2jM18oBh0IcKtC6ixf22WT4IFLs0owxswXu9egm0Ls6bwfCFfNsJYJKfqoEkd3vgUgFVLWObtzNgVKyruC+ljSzr5OEnBzjvjcQecaQhbZgBb4CmGQw+PoMkTUtdbd8VSEPakcGxPOcsoIgUKy0LecY29BmdBrqRfjIwZ93KLs5loHvBnL3cLH/jF+C/+z5dgUysAAAAAElFTkSuQmCC';
          this.unreadSFW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA30lEQVQ4y2P4//8/AyWYgSoGQMF/GJ7Y11VVUVoyKTM9ey4Ig9ggMWQ1YA1IBvzXm34YjkH8mPyJB+Nqlp8FYRAbmxoMF6ArSNrw6T0Qf8Amh9cFMEWVR/7/A+L/uORxhgEIt5/+/3/2lf//5wAxiI0uj+4CBlBgxVUvOwtydgXQZpDmi2/+/7/0GmIQSAwkB1IDUkuUAZeABlx+g2zAZ9wGlAOjChba+LwAUgNSi2HA5Am9VciBhSsQQWyoWgZiovEDsdGI1QBYQiLJAGQalpSxyWEzAJYWkGm8clTJjQCZ1hkoVG0CygAAAABJRU5ErkJggg==';
          this.unreadNSFW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA4ElEQVQ4y2P4//8/AyWYgSoGQMF/GJ7YNbGqrKRiUnp21lwQBrFBYshqwBqQDPifdsYYjkH8mInxB+OWx58FYRAbmxoMF6ArKPmU9B6IP2CTw+sCmKKe/5X/gPg/LnmcYQDCs/63/1/9fzYQzwGz0eXRXcAACqy4ZfFnQc7u+V/xD6T55v+LQHwJbBBIDCQHUgNSS5QBt4Cab/2/jDDgMx4DykrKJ8FCG58XQGpAajEMmNw7uQo5sHAFIogNVctATDR+IDYasRoAS0gkGYBMw5IyNjlsBsDSAjKNV44quREAx58Mr9vt5wQAAAAASUVORK5CYII=';
          break;
        case 'Mayhem':
          this.unreadDead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABIUlEQVQ4jZ2ScWuDMBDFgw4pIkU0WsoQkWAYIkXZH4N9/+/V3dmfXSrKYIFHwt17j8vdGWNMIkgFuaDgzgQnwRs4EQs5KdolUQtagRN0givEDBTEOjgtGs0Zq8F7cKqqusVxrMQLaDUWcjBSrXkn8gs51tpJSWLk9b3HUa0aNIL5gPBR1/V4kJvR7lTwl8GmAm1Gf9+c3S+89qBHa8502AsmSrtBaEBPbIbj0ah2madlNAPEccdgJDfAtWifBjqWKShRBT6KoiH8QlEUn/qt0CCjnNdmPUwmFWzj9Oe6LpKuZXcwqq88z78Pch3aZU3dPwwc2sWlfZKCW5tWluV8kGvXClLm6dYN4/aUqfCbnEOzNDGhGZbNargvxCzvMGfRJD8UaDVvgkzo6QAAAABJRU5ErkJggg==';
          this.unreadSFW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCElEQVQ4jZ2S4crCMAxF+0OGDJEPKYrIGKOsiJSx/fJRfSAfTJNyKqXfiuDg0C25N2RJjTGmEVrhTzhw7oStsIEtsVzT4o2Jo9ALThiEM8IdHIgNaHo8mjNWg6/ske8bohPo+63QOLzmooHp8fyAICBSQkVz0QKdsFQEV6WSW/D+7+BbgbIDHcb4Kp61XyjyI16zZ8JemGltQtDBSGxB4/GoN+7TpkkjDCsFArm0IYv3U0BbnYtf8BCy+JytsE0X6VyuKhPPK/GAJ14kvZZDZVV3pZIb8MZr6n4o4PDGKn0S5SdDmyq5PnXQsk+Xbhinp03FFzmHJw6xYRiWm9VxnohZ3vOcxdO8ARmXRvbWdtzQAAAAAElFTkSuQmCC';
          this.unreadNSFW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVQ4jZ2S0WrDMAxF/TBCCKWMYhZKCSGYmFJMSNjD/mhf239qJXNcjBdTWODgRLpXKJKNMaYROuFTOHEehFb4gJZYrunwxsSXMApOmIQzwgOciE1oRjyaM1aDj+yR7xuiHvT9VmgcXnPRwO/9+wWCgEgJFc1FCwzCVhFclUpuw/u3g3cFyg50GPOjePZ+ocjPeM2RCXthpbUFwQAzsQ2Nx6PeuE+bJo0w7BQI5NKGLN5XAW11LX7BQ8jia7bCLl2kc7mqTLzuxAOeeJH0Wk6VVf0oldyEN15T948CDm+sMiZRfjK0pZIbUwcd+3TphnF62lR8kXN44hAbhmG5WQNnT8zynucsnuYJhFpBfkMzqD4AAAAASUVORK5CYII=';
          break;
        case 'Original':
          this.unreadDead = 'data:image/gif;base64,R0lGODlhEAAQAKECAAAAAP8AAP///////yH5BAEKAAMALAAAAAAQABAAAAI/nI95wsqygIRxDgGCBhTrwF3Zxowg5H1cSopS6FrGQ82PU1951ckRmYKJVCXizLRC9kAnT0aIiR6lCFT1cigAADs=';
          this.unreadSFW = 'data:image/gif;base64,R0lGODlhEAAQAKECAAAAAC6Xw////////yH5BAEKAAMALAAAAAAQABAAAAI/nI95wsqygIRxDgGCBhTrwF3Zxowg5H1cSopS6FrGQ82PU1951ckRmYKJVCXizLRC9kAnT0aIiR6lCFT1cigAADs=';
          this.unreadNSFW = 'data:image/gif;base64,R0lGODlhEAAQAKECAAAAAGbMM////////yH5BAEKAAMALAAAAAAQABAAAAI/nI95wsqygIRxDgGCBhTrwF3Zxowg5H1cSopS6FrGQ82PU1951ckRmYKJVCXizLRC9kAnT0aIiR6lCFT1cigAADs=';
      }
      return this.unread = this.SFW ? this.unreadSFW : this.unreadNSFW;
    },
    empty: 'data:image/gif;base64,R0lGODlhEAAQAJEAAAAAAP///9vb2////yH5BAEAAAMALAAAAAAQABAAAAIvnI+pq+D9DBAUoFkPFnbs7lFZKIJOJJ3MyraoB14jFpOcVMpzrnF3OKlZYsMWowAAOw==',
    dead: 'data:image/gif;base64,R0lGODlhEAAQAKECAAAAAP8AAP///////yH5BAEKAAIALAAAAAAQABAAAAIvlI+pq+D9DAgUoFkPDlbs7lFZKIJOJJ3MyraoB14jFpOcVMpzrnF3OKlZYsMWowAAOw=='
  };

  Redirect = {
    image: function(board, filename) {
      switch (board) {
        case 'adv':
        case 'f':
        case 'hr':
        case 'mlpol':
        case 'mo':
        case 'o':
        case 'pol':
        case 's4s':
        case 'sp':
        case 'trv':
        case 'tv':
        case 'x':
          return "//archive.4plebs.org/" + board + "/full_image/" + filename;
        case 'bant':
        case 'c':
        case 'con':
        case 'e':
        case 'n':
        case 'news':
        case 'out':
        case 'p':
        case 'toy':
        case 'vmg':
        case 'vp':
        case 'vst':
        case 'w':
        case 'wg':
        case 'wsr':
          return "https://archive.nyafuu.org/" + board + "/full_image/" + filename;
        case 'cgl':
        case 'g':
        case 'mu':
          return "https://archive.rebeccablacktech.com/" + board + "/full_image/" + filename;
        case '3':
        case 'biz':
        case 'ck':
        case 'diy':
        case 'fa':
        case 'ic':
        case 'jp':
        case 'lit':
        case 'sci':
        case 'tg':
          return "https://warosu.org/" + board + "/full_image/" + filename;
        case 'a':
        case 'aco':
        case 'an':
        case 'co':
        case 'd':
        case 'fit':
        case 'gif':
        case 'his':
        case 'int':
        case 'k':
        case 'm':
        case 'mlp':
        case 'q':
        case 'qa':
        case 'r9k':
        case 'trash':
        case 'wsg':
        case 'vr':
          return "//desuarchive.org/" + board + "/full_image/" + filename;
        case 'cm':
        case 'vip':
        case 'y':
          return "https://boards.fireden.net/" + board + "/full_image/" + filename;
        case 'can':
        case 'cock':
        case 'fap':
        case 'fitlit':
        case 'gd':
        case 'mtv':
        case 'outsoc':
        case 'po':
        case 'qst':
        case 'spa':
        case 'vint':
          return "//archived.moe/" + board + "/full_image/" + filename;
        case 'b':
          return "//thebarchive.com/" + board + "/full_image/" + filename;
        case 'h':
        case 'hc':
        case 'hm':
        case 'i':
        case 'lgbt':
        case 'r':
        case 's':
        case 'soc':
        case 't':
        case 'u':
          return "//archiveofsins.com/" + board + "/full_image/" + filename;
        case 'vrpg':
          return "https://www.tokyochronos.net/" + board + "/full_image/" + filename;
      }
    },
    post: function(board, postID) {
      switch (board) {
        case 'adv':
        case 'f':
        case 'hr':
        case 'mlpol':
        case 'mo':
        case 'o':
        case 'pol':
        case 's4s':
        case 'sp':
        case 'trv':
        case 'tv':
        case 'x':
          return "//archive.4plebs.org/_/api/chan/post/?board=" + board + "&num=" + postID;
        case 'bant':
        case 'c':
        case 'con':
        case 'e':
        case 'n':
        case 'news':
        case 'out':
        case 'p':
        case 'toy':
        case 'vmg':
        case 'vp':
        case 'vst':
        case 'w':
        case 'wg':
        case 'wsr':
          return "https://archive.nyafuu.org/_/api/chan/post/?board=" + board + "&num=" + postID;
        case 'cgl':
        case 'g':
        case 'mu':
          return "https://archive.rebeccablacktech.com/_/api/chan/post/?board=" + board + "&num=" + postID;
        case 'a':
        case 'aco':
        case 'an':
        case 'co':
        case 'd':
        case 'fit':
        case 'gif':
        case 'his':
        case 'int':
        case 'k':
        case 'm':
        case 'mlp':
        case 'q':
        case 'qa':
        case 'r9k':
        case 'trash':
        case 'wsg':
          return "//desuarchive.org/_/api/chan/post/?board=" + board + "&num=" + postID;
        case 'cm':
        case 'vip':
        case 'y':
          return "https://boards.fireden.net/_/api/chan/post/?board=" + board + "&num=" + postID;
        case 'v':
        case 'vg':
        case 'vm':
        case 'vrpg':
          return "//arch.b4k.co/_/api/chan/post/?board=" + board + "&num=" + postID;
        case 'hm':
        case 'qst':
          return "https://archive.b-stats.org/_/api/chan/post/?board=" + board + "&num=" + postID;
        case 'asp':
        case 'can':
        case 'cock':
        case 'fap':
        case 'fitlit':
        case 'gd':
        case 'mtv':
        case 'outsoc':
        case 'po':
        case 'spa':
        case 'vint':
          return "//archived.moe/_/api/chan/post/?board=" + board + "&num=" + postID;
        case 'b':
          return "//thebarchive.com/_/api/chan/post/?board=" + board + "&num=" + postID;
        case 'h':
        case 'hc':
        case 'i':
        case 'lgbt':
        case 'r':
        case 's':
        case 'soc':
        case 't':
        case 'u':
          return "//archiveofsins.com/_/api/chan/post/?board=" + board + "&num=" + postID;
      }
    },
    to: function(data) {
      var board, threadID, url;
      if (!data.isSearch) {
        threadID = data.threadID;
      }
      board = data.board;
      switch (board) {
        case 'adv':
        case 'f':
        case 'hr':
        case 'mlpol':
        case 'mo':
        case 'o':
        case 'pol':
        case 's4s':
        case 'sp':
        case 'trv':
        case 'tv':
        case 'x':
          url = Redirect.path('//archive.4plebs.org', 'foolfuuka', data);
          break;
        case 'bant':
        case 'c':
        case 'con':
        case 'e':
        case 'n':
        case 'news':
        case 'out':
        case 'p':
        case 'toy':
        case 'vmg':
        case 'vp':
        case 'vst':
        case 'w':
        case 'wg':
        case 'wsr':
          url = Redirect.path('https://archive.nyafuu.org', 'foolfuuka', data);
          break;
        case 'cgl':
        case 'g':
        case 'mu':
          url = Redirect.path('https://archive.rebeccablacktech.com', 'foolfuuka', data);
          break;
        case '3':
        case 'biz':
        case 'ck':
        case 'diy':
        case 'fa':
        case 'ic':
        case 'jp':
        case 'lit':
        case 'sci':
        case 'tg':
          url = Redirect.path('https://warosu.org', 'fuuka', data);
          break;
        case 'a':
        case 'aco':
        case 'an':
        case 'co':
        case 'd':
        case 'fit':
        case 'gif':
        case 'his':
        case 'int':
        case 'k':
        case 'm':
        case 'mlp':
        case 'q':
        case 'qa':
        case 'r9k':
        case 'trash':
        case 'wsg':
        case 'vr':
          url = Redirect.path('//desuarchive.org', 'foolfuuka', data);
          break;
        case 'cm':
        case 'vip':
        case 'y':
          url = Redirect.path('https://boards.fireden.net', 'foolfuuka', data);
          break;
        case 'v':
        case 'vg':
        case 'vm':
        case 'vrpg':
          url = Redirect.path('//arch.b4k.co', 'foolfuuka', data);
          break;
        case 'hm':
        case 'qst':
          url = Redirect.path('https://archive.b-stats.org', 'foolfuuka', data);
          break;
        case 'asp':
        case 'can':
        case 'cock':
        case 'fap':
        case 'fitlit':
        case 'gd':
        case 'mtv':
        case 'outsoc':
        case 'po':
        case 'spa':
        case 'vint':
          url = Redirect.path('//archived.moe', 'foolfuuka', data);
          break;
        case 'b':
          url = Redirect.path('//thebarchive.com', 'foolfuuka', data);
          break;
        case 'h':
        case 'hc':
        case 'i':
        case 'lgbt':
        case 'r':
        case 's':
        case 'soc':
        case 't':
        case 'u':
          url = Redirect.path('//archiveofsins.com', 'foolfuuka', data);
          break;
        default:
          if (threadID) {
            url = "//boards.4chan.org/" + board + "/";
          }
      }
      return url || null;
    },
    path: function(base, archiver, data) {
      var board, path, postID, threadID, type, value;
      if (data.isSearch) {
        board = data.board, type = data.type, value = data.value;
        type = type === 'name' ? 'username' : type === 'md5' ? 'image' : type;
        value = encodeURIComponent(value);
        if (archiver === 'foolfuuka') {
          return "" + base + "/" + board + "/search/" + type + "/" + value;
        } else if (type === 'image') {
          return "" + base + "/" + board + "/?task=search2&search_media_hash=" + value;
        } else {
          return "" + base + "/" + board + "/?task=search2&search_" + type + "=" + value;
        }
      }
      board = data.board, threadID = data.threadID, postID = data.postID;
      if (postID) {
        postID = postID.match(/\d+/)[0];
      }
      path = threadID ? "" + board + "/thread/" + threadID : "" + board + "/post/" + postID;
      if (archiver === 'foolfuuka') {
        path += '/';
      }
      if (threadID && postID) {
        path += archiver === 'foolfuuka' ? "#" + postID : "#p" + postID;
      }
      return "" + base + "/" + path;
    }
  };

  ImageHover = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      if (!post.img || post.hasPdf) {
        return;
      }
      return $.on(post.img, 'mouseover', ImageHover.mouseover);
    },
    mouseover: function() {
      var el;
      if (el = $.id('ihover')) {
        if (el === UI.el) {
          delete UI.el;
        }
        $.rm(el);
      }
      if (UI.el) {
        return;
      }
      if (/\.webm$/.test(this.parentNode.href)) {
        el = UI.el = $.el('video', {
          id: 'ihover',
          src: this.parentNode.href,
          type: 'video/webm',
          autoplay: true,
          loop: true
        });
      } else {
        el = UI.el = $.el('img', {
          id: 'ihover',
          src: this.parentNode.href
        });
      }
      $.add(d.body, el);
      $.on(el, 'load', ImageHover.load);
      $.on(el, 'error', ImageHover.error);
      $.on(this, 'mousemove', UI.hover);
      return $.on(this, 'mouseout', ImageHover.mouseout);
    },
    load: function() {
      var style;
      if (!this.parentNode) {
        return;
      }
      style = this.style;
      return UI.hover({
        clientX: -45 + parseInt(style.left),
        clientY: 120 + parseInt(style.top)
      });
    },
    error: function() {
      var src, timeoutID, url,
        _this = this;
      src = this.src.split('/');
      if (!(src[2] === 'i.4cdn.org' && (url = Redirect.image(src[3], src[4])))) {
        if (g.dead) {
          return;
        }
        url = "//i.4cdn.org/" + src[3] + "/" + src[4];
      }
      if ($.engine !== 'webkit' && url.split('/')[2] === 'i.4cdn.org') {
        return;
      }
      timeoutID = setTimeout((function() {
        return _this.src = url;
      }), 3000);
      if ($.engine !== 'webkit' || url.split('/')[2] !== 'i.4cdn.org') {
        return;
      }
      return $.ajax(url, {
        onreadystatechange: (function() {
          if (this.status === 404) {
            return clearTimeout(timeoutID);
          }
        })
      }, {
        type: 'head'
      });
    },
    mouseout: function() {
      var videoel;
      if (videoel = $('video#ihover')) {
        videoel.pause();
      }
      UI.hoverend();
      $.off(this, 'mousemove', UI.hover);
      return $.off(this, 'mouseout', ImageHover.mouseout);
    }
  };

  AutoGif = {
    init: function() {
      var _ref;
      if ((_ref = g.BOARD) === 'gif' || _ref === 'wsg') {
        return;
      }
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var gif, img, src;
      img = post.img;
      if (post.el.hidden || !img) {
        return;
      }
      src = img.parentNode.href;
      if (/gif$/.test(src) && !/spoiler/.test(img.src)) {
        gif = $.el('img');
        $.on(gif, 'load', function() {
          return img.src = src;
        });
        return gif.src = src;
      }
    }
  };

  ReplacePng = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var png, img, src;
      img = post.img;
      if (post.el.hidden || !img) {
        return;
      }
      src = img.parentNode.href;
      if (/png$/.test(src) && !/spoiler/.test(img.src)) {
        png = $.el('img');
        $.on(png, 'load', function() {
          return img.src = src;
        });
        return png.src = src;
      }
    }
  };

  ReplaceJpg = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var jpg, img, src;
      img = post.img;
      if (post.el.hidden || !img) {
        return;
      }
      src = img.parentNode.href;
      if (/jpg$/.test(src) && !/spoiler/.test(img.src)) {
        jpg = $.el('img');
        $.on(jpg, 'load', function() {
          return img.src = src;
        });
        return jpg.src = src;
      }
    }
  };
  
  AlwaysCdn = {
    init: function() {
      return Main.callbacks.push(this.node);
    },
    node: function(post) {
      var img, src, fInfo;
      img = post.img;
      if (post.el.hidden || !img) {
        return;
      }
      if (post.fileInfo && (fInfo = $('a', post.fileInfo)))
      
      src = img.parentNode.href;
      if (!/4cdn$/.test(src)) {
        if (post.fileInfo && (fInfo = $('a', post.fileInfo))) {
          fInfo.href = fInfo.href.replace(/is.?\.4chan.org/, "i.4cdn.org");
        }
        return img.parentNode.href = src.replace(/is.?\.4chan.org/, "i.4cdn.org");
      }
    }
  };

  ImageExpand = {
    init: function() {
      Main.callbacks.push(this.node);
      return this.dialog();
    },
    node: function(post) {
      var a;
      if (!post.img || post.hasPdf) {
        return;
      }
      a = post.img.parentNode;
      $.on(a, 'click', ImageExpand.cb.toggle);
      if (ImageExpand.on && !post.el.hidden) {
        return ImageExpand.expand(post.img);
      }
    },
    cb: {
      toggle: function(e) {
        if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        return ImageExpand.toggle(this);
      },
      all: function() {
        var i, thumb, thumbs, _i, _j, _k, _len, _len1, _len2, _ref;
        ImageExpand.on = this.checked;
        if (ImageExpand.on) {
          thumbs = $$('img[data-md5]');
          if (Conf['Expand From Current']) {
            for (i = _i = 0, _len = thumbs.length; _i < _len; i = ++_i) {
              thumb = thumbs[i];
              if (thumb.getBoundingClientRect().top > 0) {
                break;
              }
            }
            thumbs = thumbs.slice(i);
          }
          for (_j = 0, _len1 = thumbs.length; _j < _len1; _j++) {
            thumb = thumbs[_j];
            if (!Conf['Expand All WebM'] && /\.webm$/.test(thumb.parentNode.href))
              continue;
            ImageExpand.expand(thumb);
          }
        } else {
          _ref = $$('img[data-md5][hidden]');
          for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
            thumb = _ref[_k];
            ImageExpand.contract(thumb);
          }
        }
      },
      typeChange: function() {
        var klass;
        switch (this.value) {
          case 'full':
            klass = '';
            break;
          case 'fit width':
            klass = 'fitwidth';
            break;
          case 'fit height':
            klass = 'fitheight';
            break;
          case 'fit screen':
            klass = 'fitwidth fitheight';
        }
        $.id('delform').className = klass;
        if (/\bfitheight\b/.test(klass)) {
          $.on(window, 'resize', ImageExpand.resize);
          if (!ImageExpand.style) {
            ImageExpand.style = $.addStyle('');
          }
          return ImageExpand.resize();
        } else if (ImageExpand.style) {
          return $.off(window, 'resize', ImageExpand.resize);
        }
      }
    },
    toggle: function(a) {
      var rect, thumb;
      thumb = a.firstChild;
      if (thumb.hidden) {
        rect = a.getBoundingClientRect();
        if (rect.bottom > 0) {
          if ($.engine === 'webkit') {
            if (rect.top < 0) {
              d.body.scrollTop += rect.top - 42;
            }
            if (rect.left < 0) {
              d.body.scrollLeft += rect.left;
            }
          } else {
            if (rect.top < 0) {
              d.documentElement.scrollTop += rect.top - 42;
            }
            if (rect.left < 0) {
              d.documentElement.scrollLeft += rect.left;
            }
          }
        }
        return ImageExpand.contract(thumb);
      } else {
        return ImageExpand.expand(thumb);
      }
    },
    contract: function(thumb) {
      thumb.hidden = false;
      thumb.nextSibling.hidden = true;
      if (thumb.nextSibling.nodeName === 'VIDEO') {
        thumb.nextSibling.pause();
        thumb.nextSibling.remove();
      }
      return $.rmClass(thumb.parentNode.parentNode.parentNode, 'image_expanded');
    },
    expand: function(thumb, src) {
      var a, img;
      if ($.x('ancestor-or-self::*[@hidden]', thumb)) {
        return;
      }
      a = thumb.parentNode;
      src || (src = a.href);
      if (/\.pdf$/.test(src)) {
        return;
      }
      thumb.hidden = true;
      $.addClass(thumb.parentNode.parentNode.parentNode, 'image_expanded');
      if ((img = thumb.nextSibling) && img.nodeName === 'IMG') {
        img.hidden = false;
        return;
      }
      
      /* a video in your img? it's more likely than you think */
      if (/\.webm$/.test(src)) {
        img = $.el('video', {
          src: src,
          type: 'video/webm',
          autoplay: true,
          loop: true
        });
      } else {
        img = $.el('img', {
          src: src
        });
      }
      $.on(img, 'error', ImageExpand.error);
      return $.after(thumb, img);
    },
    error: function() {
      var src, thumb, timeoutID, url;
      thumb = this.previousSibling;
      ImageExpand.contract(thumb);
      $.rm(this);
      src = this.src.split('/');
      if (!(src[2] === 'i.4cdn.org' && (url = Redirect.image(src[3], src[4])))) {
        if (g.dead) {
          return;
        }
        url = "//i.4cdn.org/" + src[3] + "/" + src[4];
      }
      if ($.engine !== 'webkit' && url.split('/')[2] === 'i.4cdn.org') {
        return;
      }
      timeoutID = setTimeout(ImageExpand.expand, 10000, thumb, url);
      if ($.engine !== 'webkit' || url.split('/')[2] !== 'i.4cdn.org') {
        return;
      }
      return $.ajax(url, {
        onreadystatechange: (function() {
          if (this.status === 404) {
            return clearTimeout(timeoutID);
          }
        })
      }, {
        type: 'head'
      });
    },
    dialog: function() {
      var controls, imageType, select;
      controls = $.el('div', {
        id: 'imgControls',
        innerHTML: "<select id=imageType name=imageType><option value=full>Full</option><option value='fit width'>Fit Width</option><option value='fit height'>Fit Height</option value='fit screen'><option value='fit screen'>Fit Screen</option></select><label>Expand Images<input type=checkbox id=imageExpand></label>"
      });
      imageType = $.get('imageType', 'full');
      select = $('select', controls);
      select.value = imageType;
      ImageExpand.cb.typeChange.call(select);
      $.on(select, 'change', $.cb.value);
      $.on(select, 'change', ImageExpand.cb.typeChange);
      $.on($('input', controls), 'click', ImageExpand.cb.all);
      return $.prepend($.id('delform'), controls);
    },
    resize: function() {
      return ImageExpand.style.textContent = ".fitheight img[data-md5] + img {max-height:" + d.documentElement.clientHeight + "px;} .fitheight img[data-md5] + video {max-height:" + d.documentElement.clientHeight + "px;}";
    }
  };

  RemoveSlug = {
    init: function() {
      var catalogdiv;
      var threads = [];
      if (g.CATALOG) {
        catalogdiv = document.getElementsByClassName('thread');
        for (var i = 0; i < catalogdiv.length; i++) {
          threads.push(catalogdiv[i].firstElementChild);
        }
      } else {
        threads = document.getElementsByClassName('replylink');
      }
      return RemoveSlug.deslug(threads);
    },
    deslug: function(els) {
      var el;
      for (var i = 0; i < els.length; i++) {
        el = els[i];
        path = el.pathname;
        if (path.slice(1).split('/').length > 3) {
          el.pathname = path.substring(0, path.lastIndexOf('/'));
        }
      }
      return;
    }
  };

  AlwaysHTTPS = {
    init: function() {
      var catalogdiv;
      var threads = [];
      if (g.CATALOG) {
        catalogdiv = document.getElementsByClassName('thread');
        for (var i = 0; i < catalogdiv.length; i++) {
          threads.push(catalogdiv[i].firstElementChild);
        }
      } else {
        threads = document.getElementsByClassName('replylink');
      }
      return AlwaysHTTPS.upgrade(threads);
    },
    upgrade: function(els) {
      var el;
      for (var i = 0; i < els.length; i++) {
        el = els[i];
        if (el.protocol == 'http:') {
          el.protocol = 'https:';
        }
      }
      return;
    }
  };

  CatalogLinks = {
    init: function() {
      var clone, el, nav, _i, _len, _ref;
      el = $.el('span', {
        className: 'toggleCatalog',
        innerHTML: '[<a href=javascript:;></a>]'
      });
      _ref = ['boardNavDesktop', 'boardNavDesktopFoot'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        nav = _ref[_i];
        clone = el.cloneNode(true);
        $.on(clone.firstElementChild, 'click', CatalogLinks.toggle);
        $.add($.id(nav), clone);
      }
      return CatalogLinks.toggle(true);
    },
    toggle: function(onLoad) {
      var a, board, nav, root, useCatalog, _i, _j, _len, _len1, _ref, _ref1;
      if (onLoad === true) {
        useCatalog = $.get('CatalogIsToggled', g.CATALOG);
      } else {
        useCatalog = this.textContent === 'Catalog Off';
        $.set('CatalogIsToggled', useCatalog);
      }
      _ref = ['boardNavDesktop', 'boardNavDesktopFoot'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        nav = _ref[_i];
        root = $.id(nav);
        _ref1 = $$('a[href]', root.getElementsByClassName('boardList')[0]);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          a = _ref1[_j];
          board = a.pathname.split('/')[1];
          if (board === 'f') {
            a.pathname = '/f/';
            continue;
          }
          a.pathname = "/" + board + "/" + (useCatalog ? 'catalog' : '');
        }
        a = $('.toggleCatalog', root).firstElementChild;
        a.textContent = "Catalog " + (useCatalog ? 'On' : 'Off');
        a.title = "Turn catalog links " + (useCatalog ? 'off' : 'on') + ".";
      }
    }
  };

  Main = {
    init: function() {
      var asap, key, path, pathname, settings, temp, val;
      Main.flatten(null, Config);
      path = location.pathname;
      pathname = path.slice(1).split('/');
      g.BOARD = pathname[0], temp = pathname[1];
      switch (temp) {
        case 'thread':
          g.REPLY = true;
          g.THREAD_ID = pathname[2];
          break;
        case 'catalog':
          g.CATALOG = true;
      }
      for (key in Conf) {
        val = Conf[key];
        Conf[key] = $.get(key, val);
      }
      switch (location.hostname) {
        case 'sys.4chan.org':
          if (/report/.test(location.search) && Conf['Alternative captcha']) {
            asap = function() {
              var field, form;
              if (!(field = $.id('recaptcha_response_field'))) {
                setTimeout(asap, 200);
                return;
              }
              form = $('form');
              $.on(field, 'keydown', function(e) {
                if (e.keyCode === 8 && !e.target.value) {
                  $.globalEval('Recaptcha.reload("t");');
                }
              });
              field.focus();
              return $.on(form, 'submit', function(e) {
                e.preventDefault();
                return form.submit();
              });
            };
            asap();
          }
          return;
        case 'is.4chan.org':
        case 'is2.4chan.org':
        case 'i.4cdn.org':
          $.ready(function() {
            var url;
            if (/^4chan - 404/.test(d.title) && Conf['404 Redirect']) {
              path = location.pathname.split('/');
              url = Redirect.image(path[1], path[2]);
              if (url) {
                return location.href = url;
              }
            }
          });
          return;
      }
      if (g.REPLY && pathname.length > 3 && Conf['Remove Slug']) {
        window.location.pathname = path.substring(0, path.lastIndexOf('/')) + location.hash;
        return;
      }
      if (location.protocol == 'http:' && Conf['Always HTTPS']) {
        window.location.replace(location.href.replace(/^http:\/\//, 'https://'));
        return;
      }
      if (Conf['Disable 4chan\'s extension']) {
        settings = JSON.parse(localStorage.getItem('4chan-settings')) || {};
        settings.disableAll = true;
        settings.dropDownNav = false;
        localStorage.setItem('4chan-settings', JSON.stringify(settings));
        $.ready(function() { $.globalEval('window.removeEventListener("message", Report.onMessage, false);') });
      }
      Main.polyfill();
      if (g.CATALOG) {
        return $.ready(Main.catalog);
      } else {
        return Main.features();
      }
    },
    polyfill: function() {
      var event, prefix, property;
      if (!('visibilityState' in document)) {
        prefix = 'mozVisibilityState' in document ? 'moz' : 'webkitVisibilityState' in document ? 'webkit' : 'o';
        property = prefix + 'VisibilityState';
        event = prefix + 'visibilitychange';
        d.visibilityState = d[property];
        d.hidden = d.visibilityState === 'hidden';
        return $.on(d, event, function() {
          d.visibilityState = d[property];
          d.hidden = d.visibilityState === 'hidden';
          return $.event('visibilitychange', null, d);
        });
      }
    },
    catalog: function() {
      if (Conf['Remove Slug']) {
        $.ready(RemoveSlug.init);
      }
      if (Conf['Always HTTPS']) {
        $.ready(AlwaysHTTPS.init);
      }
      if (Conf['Catalog Links']) {
        $.ready(CatalogLinks.init);
      }
      if (Conf['Thread Hiding']) {
        return ThreadHiding.init();
      }
    },
    features: function() {
      var cutoff, hiddenThreads, id, now, timestamp, _ref;
      Options.init();
      if (Conf['Quick Reply'] && Conf['Hide Original Post Form']) {
        Main.css += '#postForm { display: none; }';
      }
      $.addStyle(Main.css);
      now = Date.now();
      if (Conf['Check for Updates'] && $.get('lastUpdate', 0) < now - 6 * $.HOUR) {
        $.ready(function() {
          $.on(window, 'message', Main.message);
          $.set('lastUpdate', now);
          return $.add(d.head, $.el('script', {
            src: 'https://loadletter.github.io/4chan-x/latest.js'
          }));
        });
      }
      if (Conf['Alternative captcha'] && (g.REPLY || Conf['Alt index captcha'])) {
        $.ready(function() {
          $.add(d.head, $.el('script', {
            src: '//www.google.com/recaptcha/api/js/recaptcha_ajax.js'
          }));
        });
      }
      g.hiddenReplies = $.get("hiddenReplies/" + g.BOARD + "/", {});
      if ($.get('lastChecked', 0) < now - 1 * $.DAY) {
        $.set('lastChecked', now);
        cutoff = now - 7 * $.DAY;
        hiddenThreads = $.get("hiddenThreads/" + g.BOARD + "/", {});
        for (id in hiddenThreads) {
          timestamp = hiddenThreads[id];
          if (timestamp < cutoff) {
            delete hiddenThreads[id];
          }
        }
        _ref = g.hiddenReplies;
        for (id in _ref) {
          timestamp = _ref[id];
          if (timestamp < cutoff) {
            delete g.hiddenReplies[id];
          }
        }
        $.set("hiddenThreads/" + g.BOARD + "/", hiddenThreads);
        $.set("hiddenReplies/" + g.BOARD + "/", g.hiddenReplies);
      }
      if (Conf['Filter']) {
        Filter.init();
      }
      if (Conf['Reply Hiding']) {
        ReplyHiding.init();
      }
      if (Conf['Filter'] || Conf['Reply Hiding']) {
        StrikethroughQuotes.init();
      }
      if (Conf['Anonymize']) {
        Anonymize.init();
      }
      if (Conf['Time Formatting']) {
        Time.init();
      }
      if (Conf['Relative Post Dates']) {
        RelativeDates.init();
      }
      if (Conf['File Info Formatting']) {
        FileInfo.init();
      }
      if (Conf['Always CDN']) {
        AlwaysCdn.init();
      }
      if (Conf['Sauce']) {
        Sauce.init();
      }
      if (Conf['Reveal Spoilers']) {
        RevealSpoilers.init();
      }
      if (Conf['Image Auto-Gif']) {
        AutoGif.init();
      }
      if (Conf['Replace PNG']) {
        ReplacePng.init();
      }
      if (Conf['Replace JPG']) {
        ReplaceJpg.init();
      }
      if (Conf['Image Hover']) {
        ImageHover.init();
      }
      if (Conf['Menu']) {
        Menu.init();
        if (Conf['Report Link']) {
          ReportLink.init();
        }
        if (Conf['Delete Link']) {
          DeleteLink.init();
        }
        if (Conf['Filter']) {
          Filter.menuInit();
        }
        if (Conf['Download Link']) {
          DownloadLink.init();
        }
        if (Conf['Archive Link']) {
          ArchiveLink.init();
        }
      }
      if (Conf['Resurrect Quotes']) {
        Quotify.init();
      }
      if (Conf['Quote Inline']) {
        QuoteInline.init();
      }
      if (Conf['Quote Preview']) {
        QuotePreview.init();
      }
      if (Conf['Quote Backlinks']) {
        QuoteBacklink.init();
      }
      if (Conf['Indicate OP quote']) {
        QuoteOP.init();
      }
      if (Conf['Indicate You quote']) {
        QuoteYou.init();
      }
      if (Conf['Indicate Cross-thread Quotes']) {
        QuoteCT.init();
      }
      return $.ready(Main.featuresReady);
    },
    featuresReady: function() {
      var MutationObserver, a, board, node, nodes, observer, _j, _len1, _ref1;
      if (/^4chan - 404/.test(d.title)) {
        if (Conf['404 Redirect'] && /^\d+$/.test(g.THREAD_ID)) {
          location.href = Redirect.to({
            board: g.BOARD,
            threadID: g.THREAD_ID,
            postID: location.hash
          });
        }
        return;
      }
      if (!$.id('navtopright')) {
        return;
      }
      $.addClass(d.body, $.engine);
      $.addClass(d.body, 'fourchan_x');
      if (a = $("a[href$='/" + g.BOARD + "/']", $.id('boardNavDesktop'))) {
        $.addClass(a, 'current');
      }
      $.ready(function () {
        if (a = $("a[href$='/" + g.BOARD + "/']", $.id('boardNavDesktopFoot'))) {
          $.addClass(a, 'current');
        }
      });
      Favicon.init();
      if (Conf['Quick Reply']) {
        QR.init();
      }
      if (Conf['Image Expansion']) {
        ImageExpand.init();
      }
      if (Conf['Catalog Links']) {
        $.ready(CatalogLinks.init);
      }
      if (Conf['Thread Watcher']) {
        setTimeout(function() {
          return Watcher.init();
        });
      }
      if (Conf['Keybinds']) {
        setTimeout(function() {
          return Keybinds.init();
        });
      }
      if (g.REPLY) {
        if (Conf['Thread Updater']) {
          setTimeout(function() {
            return Updater.init();
          });
        }
        if (Conf['Thread Stats']) {
          ThreadStats.init();
        }
        if (Conf['Reply Navigation']) {
          setTimeout(function() {
            return Nav.init();
          });
        }
        TitlePost.init();
        if (Conf['Unread Count'] || Conf['Unread Favicon']) {
          Unread.init();
        }
      } else {
        if (Conf['Remove Slug']) {
          RemoveSlug.init();
        }
        if (Conf['Always HTTPS']) {
          AlwaysHTTPS.init();
        }
        if (Conf['Thread Hiding']) {
          ThreadHiding.init();
        }
        if (Conf['Thread Expansion']) {
          setTimeout(function() {
            return ExpandThread.init();
          });
        }
        if (Conf['Comment Expansion']) {
          setTimeout(function() {
            return ExpandComment.init();
          });
        }
        if (Conf['Index Navigation']) {
          setTimeout(function() {
            return Nav.init();
          });
        }
      }
      board = $('.board');
      nodes = [];
      _ref1 = $$('.postContainer', board);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        node = _ref1[_j];
        nodes.push(Main.preParse(node));
      }
      Main.node(nodes, true);
      Main.hasCodeTags = !!$('script[src^="//s.4cdn.org/js/prettify/prettify"]');
      if (MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.OMutationObserver) {
        observer = new MutationObserver(Main.observer);
        observer.observe(board, {
          childList: true,
          subtree: true
        });
      } else {
        $.on(board, 'DOMNodeInserted', Main.listener);
      }
    },
    flatten: function(parent, obj) {
      var key, val;
      if (obj instanceof Array) {
        Conf[parent] = obj[0];
      } else if (typeof obj === 'object') {
        for (key in obj) {
          val = obj[key];
          Main.flatten(key, val);
        }
      } else {
        Conf[parent] = obj;
      }
    },
    message: function(e) {
      var version;
      version = e.data.version;
      if (version && version !== Main.version && confirm('An updated version of 4chan X is available, would you like to install it now?')) {
        return window.location = "https://raw.github.com/loadletter/4chan-x/" + version + "/4chan_x.user.js";
      }
    },
    preParse: function(node) {
      var el, img, imgParent, parentClass, post;
      parentClass = node.parentNode.className;
      el = $('.post', node);
      post = {
        root: node,
        el: el,
        "class": el.className,
        ID: el.id.match(/\d+$/)[0],
        threadID: g.THREAD_ID || $.x('ancestor::div[parent::div[@class="board"]]', node).id.match(/\d+$/)[0],
        isArchived: /\barchivedPost\b/.test(parentClass),
        isInlined: /\binline\b/.test(parentClass),
        isCrosspost: /\bcrosspost\b/.test(parentClass),
        blockquote: el.lastElementChild,
        quotes: el.getElementsByClassName('quotelink'),
        backlinks: el.getElementsByClassName('backlink'),
        fileInfo: false,
        img: false
      };
      if (img = $('img[data-md5]', el)) {
        imgParent = img.parentNode;
        post.img = img;
        post.fileInfo = imgParent.previousElementSibling;
        post.hasPdf = /\.pdf$/.test(imgParent.href);
      }
      Main.prettify(post.blockquote);
      return post;
    },
    node: function(nodes, notify) {
      var callback, err, node, _i, _j, _len, _len1, _ref;
      _ref = Main.callbacks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        try {
          for (_j = 0, _len1 = nodes.length; _j < _len1; _j++) {
            node = nodes[_j];
            callback(node);
          }
        } catch (_error) {
          err = _error;
          if (notify) {
            alert("4chan X (" + Main.version + ") error: " + err.message + "\nReport the bug at github.com/loadletter/4chan-x/issues\n\nURL: " + window.location + "\n" + err.stack);
          }
        }
      }
    },
    observer: function(mutations) {
      var addedNode, mutation, nodes, _i, _j, _len, _len1, _ref;
      nodes = [];
      for (_i = 0, _len = mutations.length; _i < _len; _i++) {
        mutation = mutations[_i];
        _ref = mutation.addedNodes;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          addedNode = _ref[_j];
          if (/\bpostContainer\b/.test(addedNode.className)) {
            nodes.push(Main.preParse(addedNode));
          }
        }
      }
      if (nodes.length) {
        return Main.node(nodes);
      }
    },
    listener: function(e) {
      var target;
      target = e.target;
      if (/\bpostContainer\b/.test(target.className)) {
        return Main.node([Main.preParse(target)]);
      }
    },
    prettify: function(bq) {
      var code;
      if (!Main.hasCodeTags) {
        return;
      }
      code = function() {
        var pre, _i, _len, _ref;
        _ref = document.getElementById('_id_').getElementsByClassName('prettyprint');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pre = _ref[_i];
          pre.innerHTML = prettyPrintOne(pre.innerHTML.replace(/\s/g, '&nbsp;'));
        }
      };
      return $.globalEval(("(" + code + ")()").replace('_id_', bq.id));
    },
    namespace: '4chan_x.',
    version: '2.40.77',
    callbacks: [],
    css: '\
/* dialog styling */\
.dialog.reply {\
  display: block;\
  border: 1px solid rgba(0,0,0,.25);\
  padding: 0;\
}\
.move {\
  cursor: move;\
}\
label, .favicon {\
  cursor: pointer;\
}\
a[href="javascript:;"] {\
  text-decoration: none;\
}\
.warning {\
  color: red;\
}\
\
.hide_thread_button:not(.hidden_thread) {\
  float: left;\
}\
\
.thread > .hidden_thread ~ *,\
[hidden],\
#content > [name=tab]:not(:checked) + div,\
#updater:not(:hover) > :not(.move),\
.autohide:not(:hover) > form,\
#qp input, .forwarded {\
  display: none !important;\
}\
\
.menu_button {\
  display: inline-block;\
}\
.menu_button > span {\
  border-top:   .5em solid;\
  border-right: .3em solid transparent;\
  border-left:  .3em solid transparent;\
  display: inline-block;\
  margin: 2px;\
  vertical-align: middle;\
}\
#menu {\
  position: absolute;\
  outline: none;\
}\
.entry {\
  border-bottom: 1px solid rgba(0, 0, 0, .25);\
  cursor: pointer;\
  display: block;\
  outline: none;\
  padding: 3px 7px;\
  position: relative;\
  text-decoration: none;\
  white-space: nowrap;\
}\
.entry:last-child {\
  border: none;\
}\
.focused.entry {\
  background: rgba(255, 255, 255, .33);\
}\
.entry.hasSubMenu {\
  padding-right: 1.5em;\
}\
.hasSubMenu::after {\
  content: "";\
  border-left:   .5em solid;\
  border-top:    .3em solid transparent;\
  border-bottom: .3em solid transparent;\
  display: inline-block;\
  margin: .3em;\
  position: absolute;\
  right: 3px;\
}\
.hasSubMenu:not(.focused) > .subMenu {\
  display: none;\
}\
.subMenu {\
  position: absolute;\
  left: 100%;\
  top: 0;\
  margin-top: -1px;\
}\
\
h1 {\
  text-align: center;\
}\
#qr > .move {\
  min-width: 300px;\
  overflow: hidden;\
  box-sizing: border-box;\
  -moz-box-sizing: border-box;\
  padding: 0 2px;\
}\
#qr > .move > span {\
  float: right;\
}\
#autohide, .close, #qr select, #dump, .remove, .captchaimg, #qr div.warning {\
  cursor: pointer;\
}\
#qr select,\
#qr > form {\
  margin: 0;\
}\
#dump {\
  background: -webkit-linear-gradient(#EEE, #CCC);\
  background: -moz-linear-gradient(#EEE, #CCC);\
  background: -o-linear-gradient(#EEE, #CCC);\
  background: linear-gradient(#EEE, #CCC);\
  width: 10%;\
}\
.gecko #dump {\
  padding: 1px 0 2px;\
}\
#dump:hover, #dump:focus {\
  background: -webkit-linear-gradient(#FFF, #DDD);\
  background: -moz-linear-gradient(#FFF, #DDD);\
  background: -o-linear-gradient(#FFF, #DDD);\
  background: linear-gradient(#FFF, #DDD);\
}\
#dump:active, .dump #dump:not(:hover):not(:focus) {\
  background: -webkit-linear-gradient(#CCC, #DDD);\
  background: -moz-linear-gradient(#CCC, #DDD);\
  background: -o-linear-gradient(#CCC, #DDD);\
  background: linear-gradient(#CCC, #DDD);\
}\
#qr:not(.dump) #replies, .dump > form > label {\
  display: none;\
}\
#replies {\
  display: block;\
  height: 100px;\
  position: relative;\
  -webkit-user-select: none;\
  -moz-user-select: none;\
  -o-user-select: none;\
  user-select: none;\
}\
#replies > div {\
  counter-reset: thumbnails;\
  top: 0; right: 0; bottom: 0; left: 0;\
  margin: 0; padding: 0;\
  overflow: hidden;\
  position: absolute;\
  white-space: pre;\
}\
#replies > div:hover {\
  bottom: -10px;\
  overflow-x: auto;\
  z-index: 1;\
}\
.thumbnail {\
  background-color: rgba(0,0,0,.2) !important;\
  background-position: 50% 20% !important;\
  background-size: cover !important;\
  border: 1px solid #666;\
  box-sizing: border-box;\
  -moz-box-sizing: border-box;\
  cursor: move;\
  display: inline-block;\
  height: 90px; width: 90px;\
  margin: 5px; padding: 2px;\
  opacity: .5;\
  outline: none;\
  overflow: hidden;\
  position: relative;\
  text-shadow: 0 1px 1px #000;\
  -webkit-transition: opacity .25s ease-in-out;\
  -moz-transition: opacity .25s ease-in-out;\
  -o-transition: opacity .25s ease-in-out;\
  transition: opacity .25s ease-in-out;\
  vertical-align: top;\
}\
.thumbnail:hover, .thumbnail:focus {\
  opacity: .9;\
}\
.thumbnail#selected {\
  opacity: 1;\
}\
.thumbnail::before {\
  counter-increment: thumbnails;\
  content: counter(thumbnails);\
  color: #FFF;\
  font-weight: 700;\
  padding: 3px;\
  position: absolute;\
  top: 0;\
  right: 0;\
  text-shadow: 0 0 3px #000, 0 0 8px #000;\
}\
.thumbnail.drag {\
  box-shadow: 0 0 10px rgba(0,0,0,.5);\
}\
.thumbnail.over {\
  border-color: #FFF;\
}\
.thumbnail > span {\
  color: #FFF;\
}\
.remove {\
  background: none;\
  color: #E00;\
  font-weight: 700;\
  padding: 3px;\
}\
.remove:hover::after {\
  content: " Remove";\
}\
.thumbnail > label {\
  background: rgba(0,0,0,.5);\
  color: #FFF;\
  right: 0; bottom: 0; left: 0;\
  position: absolute;\
  text-align: center;\
}\
.thumbnail > label > input {\
  margin: 0;\
}\
#addReply {\
  color: #333;\
  font-size: 3.5em;\
  line-height: 100px;\
}\
#addReply:hover, #addReply:focus {\
  color: #000;\
}\
.field {\
  border: 1px solid #CCC;\
  box-sizing: border-box;\
  -moz-box-sizing: border-box;\
  color: #333;\
  font: 13px sans-serif;\
  margin: 0;\
  padding: 2px 4px 3px;\
  -webkit-transition: color .25s, border .25s;\
  -moz-transition: color .25s, border .25s;\
  -o-transition: color .25s, border .25s;\
  transition: color .25s, border .25s;\
}\
.field:-moz-placeholder,\
.field:hover:-moz-placeholder {\
  color: #AAA;\
}\
.field:hover, .field:focus {\
  border-color: #999;\
  color: #000;\
  outline: none;\
}\
#qr > form > div:first-child > .field:not(#dump) {\
  width: 30%;\
}\
#qr.sjis-preview textarea {\
  font-family: "IPAMonaPGothic","Mona","MS PGothic",monospace;\
  font-size: 16px;\
  line-height: 17px;\
}\
#qr textarea.field {\
  display: -webkit-box;\
  min-height: 160px;\
  min-width: 100%;\
}\
#qr.captcha textarea.field {\
  min-height: 120px;\
}\
.textarea {\
  position: relative;\
}\
#charCount {\
  color: #000;\
  background: hsla(0, 0%, 100%, .5);\
  font-size: 8pt;\
  margin: 1px;\
  position: absolute;\
  bottom: 0;\
  right: 0;\
  pointer-events: none;\
}\
#charCount.warning {\
  color: red;\
}\
#qr [type=file] {\
  margin: 1px 0;\
  width: 70%;\
}\
#qr [type=submit] {\
  margin: 1px 0;\
  padding: 1px; /* not Gecko */\
  width: 30%;\
}\
.gecko #qr [type=submit] {\
  padding: 0 1px; /* Gecko does not respect box-sizing: border-box */\
}\
\
.fileText:hover .fntrunc,\
.fileText:not(:hover) .fnfull {\
  display: none;\
}\
.reply > .file > .fileText {\
  margin: 0 20px;\
}\
\
.fitwidth img[data-md5] + img {\
  max-width: 100%;\
}\
.gecko  .fitwidth img[data-md5] + img,\
.presto .fitwidth img[data-md5] + img {\
  width: 100%;\
}\
\
.fitwidth img[data-md5] + video {\
  max-width: 100%;\
}\
.gecko  .fitwidth img[data-md5] + video,\
.presto .fitwidth img[data-md5] + video {\
  width: 100%;\
}\
\
#qr, #qp, #updater, #stats, #ihover, #overlay, #navlinks {\
  position: fixed;\
}\
\
#ihover {\
  max-height: 97%;\
  max-width: 75%;\
  padding-bottom: 18px;\
}\
\
#navlinks {\
  font-size: 16px;\
  top: 25px;\
  right: 5px;\
}\
\
body {\
  box-sizing: border-box;\
  -moz-box-sizing: border-box;\
}\
body.unscroll {\
  overflow: hidden;\
}\
#overlay {\
  top: 0;\
  left: 0;\
  width: 100%;\
  height: 100%;\
  text-align: center;\
  background: rgba(0,0,0,.5);\
  z-index: 1;\
}\
#overlay::after {\
  content: "";\
  display: inline-block;\
  height: 100%;\
  vertical-align: middle;\
}\
#options {\
  box-sizing: border-box;\
  -moz-box-sizing: border-box;\
  display: inline-block;\
  padding: 5px;\
  position: relative;\
  text-align: left;\
  vertical-align: middle;\
  width: 600px;\
  max-width: 100%;\
  height: 500px;\
  max-height: 100%;\
}\
#credits {\
  float: right;\
}\
#options ul {\
  padding: 0;\
}\
#options article li {\
  margin: 10px 0 10px 2em;\
}\
#options code {\
  background: hsla(0, 0%, 100%, .5);\
  color: #000;\
  padding: 0 1px;\
}\
#options label {\
  text-decoration: underline;\
}\
#content {\
  overflow: auto;\
  position: absolute;\
  top: 2.5em;\
  right: 5px;\
  bottom: 5px;\
  left: 5px;\
}\
#content textarea {\
  font-family: monospace;\
  min-height: 350px;\
  resize: vertical;\
  width: 100%;\
}\
\
#updater {\
  text-align: right;\
}\
#updater:not(:hover) {\
  border: none;\
  background: transparent;\
}\
#updater input[type=number] {\
  width: 4em;\
}\
.new {\
  background: lime;\
}\
\
#watcher {\
  padding-bottom: 5px;\
  position: absolute;\
  overflow: hidden;\
  white-space: nowrap;\
}\
#watcher:not(:hover) {\
  max-height: 220px;\
}\
#watcher > div {\
  max-width: 200px;\
  overflow: hidden;\
  padding-left: 5px;\
  padding-right: 5px;\
  text-overflow: ellipsis;\
}\
#watcher > .move {\
  padding-top: 5px;\
  text-decoration: underline;\
}\
\
#qp {\
  padding: 2px 2px 5px;\
}\
#qp .post {\
  border: none;\
  margin: 0;\
  padding: 0;\
}\
#qp img {\
  max-height: 300px;\
  max-width: 500px;\
}\
.qphl {\
  box-shadow: 0 0 0 2px rgba(216, 94, 49, .7);\
}\
.quotelink.deadlink {\
  text-decoration: underline !important;\
}\
.deadlink:not(.quotelink) {\
  text-decoration: none !important;\
}\
.inlined {\
  opacity: .5;\
}\
.inline {\
  background-color: rgba(255, 255, 255, 0.15);\
  border: 1px solid rgba(128, 128, 128, 0.5);\
  display: table;\
  margin: 2px;\
  padding: 2px;\
}\
.inline .post {\
  background: none;\
  border: none;\
  margin: 0;\
  padding: 0;\
}\
div.opContainer {\
  display: block !important;\
}\
.opContainer.filter_highlight {\
  box-shadow: inset 5px 0 rgba(255, 0, 0, .5);\
}\
.opContainer.filter_highlight.qphl {\
  box-shadow: inset 5px 0 rgba(255, 0, 0, .5),\
              0 0 0 2px rgba(216, 94, 49, .7);\
}\
.filter_highlight > .reply {\
  box-shadow: -5px 0 rgba(255, 0, 0, .5);\
}\
.filter_highlight > .reply.qphl {\
  box-shadow: -5px 0 rgba(255, 0, 0, .5),\
              0 0 0 2px rgba(216, 94, 49, .7)\
}\
.filtered {\
  text-decoration: underline line-through;\
}\
.quotelink.forwardlink,\
.backlink.forwardlink {\
  text-decoration: none;\
  border-bottom: 1px dashed;\
}\
'
  };

  Main.init();

}).call(this);
