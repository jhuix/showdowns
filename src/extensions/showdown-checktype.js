/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown checktype extension for markdown
 */
'use strict';

function showdownCheckType(check_csstypes_callback) {
  const parser = new DOMParser();
  return [
    {
      type: 'output',
      filter: function(html) {
        if (typeof check_csstypes_callback === 'function') {
          // parse html
          const doc = parser.parseFromString(html, 'text/html');
          const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;
          // find the katex and assciimath elements
          const katex_css = wrapper.querySelector('.css-katex');
          const sequence_css = wrapper.querySelector('.css-sequence');
          const railroad_css = wrapper.querySelector('.css-railroad');

          check_csstypes_callback({
            hasKatex: katex_css ? true : false,
            hasSequence: sequence_css ? true : false,
            hasRailroad: sequence_css ? true : false,
            css: {
              katex: katex_css ? katex_css.dataset.css : '',
              sequence: sequence_css ? sequence_css.dataset.css : '',
              railroad: railroad_css ? railroad_css.dataset.css : ''
            }
          });
        }
        // return html text content
        return html;
      }
    }
  ];
}

export default showdownCheckType;
