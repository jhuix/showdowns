/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown MathJax extension for markdown
 */

if (typeof window === 'undefined') {
  throw Error('The showdown MathJax extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

if (typeof MathJax === 'undefined') {
  var MathJax = window.MathJax || undefined;
}


let mathJaxElementCount = 0;
function hasMathJax() {
  return typeof MathJax !== 'undefined' && MathJax ? true : false;
}

let dync = false;
function dyncLoadScript(config) {
  const sync = hasMathJax();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      window.MathJax = {
        tex: {
          inlineMath: { '[+]': [['\\$', '\\$']] },
          displayMath: { '[+]': [['@@', '@@']] }
        },
        svg: {
          fontCache: 'global'
        },
        startup: {
          pageReady() {
            return window.MathJax.startup.defaultPageReady().then(() => {
              console.log('MathJax be rendered completed.');
            });
          }
        }
      };
      if (config) {
        utils.deepMerge(window.MathJax, config);
      } else if (window.MathJaxConfig) {
        utils.deepMerge(window.MathJax, window.MathJaxConfig);
      }
      cdnjs.loadScript('MathJax', true).then(name => {
          MathJax = utils.interopDefault(window[name]);
      }).catch(e => {
        console.log('load script error: ' + e);
      });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasMathJax()) return;
  cdnjs.unloadScript('MathJax');
  MathJax = null;
  window.MathJax = null;
  dync = false;
}

function onRenderMathJax(resolve, res) {
  if (hasMathJax()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const cssLink = res.cssLink ?? '';
    const cssClass = cssLink.length > 0 ? ' css-mathjax' : '';
    const options = res.options;
    const element = res.element;
    const doc = element.ownerDocument;
    MathJax.tex2svgPromise(data, options).then((output) => {
      const jax = doc.createElement('div');
      jax.id = id;
      jax.className = `${name}${cssClass}`;
      if (cssLink.length > 0) {
        jax.dataset.css = cssLink;
      }
      jax.appendChild(output);
      element.parentNode.replaceWith(jax);
      --mathJaxElementCount;
      if (!mathJaxElementCount) {
        MathJax.startup.document.clear();
      }
      resolve(true);
    }).catch((err) => {
      --mathJaxElementCount;
      if (!mathJaxElementCount) {
        MathJax.startup.document.clear();
      }
      console.error('MathJax render failed:', err)
      resolve(false);
    })
    return;
  }

  setTimeout(() => {
    onRenderMathJax(resolve, res);
  }, 10);
}

function renderMathJax(element, options) {
  return new Promise(resolve => {
    const meta = utils.createElementMeta('MathJax', element);
    if (!meta) {
      return resolve(false);
    }

    meta.options = Object.assign(options ?? {}, meta.options ?? {});
    onRenderMathJax(resolve, meta);
  });
}

function renderBlockElements(mathjaxs, config) {
  mathJaxElementCount = mathjaxs.length;
  dyncLoadScript(config.mathJax);
  return new Promise(resolve => {
    const promiseArray = [];
    mathjaxs.forEach(element => {
      promiseArray.push(renderMathJax(element, config.conversion));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// MathJax config
const getConfig = (userConfig = {}) => {
  let config = {
    engine: 'mathjax',
    delimiters: [],
    mathJax: {},
    conversion: {},
    ...userConfig
  };

  function _isEmptyArray(a) {
    if (!Array.isArray(a) || !a.length) {
      return false;
    }

    return true;
  }

  function _isObjectProperty(obj, prop) {
    if (!obj || typeof obj !== 'object' || !obj.hasOwnProperty(prop)) {
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

  if (!Array.isArray(config.delimiters)) {
    config.delimiters = []
      .concat(
        _getDelimiter(config.delimiters, 'asciimath', 'display') || [
          { left: '@@', right: '@@', display: true, asciimath: true }
        ]
      )
      .concat(
        _getDelimiter(config.delimiters, 'asciimath', 'inline') || [
          { left: "\\$", right: "\\$", display: false, asciimath: true }
        ]
      );
  } else if (!config.delimiters.length) {
    config.delimiters = [
      { left: '@@', right: '@@', display: true, asciimath: true },
      { left: "\\$", right: "\\$", display: false, asciimath: true }
    ];
  }
  return config;
};

function loadMathJax(callback) {
  if (!window.MathJax) {
    return;
  }

  const doc = document.querySelector('.showdowns');
  if (doc) {
    window.MathJax.startup.document.clearMathItemsWithin([doc]);
    window.MathJax.texReset();
    window.MathJax.typesetPromise().then(() => {
      console.log('MathJax be reset rendered completed.')
      window.MathJax.startup.document.clear();
      if (typeof callback === 'function' && callback) {
        callback(window.MathJax);
      }
      unloadScript();
    }).catch((err) => {
      console.error('MathJax typeset failed:', err);
    });
  }
}

function showdownMathJax(userConfig) {
  const config = getConfig(userConfig);

  return [
    {
      type: 'output',
      config: config,
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }

        this.config.mathJax = this.config.mathJax ?? {}
        const options = this.config.mathJax;
        if (config.delimiters?.length > 0) {
          const tex = {
            inlineMath: {},
            displayMath: {}
          }
          config.delimiters.forEach((delimiter) => {
            if (delimiter.display) {
              tex.displayMath['[+]'] = (tex.displayMath['[+]'] ?? []).concat([[delimiter.left, delimiter.right]]);
            } else {
              tex.inlineMath['[+]'] = (tex.inlineMath['[+]'] ?? []).concat([[delimiter.left, delimiter.right]]);
            }
          });
          if (!options.tex) {
            options.tex = {inlineMath:{}, displayMath: {}};
          }
          options.tex.inlineMath = options.tex.inlineMath ?? {}
          options.tex.displayMath = options.tex.displayMath ?? {}
          if ((options.tex.inlineMath['[+]'] ?? []).length == 0) {
            options.tex.inlineMath['[+]'] = tex.inlineMath['[+]'];
          }
          if ((options.tex.displayMath['[+]'] ?? []).length == 0) {
            options.tex.displayMath['[+]'] = tex.displayMath['[+]'];
          }
        }

        let bodyRender = false;
        if (this.config.engine === 'mathjax') {
          const content = wrapper.textContent;
          if (content.match(/(?:@@|\$\$|\\\$|\\\(|\\\[|\\begin\{.*?})/)) {
            obj.scripts.push({
              id: 'showdown-mathjax',
              code: loadMathJax,
              once: true
            })
            dyncLoadScript(this.config.mathJax)
            bodyRender = true;
          }
        }

        // find the math in code blocks
        const mathjaxs = wrapper.querySelectorAll('code.mathjax.language-mathjax,code.math.language-math');
        if (!mathjaxs.length) {
          return bodyRender ? obj : false;
        }

        console.log(format(`Begin render mathjax elements.`));
        return renderBlockElements(mathjaxs, this.config).then(() => {
          console.log(format(`End render mathjax elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownMathJax;
