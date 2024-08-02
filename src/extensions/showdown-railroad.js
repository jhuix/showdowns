/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown railroad extension for markdown
 */
'use strict';

const extName = "railroad";
const cssCdnName = 'railroadCSS';

if (typeof window === 'undefined') {
  throw Error('The showdown railroad extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

let railroad = false;
function hasRailroad() {
  return railroad;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasRailroad();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {    
      dync = true;
      cdnjs.loadStyleSheet(cssCdnName);
      cdnjs.loadScript(extName).then(() => {
        railroad = true;
      });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasRailroad()) return;
  cdnjs.unloadScript(extName);
  cdnjs.unloadStyleSheet(cssCdnName);
  railroad = false;
  dync = false; 
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
    return resolve(true);
  }
  
  setTimeout(() => {
    onRenderRailroad(resolve, res);
  }, 10);
}

/**
 * render railroad graphs
 */
function renderRailroad(element) {
  return new Promise(resolve => {
    const meta = utils.createElementMeta(extName, element);
    if (!meta) {
      return resolve(false);
    }


    meta.cssLink = cdnjs.getSrc(cssCdnName);
    onRenderRailroad(resolve, meta);
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
        console.log(format(`Begin render railroad elements.`));
        return renderRailroadElements(elements).then(() => {
          console.log(format(`End render railroad elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownRailroad;
