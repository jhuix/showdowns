/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown page-tabs extension for markdown
 */
'use strict';

import showdown from 'showdown';
import i18n from './i18n';
import utils from './utils';

let hasTabs = false;

/**
<div class="page-navigation">
<div class="page-sidebar">
<div class="nav-title"><span>Nav Sidebar</span></div>
<div class="nav-container">
<ul class="nav-list">
<li class="nav-item">
<a href="../admonitions/" class="nav-link">
<span class="nav-ellipsis">Admonitions</span>
</a>
</li>
</ul>
</div>
</div>
<div class="page-content main-toc-row">
</div>
</div>
*/

export function showdownPageTabs() {
  return [
    {
      type: 'listener',
      listeners: {
        'blockGamut.before': (_, text, converter, options, globals) => {
          text = converter._dispatch('link-tabs.before', text, options, globals);
          text += '¨0';

          text = text.replace(/^--- ([\S\t ]*)\n((?:^(?:(?:    |\t)[^\r\n]*)*\n)*)((?:^--- (?:\[[^\r\n\[\]]+\]\([^\r\n\(\)]+\)|\[\[[^\r\n\[\]\|]+(?:\|[^\r\n\[\]\|]+)?\]\])(?:\n|\n$|\s(?![^\s]))*)+$)/gm,
            function (wholeMatch, title, desc, contents) {
              const matchs = contents.matchAll(/^--- (?:\[([^\r\n\[\]]+)\]\(([^\r\n\(\)]+)\)|\[\[([^\r\n\[\]\|]+)(?:\|([^\r\n\[\]\|]+))?\]\])(?:\n|\n$|\s(?![^\s]))*$/gm);
              if (matchs) {
                const tabs = Array.from(matchs);
                const links = [];
                tabs.forEach((tab) => {
                  let name = tab[1] || tab[3];
                  name = name.trim();
                  let id = '';
                  let classes = [];
                  const nameMatchs = name.match(/^(?:(?:#([-\w]+))?((?:\.[-\w]+)*)(?::([\S]+):)?)?[ \t]*([\S\t ]*)/);
                  if (nameMatchs) {
                    const names = Array.from(nameMatchs);
                    if (names) {
                      name = names[4] || '';
                      id = names[1] || '';
                      classes = names[2] ? names[2].split('.').filter((n) => { return n.trim(); }) : [];
                      // const type = names[3] || '';
                      if (id) {
                        id = `id="${id}" `;
                      }
                      name = `<span class="nav-ellipsis">${name}</span>`;
                    }
                  }
                  classes.unshift('nav-link');
                  let url = tab[2] || tab[4];
                  url = encodeURI(url.trim() || '#');
                  if (name && url) {
                    links.push(`<li class="nav-item"><a ${id}class="${classes.join(' ')}" href="${url}">${name}</a></li>`);
                  }
                });

                title = title.trim();
                if (title) {
                  title = showdown.subParser('spanGamut')(title, options, globals);
                  title = `<div class="nav-title">${title}</div>`;
                } else {
                  title = i18n.getLangString('nav-sidebar');
                }
                if (desc) {
                  const lines = desc.split('\n');
                  lines.forEach((line, idx) => {
                    if (line) {
                      const pos = line[0] === '\t' ? 1 : 4;
                      lines[idx] = line.substring(pos);
                    }
                  })
                  desc = showdown.subParser('githubCodeBlocks')(lines.join('\n'), options, globals);
                  desc = showdown.subParser('blockGamut')(desc, options, globals);
                  desc = `<div class="nav-desc">${desc}</div>`;
                } else {
                  desc = '';
                }

                const navLinks = `<div class="nav-container"><ul class="nav-list">${links.join('')}</ul></div>`;
                const code = `<div class="page-navigation"><div class="page-sidebar">${title}${navLinks}</div>${desc}<div class="page-content main-toc-row hidden"></div></div>`;
                hasTabs = true;
                return showdown.subParser('hashBlock')(code, options, globals);
              }
            }
          );

          // attacklab: strip sentinel
          text = text.replace(/¨0/, '');

          return converter._dispatch('link-tabs.after', text, options, globals);
        },
      },
    },
  ];
}

function observeraPageTabsClick() {
  document.addEventListener('click', function (event) {
    const target = event.target;
    const navLink = target.closest('a.nav-link');
    if (navLink) {
      event.stopImmediatePropagation();
      event.preventDefault();
      const navItem = target.closest('.nav-item');
      const pageSidebar = target.closest('.page-sidebar');
      const navPage = target.closest('.page-navigation');
      if (!navItem || !pageSidebar || !navPage) return;
      const navItems = pageSidebar.querySelectorAll('.nav-item');
      navItems.forEach((item) => {
        item.classList.remove('nav-item-active');
      });
      navItem.classList.add('nav-item-active');
      const navContent = navPage.querySelector('.page-content');
      if (!navContent || !window.showdowns) return;
      const nacDesc = navPage.querySelector('.nav-desc');
      if (nacDesc && !nacDesc.classList.contains('hidden')) {
        nacDesc.classList.add('hidden');
      }
      navContent.classList.remove('hidden');
      const showdowns = window.showdowns;
      window.fetch(navLink.href).then(response => {
        if (response.ok) {
          return response.text();
        }
      }).then(md => {
        navContent.replaceChildren();
        showdowns
          .makeHtml({ content: md, output: 'dom' })
          .then(res => {
            if (typeof res === 'string') {
              navContent.innerHTML = res;
            } else if (Array.isArray(res.html)) {
              res.html.forEach((e) => {
                navContent.appendChild(e);
              })
              showdowns.completedHtml(res.scripts, '.page-content>.showdowns');
            }
          }).catch(err => {
            navContent.innerText = err;
          });
      }).catch(error => {
        console.error('Failed to navigate to page:', error);
      });
    }
  });
}

export function showdownAsyncPageTabs() {
  return [
    {
      type: 'output',
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper || !hasTabs) {
          return false;
        }

        const script = {
          id: 'showdown-page-tabs',
          code: observeraPageTabsClick
        };
        obj.scripts.push(script);
        return obj;
      }
    }
  ];
}


export default showdownPageTabs;
