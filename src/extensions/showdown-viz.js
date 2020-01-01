/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown viz extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown viz extension can only be used in browser environment!');
}

import cdnjs from './cdn';
// import viz from 'viz.js';
// if (typeof Viz === 'undefined') {
//   var Viz = viz;
// }

if (typeof Viz === 'undefined') {
  var Viz = window.Viz || undefined;
}

const engines = ['circo', 'dot', 'neato', 'osage', 'twopi'];

function hasViz() {
  return typeof Viz !== 'undefined' && Viz && typeof Viz.Module !== 'undefined' && typeof Viz.render !== 'undefined'
    ? true
    : false;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasViz();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs.loadScript('Viz').then(name => {
        Viz = cdnjs.interopDefault(window[name]);
      });
      cdnjs.loadScript('VizRender');
    }
  }
  return sync;
}

function onRenderViz(resolve, res) {
  if (hasViz()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const el = res.element;
    const langattr = res.langattr;
    let engine = 'dot';
    if (langattr) {
      const obj = JSON.parse(langattr);
      if (obj && obj.engine && engines.indexOf(obj.engine) != -1) {
        engine = obj.engine;
      }
    }
    new Viz().renderString(data, { format: 'svg', engine: engine }).then(svgData => {
      el.parentNode.outerHTML = `<div id="${id}" class="${name}">${svgData}</div>`;
      resolve(true);
    });
  } else {
    setTimeout(() => {
      onRenderViz(resolve, res);
    }, 50);
  }
}

/**
 * render Viz graphs
 */
function renderViz(element) {
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

    const code = element.textContent.trim();
    const name =
      (element.classList.length > 0 ? element.classList[0] : '') +
      (!element.className || !diagramClass ? '' : ' ') +
      diagramClass;
    const id = 'viz-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    const res = {
      element: element,
      id: id,
      className: name,
      data: code,
      langattr: langattr
    };
    onRenderViz(resolve, res);
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
        console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render dot elements.`);
        return renderVizElements(elements).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render dot elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownViz;
