/*
 * @Description: flowchart.js showdown extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
 */

'use strict';

import raphael from 'raphael';
import flowchart from 'flowchart.js';
import cdnjs from './cdn';

if (typeof Raphael === 'undefined') {
  var Raphael = raphael;
}

if (typeof Flowchart === 'undefined') {
  var Flowchart = flowchart;
}

function hasFlowchart() {
  return typeof Raphael !== 'undefined' && Raphael && typeof Flowchart !== 'undefined' && Flowchart ? true : false;
}

/**
 * render Flowchart graphs
 */
function renderFlowchart(element, options, sync) {
  const langattr = element.dataset.lang;
  const langobj = langattr ? JSON.parse(langattr) : null;
  let diagramClass = '';
  if (langobj && langobj.align) {
    //default left
    if (langobj.align === 'center') {
      diagramClass = 'diagram-center';
    } else if (langobj.align === 'right') {
      diagramClass = 'diagram-right';
    }
  }
  const code = element.textContent.trim();
  const name = element.className + (!element.className || !diagramClass ? '' : ' ') + diagramClass;
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
      Flowchart.parse(code).drawSVG(el, options);
    });
  }
}

// <div class="flowchart || flow"></div>
function renderFlowchartElements(flowchartElements, flowElements, options) {
  if (!flowchartElements.length && !flowElements.length) {
    return false;
  }

  const sync = hasFlowchart();
  if (typeof window !== 'undefined') {
    if (!sync) {
      cdnjs
        .loadScript('Raphael')
        .then(name => {
          Raphael = cdnjs.interopDefault(window[name]);
          return cdnjs.loadScript('flowchart');
        })
        .then(name => {
          Flowchart = cdnjs.interopDefault(window[name]);
        });
    }
    //sync = false;
  }

  flowchartElements.forEach(element => {
    renderFlowchart(element, options, sync);
  });
  flowElements.forEach(element => {
    renderFlowchart(element, options, sync);
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
        Flowchart.parse(data).drawSVG(el ? el : id, res.element.options);
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
