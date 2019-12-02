/** !
Modified by jhuix, 2019 (c) https://github.com/jhuix/showdowns
Based on showdown-katex.js, Version 0.6.0, Copyright (c) 2016 obedm503 https://github.com/obedm503/showdown-katex.git

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

import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import asciimathToTex from 'showdown-katex/src/asciimath-to-tex';
import cdnjs from './cdn';

if (typeof Katex === 'undefined') {
  var Katex = katex;
}

if (typeof RenderMathInElement === 'undefined') {
  var RenderMathInElement = renderMathInElement;
}

let katexElementCount = 0;

function hasKatex() {
  return typeof RenderMathInElement !== 'undefined' &&
    RenderMathInElement &&
    typeof Katex !== 'undefined' &&
    Katex
    ? true
    : false;
}

function renderKatex(element, config, isAsciimath, sync) {
  const latex = element.textContent.trim();
  const code = isAsciimath ? asciimathToTex(latex) : latex;
  const langattr = element.dataset.lang;
  const langobj = langattr ? JSON.parse(langattr) : null;
  let diagramClass = '';
  if (langobj && langobj.align) {
    //default left
    if (langobj.align === 'center') {
      diagramClass = 'diagram-center';
    } else if (langobj.align === 'right') {
      diagramClass = 'diagram-right';
    }
  }
  const name = element.className + (!element.className || !diagramClass ? '' : ' ') + diagramClass;
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    const id = 'katex-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    Promise.resolve(id).then(elementid => {
      // dispatch katex custom event
      window.dispatchEvent(
        new CustomEvent('katex', {
          detail: {
            id: elementid,
            className: name,
            input: latex,
            data: code,
            options: config
          }
        })
      );
    });
  } else {
    const html = Katex.renderToString(code, config);
    element.parentNode.outerHTML = `<div title="${latex}" class="${name}">${html}</div>`;
  }
}

function renderBlockElements(latex, asciimath, config) {
  if (!latex.length && !asciimath.length) {
    return;
  }

  katexElementCount = latex.length + asciimath.length;
  const sync = hasKatex();
  if (typeof window !== 'undefined') {
    if (!sync) {
      cdnjs.loadStyleSheet('katexCSS');
      cdnjs.loadScript('katex').then(name => {
        Katex = cdnjs.interopDefault(window[name]);
      });
    }
  }

  latex.forEach(element => {
    renderKatex(element, config, false, sync);
  });
  asciimath.forEach(element => {
    renderKatex(element, config, true, sync);
  });
}

function onRenderKatex(element) {
  Promise.resolve({ canRender: hasKatex(), element: element }).then(res => {
    if (res.canRender) {
      const id = res.element.id;
      const name = res.element.className;
      const input = res.element.input;
      const data = res.element.data;
      const config = res.element.options;
      const el = window.document.getElementById(id);
      if (el) {
        const html = Katex.renderToString(data, config);
        el.parentNode.outerHTML = `<div title="${input}" class="${name}">${html}</div>`;
      }
      --katexElementCount;
      if (!katexElementCount) {
        RenderMathInElement(window.document.body, config);
      }
    } else {
      setTimeout(() => {
        onRenderKatex(res.element);
      }, 100);
    }
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
  const parser = new DOMParser();
  const config = getConfig(userConfig);
  const asciimathDelimiters = config.delimiters
    .filter(item => item.asciimath)
    .map(({ left, right }) => {
      const test = new RegExp(
        `${escapeRegExp(left)}(.*?)${escapeRegExp(right)}`,
        'g'
      );
      const replacer = (match, asciimath) => {
        return `${left}${asciimathToTex(asciimath)}${right}`;
      };
      return { test, replacer };
    });

  if (!hasKatex() && typeof window !== 'undefined' && window.dispatchEvent) {
    // Listen Viz custom event
    window.addEventListener('katex', event => {
      if (event.detail) {
        onRenderKatex(event.detail);
      }
    });
  }

  return [
    {
      type: 'output',
      filter(html = '') {
        // parse html
        const wrapper = parser.parseFromString(html, 'text/html').body;

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
        const asciimath = wrapper.querySelectorAll(
          'code.asciimath.language-asciimath'
        );

        renderBlockElements(latex, asciimath, config);
        // return html without the wrapper
        return wrapper.innerHTML;
      }
    }
  ];
};

// register extension with default config
if (typeof window.showdown !== 'undefined') {
  window.showdown.extension('showdown-katex', showdownKatex());
}

export default showdownKatex;
