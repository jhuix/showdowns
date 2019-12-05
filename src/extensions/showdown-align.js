/*
 * @Description: showdown align extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-08-27 16:57:06
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 18:20:35
 */

'use strict';

function renderAlignElements(wrapper) {
  let element = null;
  let childNode = null;
  let result = false;
  const elements = wrapper.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, div.paragraph');
  for (let i = 0; i < elements.length; i++) {
    element = elements[i];
    childNode = element.firstChild;
    while (childNode) {
      // Text node type is 3.
      if (childNode.nodeType === 3) {
        // Does the element consist of ':-:' or '--:'
        let results = childNode.nodeValue.match(/^([\s\S]*?)([:-]-:)(?:[\s]?)([\s\S]*)$/);
        if (results) {
          if (results[2] === ':-:') {
            // align-center
            childNode.nodeValue = results[3];
            if (element.className) {
              element.className += ` align-center`;
            } else {
              element.className = `align-center`;
            }
            result = true;
          } else if (results[2] === '--:') {
            //align-right
            childNode.nodeValue = results[3];
            if (element.className) {
              element.className += ` align-right`;
            } else {
              element.className = `align-right`;
            }
            result = true;
          }
          //default algin-left
        }
        break;
      }
      childNode = childNode.nextSibling;
    }
  }
  return result;
}

function showdownAlign() {
  const parser = new DOMParser();
  return [
    {
      type: 'output',
      filter: function(html) {
        // parse html
        const doc = parser.parseFromString(html, 'text/html');
        const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;
        if (!renderAlignElements(wrapper)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownAlign;
