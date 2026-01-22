/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown image extension for markdown
 */
'use strict';

import format from './log';
import EventBus from '../utils/event-bus';

const imageEventName = 'getImagePath';

function showdownImage() {
  return [
    {
      type: 'lang',
      filter: (text) =>
        text.replace(/!\[\[([^\[\]]*)\]\](?:\{([^\{\}]*)\})?/gm, (_, filepath, attrs) => {
          if (!attrs) attrs = '';
          return `<img class="inline-image" data-src="${filepath}" ${attrs}/>`;
        })
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
    const data = { id: id, src: src, callback: (filepath) => {
      if (!filepath) filepath = src;
      element.src = filepath;
      resolve(true);
    }};
    if (!EventBus.emit(imageEventName, data)) {
      return resolve(false);
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
        // find the plotly in code blocks
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

export { showdownImage as default, showdownImage, showdownAsyncImage, imageEventName };
