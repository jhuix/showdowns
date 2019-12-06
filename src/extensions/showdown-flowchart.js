/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown flowchart extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown flowchart extension can only be used in browser environment!');
}

import cdnjs from './cdn';
// import raphael from 'raphael';
// import flowchart from 'flowchart.js';
// if (typeof Raphael === 'undefined') {
//   var Raphael = raphael;
// }
// if (typeof Flowchart === 'undefined') {
//   var Flowchart = flowchart;
// }

if (typeof Raphael === 'undefined') {
  var Raphael = window.Raphael || undefined;
}

if (typeof flowchart === 'undefined') {
  var flowchart = window.flowchart || undefined;
}

function hasFlowchart() {
  return typeof Raphael !== 'undefined' && Raphael && typeof flowchart !== 'undefined' && flowchart ? true : false;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasFlowchart();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs
        .loadScript('Raphael')
        .then(name => {
          Raphael = cdnjs.interopDefault(window[name]);
          return cdnjs.loadScript('flowchart');
        })
        .then(name => {
          flowchart = cdnjs.interopDefault(window[name]);
        });
    }
  }
  return sync;
}

/**
 * render flowchart graphs
 */
function renderFlowchart(element, options) {
  const langattr = element.dataset.lang;
  const langobj = langattr ? JSON.parse(langattr) : null;
  let diagramClass = '';
  if (langobj) {
    if (
      (typeof langobj.codeblock === 'boolean' && langobj.codeblock) ||
      (typeof langobj.codeblock === 'string' && langobj.codeblock.toLowerCase() === 'true')
    ) {
      return;
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
  const sync = dyncLoadScript();
  const code = element.textContent.trim();
  const name =
    (element.classList.length > 0 ? element.classList[0] : '') +
    (!element.className || !diagramClass ? '' : ' ') +
    diagramClass;
  const id = 'flowchart-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    element.id = id;
    Promise.resolve(id).then(elementid => {
      // dispatch flowchart custom event
      window.dispatchEvent(
        new CustomEvent('flowchart', {
          detail: {
            id: elementid,
            className: name,
            data: code,
            options: options
          }
        })
      );
    });
  } else {
    element.parentNode.outerHTML = cdnjs.renderCacheElement(element.ownerDocument, id, name, el => {
      flowchart.parse(code).drawSVG(el, options);
    });
  }
}

// <div class="flowchart || flow"></div>
function renderFlowchartElements(flowchartElements, flowElements, options) {
  if (!flowchartElements.length && !flowElements.length) {
    return false;
  }

  flowchartElements.forEach(element => {
    renderFlowchart(element, options);
  });
  flowElements.forEach(element => {
    renderFlowchart(element, options);
  });
  return true;
}

// Flowchart default options:
// 'x': 0,
// 'y': 0,
// 'line-width': 3,
// 'line-length': 50,
// 'text-margin': 10,
// 'font-size': 14,
// 'font-color': 'black',
// 'font': 'normal',
// 'font-family': 'calibri',
// 'font-weight': 'normal',
// 'line-color': 'black',
// 'element-color': 'black',
// 'fill': 'white',
// 'yes-text': 'yes',
// 'no-text': 'no',
// 'arrow-end': 'block',
// 'class': 'flowchart',
// 'scale': 1,
// 'symbols': {
//   'start': {},
//   'end': {},
//   'condition': {},
//   'inputoutput': {},
//   'operation': {},
//   'subroutine': {},
//   'parallel': {}
// },
// 'flowstate' : {
//   'past' : { 'fill': '#CCCCCC', 'font-size': 12},
//   'current' : {'fill': 'yellow', 'font-color': 'red', 'font-weight': 'bold'},
//   'future' : { 'fill': '#FFFF99'},
//   'invalid': {'fill': '#444444'}
// }
const getOptions = (userOptions = {}) => ({
  'line-width': 3,
  maxWidth: 3, //ensures the flowcharts fits within a certian width
  'line-length': 50,
  'text-margin': 10,
  'font-size': 14,
  font: 'normal',
  'font-family': 'Helvetica',
  'font-weight': 'normal',
  'font-color': 'black',
  'line-color': 'black',
  'element-color': 'black',
  fill: 'white',
  'yes-text': 'yes',
  'no-text': 'no',
  'arrow-end': 'block',
  scale: 1,
  symbols: {
    start: {
      'font-color': 'red',
      'element-color': 'green',
      fill: 'yellow'
    },
    end: {
      class: 'end-element'
    }
  },
  flowstate: {
    past: { fill: '#CCCCCC', 'font-size': 12 },
    current: { fill: 'yellow', 'font-color': 'red', 'font-weight': 'bold' },
    future: { fill: '#FFFF99' },
    request: { fill: 'blue' },
    invalid: { fill: '#444444' },
    approved: {
      fill: '#58C4A3',
      'font-size': 12,
      'yes-text': 'APPROVED',
      'no-text': 'n/a'
    },
    rejected: {
      fill: '#C45879',
      'font-size': 12,
      'yes-text': 'n/a',
      'no-text': 'REJECTED'
    }
  },
  ...userOptions
});

function onRenderFlowchart(element) {
  Promise.resolve({ canRender: hasFlowchart(), element: element }).then(res => {
    if (res.canRender) {
      const id = res.element.id;
      const name = res.element.className;
      const data = res.element.data;
      let el = window.document.getElementById(id);
      if (el) {
        el.parentNode.outerHTML = `<div id="${id}" class="${name}"></div>`;
        el = window.document.getElementById(id);
        flowchart.parse(data).drawSVG(el ? el : id, res.element.options);
      }
    } else {
      setTimeout(() => {
        onRenderFlowchart(res.element);
      }, 100);
    }
  });
}

function showdownFlowchart(userOptions) {
  const parser = new DOMParser();
  const options = getOptions(userOptions);

  if (!hasFlowchart() && typeof window !== 'undefined' && window.dispatchEvent) {
    // Listen flowchart custom event
    window.addEventListener('flowchart', event => {
      if (event.detail) {
        onRenderFlowchart(event.detail);
      }
    });
  }

  return [
    {
      type: 'output',
      filter: function(html) {
        // parse html
        const doc = parser.parseFromString(html, 'text/html');
        const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;

        // find the Flowchart in code blocks
        const flowchartElements = wrapper.querySelectorAll('code.flowchart.language-flowchart');
        const flowElements = wrapper.querySelectorAll('code.flow.language-flow');

        if (!renderFlowchartElements(flowchartElements, flowElements, options)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownFlowchart;
