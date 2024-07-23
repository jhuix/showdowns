/*
 * Copyright (c) 2024-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown railroad extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown railroad extension can only be used in browser environment!');
}

import cdnjs from './cdn';

if (typeof ABCJS === 'undefined') {
    var ABCJS = window.ABCJS || undefined;
}  

function hasAbc() {
    return !!ABCJS;
}

let dync = false;
const cssCdnName = 'ABCJSCSS';
function dyncLoadScript() {
  const sync = hasAbc();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs.loadStyleSheet(cssCdnName);
      cdnjs.loadScript('ABCJS').then(name => {
        ABCJS = cdnjs.interopDefault(window[name]);
      });
    }
  }
  return sync;
}

function onRenderAbc(resolve, res) {
  if (hasAbc()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const cssLink = res.cssLink;
    const doc = res.element.ownerDocument;
    res.element.parentNode.outerHTML = cssLink
      ? `<div id="${id}" class="${name} css-abc" data-css="${cssLink}"></div>`
      : `<div id="${id}" class="${name}"></div>`;
    const element = doc.getElementById(id);
    ABCJS.renderAbc(element, data);
    resolve(true);
  } else {
    setTimeout(() => {
      onRenderAbc(resolve, res);
    }, 50);
  }
}

/**
 * render abc graphs
 */
function renderAbc(element) {
  return new Promise(resolve => {
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
    const code = element.textContent.trim();
    const name =
      (element.classList.length > 0 ? element.classList[0] : '') +
      (!element.className || !diagramClass ? '' : ' ') +
      diagramClass;
    const id = 'abc-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    const res = {
      element: element,
      id: id,
      className: name,
      data: code,
      cssLink: cssLink
    };
    onRenderAbc(resolve, res);
  });
}

// <div class="abc"></div>
function renderAbcElements(elements) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderAbc(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

const extName = 'abc';
function showdownAbc() {
  return [
    {
      type: 'output',
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the railroad in code blocks
        const elements = wrapper.querySelectorAll(`code.${extName}.language-${extName}`);
        if (!elements.length) {
          return false;
        }

        this.config = {
          cssLink: cdnjs.getSrc(cssCdnName)
        };
        console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render ${extName} elements.`);
        return renderAbcElements(elements).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render ${extName} elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownAbc;
