/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: dynamic loading js libs for local or cdnjs or jsdelivr
 */
'use strict';

let cdnName = 'jsdelivr';
let scheme = document.location.protocol === 'file:' ? 'https://' : document.location.protocol + '//';
let defScheme = '';
let distScheme = '';

const cdnSrc = {
  local: {
    ABCJS: '../node_modules/abcjs/dist/abcjs-basic.js',
    ABCJSCSS: '../node_modules/abcjs/abcjs-audio.css',
    echarts: '../node_modules/echarts/dist/echarts.js',
    Viz: '../node_modules/@viz-js/viz/lib/viz-standalone.js',
    Raphael: '../node_modules/raphael/raphael.min.js',
    flowchart: '../dist/diagrams/flowchart/flowchart.min.js',
    mermaid: '../node_modules/mermaid/dist/mermaid.js',
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
    vega: '../node_modules/vega/build/vega.js',
    vegaLite: '../node_modules/vega-lite/build/vega-lite.js',
    vegaEmbed: '../node_modules/vega-embed/build/vega-embed.js'
  },
  cdnjs: {
    ABCJS: scheme + 'cdnjs.cloudflare.com/ajax/libs/abcjs/6.4.1/abcjs-basic-min.js',
    ABCJSCSS: scheme + 'cdnjs.cloudflare.com/ajax/libs/abcjs/abcjs-audio.css',
    echarts: scheme + 'cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js',
    Viz: scheme + 'cdn.jsdelivr.net/npm/@viz-js/viz@3/lib/viz-standalone.js',
    Raphael: scheme + 'cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js',
    flowchart: scheme + 'cdnjs.cloudflare.com/ajax/libs/flowchart/1.18.0/flowchart.min.js',
    mermaid: scheme + 'cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js',
    katex: scheme + 'cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.js',
    katexCSS: scheme + 'cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.css',
    renderMathInElement: scheme + 'cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/contrib/auto-render.js',
    railroad: scheme + 'cdnjs.cloudflare.com/ajax/libs/railroad-diagrams/1.0.0/railroad-diagrams.js',
    railroadCSS: scheme + 'cdnjs.cloudflare.com/ajax/libs/railroad-diagrams/1.0.0/railroad-diagrams.css',
    Snap: scheme + 'cdnjs.cloudflare.com/ajax/libs/snap.svg/0.5.1/snap.svg-min.js',
    WebFont: scheme + 'cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js',
    underscore: scheme + 'cdnjs.cloudflare.com/ajax/libs/underscore.js/1.13.6/underscore-min.js',
    sequence: scheme + 'cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams@2.0.6-2/dist/sequence-diagram-min.js',
    sequenceCSS: scheme + 'cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams@2.0.6-2/dist/sequence-diagram-min.css',
    WaveDrom: scheme + 'cdnjs.cloudflare.com/ajax/libs/wavedrom/3.5.0/wavedrom.min.js',
    WaveDromSkin: {
      default: scheme + 'cdnjs.cloudflare.com/ajax/libs/wavedrom/3.5.0/skins/default.js',
      lowkey: scheme + 'cdnjs.cloudflare.com/ajax/libs/wavedrom/3.5.0/skins/lowkey.js',
      narrow: scheme + 'cdnjs.cloudflare.com/ajax/libs/wavedrom/3.5.0/skins/narrow.js'
    },
    vega: scheme + 'cdnjs.cloudflare.com/ajax/libs/vega/5.30.0/vega.min.js',
    vegaLite: scheme + 'cdnjs.cloudflare.com/ajax/libs/vega-lite/5.19.0/vega-lite.min.js',
    vegaEmbed: scheme + 'cdnjs.cloudflare.com/ajax/libs/vega-embed/6.26.0/vega-embed.min.js'
  },
  jsdelivr: {
    ABCJS: scheme + 'cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js',
    ABCJSCSS: scheme + 'cdn.jsdelivr.net/npm/abcjs@6/abcjs-audio.css',
    echarts: scheme + 'cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js',
    Viz: scheme + 'cdn.jsdelivr.net/npm/@viz-js/viz@3/lib/viz-standalone.js',
    Raphael: scheme + 'cdn.jsdelivr.net/npm/raphael@2/raphael.min.js',
    flowchart: scheme + 'cdnjs.cloudflare.com/ajax/libs/flowchart/1.18.0/flowchart.min.js',
    mermaid: scheme + 'cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js',
    katex: scheme + 'cdn.jsdelivr.net/npm/katex@0/dist/katex.min.js',
    katexCSS: scheme + 'cdn.jsdelivr.net/npm/katex@0/dist/katex.min.css',
    renderMathInElement: scheme + 'cdn.jsdelivr.net/npm/katex@0/dist/contrib/auto-render.js',
    railroad: scheme + 'cdn.jsdelivr.net/npm/railroad-diagrams@1/railroad-diagrams.js',
    railroadCSS: scheme + 'cdn.jsdelivr.net/npm/railroad-diagrams@1/railroad-diagrams.css',
    Snap: scheme + 'cdn.jsdelivr.net/npm/snapsvg@0/dist/snap.svg-min.js',
    WebFont: scheme + 'cdn.jsdelivr.net/npm/webfontloader@1/webfontloader.js',
    underscore: scheme + 'cdn.jsdelivr.net/npm/underscore@1/underscore-min.js',
    sequence: scheme + 'cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams@2.0.6-2/dist/sequence-diagram-min.js',
    sequenceCSS: scheme + 'cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams@2.0.6-2/dist/sequence-diagram-min.css',
    WaveDrom: scheme + 'cdn.jsdelivr.net/npm/wavedrom@3/wavedrom.min.js',
    WaveDromSkin: {
      default: scheme + 'cdn.jsdelivr.net/npm/wavedrom@3/skins/default.js',
      lowkey: scheme + 'cdn.jsdelivr.net/npm/wavedrom@3/skins/lowkey.js',
      narrow: scheme + 'cdn.jsdelivr.net/npm/wavedrom@3/skins/narrow.js'
    },
    vega: scheme + 'cdn.jsdelivr.net/npm/vega@5/build/vega.js',
    vegaLite: scheme + 'cdn.jsdelivr.net/npm/vega-lite@5/build/vega-lite.js',
    vegaEmbed: scheme + 'cdn.jsdelivr.net/npm/vega-embed@6/build/vega-embed.js'
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
      if (url.substring(0, scheme.length) === scheme) {
        def = url;
      } else if (url.substring(0, 8) === '../dist/') {
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

const cdnjs = {
  setCDN,
  getCDN,
  getSrc,
  loadScript,
  loadStyleSheet
};

export default cdnjs;
