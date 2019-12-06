/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown wavedrom extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown wavedrom extension can only be used in browser environment!');
}

import cdnjs from './cdn';
// import WaveDrom from 'wavedrom';
// if (typeof wavedrom === 'undefined') {
//   var wavedrom = WaveDrom;
// }

if (typeof WaveDrom === 'undefined') {
  var WaveDrom = window.WaveDrom || undefined;
}

let wdCount = 0;
let indexWD = 0;
function hasWavedrom() {
  return !!WaveDrom;
}

let dync = false;
function dyncLoadScript(skin) {
  const sync = hasWavedrom();
  if (!sync && !dync) {
    dync = true;
    if (typeof window !== 'undefined') {
      cdnjs
        .loadScript({ WaveDromSkin: skin })
        .then(() => {
          return cdnjs.loadScript('WaveDrom');
        })
        .then(name => {
          WaveDrom = cdnjs.interopDefault(window[name]);
        });
    }
  }
  return sync;
}

/**
 * render wavedrom graphs
 */
function renderWavedrom(element, skin) {
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
  const sync = dyncLoadScript(skin);
  const code = element.textContent.trim();
  const name =
    (element.classList.length > 0 ? element.classList[0] : '') +
    (!element.className || !diagramClass ? '' : ' ') +
    diagramClass;
  const index = indexWD;
  ++indexWD;
  // When index of wavwdrom is 0, there will be some special logic in the WaveDrom lib.
  // So the index needs to be cleared after all WavwDrom element are rendered.
  --wdCount;
  if (!wdCount) {
    indexWD = 0;
  }
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    const id = 'wavedrom-' + Date.now() + '-' + Math.floor(Math.random() * 10000) + '-';
    element.id = id + index;
    Promise.resolve(id).then(elementid => {
      // dispatch wavedrom custom event
      window.dispatchEvent(
        new CustomEvent('wavedrom', {
          detail: {
            index: index,
            id: elementid,
            className: name,
            data: code
          }
        })
      );
    });
  } else {
    const id = 'WaveDrom_Display_' + index;
    element.parentNode.outerHTML = cdnjs.renderCacheElement(element.ownerDocument, id, name, el => {
      const obj = window.eval(`(${code})`);
      WaveDrom.RenderWaveForm(index, obj, 'WaveDrom_Display_');
      // Replace the created cache element with the original element with the same id.
      const wdel = document.getElementById('WaveDrom_Display_' + index);
      if (el != wdel) {
        while (wdel.childNodes.length) {
          el.appendChild(wdel.removeChild(wdel.childNodes[0]));
        }
      }
    });
  }
}

// <div class="wavedrom"></div>
function renderWavedromElements(elements, skin) {
  if (!elements.length) {
    return false;
  }

  wdCount = elements.length;
  elements.forEach(element => {
    renderWavedrom(element, skin);
  });
  return true;
}

function onRenderWavedrom(element) {
  Promise.resolve({ canRender: hasWavedrom(), element: element }).then(res => {
    if (res.canRender) {
      const index = res.element.index;
      const id = res.element.id;
      const name = res.element.className;
      const data = res.element.data;
      let el = window.document.getElementById(id + index);
      if (el) {
        el.parentNode.outerHTML = `<div id="${id + index}" class="${name}"></div>`;
        const obj = window.eval(`(${data})`);
        WaveDrom.RenderWaveForm(index, obj, id);
      }
    } else {
      setTimeout(() => {
        onRenderWavedrom(res.element);
      }, 100);
    }
  });
}

// wavedrom default config
const getConfig = (config = {}) => ({
  skin: 'default',
  ...config
});

function showdownWavedrom(config) {
  const parser = new DOMParser();
  const skin = getConfig(config).skin;

  if (!hasWavedrom() && typeof window !== 'undefined' && window.dispatchEvent) {
    // Listen wavedrom custom event
    window.addEventListener('wavedrom', event => {
      if (event.detail) {
        onRenderWavedrom(event.detail);
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

        // find the wavedrom in code blocks
        const elements = wrapper.querySelectorAll('code.wavedrom.language-wavedrom');
        if (!renderWavedromElements(elements, skin)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownWavedrom;
