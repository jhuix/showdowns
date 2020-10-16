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

function onRenderWavedrom(resolve, res) {
  if (hasWavedrom()) {
    const index = res.index;
    const id = res.id;
    const name = res.className;
    const data = res.data;
    let element = res.element;
    const doc = element.ownerDocument;
    element.parentNode.outerHTML = cdnjs.renderCacheElement(doc, id + index, name, el => {
      const obj = window.eval(`(${data})`);
      WaveDrom.RenderWaveForm(index, obj, id);
      // Replace the created cache element with the original element with the same id.
      const wdel = document.getElementById('WaveDrom_Display_' + index);
      if (el != wdel) {
        while (wdel.childNodes.length) {
          el.appendChild(wdel.removeChild(wdel.childNodes[0]));
        }
      }
    });
    resolve(true);
  } else {
    setTimeout(() => {
      onRenderWavedrom(resolve, res);
    }, 50);
  }
}
/**
 * render wavedrom graphs
 */
function renderWavedrom(element) {
  return new Promise(resolve => {
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

    //const id = 'wavedrom-' + Date.now() + '-' + Math.floor(Math.random() * 10000) + '-';
    const id = 'WaveDrom_Display_';
    element.id = id + index;
    const res = {
      element: element,
      index: index,
      id: id,
      className: name,
      data: code
    };
    onRenderWavedrom(resolve, res);
    // const id = 'WaveDrom_Display_' + index;
    // element.parentNode.outerHTML = cdnjs.renderCacheElement(element.ownerDocument, id, name, el => {
    //   const obj = window.eval(`(${code})`);
    //   WaveDrom.RenderWaveForm(index, obj, 'WaveDrom_Display_');
    //   // Replace the created cache element with the original element with the same id.
    //   const wdel = document.getElementById('WaveDrom_Display_' + index);
    //   if (el != wdel) {
    //     while (wdel.childNodes.length) {
    //       el.appendChild(wdel.removeChild(wdel.childNodes[0]));
    //     }
    //   }
    // });
  });
}

// <div class="wavedrom"></div>
function renderWavedromElements(elements, skin) {
  dyncLoadScript(skin);
  return new Promise(resolve => {
    const promiseArray = [];
    wdCount = elements.length;
    elements.forEach(element => {
      promiseArray.push(renderWavedrom(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// wavedrom default config
const getConfig = (config = {}) => ({
  skin: 'default',
  ...config
});

function showdownWavedrom(skinConfig) {
  const config = getConfig(skinConfig)

  return [
    {
      type: 'output',
      config: config,
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the wavedrom in code blocks
        const elements = wrapper.querySelectorAll('code.wavedrom.language-wavedrom');
        if (!elements.length) {
          return false;
        }

        console.log(`${new Date().Format('yyyy-MM-dd hh:mm:ss.S')} Begin render wavedrom elements.`);
        return renderWavedromElements(elements, this.config.skin).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd hh:mm:ss.S')} End render wavedrom elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownWavedrom;
