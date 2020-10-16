/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown vega extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown vega extension can only be used in browser environment!');
}

import cdnjs from './cdn';
// import vegaEmbed from 'vega-embed';
// if (typeof VegaEmbed === 'undefined') {
//   var VegaEmbed = vegaEmbed;
// }

if (typeof vegaEmbed === 'undefined') {
  var vegaEmbed = window.vegaEmbed || undefined;
}

function hasVegaEmbed() {
  return typeof vegaEmbed !== 'undefined' && vegaEmbed ? true : false;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasVegaEmbed();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs
        .loadScript('vega')
        .then(() => {
          return cdnjs.loadScript('vegaLite');
        })
        .then(() => {
          return cdnjs.loadScript('vegaEmbed');
        })
        .then(name => {
          vegaEmbed = cdnjs.interopDefault(window[name]);
        });
    }
  }
  return sync;
}

/**
 * render VegaEmbed graphs
 */
function renderVega(element, options, isVegaLite) {
  return new Promise(resolve => {
    const langattr = element.dataset.lang;
    const langobj = langattr ? JSON.parse(langattr) : null;
    let diagramClass = '';
    if (langobj) {
      if (
        (typeof langobj.codeblock === 'boolean' && langobj.codeblock) ||
        (typeof langobj.codeblock === 'string' && langobj.codeblock.toLowerCase() === 'true')
      ) {
        return resolve(false);
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
    const id = 'vega-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    const res = {
      element: element,
      id: id,
      className: name,
      data: code,
      options: options,
      isVegaLite: isVegaLite
    };
    onRenderVega(resolve, res);
  });
}

// <div class="vegaembed || flow"></div>
function renderVegaElements(vegaElements, vegaLiteElements, options) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    vegaElements.forEach(element => {
      promiseArray.push(renderVega(element, options, false));
    });
    vegaLiteElements.forEach(element => {
      promiseArray.push(renderVega(element, options, true));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// theme: 'excel' | 'ggplot2' | 'quartz' | 'vox' | 'dark'
const getOptions = (userOptions = {}) => ({
  actions: { editor: false },
  theme: 'vox',
  tooltip: false,
  ...userOptions
});

async function renderVegaEmbed(nr, r, element, el, data, options) {
  await vegaEmbed.embed(el, JSON.parse(data), options);
  element.parentNode.outerHTML = el.outerHTML;
  nr(true);
  r(el);
}

function onRenderVega(resolve, res) {
  if (hasVegaEmbed()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const options = res.options;
    let element = res.element;
    const doc = element.ownerDocument;
    cdnjs.renderCacheElement(doc, id, name, el => {
      vegaEmbed(el, JSON.parse(data), options);
      return new Promise(solve => {
        //Async draw svg, need to check whether the drawing is completed regularly.
        function checkDraw() {
          if (el.childNodes.length > 0) {
            element.parentNode.outerHTML = el.outerHTML;
            //Replace display element
            element = doc.getElementById(id);
            if (element) {
              element.style.display = '';
            }
            resolve(true);
            solve(el);
          } else {
            setTimeout(checkDraw, 50);
          }
        }
        checkDraw();
      });
    });
  } else {
    setTimeout(() => {
      onRenderVega(resolve, res);
    }, 50);
  }
}

function showdownVega(userOptions) {
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

        // find the VegaEmbed in code blocks
        const vegaElements = wrapper.querySelectorAll('code.vega.language-vega');
        const vegaLiteElements = wrapper.querySelectorAll('code.vega-lite.language-vega-lite');
        if (!vegaElements.length && !vegaLiteElements.length) {
          return false;
        }
        console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render vega elements.`);
        return renderVegaElements(vegaElements, vegaLiteElements, this.config).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render vega elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownVega;
