/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown footnotes extension for markdown
 */
'use strict';

import showdown from "showdown";

/**
  <div class="footnotes">
    <hr>
      <div class="footnote" id="footnote-1">
        <a class="footnote" href="#footnote-ref-1" title="Jump back to footnote 1 in the text"><sup>[1]</sup></a>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.&nbsp;</p>
      </div>
      <div class="footnote" id="footnote-2">
        <a class="footnote" href="#footnote-ref-2" title="Jump back to footnote 2 in the text"><sup>[2]</sup></a>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod nulla. Curabitur feugiat, tortor
          non consequat finibus, justo purus auctor massa, nec semper lorem quam in massa.&nbsp;</p>
      </div>
  </div>
 */

let footnotes = [];

export function showdownFootnotes() {
  return [
    {
      type: 'listener',
      listeners: {
        'blockGamut.before': (_, text, converter, options, globals) => {
          text = converter._dispatch('footnotes.before', text, options, globals);

          text = text.replace(/^\[\^([\d\w]+)\]:[ \t]([^\r\n]+)$|^\[\^([\d\w]+)\]:\s*\n((?:\n*(?:\s{2,4}|\t).+)+)$/gm, function (str, name, content, multiName, multiContent) {
            if (name) {
              content = showdown.subParser('spanGamut')(content, options, globals);
              content = `<div class="footnote single" id="footnote-${name}"><p><a href="#footnote-ref-${name}" title="Jump back to footnote ${name} in the text"><sup>[${name}]</sup></a>: ${content}</p></div>`;
              footnotes.push(content);
              return '';
            }

            name = multiName;
            content = multiContent;
            content = content.replace(new RegExp(`^\s{2,4}|\t`, 'gm'), '');
            content = `<a href="#footnote-ref-${name}" title="Jump back to footnote ${name} in the text"><sup>[${name}]</sup></a>: ${content}`;
            content = showdown.subParser('blockGamut')(content, options, globals);
            content = showdown.subParser('unhashHTMLSpans')(content, options, globals);
            content = showdown.subParser('unescapeSpecialChars')(content, options, globals);
            content = `<div class="footnote" id="footnote-${name}">${content}</div>`;
            footnotes.push(content);
            return '';
          });

          return converter._dispatch('footnotes.after', text, options, globals);
        }
      }
    },
    // {
    //   type: 'lang',
    //   filter: (text, converter) =>
    //     text.replace(/^\[\^([\d\w]+)\]:\s*((\n+(\s{2,4}|\t).+)+)$/gm, (str, name, rawContent, _, padding) => {
    //       const content = converter.makeHtml(rawContent.replace(new RegExp(`^${padding}`, 'gm'), ''));
    //       return `<div class="footnote" id="footnote-${name}"><a href="#footnote-ref-${name}"><sup>[${name}]</sup></a>:${content}</div>`;
    //     })
    // },
    // {
    //   type: 'lang',
    //   filter: text =>
    //     text.replace(
    //       /^\[\^([\d\w]+)\]:( |\n)((.+\n)*.+)$/gm,
    //       (str, name, _, content) =>
    //         `<div class="footnote single" id="footnote-${name}"><a href="#footnote-ref-${name}"><sup>[${name}]</sup></a>: ${content}</div>`
    //     )
    // },
    {
      type: 'lang',
      filter: text =>
        text.replace(/([^\\])\[\^([\d\w]+)\](?!:)/gm, (str, preContent, name) => `${preContent}<a id="footnote-ref-${name}" href="#footnote-${name}"><sup>[${name}]</sup></a>`)
    },
    {
      type: 'lang',
      filter: text =>
        text.replace(/\\\[\^([\d\w]+)\]/gm, (str, name) => `[^${name}]`)
    }
  ];
}

export function showdownAyncFootnotes() {
  return [
    {
      type: 'output',
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper || !footnotes.length) {
          return false;
        }

        const footnotesContainer = `<div class="footnotes"><hr>${footnotes.join('')}</div>`;
        footnotes = [];
        obj.inners.push(footnotesContainer);
        return obj;
      }
    }
  ];
}

export default showdownFootnotes;
