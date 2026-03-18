/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown plotly extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown plotly extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

const extName = "Plotly";
if (typeof Plotly === 'undefined') {
  var Plotly = window.Plotly || undefined;
}

function hasPlotly() {
  return typeof Plotly !== 'undefined' && Plotly ? true : false;
}

let dync = false;
function dyncLoadScript() {
  // When window object exists,
  // it means browser environment, otherwise node.js environment.
  // In browser environment, html need to be rendered asynchronously.
  const sync = hasPlotly();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      cdnjs.loadScript(extName).then(name => {
        Plotly = utils.interopDefault(window[name]);
      }).catch(e => {
        console.log('load script error: ' + e);
      });
      return sync
    }
  }

  return sync;
}

function unloadScript() {
  if (!hasPlotly()) return;
  cdnjs.unloadScript(extName);
  window.Plotly = null;
  Plotly = null;
  dync = false;
}


function onRenderPlotly(resolve, meta, scripts) {
  if (hasPlotly()) {
    const id = meta.id;
    const name = meta.className;
    const data = meta.data;
    const node = meta.element.parentNode;
    const element = meta.element;
    const doc = element.ownerDocument;
    const svgElement = doc.createElement('div');
    svgElement.id = id;
    if (element.style.cssText.length > 0) {
      svgElement.style.cssText = element.style.cssText;
    }
    svgElement.className = name;
    node.replaceWith(svgElement);
    scripts.push({
      id: id,
      code: `(function(){
  try {
    const it = document.querySelector('#${id}');
    if (!it) return;
    ${data}
  }catch(e){
    console.error('plotly script run failed: ', e.toString());
  }
})();`,
      host: svgElement
    });
    resolve(true);
    return;
  }

  setTimeout(() => {
    onRenderPlotly(resolve, meta, scripts);
  }, 10);
}

/**
 * render plotly graphs
 */
function renderPlotly(element, scripts) {
  return new Promise(resolve => {
    const meta = utils.createElementMeta(extName, element);
    if (!meta || !meta.data) {
      return resolve(false);
    }

    onRenderPlotly(resolve, meta, scripts);
  });
}

// <div class="plotly"></div>
function renderPlotlyElements(elements, scripts) {
  dyncLoadScript();
  const script = {
    outer: [
      {
        name: 'Plotly',
        src: cdnjs.getSrc(false, 'Plotly', 'jsdelivr'),
      },
    ],
    inner: []
  }
  scripts.push(script);
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderPlotly(element, script.inner));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// plotly configuration: https://plotly.com/javascript/configuration-options/
// see https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_config.js
function showdownPlotly() {
  return [
    {
      type: 'output',
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the plotly in code blocks
        const elements = wrapper.querySelectorAll('code.plotly.language-plotly');
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render plotly elements.`));
        return renderPlotlyElements(elements, obj.scripts).then(() => {
          console.log(format(`End render plotly elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownPlotly;
