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
          const katexs =
            wrapper.querySelectorAll('span.katex-display').length ||
            wrapper.querySelectorAll('code.latex.language-latex').length ||
            wrapper.querySelectorAll('code.asciimath.language-asciimath').length;
          // find the network-sequences elements
          const sequences =
            wrapper.querySelectorAll('div.js-sequence').length ||
            wrapper.querySelectorAll('code.sequence.language-sequence').length;
          // find the railroad-diagrams elements
          const railroad =
            wrapper.querySelectorAll('div.railroad').length ||
            wrapper.querySelectorAll('code.railroad.language-railroad').length;

          check_csstypes_callback({
            hasKatex: katexs > 0 ? true : false,
            hasSequence: sequences > 0 ? true : false,
            hasRailroad: railroad > 0 ? true : false
          });
        }
        // return html text content
        return html;
      }
    }
  ];
}

export default showdownCheckType;
