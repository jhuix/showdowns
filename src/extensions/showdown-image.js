/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown inline image extension for markdown
 */
'use strict';

import format from './log';
import EventBus from '../utils/event-bus';

const imageResetEventName = 'resetImagePath';

function showdownImage() {
  return [
    {
      type: 'listener',
      listeners: {
        'images.after': (_, text) =>
          text.replace(/!\[\[([^\f\v\r\n\[\]]*)\]\](?:\{([^\f\v\r\n\{\}]*)\})?/gm, (_, filepath, attrs) => {
            if (attrs) {
              attrs = attrs.trim();
              if (attrs) {
                let id = '';
                let classes = [];
                const attrMatchs = attrs.match(/^(?:(?:#([-\w]+))?((?:\.[-\w]+)*))?[ \t]*([\S\t ]*)/);
                if (attrMatchs) {
                  const names = Array.from(attrMatchs);
                  if (names) {
                    attrs = names[3] || '';
                    id = names[1] || '';
                    classes = names[2] ? names[2].split('.').filter((n) => { return n.trim(); }) : [];
                    if (id) {
                      id = `id="${id}" `;
                    }
                  }
                }
                classes.unshift('inline-image');
                return `<img ${id}class="${classes.join(' ')}" data-src="${filepath}" ${attrs}/>`;
              };
            }

            return `<img class="inline-image" data-src="${filepath}" />`;
          })
      }
    }
  ];
}

function renderInlineImage(element) {
  return new Promise(resolve => {
    const src = element.dataset.src;
    if (!src) {
      return resolve(false);
    }

    const id = 'image-' + Date.now() + Math.floor(Math.random() * 10000);
    const callback = (filepath) => {
      if (!filepath) filepath = src;
      element.src = filepath;
      delete element.dataset.src;
      resolve(true);
    };
    if (!EventBus.emit(imageResetEventName, id, src, callback)) {
      callback(src);
    }
  });
}

function renderInlineImageElements(elements) {
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderInlineImage(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

function showdownAsyncImage() {
  return [
    {
      type: 'output',
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the inline image in code blocks
        const elements = wrapper.querySelectorAll('img.inline-image');
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render inline image elements.`));
        return renderInlineImageElements(elements).then(() => {
          console.log(format(`End render inline image elements.`));
          return obj;
        });
      }
    }
  ];
}

export { showdownImage as default, showdownImage, showdownAsyncImage, imageResetEventName };
