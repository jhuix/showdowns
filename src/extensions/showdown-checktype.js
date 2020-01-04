/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown checktype extension for markdown
 */
'use strict';

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
          // find the katex and assciimath elements
          const katex_css = wrapper.querySelector('.css-katex');
          const sequence_css = wrapper.querySelector('.css-sequence');
          const railroad_css = wrapper.querySelector('.css-railroad');

          obj.cssTypes = {
            hasKatex: katex_css ? true : false,
            hasSequence: sequence_css ? true : false,
            hasRailroad: sequence_css ? true : false,
            css: {
              katex: katex_css ? katex_css.dataset.css : '',
              sequence: sequence_css ? sequence_css.dataset.css : '',
              railroad: railroad_css ? railroad_css.dataset.css : ''
            }
          };
          return resolve(obj);
        });
      }
    }
  ];
}

export default showdownCheckType;
