/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown viz extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown viz extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

if (typeof Viz === 'undefined') {
  var Viz = window.Viz || undefined;
}

const engines = ['circo', 'dot', 'neato', 'osage', 'twopi'];

function hasViz() {
  return typeof Viz !== 'undefined' && Viz && typeof Viz.instance !== 'undefined'
    ? true
    : false;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasViz();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {  
      dync = true;
      cdnjs.loadScript('Viz').then(name => {
        Viz = utils.interopDefault(window[name]);
      });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasViz()) return;
  cdnjs.unloadScript('Viz');
  Viz = null;
  window.Viz = null;
  dync = false;  
}

function onRenderViz(resolve, res) {
  if (hasViz()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const el = res.element;
    const langattr = res.element.dataset.lang;
    let engine = 'dot';
    if (langattr) {
      const obj = JSON.parse(langattr);
      if (obj && obj.engine && engines.indexOf(obj.engine) != -1) {
        engine = obj.engine;
      }
    }
    Viz.instance().then(viz => {
      const svg = viz.renderString(data, { format: 'svg', engine: engine });
      el.parentNode.outerHTML = `<div id="${id}" class="${name}">${svg}</div>`;
      resolve(true)
    });
    return;
  }

  setTimeout(() => {
    onRenderViz(resolve, res);
  }, 10);
}

/**
 * render Viz graphs
 */
function renderViz(element) {
  return new Promise(resolve => {
    const meta = utils.createElementMeta("viz", element);
    if (!meta) {
      return resolve(false);
    }
 
    onRenderViz(resolve, meta);
  });
}

// <div class="dot"></div>
function renderVizElements(elements) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderViz(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

function showdownViz() {
  return [
    {
      type: 'output',
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the Viz in code blocks
        const elements = wrapper.querySelectorAll('code.dot.language-dot');
        if (!elements.length) {
          return false;
        }
        console.log(format(`Begin render dot elements.`));
        return renderVizElements(elements).then(() => {
          console.log(format(`End render dot elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownViz;
