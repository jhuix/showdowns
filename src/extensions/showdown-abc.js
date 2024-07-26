/*
 * Copyright (c) 2024-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown abc extension for markdown
 */
'use strict';

const extName = 'abc';
const cssCdnName = 'ABCJSCSS';

if (typeof window === 'undefined') {
  throw Error('The showdown abcjs extension can only be used in browser environment!');
}

import cdnjs from './cdn';
import utils from './utils';

if (typeof ABCJS === 'undefined') {
    var ABCJS = window.ABCJS || undefined;
}  

function hasAbc() {
    return !!ABCJS;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasAbc();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs.loadStyleSheet(cssCdnName);
      cdnjs.loadScript('ABCJS').then(name => {
        ABCJS = utils.interopDefault(window[name]);
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
    return resolve(true);
  }

  setTimeout(() => {
    onRenderAbc(resolve, res);
  }, 20);
}

/**
 * render abc graphs
 */
function renderAbc(element) {
  return new Promise(resolve => {
    let meta = utils.createElementMeta(extName, element);
    if (!meta) {
      return resolve(false);
    }

    meta.cssLink = cdnjs.getSrc(cssCdnName);
    onRenderAbc(resolve, meta);
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


function showdownAbc() {
  return [
    {
      type: 'output',
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the abc in code blocks
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
