/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown content-tabs extension for markdown
 * https://squidfunk.github.io/mkdocs-material/reference/content-tabs
 */
'use strict';

import showdown from 'showdown';
import utils from './utils';

let hasTabs = false;

export function showdownContentTabs() {
  return [
    {
      type: 'listener',
      listeners: {
        'blockGamut.before': (_, text, converter, options, globals) => {
          text = converter._dispatch('content-tabs.before', text, options, globals);
          text += '¨0';

          // Support content-tabs of mkdocs-material https://squidfunk.github.io/mkdocs-material/reference/content-tabs
          text = text.replace(/^=== (?:(?:[^"\f\v\r\n\{\}\[\]]+[ \t]*)*)"(?:[^"\r\n]+)"[ \t]*(?:(?:\n(?:    |\t)[^\r\n]*$|\n=== (?:(?:[^"\f\v\r\n\{\}\[\]]+[ \t]*)*)"(?:[^"\r\n]+)"[ \t]*$|\n$|\n(?![^ \t\r\n]))*)/gm,
            function (wholeMatch) {
              const wholeMatchs = wholeMatch.matchAll(/^=== ((?:[^"\f\v\r\n\{\}\[\]]+[ \t]*)*)"([^"\r\n]+)"[ \t]*((?:\n(?:    |\t)[^\r\n]*$|\n$|\n(?![^ \t\r\n]))*)/gm);
              if (wholeMatchs) {
                const matchs = Array.from(wholeMatchs);
                const inputs = [], labels = [], contents = [];
                const hash = utils.hashString(wholeMatch).toString(16);
                matchs.forEach((match, index) => {
                  let id = `content_tab_${utils.hashString(match[0]).toString(16)}`;
                  let name = match[1] || '';
                  name = name.trim().toLowerCase();
                  if (name) {
                    name = `class="${name}" `;
                  }
                  inputs.push(`<input ${index === 0 ? 'checked="checked" ' : ''}id="${id}" name="__tabbed_${hash}_${matchs.length}" type="radio"/>`);
                  labels.push(`<label ${name}for="${id}">${match[2]}</label>`);
                  let content = match[3];
                  if (content) {
                    const lines = content.split('\n');
                    lines.forEach((line, idx) => {
                      if (line) {
                        const pos = line[0] === '\t' ? 1 : 4;
                        lines[idx] = line.substring(pos);
                      }
                    })
                    content = showdown.subParser('githubCodeBlocks')(lines.join('\n'), options, globals);
                    content = showdown.subParser('blockGamut')(content, options, globals);
                  } else {
                    content = '';
                  }
                  contents.push(`<div class="tabbed-block">${content}</div>`);
                });

                const tabbedInputs = inputs.join('');
                const tabbedLabels = `<div class="tabbed-labels">${labels.join('')}</div>`;
                const tabbedContent = `<div class="tabbed-content">${contents.join('')}</div>`;
                const code = `<div class="tabbed-set">${tabbedInputs}${tabbedLabels}${tabbedContent}</div>`;
                hasTabs = true;
                return showdown.subParser('hashBlock')(code, options, globals);
              }
            }
          );

          // attacklab: strip sentinel
          text = text.replace(/¨0/, '');

          return converter._dispatch('content-tabs.after', text, options, globals);
        },
      },
    },
  ];
}

function observerTabsClick() {
  document.addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName === 'LABEL') {
      const tabbedSet = target.closest('.tabbed-set');
      if (tabbedSet) {
        const indicatorX = target.offsetLeft;
        const indicatorWidth = target.offsetWidth;
        tabbedSet.style.setProperty('--md-indicator-x', `${indicatorX}px`);
        tabbedSet.style.setProperty('--md-indicator-width', `${indicatorWidth}px`);
      }
    }
  });

  document.querySelectorAll('.tabbed-set').forEach(tabbedSet => {
    const checkedInput = tabbedSet.querySelector('input[type="radio"]:checked');
    if (checkedInput) {
      const label = tabbedSet.querySelector(`label[for="${checkedInput.id}"]`);
      if (label) {
        const indicatorX = label.offsetLeft;
        const indicatorWidth = label.offsetWidth;
        tabbedSet.style.setProperty('--md-indicator-x', `${indicatorX}px`);
        tabbedSet.style.setProperty('--md-indicator-width', `${indicatorWidth}px`);
      }
    }
  });
}

export function showdownAsyncContentTabs() {
  return [
    {
      type: 'output',
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper || !hasTabs) {
          return false;
        }

        const script = {
          id: 'showdown-content-tabs',
          code: observerTabsClick
        };
        obj.scripts.push(script);
        return obj;
      }
    }
  ];
}


export default showdownContentTabs;
