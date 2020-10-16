/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown railroad extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown railroad extension can only be used in browser environment!');
}

import cdnjs from './cdn';

let railroad = false;
function hasRailroad() {
  return railroad;
}

let dync = false;
const cssCdnName = 'railroadCSS';
function dyncLoadScript() {
  const sync = hasRailroad();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs.loadStyleSheet(cssCdnName);
      cdnjs.loadScript('railroad').then(() => {
        railroad = true;
      });
    }
  }
  return sync;
}

function onRenderRailroad(resolve, res) {
  if (hasRailroad()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const cssLink = res.cssLink;
    const railroadElement = window.eval(data).format();
    const doc = res.element.ownerDocument;
    res.element.parentNode.outerHTML = cssLink
      ? `<div id="${id}" class="${name} css-railroad" data-css="${cssLink}"></div>`
      : `<div id="${id}" class="${name}"></div>`;
    railroadElement.addTo(doc.getElementById(id));
    resolve(true);
  } else {
    setTimeout(() => {
      onRenderRailroad(resolve, res);
    }, 50);
  }
}

/**
 * render railroad graphs
 */
function renderRailroad(element) {
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
    const id = 'railroad-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    const res = {
      element: element,
      id: id,
      className: name,
      data: code,
      cssLink: cssLink
    };
    onRenderRailroad(resolve, res);
  });
}

// <div class="railroad"></div>
function renderRailroadElements(elements) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderRailroad(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

function showdownRailroad() {
  return [
    {
      type: 'output',
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the railroad in code blocks
        const elements = wrapper.querySelectorAll('code.railroad.language-railroad');
        if (!elements.length) {
          return false;
        }

        this.config = {
          cssLink: cdnjs.getSrc(cssCdnName)
        };
        console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render railroad elements.`);
        return renderRailroadElements(elements).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render railroad elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownRailroad;
