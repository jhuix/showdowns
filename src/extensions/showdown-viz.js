/*
 * @Description: showdown viz extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
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

/**
 * render Viz graphs
 */
function renderViz(element) {
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
  const id = 'viz-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  element.id = id;
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    Promise.resolve(id).then(elementid => {
      // dispatch dot custom event
      window.dispatchEvent(
        new CustomEvent('dot', {
          detail: {
            id: elementid,
            className: name,
            data: code,
            langattr: langattr,
            rendered: false
          }
        })
      );
    });
  } else {
    let engine = 'dot';
    if (langobj && langobj.engine && engines.indexOf(langobj.engine) != -1) {
      engine = langobj.engine;
    }
    new Viz().renderString(code, { format: 'svg', engine: engine }).then(svgData => {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        // dispatch dot custom event
        window.dispatchEvent(
          new CustomEvent('dot', {
            detail: {
              id: id,
              className: name,
              data: svgData,
              rendered: true
            }
          })
        );
      }
    });
  }
}

// <div class="dot"></div>
function renderVizElements(elements) {
  if (!elements.length) {
    return false;
  }

  elements.forEach(element => {
    renderViz(element);
  });
  return true;
}

function onRenderViz(element) {
  Promise.resolve({ canRender: hasViz(), element: element }).then(res => {
    if (res.canRender) {
      const id = res.element.id;
      const name = res.element.className;
      const data = res.element.data;
      const el = window.document.getElementById(id);
      if (el) {
        if (res.element.rendered) {
          el.parentNode.outerHTML = `<div id="${id}" class="${name}">${data}</div>`;
        } else {
          const langattr = res.element.langattr;
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

  if (typeof window !== 'undefined' && window.dispatchEvent) {
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
