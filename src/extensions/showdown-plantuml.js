/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown plantuml extension for markdown
 */
'use strict';

import plantumlcodec from '../utils/plantuml-codec.js';

const defaultUmlWebsite = 'www.plantuml.com/plantuml';
const defaultImageFormat = 'img';

let umlElementCount = 0;
function renderPlantumlElement(element, config) {
  return new Promise(resolve => {
    const langattr = element.dataset.lang;
    const langobj = langattr ? JSON.parse(langattr) : null;
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
    const code = element.textContent.trim();
    const name =
      (element.classList.length > 0 ? element.classList[0] : '') +
      (!element.className || !diagramClass ? '' : ' ') +
      diagramClass;
    const imageFormat = config.imageFormat;
    if (imageFormat === 'svg') {
      const id = 'plantuml-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      if (typeof config.svgRender === 'function' && config.svgRender) {
        config.svgRender(id, name, code, umlElementCount).then(svgData => {
          element.parentNode.outerHTML = `<div id="${id}" class="${name}">${svgData}</div>`;
          resolve(true);
        });
      } else if (typeof window !== 'undefined' && window.fetch && window.dispatchEvent) {
        const protocol = window && window.location.protocol;
        const website = (protocol === 'http:' || protocol === 'https:' ? '//' : 'https://') + config.umlWebSite;
        const imageExtension = imageFormat !== defaultImageFormat ? `.${imageFormat}` : '';
        const uml = plantumlcodec.encodeuml(code);
        const src = `${website}/${imageFormat}/${uml}${imageExtension}`;
        window
          .fetch(src)
          .then(response => {
            if (response.ok) {
              return response.text();
            }
          })
          .then(svgData => {
            element.parentNode.outerHTML = `<div id="${id}" class="${name}">${svgData}</div>`;
            resolve(true);
          });
      }
    } else {
      const protocol = window && window.location.protocol;
      const website = (protocol === 'http:' || protocol === 'https:' ? '//' : 'https://') + config.umlWebSite;
      const imageExtension = imageFormat !== defaultImageFormat ? `.${imageFormat}` : '';
      const uml = plantumlcodec.encodeuml(code);
      const src = `${website}/${imageFormat}/${uml}${imageExtension}`;
      element.parentNode.outerHTML = `<div class="${name}"><img src='${src}' alt=''></img></div>`;
      return resolve(true);
    }
  });
}

// <div class="plantuml"></div>
function renderPlantumlElements(elements, config) {
  umlElementCount = elements.length;
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderPlantumlElement(element, config));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// Plantuml default config
const getConfig = (config = {}) => ({
  umlWebSite: defaultUmlWebsite,
  imageFormat: defaultImageFormat,
  svgRender: null,
  ...config
});

function showdownPlantuml(userConfig) {
  const config = getConfig(userConfig);

  return [
    {
      type: 'output',
      config: config,
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the plantuml in code blocks
        const elements = wrapper.querySelectorAll('code.plantuml.language-plantuml');
        if (!elements.length) {
          return false;
        }

        console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render plantuml elements.`);
        return renderPlantumlElements(elements, this.config).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render plantuml elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownPlantuml;
