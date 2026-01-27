/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown antv extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown antv extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

const extName = "AntVInfographic";
if (typeof AntVInfographic === 'undefined') {
  var AntVInfographic = window.AntVInfographic || undefined;
}

function hasAntV() {
  return typeof AntVInfographic !== 'undefined' && AntVInfographic ? true : false;
}

let dync = false;
function dyncLoadScript() {
  // When window object exists,
  // it means browser environment, otherwise node.js environment.
  // In browser environment, html need to be rendered asynchronously.
  const sync = hasAntV();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      cdnjs.loadScript(extName).then(name => {
        AntVInfographic = utils.interopDefault(window[name]);
      }).catch(e => {
        console.log('load script error: ' + e);
      });
      return sync
    }
  }

  return sync;
}

function unloadScript() {
  if (!hasAntV()) return;
  cdnjs.unloadScript(extName);
  window.AntVInfographic = null;
  AntVInfographic = null;
  dync = false;
}


function onRenderInfoGraphic(resolve, meta) {
  if (hasAntV()) {
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
    options.container = svgElement;
    if (meta.lang) {
      if (meta.lang.width) {
        options.width = meta.lang.width;
      }
      if (meta.lang.height) {
        options.height = meta.lang.height;
      }
    }
    const infographic = new AntVInfographic.Infographic(options);
    infographic.render(data);
    node.replaceWith(svgElement);
    resolve(true);
    return;
  }

  setTimeout(() => {
    onRenderInfoGraphic(resolve, meta);
  }, 10);
}

/**
 * render antv graphs
 */
function renderInfoGraphic(element) {
  return new Promise(resolve => {
    const meta = utils.createElementMeta('infographic', element);
    if (!meta || !meta.data) {
      return resolve(false);
    }

    onRenderInfoGraphic(resolve, meta);
  });
}

// <div class="infographic"></div>
function renderAntvElements(elements) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderInfoGraphic(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// antv infographic configuration: https://infographic.antv.vision/reference/infographic-options
function showdownAntV() {

  return [
    {
      type: 'output',
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the antv in code blocks
        const elements = wrapper.querySelectorAll('code.infographic.language-infographic');
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render antv elements.`));
        return renderAntvElements(elements).then(() => {
          console.log(format(`End render antv elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownAntV;
