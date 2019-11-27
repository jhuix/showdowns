/*
 * @Description: js-wavedrom-diagrams showdown extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
 */

'use strict';

import WaveDrom from 'wavedrom';
import cdnjs from './cdn';

if (typeof wavedrom === 'undefined') {
  var wavedrom = WaveDrom;
}

let indexWD = 0;

function hasWavedrom() {
  return !!wavedrom;
}

/**
 * render wavedrom graphs
 */
function renderWavedrom(element, sync) {
  const code = element.textContent.trim();
  const name = element.className;
  const index = indexWD;
  const id = 'WaveDrom_Display_' + index;
  ++indexWD;
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    element.id = id;
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
    element.parentNode.outerHTML = `<div id="${id}" class="${name}"></div>`;
    const obj = JSON.parse(code);
    wavedrom.renderWaveForm(index, obj, 'WaveDrom_Display_');
  }
}

// <div class="wavedrom"></div>
function renderWavedromElements(elements, skin) {
  if (!elements.length) {
    return false;
  }

  const sync = hasWavedrom();
  if (typeof window !== 'undefined') {
    if (!sync) {
      cdnjs
        .loadScript({ WaveDromSkin: skin })
        .then(() => {
          return cdnjs.loadScript('WaveDrom');
        })
        .then(name => {
          wavedrom = cdnjs.interopDefault(window[name]);
        });
    }
    sync = false;
  }

  elements.forEach(element => {
    renderWavedrom(element, sync);
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
      let el = window.document.getElementById(id);
      if (el) {
        el.parentNode.outerHTML = `<div id="${id}" class="${name}"></div>`;
        const obj = window.eval(`(${data})`);
        wavedrom.RenderWaveForm(index, obj, 'WaveDrom_Display_');
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
        const elements = wrapper.querySelectorAll(
          'code.wavedrom.language-wavedrom'
        );
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
