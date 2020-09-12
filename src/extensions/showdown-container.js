/*
 * Copyright (c) 2020-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown container extension for markdown
 */
'use strict';

function showdownContainer() {
  return [
    {
      type: 'lang',
      filter: (text, converter) =>
        text.replace(
          /(?:^|\n)(?: {0,3})(:::+)(?: *)([\S]+)(?:[ \t]*)([^\s][\S\t ]*)?\n([\s\S]*?)\n(?: {0,3})\1(?:[ \t]*)\n/g,
          function (wholeMatch, delim, classname, title, content) {
            if (classname) {
              let classes = classname.split('-');
              if (classes.length > 1) {
                classes.forEach(function (name, index, arr) {
                  if (index > 0) {
                    arr[index] = arr[index - 1] + '-' + name;
                  }
                });
              } else {
                classes.unshift('container');
              }
              classname = classes.join(' ');
            }
            if (content) {
              content = converter.makeHtml(content);
            }
            if (title) {
              title = `<p class="container-title">${title}</p>`;
            } else {
              title = ''
            }
            return `<div class="showdown-container ${classname}">${title}${content}</div>`;
          }
        ),
    },
  ];
}

export default showdownContainer;
