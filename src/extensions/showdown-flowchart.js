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

function onRenderFlowchart(resolve, res) {
  if (hasFlowchart()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const options = res.options;
    const doc = res.element.ownerDocument;
    res.element.parentNode.outerHTML = cdnjs.renderCacheElement(doc, id, name, el => {
      flowchart.parse(data).drawSVG(el, options);
    });
    resolve(true);
  } else {
    setTimeout(() => {
      onRenderFlowchart(resolve, res);
    }, 50);
  }
}

/**
 * render flowchart graphs
 */
function renderFlowchart(element, options) {
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
    const id = 'flowchart-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    const res = {
      element: element,
      id: id,
      className: name,
      data: code,
      options: options
    };
    onRenderFlowchart(resolve, res);
  });
}

// <div class="flowchart || flow"></div>
function renderFlowchartElements(flowchartElements, flowElements, options) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    flowchartElements.forEach(element => {
      promiseArray.push(renderFlowchart(element, options));
    });
    flowElements.forEach(element => {
      promiseArray.push(renderFlowchart(element, options));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
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

function showdownFlowchart(userOptions) {
  const options = getOptions(userOptions);

  return [
    {
      type: 'output',
      config: options,
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }

        // find the Flowchart in code blocks
        const flowchartElements = wrapper.querySelectorAll('code.flowchart.language-flowchart');
        const flowElements = wrapper.querySelectorAll('code.flow.language-flow');
        if (!flowchartElements.length && !flowElements.length) {
          return false;
        }
        console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render flowchart elements.`);
        return renderFlowchartElements(flowchartElements, flowElements, this.config).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render flowchart elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownFlowchart;
