/*
 * @Description: Viz.js showdown extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
 */

'use strict';

import viz from 'viz.js';
import cdnjs from './cdn';

if (typeof Viz === 'undefined') {
  var Viz = viz;
}

const engines = ['circo', 'dot', 'neato', 'osage', 'twopi'];

function hasViz() {
  return typeof Viz !== 'undefined' &&
    Viz &&
    typeof Viz.Module !== 'undefined' &&
    typeof Viz.render !== 'undefined'
    ? true
    : false;
}

/**
 * render Viz graphs
 */
function renderViz(element, sync) {
  const code = element.textContent.trim();
  const name = element.className;
  const langattr = element.dataset.lang;
  const id = 'viz-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    element.id = id;
    Promise.resolve(id).then(elementid => {
      // dispatch dot custom event
      window.dispatchEvent(
        new CustomEvent('dot', {
          detail: {
            id: elementid,
            className: name,
            data: code,
            langattr: langattr
          }
        })
      );
    });
  } else {
    let engine = 'dot';
    if (langattr) {
      const obj = JSON.parse(langattr);
      if (obj && obj.engine && engines.indexOf(obj.engine) != -1) {
        engine = obj.engine;
      }
    }
    new Viz()
      .renderString(code, { format: 'svg', engine: engine })
      .then(svgData => {
        element.parentNode.outerHTML = `<div id="${id}" class="${name}">${svgData}</div>`;
      });
  }
}

// <div class="dot"></div>
function renderVizElements(elements) {
  if (!elements.length) {
    return false;
  }

  const sync = hasViz();
  if (typeof window !== 'undefined') {
    if (!sync) {
      cdnjs.loadScript('Viz').then(name => {
        Viz = cdnjs.interopDefault(window[name]);
      });
      cdnjs.loadScript('VizRender');
    }
    sync = false;
  }

  elements.forEach(element => {
    renderViz(element, sync);
  });
  return true;
}

function onRenderViz(element) {
  Promise.resolve({ canRender: hasViz(), element: element }).then(res => {
    if (res.canRender) {
      const id = res.element.id;
      const name = res.element.className;
      const data = res.element.data;
      const langattr = res.element.langattr;
      const el = window.document.getElementById(id);
      if (el) {
        let engine = 'dot';
        if (langattr) {
          const obj = JSON.parse(langattr);
          if (obj && obj.engine && engines.indexOf(obj.engine) != -1) {
            engine = obj.engine;
          }
        }
        new Viz()
          .renderString(data, {
            format: 'svg',
            engine: engine
          })
          .then(svgData => {
            el.parentNode.outerHTML = `<div id="${id}" class="${name}">${svgData}</div>`;
          });
      }
    } else {
      setTimeout(() => {
        onRenderViz(res.element);
      }, 100);
    }
  });
}

function showdownViz() {
  const parser = new DOMParser();

  if (!hasViz() && typeof window !== 'undefined' && window.dispatchEvent) {
    // Listen dot custom event
    window.addEventListener('dot', event => {
      if (event.detail) {
        onRenderViz(event.detail);
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

        // find the Viz in code blocks
        const elements = wrapper.querySelectorAll('code.dot.language-dot');

        if (!renderVizElements(elements)) {
          return html;
        }

        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownViz;
