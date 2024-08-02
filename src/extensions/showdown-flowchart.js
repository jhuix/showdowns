/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown flowchart extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown flowchart extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

if (typeof Raphael === 'undefined') {
  var Raphael = window.Raphael || undefined;
}

if (typeof flowchart === 'undefined') {
  var flowchart = window.flowchart || undefined;
}

function hasRaphael() {
  return !!Raphael
}

function hasFlowchart() {
  return typeof Raphael !== 'undefined' && Raphael && typeof flowchart !== 'undefined' && flowchart ? true : false;
}

function hasSequence() {
  return hasRaphael() && !!window.SequenceJS;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasFlowchart();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      if (!hasRaphael()) {
        cdnjs
          .loadScript('Raphael')
          .then(name => {
            Raphael = utils.interopDefault(window[name]);
            return cdnjs.loadScript('flowchart');
          })
          .then(name => {
            flowchart = utils.interopDefault(window[name]);
          });
        return sync
      }

      cdnjs
      .loadScript('flowchart')
      .then(name => {
        flowchart = utils.interopDefault(window[name]);
      });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasFlowchart()) return;
  cdnjs.unloadScript('flowchart');
  flowchart = null;
  window.flowchart = null;
  if (!hasSequence()) {
    cdnjs.unloadScript('Raphael');
    const es = document.getElementsByTagName('i');
    if (es && es.length > 0) {
      const body = document.body;
      for (let i = 0; i < es.length; i++) {
        const e = es[i];
        if (e.title && e.title === 'Raphaël Colour Picker') {
          body.removeChild(e);
        }
      }
    }
    Raphael = null;
    window.Raphael = null;
  }
  dync = false;
}

function onRenderFlowchart(resolve, res) {
  if (hasFlowchart()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const options = res.options;
    const doc = res.element.ownerDocument;
    res.element.parentNode.outerHTML = utils.renderCacheElement(doc, id, name, el => {
      flowchart.parse(data).drawSVG(el, options);
    });
    resolve(true);
    return;
  }
  
  setTimeout(() => {
    onRenderFlowchart(resolve, res);
  }, 10);
}

/**
 * render flowchart graphs
 */
function renderFlowchart(element, options) {
  return new Promise(resolve => {
    const meta = utils.createElementMeta('flowchart', element);
    if (!meta) {
      return resolve(false);
    }

    meta.options = options;
    onRenderFlowchart(resolve, meta);
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
        console.log(format(`Begin render flowchart elements.`));
        return renderFlowchartElements(flowchartElements, flowElements, this.config).then(() => {
          console.log(format(`End render flowchart elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownFlowchart;
