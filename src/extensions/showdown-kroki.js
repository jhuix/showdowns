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

function clearCache(doc) {
  Object.keys(graphsCache).forEach(key => {
    if (!doc.querySelector(`[id*="-${key}-"]`)) {
      delete graphsCache[key];
    }
  });
}

function renderKrokiElement(element, config) {
  return new Promise(resolve => {
    const langattr = element.dataset.lang;
    const code = element.textContent.trim();
    const checksum = utils.hashString(langattr + code);
    const diagramInCache = graphsCache[checksum];
    if (diagramInCache) {
      element.parentNode.replaceWith(diagramInCache);
      resolve(true);
      return;
    }

    let langobj = null;
    if (langattr) {
      try {
        langobj = JSON.parse(langattr);
      } catch {
        console.log(`Error: parse kroki data-lang ${langattr} failed.`);
      }
    }
    let diagramClass = '';
    if (langobj) {
      if (
        (typeof langobj.codeblock === 'boolean' && langobj.codeblock) ||
        (typeof langobj.codeblock === 'string' && langobj.codeblock.toLowerCase() === 'true')
      ) {
        return resolve(false);
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

    let diagramType = '';
    if (element.classList.length > 0) {
      const classname = element.classList[0];
      const names = classname.split('-');
      diagramType = names[names.length - 1];
    }

    const classnames =
      (element.classList.length > 0 ? element.classList[0] : '') +
      (!element.className || !diagramClass ? '' : ' ') +
      diagramClass;
    if (diagramType.length > 0 && !!window && window.fetch) {
      const id = `${diagramType}-${checksum}-` + Date.now() + '-' + Math.floor(Math.random() * 10000);
      const imageFormat = config.imageFormat;
      const website = 'https://' + config.serverUrl;
      const src = `${website}/${diagramType}/${imageFormat}/png`;
      try{
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
          if (!svg) {
            resolve(false);
          } else {
            const krokiElement = element.ownerDocument.createElement('div');
            krokiElement.id = id;
            krokiElement.className = classnames;
            krokiElement.innerHTML = svg;
            element.parentNode.replaceWith(krokiElement);
            graphsCache[checksum] = krokiElement;
            resolve(true);
          }
        }).catch((err) => {
          console.log(`kroki to ${imageFormat} of ${diagramType} failed:`, err.toString());
          resolve(false);
        });
      } catch(err) {
        console.log(`kroki to ${imageFormat} of ${diagramType} failed:`, err.toString());
        resolve(false);
      }
      return;
    }
    resolve(false);
  });
}

function renderKrokiElements(elements, config) {
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderKrokiElement(element, config));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

const getConfig = (config = {}) => ({
  serverUrl: krokiWeb,
  imageFormat: 'svg',
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
        // find the plantuml in code blocks
        const elements = wrapper.querySelectorAll('code[class*="language-kroki-"]');
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render kroki elements.`));
        return renderKrokiElements(elements, this.config).then(() => {
          clearCache(wrapper);
          console.log(format(`End render kroki elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownKroki;
