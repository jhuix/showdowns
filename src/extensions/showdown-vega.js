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
  const id = 'vega-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  element.id = id;
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    if (!sync) {
      Promise.resolve(id).then(elementid => {
        // dispatch vegaembed custom event
        window.dispatchEvent(
          new CustomEvent('vega', {
            detail: {
              id: elementid,
              className: name,
              data: code,
              options: options,
              isVegaLite: isVegaLite
            }
          })
        );
      });
    } else {
      // dispatch vegaembed custom event
      window.dispatchEvent(
        new CustomEvent('vega', {
          detail: {
            id: id,
            className: name,
            data: code,
            options: options,
            isVegaLite: isVegaLite
          }
        })
      );
    }
  }
  // else {
  //   element.parentNode.outerHTML = cdnjs.renderCacheElement(element.ownerDocument, id, name, el => {
  //     vegaEmbed(el, JSON.parse(code), options);
  //   });
  // }
}

// <div class="vegaembed || flow"></div>
function renderVegaElements(vegaElements, vegaLiteElements, options) {
  if (!vegaElements.length && !vegaLiteElements.length) {
    return false;
  }

  vegaElements.forEach(element => {
    renderVega(element, options, false);
  });
  vegaLiteElements.forEach(element => {
    renderVega(element, options, true);
  });
  return true;
}

// theme: 'excel' | 'ggplot2' | 'quartz' | 'vox' | 'dark'
const getOptions = (userOptions = {}) => ({
  actions: { editor: false },
  theme: 'vox',
  tooltip: false,
  ...userOptions
});

function onRenderVega(element) {
  Promise.resolve({ canRender: hasVegaEmbed(), element: element }).then(res => {
    if (res.canRender) {
      const id = res.element.id;
      const name = res.element.className;
      const data = res.element.data;
      let el = window.document.getElementById(id);
      if (el) {
        el.parentNode.outerHTML = `<div id="${id}" class="${name}"></div>`;
        el = window.document.getElementById(id);
        vegaEmbed(el, JSON.parse(data), res.element.options);
      }
    } else {
      setTimeout(() => {
        onRenderVega(res.element);
      }, 100);
    }
  });
}

function showdownVega(userOptions) {
  const parser = new DOMParser();
  const options = getOptions(userOptions);

  if (!hasVegaEmbed() && typeof window !== 'undefined' && window.dispatchEvent) {
    // Listen vegaembed custom event
    window.addEventListener('vega', event => {
      if (event.detail) {
        onRenderVega(event.detail);
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

        // find the VegaEmbed in code blocks
        const vegaElements = wrapper.querySelectorAll('code.vega.language-vega');
        const vegaLiteElements = wrapper.querySelectorAll('code.vega-lite.language-vega-lite');

        if (!renderVegaElements(vegaElements, vegaLiteElements, options)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownVega;
