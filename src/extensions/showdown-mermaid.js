/*
 * @Description: showdown mermaid extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
 */

'use strict';

import mermaid from 'mermaid';
import cdnjs from './cdn';

if (typeof Mermaid === 'undefined') {
  var Mermaid = mermaid;
}

function hasMermaid() {
  return typeof Mermaid !== 'undefined' && Mermaid ? true : false;
}

/**
 * render mermaid graphs
 */
function renderMermaid(element, sync) {
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
  const id = 'mermaid-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    element.id = id;
    Promise.resolve(id).then(elementid => {
      // dispatch mermaid custom event
      window.dispatchEvent(
        new CustomEvent('mermaid', {
          detail: {
            id: elementid,
            className: name,
            data: code
          }
        })
      );
    });
  } else {
    Mermaid.render(id, code, svgCode => {
      element.parentNode.outerHTML = `<div class="${name}">${svgCode}</div>`;
    });
  }
}

// <div class="mermaid"></div>
function renderMermaidElements(elements, config) {
  if (!elements.length) {
    return false;
  }

  // When window object exists,
  // it means browser environment, otherwise node.js environment.
  // In browser environment, html need to be rendered asynchronously.
  const sync = hasMermaid();
  if (typeof window !== 'undefined') {
    if (!sync) {
      cdnjs.loadScript('mermaid').then(name => {
        Mermaid = cdnjs.interopDefault(window[name]);
        Mermaid.initialize(config);
      });
    }
  }

  elements.forEach(element => {
    renderMermaid(element, sync);
  });
  return true;
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

function onRenderMermaid(element) {
  Promise.resolve({ canRender: hasMermaid(), element: element }).then(res => {
    if (res.canRender) {
      const id = res.element.id;
      const name = res.element.className;
      const data = res.element.data;
      let el = window.document.getElementById(id);
      if (el) {
        const svgId = 'mermaid-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
        Mermaid.render(svgId, data, svgCode => {
          el.parentNode.outerHTML = `<div class="${name}">${svgCode}</div>`;
        });
      }
    } else {
      setTimeout(() => {
        onRenderMermaid(res.element);
      }, 100);
    }
  });
}

function showdownMermaid(userConfig) {
  const parser = new DOMParser();
  const config = getConfig(userConfig);
  if (!hasMermaid() && typeof window !== 'undefined' && window.dispatchEvent) {
    // Listen mermaid custom event
    window.addEventListener('mermaid', event => {
      if (event.detail) {
        onRenderMermaid(event.detail);
      }
    });
  } else {
    Mermaid.initialize(config);
  }

  return [
    {
      type: 'output',
      filter: function(html) {
        // parse html
        const doc = parser.parseFromString(html, 'text/html');
        const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;

        // find the mermaid in code blocks
        const elements = wrapper.querySelectorAll('code.mermaid.language-mermaid');

        if (!renderMermaidElements(elements, config)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownMermaid;
