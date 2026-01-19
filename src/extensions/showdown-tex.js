/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown plantuml extension for markdown
 */
'use strict';

import format from './log';
import utils from './utils';

const texWeb = 'tex.io';
const Tex = {};
const graphsCache = {};
const latexEngines = ['pdflatex', 'xelatex', 'lualatex'];

function clearCache(doc) {
  Object.keys(graphsCache).forEach(key => {
    if (!doc.querySelector(`[id*="-${key}"]`)) {
      delete graphsCache[key];
    }
  });
}

function markTexElement(element, tex) {
  const meta = utils.createElementMeta('Tex', element, true);
  if (!meta || meta.data.length === 0) {
    return;
  }

  const diagramInCache = graphsCache[meta.hash];
  if (diagramInCache) {
    element.parentNode.replaceWith(diagramInCache);
    return;
  }

  let buildType = tex.config.buildType ?? 'pdflatex';
  if (meta.lang?.engine && latexEngines.includes(meta.lang.engine.toLowerCase())) {
    buildType = meta.lang.engine.toLowerCase();
  }
  tex.elements = tex.elements ?? []
  const context = { type: buildType, id: meta.id };
  if (meta.lang) {
    context.lang = meta.lang;
  }
  tex.elements.push(context);
}

function markTexElements(elements, tex) {
  elements.forEach(element => {
    markTexElement(element, tex);
  });
}

function renderTexElements() {
  if (!window || !('Tex' in window)) return;
  const tex = window['Tex'];
  if (!tex.elements || !Array.isArray(tex.elements) || tex.elements.length === 0) {
    return;
  }

  const website = 'https://' + (tex.config.serverUrl ?? 'tex.io');
  tex.elements.forEach(({ type, id, lang }) => {
    const element = document.querySelector(`#${id}`);
    if (!element) return;

    const langattr = element.dataset.lang;
    const code = element.textContent.trim();
    const checksum = utils.hashString(langattr + code);
    const texElement = graphsCache[checksum];
    if (texElement) {
      element.parentNode.replaceWith(texElement);
      return;
    }

    if (typeof tex.svgRender === 'function' && tex.svgRender) {
      const params = {
        build: type
      };
      if (lang) {
        if (lang.width?.length > 0) {
          params.width = lang.width;
        }
        if (lang.height?.length > 0) {
          params.height = lang.height;
        }
        if (lang.zoom && lang.zoom > 0) {
          params.zoom = lang.zoom;
        }
      }
      try {
        tex.svgRender(element.id, code, params).then((svg) => {
          const texElement = document.createElement('div');
          texElement.id = element.id;
          texElement.className = element.className;
          if (element.style.cssText.length > 0) {
            texElement.style = element.style.cssText;
          }
          texElement.innerHTML = svg;
          element.parentNode.replaceWith(texElement);
          graphsCache[checksum] = texElement;
        }).catch((err) => {
          console.log(`tex to ${imageFormat} of ${type} failed:`, err.toString());
        });
      } catch (err) {
        console.log(`tex to ${imageFormat} of ${type} failed:`, err.toString());
      }
      return;
    }

    if (!window || !window.fetch) return;

    const params = []
    if (lang) {
      if (lang.width?.length > 0) {
        params.push(`width=${lang.width}`);
      }
      if (lang.height?.length > 0) {
        params.push(`height=${lang.height}`);
      }
      if (lang.zoom && lang.zoom > 0) {
        params.push(`zoom=${lang.zoom}`);
      }
    }
    const src = `${website}/${type}/svg` + (params.length > 0 ? `?${params.join('&')}` : '');
    try {
      window.fetch(src, {
        method: 'POST',
        body: code,
        headers: { Accept: `*/*`, 'Content-Type': 'text/plain; charset=utf-8' }
      }).then((res) => {
        if (typeof res === 'string') {
          return res;
        }

        if (res.ok) {
          return res.text();
        }

        throw new Error(`RequestError: ${res.status}`);
      }).then((svg) => {
        if (svg) {
          const texElement = document.createElement('div');
          texElement.id = element.id;
          texElement.className = element.className;
          if (element.style.cssText.length > 0) {
            texElement.style = element.style.cssText;
          }
          texElement.innerHTML = svg;
          element.parentNode.replaceWith(texElement);
          graphsCache[checksum] = texElement;
        }
      }).catch((err) => {
        console.log(`tex to svg of ${type} failed:`, err.toString());
      });
    } catch (err) {
      console.log(`tex to svg of ${type} failed:`, err.toString());
    }
  })
  delete tex.elements;
}

const getConfig = (config = {}) => ({
  serverUrl: texWeb,
  buildType: 'pdflatex',
  svgRender: null,
  ...config
});

function showdownTex(userConfig) {
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
        const elements = wrapper.querySelectorAll('code.tex.language-tex,code.latex.language-latex');
        if (!elements.length) {
          return false;
        }

        if (!!window) {
          window['Tex'] = Tex;
        }
        Tex.config = {
          serverUrl: this.config.serverUrl,
          buildType: this.config.buildType
        }
        Tex.svgRender =this.config.svgRender;
        obj.scripts.push({
          id: 'showdown-tex',
          code: renderTexElements,
          once: true
        })
        console.log(format(`Begin render tex elements.`));
        markTexElements(elements, Tex);
        if (Tex.elements?.length > 0) {
          clearCache(wrapper);
        }
        console.log(format(`End render tex elements.`));
        return obj;
      }
    }
  ];
}

export default showdownTex;
