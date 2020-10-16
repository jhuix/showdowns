/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown mermaid extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown mermaid extension can only be used in browser environment!');
}

import cdnjs from './cdn';
// import mermaid from 'mermaid';
// if (typeof Mermaid === 'undefined') {
//   var Mermaid = mermaid;
// }

if (typeof mermaid === 'undefined') {
  var mermaid = window.mermaid || undefined;
}

function hasMermaid() {
  return typeof mermaid !== 'undefined' && mermaid ? true : false;
}

let dync = false;
function dyncLoadScript(config) {
  // When window object exists,
  // it means browser environment, otherwise node.js environment.
  // In browser environment, html need to be rendered asynchronously.
  const sync = hasMermaid();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs.loadScript('mermaid').then(name => {
        mermaid = cdnjs.interopDefault(window[name]);
        mermaid.initialize(config);
      });
      return sync
    }
  }

  mermaid.initialize(config);
  return sync;
}

function onRenderMermaid(resolve, res) {
  if (hasMermaid()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    mermaid.render(id, data, svgCode => {
      res.element.parentNode.outerHTML = `<div class="${name}">${svgCode}</div>`;
      resolve(true);
    });
  } else {
    setTimeout(() => {
      onRenderMermaid(resolve, res);
    }, 50);
  }
}

/**
 * render mermaid graphs
 */
function renderMermaid(element) {
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
    const id = 'mermaid-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    const res = {
      element: element,
      id: id,
      className: name,
      data: code,
      resolve: resolve
    };
    onRenderMermaid(resolve, res);
  });
}

// <div class="mermaid"></div>
function renderMermaidElements(elements, config) {
  dyncLoadScript(config);
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderMermaid(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// mermaid default config
const getConfig = (config = {}) => ({
  theme: 'forest',
  logLevel: 3,
  startOnLoad: false,
  arrowMarkerAbsolute: false,
  flowchart: {
    curve: 'basis'
  },
  gantt: {
    axisFormat: '%m/%d/%Y'
  },
  sequence: {
    actorMargin: 50
  },
  ...config
});

function showdownMermaid(userConfig) {
  const config = getConfig(userConfig);
  return [
    {
      type: 'output',
      config: config,
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the mermaid in code blocks
        const elements = wrapper.querySelectorAll('code.mermaid.language-mermaid');
        if (!elements.length) {
          return false;
        }

        console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render mermaid elements.`);
        return renderMermaidElements(elements, this.config).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render mermaid elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownMermaid;
