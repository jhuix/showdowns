/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown plantuml extension for markdown
 */
'use strict';

import format from './log';
import utils from './utils';

const texWeb = 'tex.io';
const graphsCache = {};

function clearCache(doc) {
  Object.keys(graphsCache).forEach(key => {
    if (!doc.querySelector(`[id*="-${key}-"]`)) {
      delete graphsCache[key];
    }
  });
}

function markTexElement(element, tex) {
  const code = element.textContent.trim();
  if (code.length === 0) {
    return;
  }

  const langattr = element.dataset.lang;
  const checksum = utils.hashString(langattr + code);
  const diagramInCache = graphsCache[checksum];
  if (diagramInCache) {
    element.parentNode.replaceWith(diagramInCache);
    return;
  }

  let langobj = null;
  if (langattr) {
    try {
      langobj = JSON.parse(langattr);
    } catch {
      console.log(`Error: parse tex data-lang ${langattr} failed.`);
    }
  }
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

  let buildType = tex.config.buildType ?? 'pdflatex';
  if (element.classList.length > 0) {
    const classname = element.classList[0];
    const names = classname.split('-');
    if (names.length > 1) {
      buildType = names[names.length - 1];
    }
  }
  const classnames =
    (element.classList.length > 0 ? element.classList[0] : '') +
    (!element.className || !diagramClass ? '' : ' ') +
    diagramClass;
  if (buildType.length > 0 && !!window && window.fetch) {
    const id = `${buildType}-${checksum}-` + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    element.className = classnames;
    if (tex) {
      tex.elements = tex.elements ?? []
      tex.elements.push({ type: buildType, id: id });
    }
  }
}

function markTexElements(elements, tex) {
  elements.forEach(element => {
    markTexElement(element, tex);
  });
}

function renderTexElements() {
  const tex = window.Tex ?? {};
  if (!tex.elements || !Array.isArray(tex.elements) || tex.elements.length === 0) {
    return;
  }

  const website = 'https://' + (tex.serverUrl ?? 'tex.io');
  tex.elements.forEach(({ type, id }) => {
    const element = document.querySelector(`#${id}`);
    if (!element) return;

    const langattr = element.dataset.lang;
    const code = element.textContent.trim();
    const checksum = utils.hashString(langattr + code);
    const src = `${website}/${type}/svg`;
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
}

const getConfig = (config = {}) => ({
  serverUrl: texWeb,
  buildType: 'pdflatex',
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
        // find the plantuml in code blocks
        const elements = wrapper.querySelectorAll('code.tex.language-tex');
        if (!elements.length) {
          return false;
        }

        window.Tex = window.Tex ?? {}
        window.Tex.config = this.config;
        obj.scripts.push({
          id: 'showdown-tex',
          code: renderTexElements,
          once: true
        })
        console.log(format(`Begin render tex elements.`));
        markTexElements(elements, window.Tex)
        clearCache(wrapper);
        console.log(format(`End render tex elements.`));
        return obj;
      }
    }
  ];
}

export default showdownTex;
