/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: dynamic loading js libs for local or cdnjs or jsdelivr
 */
'use strict';

import './date-format.js';

let cdnName = 'jsdelivr';
let scheme = document.location.protocol === 'file:' ? 'https://' : document.location.protocol + '//';
let defScheme = '';
let distScheme = '';

const cdnSrc = {
  local: {
    Viz: '../node_modules/viz.js/viz.js',
    VizRender: '../node_modules/viz.js/full.render.js',
    Raphael: '../node_modules/raphael/raphael.min.js',
    flowchart: '../dist/diagrams/flowchart/flowchart.min.js',
    mermaid: '../node_modules/mermaid/dist/mermaid.min.js',
    katex: '../node_modules/katex/dist/katex.min.js',
    katexCSS: '../node_modules/katex/dist/katex.min.css',
    renderMathInElement: '../node_modules/katex/dist/contrib/auto-render.js',
    railroad: '../node_modules/railroad-diagrams/railroad-diagrams.js',
    railroadCSS: '../node_modules/railroad-diagrams/railroad-diagrams.css',
    Snap: '../node_modules/snapsvg/dist/snap.svg-min.js',
    WebFont: '../node_modules/webfontloader/webfontloader.js',
    underscore: '../node_modules/underscore/underscore-min.js',
    sequence: '../node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.js',
    sequenceCSS: '../node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.css',
    WaveDrom: '../node_modules/wavedrom/wavedrom.min.js',
    WaveDromSkin: {
      default: '../node_modules/wavedrom/skins/default.js',
      lowkey: '../node_modules/wavedrom/skins/lowkey.js',
      narrow: '../node_modules/wavedrom/skins/narrow.js'
    },
    vega: '../node_modules/vega/build/vega.min.js',
    vegaLite: '../node_modules/vega-lite/build/vega-lite.min.js',
    vegaEmbed: '../node_modules/vega-embed/build/vega-embed.min.js'
  },
  cdnjs: {
    Viz: scheme + 'cdnjs.cloudflare.com/ajax/libs/viz.js/2.1.2/viz.js',
    VizRender: scheme + 'cdnjs.cloudflare.com/ajax/libs/viz.js/2.1.2/full.render.js',
    Raphael: scheme + 'cdnjs.cloudflare.com/ajax/libs/raphael/2.2.7/raphael.min.js',
    flowchart: scheme + 'cdnjs.cloudflare.com/ajax/libs/flowchart/1.12.2/flowchart.min.js',
    mermaid: scheme + 'cdnjs.cloudflare.com/ajax/libs/mermaid/8.3.1/mermaid.min.js',
    katex: scheme + 'cdnjs.cloudflare.com/ajax/libs/KaTeX/0.11.1/katex.min.js',
    katexCSS: scheme + 'cdnjs.cloudflare.com/ajax/libs/KaTeX/0.11.1/katex.min.css',
    renderMathInElement: scheme + 'cdnjs.cloudflare.com/ajax/libs/KaTeX/0.11.1/contrib/auto-render.js',
    railroad: scheme + 'cdn.jsdelivr.net/npm/railroad-diagrams',
    railroadCSS: scheme + 'cdn.jsdelivr.net/npm/railroad-diagrams/railroad-diagrams.css',
    Snap: scheme + 'cdnjs.cloudflare.com/ajax/libs/snap.svg/0.5.1/snap.svg-min.js',
    WebFont: scheme + 'cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js',
    underscore: scheme + 'cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js',
    sequence: scheme + 'cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams',
    sequenceCSS: scheme + 'cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.css',
    WaveDrom: scheme + 'cdnjs.cloudflare.com/ajax/libs/wavedrom/2.1.2/wavedrom.min.js',
    WaveDromSkin: {
      default: scheme + 'cdnjs.cloudflare.com/ajax/libs/wavedrom/2.1.2/skins/default.js',
      lowkey: scheme + 'cdnjs.cloudflare.com/ajax/libs/wavedrom/2.1.2/skins/lowkey.js',
      narrow: scheme + 'cdnjs.cloudflare.com/ajax/libs/wavedrom/2.1.2/skins/narrow.js'
    },
    vega: scheme + 'cdnjs.cloudflare.com/ajax/libs/vega/5.7.0/vega.min.js',
    vegaLite: scheme + 'cdnjs.cloudflare.com/ajax/libs/vega-lite/3.4.0/vega-lite.min.js',
    vegaEmbed: scheme + 'cdnjs.cloudflare.com/ajax/libs/vega-embed/5.1.3/vega-embed.min.js'
  },
  jsdelivr: {
    Viz: scheme + 'cdn.jsdelivr.net/npm/viz.js',
    VizRender: scheme + 'cdn.jsdelivr.net/npm/viz.js/full.render.js',
    Raphael: scheme + 'cdn.jsdelivr.net/npm/raphael',
    flowchart: scheme + 'cdnjs.cloudflare.com/ajax/libs/flowchart/1.12.2/flowchart.min.js',
    mermaid: scheme + 'cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js',
    katex: scheme + 'cdn.jsdelivr.net/npm/katex',
    katexCSS: scheme + 'cdn.jsdelivr.net/npm/katex/dist/katex.min.css',
    renderMathInElement: scheme + 'cdn.jsdelivr.net/npm/katex/dist/contrib/auto-render.js',
    railroad: scheme + 'cdn.jsdelivr.net/npm/railroad-diagrams',
    railroadCSS: scheme + 'cdn.jsdelivr.net/npm/railroad-diagrams/railroad-diagrams.css',
    Snap: scheme + 'cdn.jsdelivr.net/npm/snapsvg',
    WebFont: scheme + 'cdn.jsdelivr.net/npm/webfontloader',
    underscore: scheme + 'cdn.jsdelivr.net/npm/underscore',
    sequence: scheme + 'cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams',
    sequenceCSS: scheme + 'cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.css',
    WaveDrom: scheme + 'cdn.jsdelivr.net/npm/wavedrom/wavedrom.min.js',
    WaveDromSkin: {
      default: scheme + 'cdn.jsdelivr.net/npm/wavedrom/skins/default.js',
      lowkey: scheme + 'cdn.jsdelivr.net/npm/wavedrom/skins/lowkey.js',
      narrow: scheme + 'cdn.jsdelivr.net/npm/wavedrom/skins/narrow.js'
    },
    vega: scheme + 'cdn.jsdelivr.net/npm/vega/build/vega.js',
    vegaLite: scheme + 'cdn.jsdelivr.net/npm/vega-lite/build/vega-lite.js',
    vegaEmbed: scheme + 'cdn.jsdelivr.net/npm/vega-embed/build/vega-embed.js'
  }
};

