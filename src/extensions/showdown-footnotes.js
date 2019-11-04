/*
 * @Description: showdown footnotes extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-08-30 10:02:40
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-09-07 19:50:55
 * Reference website: https://github.com/Kriegslustig/showdown-footnotes
 */

"use strict";

function showdownFootnotes() {
  return [
    {
      type: "lang",
      filter: (text, converter) =>
        text.replace(
          /^\[\^([\d\w]+)\]:\s*((\n+(\s{2,4}|\t).+)+)$/gm,
          (str, name, rawContent, _, padding) => {
            const content = converter.makeHtml(
              rawContent.replace(new RegExp(`^${padding}`, "gm"), "")
            );
            return `<div class="footnote" id="footnote-${name}"><a href="#footnote-${name}"><sup>[${name}]</sup></a>:${content}</div>`;
          }
        )
    },
    {
      type: "lang",
      filter: text =>
        text.replace(
          /^\[\^([\d\w]+)\]:( |\n)((.+\n)*.+)$/gm,
          (str, name, _, content) =>
            `<small class="footnote" id="footnote-${name}"><a href="#footnote-${name}"><sup>[${name}]</sup></a>: ${content}</small>`
        )
    },
    {
      type: "lang",
      filter: text =>
        text.replace(
          /\[\^([\d\w]+)\]/m,
          (str, name) => `<a href="#footnote-${name}"><sup>[${name}]</sup></a>`
        )
    }
  ];
}

export default showdownFootnotes;
