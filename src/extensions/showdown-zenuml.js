/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown zenuml extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown zenuml extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

const extName = "zenuml";
if (typeof zenuml === 'undefined') {
  var zenuml = window.zenuml || undefined;
}

function hasZenuml() {
  return typeof zenuml !== 'undefined' && zenuml ? true : false;
}

let dync = false;
function dyncLoadScript() {
  // When window object exists,
  // it means browser environment, otherwise node.js environment.
  // In browser environment, html need to be rendered asynchronously.
  const sync = hasZenuml();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      cdnjs.loadScript(extName).then(name => {
        zenuml = utils.interopDefault(window[name]);
      }).catch(e => {
        console.log('load script error: ' + e);
      });
      return sync
    }
  }

  return sync;
}

function unloadScript() {
  if (!hasZenuml()) return;
  cdnjs.unloadScript(extName);
  window.zenuml = null;
  zenuml = null;
  dync = false;
}


function onRenderZenuml(resolve, meta) {
  if (hasZenuml()) {
    const id = meta.id;
    const name = meta.className;
    const data = meta.data;
    const node = meta.element.parentNode;
    const element = meta.element;
    const options = meta.lang?.options ?? {}
    const doc = element.ownerDocument;
    const svgElement = doc.createElement('div');
    svgElement.id = id;
    if (element.style.cssText.length > 0) {
      svgElement.style.cssText = element.style.cssText;
    }
    svgElement.className = name;
    svgElement.classList.remove('zenuml');
    if (!options.theme) {
      options.theme = 'theme-blue';
    }
    const uml = new zenuml(svgElement);
    uml.render(data, options);
    node.replaceWith(svgElement);
    resolve(true);
    return;
  }

  setTimeout(() => {
    onRenderZenuml(resolve, meta);
  }, 10);
}

/**
 * render zenuml graphs
 */
function renderZenuml(element) {
  return new Promise(resolve => {
    const meta = utils.createElementMeta(extName, element);
    if (!meta || !meta.data) {
      return resolve(false);
    }

    onRenderZenuml(resolve, meta);
  });
}

// <div class="zenuml"></div>
function renderZenumlElements(elements, scripts) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderZenuml(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// zenuml configuration: https://github.com/mermaid-js/zenuml-core/blob/main/TUTORIAL.md#configuration
function showdownZenuml() {

  return [
    {
      type: 'output',
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the zenuml in code blocks
        const elements = wrapper.querySelectorAll('code.zenuml.language-zenuml');
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render zenuml elements.`));
        return renderZenumlElements(elements).then(() => {
          console.log(format(`End render zenuml elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownZenuml;
