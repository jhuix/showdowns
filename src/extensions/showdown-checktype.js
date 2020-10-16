/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown checktype extension for markdown
 */
'use strict';

function _getCssLink(wrapper, className, extName) {
  // find elements that has csslink
  const element = wrapper.querySelector(className);
  let cssLink = '';
  if (element) {
    cssLink = element.dataset.css;
  } else {
    let ext;
    try {
      ext = showdown.extension(extName);
    } catch {}

    if (!ext) {
      try {
        ext = showdown.asyncExtension(extName);
      } catch {}
    }

    if (ext) {
      if (Array.isArray(ext)) {
        for (var i = 0; i < ext.length; ++i) {
          if (ext[i].hasOwnProperty('config') && ext[i].config.hasOwnProperty('cssLink')) {
            cssLink = ext[i].config.cssLink;
            break;
          }
        }
      } else if (typeof ext === 'object') {
        if (ext.hasOwnProperty('config') && ext.config.hasOwnProperty('cssLink')) {
          cssLink = ext.config.cssLink;
        }
      }
    }
  }
  return cssLink;
}

function showdownCheckType() {
  return [
    {
      type: 'output',
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }

        return new Promise(resolve => {
          const katexCssLink = _getCssLink(wrapper, '.css-katex', 'showdown-katex');
          const sequenceCssLink = _getCssLink(wrapper, '.css-sequence', 'showdown-sequence');
          const railroadCssLink = _getCssLink(wrapper, '.css-railroad', 'showdown-railroad');

          obj.cssTypes = {
            hasKatex: katexCssLink ? true : false,
            hasSequence: sequenceCssLink ? true : false,
            hasRailroad: railroadCssLink ? true : false,
            css: {
              katex: katexCssLink,
              sequence: sequenceCssLink,
              railroad: railroadCssLink
            }
          };
          return resolve(obj);
        });
      }
    }
  ];
}

export default showdownCheckType;
