/*
 * @Description: dynamic loading js libs for cdnjs or local
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-08-27 16:57:06
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 18:20:35
 */

'use strict';

let cdnName = 'cdnjs';

const scheme =
  document.location.protocol === 'file:'
    ? 'https://'
    : document.location.protocol + '//';

const cdnSrc = {
  local: {
    Viz: '../node_modules/viz.js/viz.js',
    VizRender: '../node_modules/viz.js/full.render.js',
    Raphael: '../node_modules/raphael/raphael-min.js',
    flowchart:
      scheme +
      'cdnjs.cloudflare.com/ajax/libs/flowchart/1.12.2/flowchart.min.js',
    mermaid: '../node_modules/mermaid/dist/mermaid.min.js',
    katex: '../node_modules/katex/dist/katex.min.js',
    katexCSS: '../node_modules/katex/dist/katex.min.css',
    railroad: '../node_modules/railroad-diagrams/railroad-diagrams.js',
    railroadCSS: '../node_modules/railroad-diagrams/railroad-diagrams.css',
    Snap: '../node_modules/snapsvg/dist/snap.svg-min.js',
    WebFont: '../node_modules/webfontloader/webfontloader.js',
    underscore: '../node_modules/underscore/underscore-min.js',
    sequence:
      '../node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.js',
    sequenceCSS:
      '../node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.css'
  },
  cdnjs: {
    Viz: scheme + 'cdnjs.cloudflare.com/ajax/libs/viz.js/2.1.2/viz.js',
    VizRender:
      scheme + 'cdnjs.cloudflare.com/ajax/libs/viz.js/2.1.2/full.render.js',
    Raphael:
      scheme + 'cdnjs.cloudflare.com/ajax/libs/raphael/2.2.0/raphael-min.js',
    flowchart:
      scheme +
      'cdnjs.cloudflare.com/ajax/libs/flowchart/1.12.2/flowchart.min.js',
    mermaid:
      scheme + 'cdnjs.cloudflare.com/ajax/libs/mermaid/8.3.1/mermaid.min.js',
    katex: scheme + 'cdnjs.cloudflare.com/ajax/libs/KaTeX/0.11.1/katex.min.js',
    katexCSS:
      scheme + 'cdnjs.cloudflare.com/ajax/libs/KaTeX/0.11.1/katex.min.css',
    railroad: '../dist/diagrams/railroad/railroad-diagrams.js',
    railroadCSS: '../dist/diagrams/railroad/railroad-diagrams.css',
    Snap:
      scheme + 'cdnjs.cloudflare.com/ajax/libs/snap.svg/0.5.1/snap.svg-min.js',
    WebFont:
      scheme + 'cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js',
    underscore:
      scheme +
      'cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js',
    sequence: '../dist/diagrams/sequence/dist/sequence-diagram-min.js',
    sequenceCSS: '../dist/diagrams/sequence/dist/sequence-diagram-min.css'
  }
};

function setCDN(name) {
  cdnName = name;
}

function loadScript(src, name) {
  return new Promise((res, rej) => {
    if (!src || typeof document === 'undefined') {
      rej('Args is invaild!');
    }

    if (typeof name === 'undefined') {
      name = src;
    }

    if (cdnSrc.hasOwnProperty(cdnName) && cdnSrc[cdnName][name]) {
      src = cdnSrc[cdnName][name];
    }

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
    return;
  }

  if (typeof name === 'undefined') {
    name = css;
  }

  if (cdnSrc.hasOwnProperty(cdnName) && cdnSrc[cdnName][name]) {
    css = cdnSrc[cdnName][name];
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = css;
  head.appendChild(link);
}

const cdnjs = { loadScript, loadStyleSheet, setCDN };

export default cdnjs;
