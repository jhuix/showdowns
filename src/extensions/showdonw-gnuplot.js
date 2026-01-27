/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown gnuplot extension for markdown
 */
'use strict';

import format from './log';
import utils from './utils';

const Gnuplot = {};
const plotCache = {};

function clearCache(doc) {
  Object.keys(plotCache).forEach(key => {
    if (!doc.querySelector(`[id*="-${key}"]`)) {
      delete plotCache[key];
    }
  });
}

function markGnuplotElement(element, gnuplot) {
  const meta = utils.createElementMeta('Gnuplot', element, true);
  if (!meta || !meta.data) {
    return;
  }

  const diagramInCache = plotCache[meta.hash];
  if (diagramInCache) {
    element.parentNode.replaceWith(diagramInCache);
    return;
  }

  gnuplot.elements = gnuplot.elements ?? []
  const context = { id: meta.id };
  if (meta.lang) {
    context.lang = meta.lang;
  }
  if (meta.hash) {
    context.hash = meta.hash;
  }
  gnuplot.elements.push(context);
}

function markGnuplotElements(elements, tex) {
  elements.forEach(element => {
    markGnuplotElement(element, tex);
  });
}

function renderGnuplotElements() {
  if (!window || !('Gnuplot' in window)) return;
  const gnuplot = window['Gnuplot'];
  if (!gnuplot.elements ||
    !Array.isArray(gnuplot.elements) || gnuplot.elements.length === 0 ||
    typeof gnuplot.svgRender !== 'function' || !gnuplot.svgRender) {
    return;
  }

  gnuplot.elements.forEach(({ id, hash, lang }) => {
    const element = document.querySelector(`#${id}`);
    if (!element) return;

    let svgElement = plotCache[hash];
    if (svgElement) {
      element.parentNode.replaceWith(svgElement);
      return;
    }

    try {
      const code = `set terminal svg
${element.textContent.trim()}
`;
      gnuplot.svgRender(element.id, code).then((svg) => {
        svgElement = document.createElement('div');
        svgElement.id = element.id;
        svgElement.className = element.className;
        if (element.style.cssText.length > 0) {
          svgElement.style = element.style.cssText;
        }
        svgElement.innerHTML = svg;
        element.parentNode.replaceWith(svgElement);
        plotCache[hash] = svgElement;
      }).catch((err) => {
        console.log(`gnuplot to svg failed:`, err.toString());
      });
    } catch (err) {
      console.log(`gnuplot to svg failed:`, err.toString());
    }
  })
  delete gnuplot.elements;
}

const getConfig = (config = {}) => ({
  svgRender: null,
  ...config
});

function showdownGnuplot(userConfig) {
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
        // find the latex in code blocks
        const elements = wrapper.querySelectorAll('code.gnuplot.language-gnuplot');
        if (!elements.length) {
          return false;
        }

        if (!!window) {
          window['Gnuplot'] = Gnuplot;
        }
        Gnuplot.svgRender = this.config.svgRender;
        obj.scripts.push({
          id: 'showdown-gnuplot',
          code: renderGnuplotElements,
          once: true
        })
        console.log(format(`Begin render gnuplot elements.`));
        markGnuplotElements(elements, Gnuplot);
        if (Gnuplot.elements?.length > 0) {
          clearCache(wrapper);
        }
        console.log(format(`End render gnuplot elements.`));
        return obj;
      }
    }
  ];
}

export default showdownGnuplot;
