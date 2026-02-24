/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown mermaid extension for markdown
 */
'use strict';

const extName = "mermaid";

if (typeof window === 'undefined') {
  throw Error('The showdown mermaid extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';
import i18n from './i18n';
import { pickStyleSheet, svgAsDataUri, svgAsPngUri } from '../utils/saveSvgAsPng';

if (typeof mermaid === 'undefined') {
  var mermaid = window.mermaid || undefined;
}

function hasMermaid() {
  return typeof mermaid !== 'undefined' && mermaid ? true : false;
}

let dync = false;
function dyncLoadScript(config) {
  // When window object exists,
  // it means browser environment, otherwise node.js environment.
  // In browser environment, html need to be rendered asynchronously.
  const sync = hasMermaid();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      cdnjs.loadScript(extName).then((res) => {
        if (typeof res === 'string') {
          mermaid = utils.interopDefault(window[res]);
          mermaid.initialize(config);
        } else if (Array.isArray(res) && res.length > 0) {
          const plugins = [];
          const layouts = [];
          res.forEach((name) => {
            const obj = utils.interopDefault(window[name]);
            if (Array.isArray(obj)) {
              layouts.push(...obj);
            } else {
              plugins.push(obj);
            }
          })
          const m = plugins[0];
          plugins.shift();
          if (layouts.length > 0) {
            m.registerLayoutLoaders(layouts);
          }
          if (plugins.length > 0) {
            m.registerExternalDiagrams(plugins).then(() => {
              mermaid = m;
              mermaid.initialize(config);
            });
          } else {
            mermaid = m;
            mermaid.initialize(config);
          }
        }
      });
      return sync
    }
  }

  mermaid.initialize(config);
  return sync;
}

function unloadScript() {
  if (!hasMermaid()) return;
  cdnjs.unloadScript(extName);
  window.mermaid = null;
  mermaid = null;
  dync = false;
}

function loadExportActions(root, svg, id) {
  const doc = root.ownerDocument;
  const details = doc.createElement('details');
  details.setAttribute('title', i18n.getLangString('export-actions-title', 'Click to view actions'));
  const summary = doc.createElement('summary');
  summary.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor" stroke="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
  <circle r="2" cy="8" cx="2"></circle>
  <circle r="2" cy="8" cx="8"></circle>
  <circle r="2" cy="8" cx="14"></circle>
</svg>`;
  details.append(summary);
  const documentClickHandler = (ev) => {
    if (!details.contains(ev.target)) {
      details.removeAttribute('open');
    }
  };
  document.addEventListener('click', documentClickHandler);
  const ctrl = doc.createElement('div');
  ctrl.classList.add('diagram-actions');
  const zenuml = !!root.querySelector('.zenuml');

  // add 'Export' action
  for (const ext of ['svg', 'png']) {
    const i18nExportAction = i18n.getLangString(`export-${ext}-action`, `Save as ${ext.toUpperCase()}`);
    const exportLink = document.createElement('a');
    // const scaleFactor = isObject(opts.scaleFactor) ? opts.scaleFactor[ext] : opts.scaleFactor;
    exportLink.text = i18nExportAction;
    exportLink.href = '#';
    exportLink.target = '_blank';
    exportLink.download = `${id}.${ext}`;
    // add link on mousedown so that it's correct when the click happens
    exportLink.addEventListener('mousedown', async function (e) {
      e.preventDefault();
      let url = '';
      let includeCss = '';
      try {
        if (zenuml) {
          includeCss = pickStyleSheet('zenuml');
        }
        if (ext === 'svg') url = await svgAsDataUri(svg, { autosize: true, encoderOptions: 1, excludeCss: !includeCss, fonts: false, includeCss: includeCss });
        else url = await svgAsPngUri(svg, { encoderOptions: 1, excludeCss: !includeCss, backgroundColor: '#fff', fonts: false, includeCss: includeCss });
      } catch (err) {
        console.log('export diagram error: ' + err);
        return;
      }
      exportLink.href = url;
    });
    ctrl.append(exportLink);
  }
  details.append(ctrl);
  root.appendChild(details);
}

function onRenderMermaid(resolve, res) {
  if (hasMermaid()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const node = res.element.parentNode;
    const element = res.element;
    const doc = element.ownerDocument;
    mermaid.render(id, data).then((m) => {
      let style = element.style.cssText;
      const container = doc.createElement('div');
      container.classList.add('diagram-container', 'has-actions');
      const diagramWrapper = doc.createElement('div');
      if (name) {
        diagramWrapper.className = name;
      }
      diagramWrapper.classList.add('diagram-wrapper');
      if (style.length > 0) {
        diagramWrapper.setAttribute('style', style);
      }
      diagramWrapper.innerHTML = m.svg;
      container.appendChild(diagramWrapper);
      loadExportActions(container, diagramWrapper.querySelector('svg'), id);
      node.replaceWith(container);
      resolve(true);
    }).catch((err) => {
      console.log('render mermaid error: ' + err);
      resolve(false);
    });
    return;
  }

  setTimeout(() => {
    onRenderMermaid(resolve, res);
  }, 10);
}

/**
 * render mermaid graphs
 */
function renderMermaid(element) {
  return new Promise(resolve => {
    const meta = utils.createElementMeta(extName, element);
    if (!meta || !meta.data) {
      return resolve(false);
    }

    onRenderMermaid(resolve, meta);
  });
}

// <div class="mermaid"></div>
function renderMermaidElements(elements, config) {
  dyncLoadScript(config);
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderMermaid(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// mermaid default config
const getConfig = (config = {}) => ({
  theme: 'forest',
  logLevel: 4,
  startOnLoad: false,
  arrowMarkerAbsolute: false,
  flowchart: {
    curve: 'basis'
  },
  gantt: {
    axisFormat: '%m/%d/%Y'
  },
  sequence: {
    actorMargin: 50
  },
  ...config
});

function showdownMermaid(userConfig) {
  const config = getConfig(userConfig);
  return [
    {
      type: 'output',
      config: config,
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the mermaid in code blocks
        const elements = wrapper.querySelectorAll('code.mermaid.language-mermaid');
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render mermaid elements.`));
        return renderMermaidElements(elements, this.config).then(() => {
          console.log(format(`End render mermaid elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownMermaid;
