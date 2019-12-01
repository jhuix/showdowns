/*
 * @Description: vega and vega-lite showdown extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
 */

'use strict';

import vegaEmbed from 'vega-embed';
import cdnjs from './cdn';

if (typeof VegaEmbed === 'undefined') {
  var VegaEmbed = vegaEmbed;
}

function hasVegaEmbed() {
  return typeof VegaEmbed !== 'undefined' && VegaEmbed ? true : false;
}

/**
 * render VegaEmbed graphs
 */
function renderVega(element, options, isVegaLite, sync) {
  const code = element.textContent.trim();
  const name = element.className;
  const id = 'vega-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    element.id = id;
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
    element.parentNode.outerHTML = cdnjs.renderCacheElement(
      element.ownerDocument,
      id,
      name,
      el => {
        VegaEmbed(el, JSON.parse(code), options);
      }
    );
  }
}

// <div class="vegaembed || flow"></div>
function renderVegaElements(vegaElements, vegaLiteElements, options) {
  if (!vegaElements.length && !vegaLiteElements.length) {
    return false;
  }

  const sync = hasVegaEmbed();
  if (typeof window !== 'undefined') {
    if (!sync) {
      cdnjs
        .loadScript('vega')
        .then(() => {
          return cdnjs.loadScript('vegaLite');
        })
        .then(() => {
          return cdnjs.loadScript('vegaEmbed');
        })
        .then(name => {
          VegaEmbed = cdnjs.interopDefault(window[name]);
        });
    }
    //sync = false;
  }

  vegaElements.forEach(element => {
    renderVega(element, options, false, sync);
  });
  vegaLiteElements.forEach(element => {
    renderVega(element, options, true, sync);
  });
  return true;
}

// theme: 'excel' | 'ggplot2' | 'quartz' | 'vox' | 'dark'
const getOptions = (userOptions = {}) => ({
  actions: { editor: false },
  theme: 'vox',
  renderer: 'svg',
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
        VegaEmbed(el, JSON.parse(data), res.element.options);
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

  if (
    !hasVegaEmbed() &&
    typeof window !== 'undefined' &&
    window.dispatchEvent
  ) {
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
        const vegaElements = wrapper.querySelectorAll(
          'code.vega.language-vega'
        );
        const vegaLiteElements = wrapper.querySelectorAll(
          'code.vega-lite.language-vega-lite'
        );

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
