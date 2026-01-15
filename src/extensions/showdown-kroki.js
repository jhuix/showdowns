/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown plantuml extension for markdown
 */
'use strict';

import format from './log';
import utils from './utils';

const krokiWeb = 'kroki.io';
const graphsCache = {};
const Kroki = {};

function clearCache(doc) {
  Object.keys(graphsCache).forEach(key => {
    if (!doc.querySelector(`[id*="-${key}-"]`)) {
      delete graphsCache[key];
    }
  });
}

function markKrokiElement(element, kroki) {
  const meta = utils.createElementMeta('Tex', element);
  if (!meta || meta.data.length === 0) {
    return;
  }

  const langattr = element.dataset.lang;
  const checksum = utils.hashString(langattr + meta.data);
  const diagramInCache = graphsCache[checksum];
  if (diagramInCache) {
    element.parentNode.replaceWith(diagramInCache);
    return;
  }

  let diagramType = '';
  if (element.classList.length > 0) {
    const classname = element.classList[0];
    const names = classname.split('-');
    if (names.length > 1) {
      diagramType = names[names.length - 1];
    }
  }
  if (diagramType.length > 0 && !!window && window.fetch && kroki) {
    kroki.elements = kroki.elements ?? []
    kroki.elements.push({ type: diagramType, id: meta.id });
  }
}

function markKrokiElements(elements, kroki) {
  elements.forEach(element => {
    markKrokiElement(element, kroki);
  });
}

function renderKrokiElements() {
  if (!window || !('Kroki' in window)) return;
  const kroki = window['Kroki'];
  if (!kroki.elements || !Array.isArray(kroki.elements) || kroki.elements.length === 0) {
    return;
  }

  const imageFormat = kroki.config.imageFormat ?? 'svg';
  kroki.elements.forEach(({ type, id }) => {
    const element = document.querySelector(`#${id}`);
    if (!element) return;

    const langattr = element.dataset.lang;
    const code = element.textContent.trim();
    const checksum = utils.hashString(langattr + code);
    if (typeof kroki.svgRender === 'function' && kroki.svgRender) {
      const params = {
        diagramType: type,
        imageFormat: imageFormat
      }
      try {
        kroki.svgRender(element.id, code, params).then((svg) => {
          const krokiElement = document.createElement('div');
          krokiElement.id = element.id;
          krokiElement.className = element.className;
          if (element.style.cssText.length > 0) {
            krokiElement.style = element.style.cssText;
          }
          krokiElement.innerHTML = svg;
          element.parentNode.replaceWith(krokiElement);
          graphsCache[checksum] = krokiElement;
        }).catch((err) => {
          console.log(`kroki to ${imageFormat} of ${type} failed:`, err.toString());
        });
      } catch (err) {
        console.log(`kroki to ${imageFormat} of ${type} failed:`, err.toString());
      }
      return;
    }

    const website = 'https://' + (kroki.config.serverUrl ?? 'kroki.io');
    const src = `${website}/${type}/${imageFormat}`;
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
          const krokiElement = document.createElement('div');
          krokiElement.id = element.id;
          krokiElement.className = element.className;
          if (element.style.cssText.length > 0) {
            krokiElement.style = element.style.cssText;
          }
          krokiElement.innerHTML = svg;
          element.parentNode.replaceWith(krokiElement);
          graphsCache[checksum] = krokiElement;
        }
      }).catch((err) => {
        console.log(`kroki to ${imageFormat} of ${type} failed:`, err.toString());
      });
    } catch (err) {
      console.log(`kroki to ${imageFormat} of ${type} failed:`, err.toString());
    }
  })
}

const getConfig = (config = {}) => ({
  serverUrl: krokiWeb,
  imageFormat: 'svg',
  svgRender: null,
  ...config
});

function showdownKroki(userConfig) {
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
        // find the kroki in code blocks
        const elements = wrapper.querySelectorAll('code[class*="language-kroki-"]');
        if (!elements.length) {
          return false;
        }

        if (!!window) {
          window['Kroki'] = Kroki;
        }
        Kroki.config = {
          serverUrl: this.config.serverUrl,
          imageFormat: this.config.imageFormat
        }
        Kroki.svgRender = this.config.svgRender;
        obj.scripts.push({
          id: 'showdown-kroki',
          code: renderKrokiElements,
          once: true
        })
        console.log(format(`Begin render kroki elements.`));
        markKrokiElements(elements, Kroki)
        clearCache(wrapper);
        console.log(format(`End render kroki elements.`));
        return obj;
      }
    }
  ];
}

export default showdownKroki;
