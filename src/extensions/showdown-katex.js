/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
/*
Showdown katex extension for markdown,
Modified by jhuix, Copyright (c) 2019 https://github.com/jhuix/showdowns.
Based on showdown-katex.js, Version 0.6.0, Copyright (c) 2016 obedm503 https://github.com/obedm503/showdown-katex.git.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

if (typeof window === 'undefined') {
  throw Error('The showdown katex extension can only be used in browser environment!');
}

import asciimathToTex from 'showdown-katex/src/asciimath-to-tex';
import cdnjs from './cdn';
// import katex from 'katex';
// import renderMathInElement from 'katex/dist/contrib/auto-render';
// if (typeof Katex === 'undefined') {
//   var Katex = katex;
// }
// if (typeof RenderMathInElement === 'undefined') {
//  var RenderMathInElement = renderMathInElement;
// }

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
function dyncLoadScript() {
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
        });
    }
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
    const document = res.element.ownerDocument;
    const html = katex.renderToString(data, config);
    res.element.parentNode.outerHTML = cssLink
      ? `<div title="${input}" class="${name} css-katex" data-css="${cssLink}">${html}</div>`
      : `<div title="${input}" class="${name}">${html}</div>`;
    --katexElementCount;
    if (!katexElementCount) {
      RenderMathInElement(document.body, config);
    }
    resolve(true);
  } else {
    setTimeout(() => {
      onRenderKatex(resolve, res);
    }, 100);
  }
}

function renderKatex(element, config, isAsciimath) {
  return new Promise(resolve => {
    const latex = element.textContent.trim();
    const code = isAsciimath ? asciimathToTex(latex) : latex;
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
    const sync = dyncLoadScript();
    const cssLink = cdnjs.getSrc(cssCdnName);
    const name =
      (element.classList.length > 0 ? element.classList[0] : '') +
      (!element.className || !diagramClass ? '' : ' ') +
      diagramClass;
    if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
      const id = 'katex-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      element.id = id;
      const res = {
        element: element,
        id: id,
        className: name,
        input: latex,
        data: code,
        cssLink: cssLink,
        options: config
      };
      onRenderKatex(resolve, res);
    } else {
      const document = element.ownerDocument;
      const html = katex.renderToString(code, config);
      element.parentNode.outerHTML = cssLink
        ? `<div title="${latex}" class="${name} css-katex" data-css="${cssLink}">${html}</div>`
        : `<div title="${latex}" class="${name}">${html}</div>`;
      --katexElementCount;
      if (!katexElementCount) {
        RenderMathInElement(document.body, config);
      }
      return resolve(true);
    }
  });
}

function renderBlockElements(latex, asciimath, config) {
  katexElementCount = latex.length + asciimath.length;

  const promiseArray = [];
  latex.forEach(element => {
    promiseArray.push(renderKatex(element, config, false));
  });
  asciimath.forEach(element => {
    promiseArray.push(renderKatex(element, config, true));
  });
  return Promise.all(promiseArray);
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
const getConfig = (config = {}) => ({
  displayMode: true,
  throwOnError: false, // fail silently
  errorColor: '#ff0000',
  ...config,
  delimiters: [
    { left: '$$', right: '$$', display: false },
    { left: '~', right: '~', display: false, asciimath: true }
  ].concat(config.delimiters || [])
});

const showdownKatex = userConfig => {
  const config = getConfig(userConfig);
  const asciimathDelimiters = config.delimiters
    .filter(item => item.asciimath)
    .map(({ left, right }) => {
      const test = new RegExp(`${escapeRegExp(left)}(.*?)${escapeRegExp(right)}`, 'g');
      const replacer = (match, asciimath) => {
        return `${left}${asciimathToTex(asciimath)}${right}`;
      };
      return { test, replacer };
    });

  return [
    {
      type: 'output',
      filter: function(obj) {
        return new Promise(resolve => {
          const wrapper = obj.wrapper;
          if (!wrapper) {
            return resolve(obj);
          }

          if (asciimathDelimiters.length) {
            // convert inline asciimath to inline latex
            // ignore anything in code and pre elements
            wrapper.querySelectorAll(':not(code):not(pre)').forEach(el => {
              /** @type Text[] */
              const textNodes = [...el.childNodes].filter(
                // skip "empty" text nodes
                node => node.nodeName === '#text' && node.nodeValue.trim()
              );

              textNodes.forEach(node => {
                const newText = asciimathDelimiters.reduce(
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
            return resolve(obj);
          }

          renderBlockElements(latex, asciimath, config).then(() => {
            resolve(obj);
          });
        });
      }
    }
  ];
};

export default showdownKatex;
