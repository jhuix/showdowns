/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown plantuml extension for markdown
 */
'use strict';

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

if (typeof shiki === 'undefined') {
  var shiki = window.shiki || undefined;
}

function hasShiki() {
  shiki = window.shiki;
  return typeof shiki !== 'undefined' && shiki ? true : false;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasShiki();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      cdnjs.loadScript('shiki', false, true).then(name => {
        shiki = utils.interopDefault(window[name]);
      }).catch(e => {
        console.log('load script error: ' + e);
      });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasShiki()) return;
  cdnjs.unloadScript('Shiki');
  shiki = null;
  window.shiki = null;
  dync = false;
}

function onRenderShiki(resolve, element, options) {
  if (hasShiki()) {
    const code = element.textContent.trim();
    const language = element.classList[0];
    shiki.codeToHtml(code, {lang: language, theme: options.theme}).then((output) => {
      output = output.replace(/<pre(.*)><code/g, '<pre' + '$1' +` data-language="${language}" data-theme="${options.theme}"><code` );
      element.parentNode.outerHTML = output;
      resolve(true);
    }).catch((err) => {
      console.error('Shiki render failed:', err)
      resolve(false);
    })
    return;
  }

  setTimeout(() => {
    onRenderShiki(resolve, element, options);
  }, 10);
}

function renderShiki(element, options) {
  return new Promise(resolve => {
    onRenderShiki(resolve, element, options);
  });
}

function renderBlockElements(elements, config) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderShiki(element, config));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

const getConfig = (config = {}) => ({
  theme: 'github-light',
  ...config
});

function showdownShiki(userConfig) {
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
        // find the language in code blocks
        const elements = wrapper.querySelectorAll('code[class*="language-"]');
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render shiki elements.`));
        return renderBlockElements(elements, this.config).then(() => {
          console.log(format(`End render shiki elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownShiki;
