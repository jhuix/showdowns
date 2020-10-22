/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown katex extension for markdown
 */

if (typeof window === 'undefined') {
  throw Error('The showdown katex extension can only be used in browser environment!');
}

import asciimathToTex from './asciimath2tex';
import cdnjs from './cdn';

if (typeof katex === 'undefined') {
  var katex = window.katex || undefined;
}

if (typeof renderMathInElement === 'undefined') {
  var RenderMathInElement = window.renderMathInElement || undefined;
}

let katexElementCount = 0;
function hasKatex() {
  return typeof RenderMathInElement !== 'undefined' && RenderMathInElement && typeof katex !== 'undefined' && katex
    ? true
    : false;
}

let dync = false;
const cssCdnName = 'katexCSS';
function dyncLoadScript(callback) {
  const sync = hasKatex();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs.loadStyleSheet(cssCdnName);
      cdnjs
        .loadScript('katex')
        .then(name => {
          katex = cdnjs.interopDefault(window[name]);
          return cdnjs.loadScript('renderMathInElement');
        })
        .then(name => {
          RenderMathInElement = cdnjs.interopDefault(window[name]);
          if (typeof callback === 'function' && callback) {
            callback(RenderMathInElement);
          }
        });
      return sync;
    }
  }

  if (typeof callback === 'function' && callback) {
    callback(RenderMathInElement);
  }
  return sync;
}

function onRenderKatex(resolve, res) {
  if (hasKatex()) {
    const id = res.id;
    const name = res.className;
    const input = res.input;
    const data = res.data;
    const cssLink = res.cssLink;
    const config = res.options;
    const doc = res.element.ownerDocument;
    let html = '';
    if (data instanceof Array) {
      data.forEach(code => {
        if (code === '') {
          html += '<br>';
        } else {
          const math = katex.renderToString(code, config);
          html += cssLink
            ? `<div title="${input}" class="${name} css-katex" data-css="${cssLink}">${math}</div>`
            : `<div title="${input}" class="${name}">${math}</div>`;
        }
      });
    } else {
      const math = katex.renderToString(data, config);
      html = cssLink
        ? `<div title="${input}" class="${name} css-katex" data-css="${cssLink}">${math}</div>`
        : `<div title="${input}" class="${name}">${math}</div>`;
    }
    res.element.parentNode.outerHTML = html;
    --katexElementCount;
    if (!katexElementCount) {
      RenderMathInElement(doc.body, config);
    }
    resolve(true);
  } else {
    setTimeout(() => {
      onRenderKatex(resolve, res);
    }, 50);
  }
}

function renderKatex(element, config, isAsciimath) {
  return new Promise(resolve => {
    const latex = element.textContent.trim();
    let data;
    const codes = latex.split(/\n[ \f\r\t\v]*\n/);
    if (codes.length > 1) {
      data = new Array();
      codes.forEach(code => {
        code = code.trim();
        if (code !== '') {
          code = isAsciimath ? asciimathToTex(code) : code;
        }
        data.push(code);
      });
    } else {
      data = isAsciimath ? asciimathToTex(latex) : latex;
    }

    const langattr = element.dataset.lang;
    const langobj = langattr ? JSON.parse(langattr) : null;
    let diagramClass = '';
    if (langobj) {
      if (
        (typeof langobj.codeblock === 'boolean' && langobj.codeblock) ||
        (typeof langobj.codeblock === 'string' && langobj.codeblock.toLowerCase() === 'true')
      ) {
        return resolve(false);
      }

      if (langobj.align) {
        //default left
        if (langobj.align === 'center') {
          diagramClass = 'diagram-center';
        } else if (langobj.align === 'right') {
          diagramClass = 'diagram-right';
        }
      }
    }
    const cssLink = cdnjs.getSrc(cssCdnName);
    const name =
      (element.classList.length > 0 ? element.classList[0] : '') +
      (!element.className || !diagramClass ? '' : ' ') +
      diagramClass;
    const id = 'katex-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    const res = {
      element: element,
      id: id,
      className: name,
      input: latex,
      data: data,
      cssLink: cssLink,
      options: config
    };
    onRenderKatex(resolve, res);
  });
}

function renderBlockElements(latex, asciimath, config) {
  katexElementCount = latex.length + asciimath.length;
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    latex.forEach(element => {
      promiseArray.push(renderKatex(element, config, false));
    });
    asciimath.forEach(element => {
      promiseArray.push(renderKatex(element, config, true));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

/**
 * https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
 * @param {string} str
 * @returns {string} regexp escaped string
 */
function escapeRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\$^|]/g, '\\$&');
}