function setCDN(name, scheme_default, scheme_dist) {
  if (name in cdnSrc) {
    cdnName = name;
  }

  if (typeof scheme_default === 'string' && scheme_default) {
    defScheme = scheme_default;
  }

  if (typeof scheme_dist === 'string' && scheme_dist) {
    distScheme = scheme_dist;
  }
}

function getCDN() {
  return cdnName;
}

function getSrc(name, def) {
  if (cdnSrc.hasOwnProperty(cdnName)) {
    const cdn = cdnSrc[cdnName];
    let url = '';
    if (typeof name === 'object') {
      const key = Object.keys(name)[0];
      const val = name[key];
      if (cdn[key] && typeof val === 'string' && val && cdn[key][val]) {
        url = cdn[key][val];
      }
    } else if (cdn[name]) {
      url = cdn[name];
    }

    if (url) {
      if (url.substr(0, scheme.length) === scheme) {
        def = url;
      } else if (url.substr(0, 8) === '../dist/') {
        def = distScheme + url;
      } else {
        def = defScheme + url;
      }
    }
  }
  return def;
}

function loadScript(src, name) {
  return new Promise((res, rej) => {
    if (!src || typeof document === 'undefined') {
      rej('Args is invaild!');
    }

    if (typeof name === 'undefined') {
      name = src;
    }

    src = getSrc(name, src);
    const head = document.head || document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      res(name);
    };
    head.appendChild(script);
  });
}

function loadStyleSheet(css, name) {
  if (!css || typeof document === 'undefined') {
    return '';
  }

  if (typeof name === 'undefined') {
    name = css;
  }

  css = getSrc(name, css);
  var head = document.head || document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = css;
  head.appendChild(link);
  return cdnName === 'local' ? '' : css;
}

function interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

function renderCacheElement(doc, id, name, callback) {
  if (typeof window !== 'undefined' && window.document) {
    doc = window.document;
  }
  const el = doc.createElement('div');
  el.id = id;
  el.className = name;
  el.style.display = 'none';
  doc.body.appendChild(el);
  if (typeof callback === 'function' && callback) {
    const result = callback(el);
    if (result instanceof Promise) {
      result.then(el => {
        doc.body.removeChild(el);
        el.style.display = '';
      });
      return el.outerHTML;
    }
  }
  doc.body.removeChild(el);
  el.style.display = '';
  return el.outerHTML;
}

const cdnjs = {
  interopDefault,
  loadScript,
  loadStyleSheet,
  renderCacheElement,
  setCDN,
  getCDN,
  getSrc
};

export default cdnjs;
