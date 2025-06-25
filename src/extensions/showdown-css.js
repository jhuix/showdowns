/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown checktype extension for markdown
 */
'use strict';

import cdnjs from './cdn';
import utils from './utils';

function showdownCss() {
  return [
    {
      type: 'output',
      filter: function(obj) {
        const prefix = 'css-ex-';
        utils.removeAllStylesheet(prefix);
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }

        const elements = wrapper.querySelectorAll('a');
        if (!elements.length) {
          return false;
        }

        elements.forEach((e)=>{
          try {
            if (e.href && typeof e.href === 'string' && e.href.substr(0, 4) === 'css:') {
              let cssLink = e.href.substr(4).trim();
              const hash = `${utils.hashString(cssLink)}`;
              utils.addCssLink(obj, cssLink, prefix + hash);             
              if (e.parentNode && e.parentNode.tagName === 'P' && e.parentNode.parentNode) {
                e.parentNode.parentNode.removeChild(e.parentNode);
              } else {
                e.parentNode.removeChild(e);
              }
              cssLink = cdnjs.getUrl(cssLink);
              utils.loadStylesheet(cssLink, prefix + hash);
            }
          } catch {
            console.log('Error: href of <a> tag is not exist');
          }
        });
        return obj;
      }
    }
  ];
}

export default showdownCss;