// katex config
const getConfig = (userConfig = {}) => {
  let config = {
    displayMode: true,
    throwOnError: false, // fail silently
    errorColor: '#ff0000',
    delimiters: [
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false }
    ],
    ...userConfig
  };

  function _isEmptyArray(a) {
    if (!Array.isArray(a) || !a.length) {
      return false;
    }

    return true;
  }

  function _isObjectProperty(obj, prop) {
    if (typeof obj !== 'object' || !obj.hasOwnProperty(prop)) {
      return false;
    }
    return true;
  }

  function _getDelimiter(obj, style, type) {
    if (!_isObjectProperty(obj, style) || !_isObjectProperty(obj[style], type) || !_isEmptyArray(obj[style][type])) {
      return false;
    }

    obj[style][type].forEach(delimiter => {
      delimiter.display = type === 'inline' ? false : true;
      if (style === 'asciimath') {
        delimiter.asciimath = true;
      }
    });
    return obj[style][type];
  }

  if (!Array.isArray(config.mathDelimiters)) {
    config.mathDelimiters = []
      .concat(
        _getDelimiter(config.mathDelimiters, 'texmath', 'display') || [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true }
        ]
      )
      .concat(
        _getDelimiter(config.mathDelimiters, 'texmath', 'inline') || [
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ]
      )
      .concat(
        _getDelimiter(config.mathDelimiters, 'asciimath', 'display') || [
          { left: '@@', right: '@@', display: true, asciimath: true }
        ]
      )
      .concat(
        _getDelimiter(config.mathDelimiters, 'asciimath', 'inline') || [
          { left: '@ ', right: ' @', display: false, asciimath: true },
          { left: '~ ', right: ' ~', display: false, asciimath: true }
        ]
      );
  } else if (!config.mathDelimiters.length) {
    config.mathDelimiters = [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '$', right: '$)', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '@@', right: '@@', display: true, asciimath: true },
      { left: '@ ', right: ' @', display: false, asciimath: true },
      { left: '~ ', right: ' ~', display: false, asciimath: true }
    ];
  }
  return config;
};

function showdownKatex(userConfig) {
  let inlineMathCount = 0;
  const config = getConfig(userConfig);
  const mathDelimiters = config.mathDelimiters.map(({ left, right, display, asciimath }) => {
    const test = new RegExp(`${escapeRegExp(left)}(.+?)${escapeRegExp(right)}`, 'g');
    const replacer = (match, math) => {
      ++inlineMathCount;
      if (asciimath) {
        math = asciimathToTex(math);
      }
      if (display) {
        return `\\[${math}\\]`;
      }
      return `\\(${math}\\)`;
    };
    return { test, replacer };
  });

  return [
    {
      type: 'output',
      config: config,
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }

        if (mathDelimiters.length) {
          // convert inline math to inline latex
          // ignore anything in code and pre elements
          wrapper.querySelectorAll(':not(code):not(pre)').forEach(el => {
            /** @type Text[] */
            const textNodes = [...el.childNodes].filter(
              // skip "empty" text nodes
              node => node.nodeName === '#text' && node.nodeValue.trim()
            );

            textNodes.forEach(node => {
              const newText = mathDelimiters.reduce(
                (acc, { test, replacer }) => acc.replace(test, replacer),
                node.nodeValue
              );
              node.nodeValue = newText;
            });
          });
        }

        // find the math in code blocks
        const latex = wrapper.querySelectorAll('code.latex.language-latex');
        const asciimath = wrapper.querySelectorAll('code.asciimath.language-asciimath');

        if (!latex.length && !asciimath.length) {
          if (inlineMathCount > 0) {
            this.config.cssLink = cdnjs.getSrc(cssCdnName);
            const that = this;
            function asyncRenderKatex(resolve, render) {
              if (hasKatex()) {
                render(wrapper.ownerDocument.body, that.config);
                resolve(true);
              } else {
                setTimeout(() => {
                  asyncRenderKatex(resolve, render);
                }, 50);
              }
            }
            console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render inline katex elements.`);
            return new Promise(resolve => {
              dyncLoadScript(render => {
                asyncRenderKatex(resolve, render);
              });
            }).then(() => {
              console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render inline katex elements.`);
              return obj;
            });
          }

          return false;
        }

        config.cssLink = cdnjs.getSrc(cssCdnName);
        console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render katex elements.`);
        return renderBlockElements(latex, asciimath, this.config).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render katex elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownKatex;
