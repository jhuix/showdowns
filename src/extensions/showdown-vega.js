/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown vega extension for markdown
 */
'use strict';

const extName = "vega";

if (typeof window === 'undefined') {
  throw Error('The showdown vega extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

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
    if (dync) {
      return sync;
    }

    if (!sync) {   
      dync = true;
      cdnjs
        .loadScript(extName)
        .then(() => {
          return cdnjs.loadScript('vegaLite');
        })
        .then(() => {
          return cdnjs.loadScript('vegaEmbed');
        })
        .then(name => {
          vegaEmbed = utils.interopDefault(window[name]);
        });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasVegaEmbed()) return;
  cdnjs.unloadScript('vegaEmbed');
  cdnjs.unloadScript('vegaLite');
  cdnjs.unloadScript(extName);
  const vegaStyle = document.getElementById('vega-embed-style');
  if (vegaStyle && vegaStyle.tagName.toLowerCase() === 'style') {
    const head = document.head || document.getElementsByTagName('head')[0];
    head.removeChild(vegaStyle);
  }
  vegaEmbed = null;
  window.vegaEmbed = null;
  dync = false;  
}

/**
 * render VegaEmbed graphs
 */
function renderVega(element, options, scripts, isVegaLite) {
  const meta = utils.createElementMeta(extName, element);
  if (!meta) {
    return Promise.resolve(false);
  }

  const config = JSON.stringify(options);      
  const data = JSON.stringify(JSON.parse(meta.data));
  const id = meta.id;
  const container = meta.container;
  let code = `(function() {
    let el = document.getElementById('${id}');
    if (el){
  `;  
  if (meta.lang && meta.lang.type && typeof meta.lang.type === 'string'
      && meta.lang.type.toLowerCase() == 'javascript') {
    code += '    ' + meta.data;
  } else { // JSON string
    const data = JSON.stringify(JSON.parse(meta.data));
    code += `    const option = JSON.parse(\`${data}\`);`;
  }
  code += `
      vegaEmbed(el, option, JSON.parse('${config}'));
    }
  })();`
  const script = {
    id: container,
    code: code
  }
  scripts.push(script);
  return new Promise(resolve => {
    onRenderVega(resolve, meta);
  });
}

// <div class="vegaembed || flow"></div>
function renderVegaElements(vegaElements, vegaLiteElements, scripts, options) {
  const script = {
    outer: [
      {
        name: extName,
        src: cdnjs.getSrc(extName,'jsdelivr')
      },
      {
        name: 'vegaLite',
        src: cdnjs.getSrc('vegaLite','jsdelivr')
      },
      {
        name: 'vegaEmbed',
        src: cdnjs.getSrc('vegaEmbed','jsdelivr')
      }    
    ],
    inner: []
  };
  scripts.push(script); 
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    vegaElements.forEach(element => {
      promiseArray.push(renderVega(element, options, script.inner, false));
    });
    vegaLiteElements.forEach(element => {
      promiseArray.push(renderVega(element, options, script.inner, true));
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
  renderer: 'svg',
  ...userOptions
});

function onRenderVega(resolve, meta) {
  if (hasVegaEmbed()) {
    const id = meta.id;
    const name = meta.className;
    const container = meta.container;
    const node = meta.element.parentNode;
    node.outerHTML = `<div id="${container}" class="${name}"><div id="${id}"></div></div>`;
    return resolve(true);
  }
  
  setTimeout(() => {
    onRenderVega(resolve, meta);
  }, 10);
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

        console.log(format(`Begin render vega elements.`));
        return renderVegaElements(vegaElements, vegaLiteElements, obj.scripts, this.config).then(() => {
          console.log(format(`End render vega elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownVega;
