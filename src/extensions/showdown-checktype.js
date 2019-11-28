/*
 * @Description: showdown checktype extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
 */

'use strict';

function showdownCheckType(checktype_callback) {
  const parser = new DOMParser();
  return [
    {
      type: 'output',
      filter: function(html) {
        if (
          typeof checktype_callback === 'function' &&
          (typeof window === 'undefined' || !window.dispatchEvent)
        ) {
          // parse html
          const doc = parser.parseFromString(html, 'text/html');
          const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;
          // find the katex elements
          const katexs =
            wrapper.querySelectorAll('span.katex-display') ||
            wrapper.querySelectorAll('code.latex.language-latex') ||
            wrapper.querySelectorAll('code.asciimath.language-asciimath');

          const sequences =
            wrapper.querySelectorAll('div.sequence') ||
            wrapper.querySelectorAll('code.sequence.language-sequence');

          const railroad =
            wrapper.querySelectorAll('div.railroad') ||
            wrapper.querySelectorAll('code.railroad.language-railroad');

          checktype_callback({
            hasKatex: katexs.length > 0 ? true : false,
            hasSequence: sequences.length > 0 ? true : false,
            hasRailroad: railroad.length > 0 ? true : false
          });
        }
        // return html text content
        return html;
      }
    }
  ];
}

export default showdownCheckType;
