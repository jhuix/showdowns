/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown plantuml extension for markdown
 */
'use strict';

import format from './log';
import utils from './utils';
import plantumlcodec from '../utils/plantuml-codec.js';

const defaultUmlWebsite = 'www.plantuml.com/plantuml';
const defaultImageFormat = 'svg';
const umlCache = {};

function clearCache(doc) {
  Object.keys(umlCache).forEach(key => {
    if (!doc.querySelector(`[id*="-${key}"]`)) {
      delete umlCache[key];
    }
  });
}

let umlElementCount = 0;
function renderPlantumlElement(element, config) {
  const meta = utils.createElementMeta('PlantUML', element, true);
  if (!meta || meta.data.length === 0) {
    return;
  }

  const svgElement = umlCache[meta.hash]
  if (svgElement) {
    element.parentNode.replaceWith(svgElement);
    return;
  }

  return (resolve) => {
    // const meta = utils.createElementMeta('PlantUML', element, true);
    // if (!meta || meta.data.length === 0) {
    //   return resolve(false);
    // }

    // const svgElement = umlCache[meta.hash]
    // if (svgElement) {
    //   element.parentNode.replaceWith(svgElement);
    //   return resolve(true);
    // }
    const imageFormat = config.imageFormat;
    if (imageFormat === 'svg') {
      if (typeof config.svgRender === 'function' && config.svgRender) {
        try {
          const params = {
            count: umlElementCount
          }
          config.svgRender(meta.id, meta.data, params).then(svg => {
            // <div id="${meta.id}" class="${meta.className}"${style}>${svgData}</div>
            const svgElement = document.createElement('div');
            svgElement.id = meta.id;
            svgElement.className = meta.className;
            if (element.style.cssText.length > 0) {
              svgElement.style = element.style.cssText;
            }
            svgElement.innerHTML = svg;
            element.parentNode.replaceWith(svgElement);
            umlCache[meta.hash] = svgElement;
            resolve(true);
          });
        } catch (err) {
          console.log(`plantuml to ${imageFormat} of ${type} failed:`, err.toString());
          resolve(false);
        }
        return;
      }
      if (!!window && window.fetch) {
        const protocol = window.location && window.location.protocol;
        const website = (protocol === 'http:' || protocol === 'https:' ? '//' : 'https://') + config.umlWebSite;
        const imageExtension = imageFormat !== defaultImageFormat ? `.${imageFormat}` : '';
        const uml = plantumlcodec.encodeuml(meta.data);
        const src = `${website}/${imageFormat}/${uml}${imageExtension}`;
        try {
          window
            .fetch(src)
            .then((res) => {
              if (typeof res === 'string') {
                return res;
              }

              if (res.ok) {
                return res.text();
              }

              throw new Error(`RequestError: ${res.status}`);
            })
            .then((svg) => {
              const svgElement = document.createElement('div');
              svgElement.id = meta.id;
              svgElement.className = meta.className;
              if (element.style.cssText.length > 0) {
                svgElement.style = element.style.cssText;
              }
              svgElement.innerHTML = svg;
              element.parentNode.replaceWith(svgElement);
              umlCache[meta.hash] = svgElement;
              resolve(true);
            }).catch((err) => {
              console.log('render remote plantuml failed: ', err.toString());
              resolve(false);
            });
        } catch (err) {
          console.log('render remote plantuml failed: ', err.toString());
          resolve(false);
        }
        return;
      }
      resolve(false);
      return;
    }

    let style = element.style.cssText;
    if (style.length > 0) {
      style = ` style="${style}"`;
    }
    const protocol = window && window.location.protocol;
    const website = (protocol === 'http:' || protocol === 'https:' ? '//' : 'https://') + config.umlWebSite;
    const imageExtension = imageFormat !== defaultImageFormat ? `.${imageFormat}` : '';
    const uml = plantumlcodec.encodeuml(code);
    const src = `${website}/${imageFormat}/${uml}${imageExtension}`;
    element.parentNode.outerHTML = `<div id="${meta.id}" class="${meta.className}"${style}><img src='${src}' alt=''></img></div>`;
    return resolve(true);
  };
}

// <div class="plantuml"></div>
function renderPlantumlElements(elements, config) {
  return new Promise((resolve) => {
    const promiseArray = [];
    const executores = []
    elements.forEach((element) => {
      const executor = renderPlantumlElement(element, config);
      if (executor) {
        executores.push(executor);
      }
    });
    umlElementCount = executores.length;
    executores.forEach((executor) => {
      promiseArray.push(new Promise(executor));
    })
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
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the plantuml in code blocks
        const elements = wrapper.querySelectorAll('code.plantuml.language-plantuml');
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render plantuml elements.`));
        return renderPlantumlElements(elements, this.config).then(() => {
          clearCache(wrapper);
          console.log(format(`End render plantuml elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownPlantuml;
