/*
 * @Description: showdown checktype extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
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
            wrapper.querySelectorAll('div.sequence').length ||
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
