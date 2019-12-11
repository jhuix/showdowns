/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown railroad extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown railroad extension can only be used in browser environment!');
}

import cdnjs from './cdn';

let railroad = false;
function hasRailroad() {
  return railroad;
}

let dync = false;
const cssCdnName = 'railroadCSS';
function dyncLoadScript() {
  const sync = hasRailroad();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs.loadStyleSheet(cssCdnName);
      cdnjs.loadScript('railroad').then(() => {
        railroad = true;
      });
    }
  }
  return sync;
}

/**
 * render railroad graphs
 */
function renderRailroad(element) {
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
  const cssLink = cdnjs.getSrc(cssCdnName);
  const code = element.textContent.trim();
  const name =
    (element.classList.length > 0 ? element.classList[0] : '') +
    (!element.className || !diagramClass ? '' : ' ') +
    diagramClass;
  const id = 'railroad-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    element.id = id;
    if (cssLink) {
      element.className = element.className + (!element.className ? '' : ' ') + 'css-railroad';
      element.dataset.css = cssLink;
    }
    Promise.resolve(id).then(elementid => {
      // dispatch railroad custom event
      window.dispatchEvent(
        new CustomEvent('railroad', {
          detail: {
            id: elementid,
            className: name,
            data: code
          }
        })
      );
    });
  } else if (typeof window !== 'undefined' && window.eval) {
    const railroadElement = window.eval(code).format();
    const doc = element.ownerDocument;
    element.parentNode.outerHTML = cssLink
      ? `<div id="${id}" class="${name} css-railroad" data-css="${cssLink}"></div>`
      : `<div id="${id}" class="${name}"></div>`;
    railroadElement.addTo(doc.getElementById(id));
  }
}

// <div class="railroad"></div>
function renderRailroadElements(elements) {
  if (!elements.length) {
    return false;
  }

  elements.forEach(element => {
    renderRailroad(element);
  });
  return true;
}

function onRenderRailroad(element) {
  Promise.resolve({ canRender: hasRailroad(), element: element }).then(res => {
    if (res.canRender) {
      const id = res.element.id;
      const name = res.element.className;
      const data = res.element.data;
      let el = window.document.getElementById(id);
      if (el) {
        el.parentNode.outerHTML = `<div id="${id}" class="${name}"></div>`;
        el = window.document.getElementById(id);
        try {
          const railroadElement = window.eval(data).format();
          railroadElement.addTo(el);
        } catch (e) {
          return;
        }
      }
    } else {
      setTimeout(() => {
        onRenderRailroad(res.element);
      }, 100);
    }
  });
}

function showdownRailroad() {
  const parser = new DOMParser();

  if (!hasRailroad() && typeof window !== 'undefined' && window.dispatchEvent) {
    // Listen railroad custom event
    window.addEventListener('railroad', event => {
      if (event.detail) {
        onRenderRailroad(event.detail);
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

        // find the railroad in code blocks
        const elements = wrapper.querySelectorAll('code.railroad.language-railroad');
        if (!renderRailroadElements(elements)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownRailroad;
