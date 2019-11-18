/*
 * @Description: showdown plantuml extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-08-30 09:32:41
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 18:18:51
 */

'use strict';

import plantumlcodec from '../utils/plantuml-codec.js';

const defaultUmlWebsite = 'www.plantuml.com/plantuml';
const defaultImageFormat = 'img';

// <div class="plantuml"></div>
function renderPlantumlElements(elements, config) {
  if (!elements.length) {
    return false;
  }
  elements.forEach(element => {
    const code = element.textContent;
    const name = element.className;
    const imageFormat = config.imageFormat;
    const protocol = window && window.location.protocol;
    const website =
      (protocol === 'http:' || protocol === 'https:' ? '//' : 'https://') +
      config.umlWebSite;
    const imageExtension =
      imageFormat !== defaultImageFormat ? `.${imageFormat}` : '';
    const uml = plantumlcodec.encodeuml(code);
    let src = `${website}/${imageFormat}/${uml}${imageExtension}`;
    if (
      imageFormat === 'svg' &&
      typeof window !== 'undefined' &&
      window.fetch &&
      window.dispatchEvent
    ) {
      element.id = 'plantuml-' + Date.now();
      window
        .fetch(src)
        .then(response => {
          if (response.ok) {
            return response.text();
          }
        })
        .then(data => {
          //element.parentNode.outerHTML = `<div class="${name}">${data}</div>`;
          window.dispatchEvent(
            new CustomEvent('plantuml', {
              detail: {
                id: element.id,
                className: element.className,
                imgData: data
              }
            })
          );
        });
    } else {
      element.parentNode.outerHTML = `<div class="${name}"><img src='${src}' alt=''></img></div>`;
    }
  });
  return true;
}

// Plantuml default config
const getConfig = (config = {}) => ({
  umlWebSite: defaultUmlWebsite,
  imageFormat: defaultImageFormat,
  ...config
});

function showdownPlantuml(userConfig) {
  const parser = new DOMParser();
  const config = getConfig(userConfig);

  if (
    config.imageFormat === 'svg' &&
    typeof window !== 'undefined' &&
    window.fetch &&
    window.dispatchEvent
  ) {
    window.addEventListener('plantuml', event => {
      if (event.detail) {
        const el = window.document.getElementById(event.detail.id);
        if (el) {
          el.parentNode.outerHTML = `<div id="${event.detail.id}" class="${event.detail.className}">${event.detail.imgData}</div>`;
        }
      }
    });
  }

  return [
    {
      type: 'output',
      filter: function(html) {
        // parse html
        const doc = parser.parseFromString(html, 'text/html');
        const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;

        // find the plantuml in code blocks
        const elements = wrapper.querySelectorAll(
          'code.plantuml.language-plantuml'
        );

        if (!renderPlantumlElements(elements, config)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownPlantuml;
