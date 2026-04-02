/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown page-tabs extension for markdown
 */
'use strict';

import showdown from 'showdown';
import i18n from './i18n';

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
                  desc = `<div class="page-desc">${desc}</div>`;
                } else {
                  desc = '';
                }

                const navLinks = `<div class="nav-container"><ul class="nav-list">${links.join('')}</ul></div>`;
                const id = converter.context.id ? `id="page-side${converter.context.id}" ` : '';
                const code = `<div class="page-navigation page-remote"><div ${id}class="page-sidebar">${title}${navLinks}</div><div class="page-doc">${desc}</div></div>`;
                converter.context.hasTabs = true;
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

function renderLocalPage(pageId, pageRender) {
  return () => {
    pageRender(`#page-side${pageId}`);
  };
}

function observeraPageTabsClick() {
  let currNavItem = null;
  document.addEventListener('click', function (event) {
    const target = event.target;
    const navLink = target.closest('a.nav-link');
    if (navLink) {
      const pageSidebar = target.closest('.page-sidebar');
      const navPage = target.closest('.page-navigation');
      if (!pageSidebar || !navPage) return;
      if (!navPage.classList.contains('page-remote')) {
        event.stopImmediatePropagation();
        event.preventDefault();

        const navItem = target.closest('.nav-item');
        if (navItem !== currNavItem) {
          if (currNavItem) {
            currNavItem.classList.remove('nav-item-active')
          }
          currNavItem = navItem;
          if (navItem) {
            navItem.classList.add('nav-item-active');
          }
        }
        const navContents = navPage.querySelectorAll('.page-content');
        navContents.forEach((page) => {
          if (page.id === `${navLink.id}-content`) {
            page.classList.remove('hidden');
          } else {
            page.classList.add('hidden');
          }
        })
        const navDesc = navPage.querySelector('.page-desc');
        if (navDesc) {
          if (navItem) {
            navDesc.classList.add('hidden');
          } else {
            navDesc.classList.remove('hidden');
          }
        }
        return;
      }

      const navItem = target.closest('.nav-item');
      if (!navItem) return;
      if (navItem !== currNavItem) {
        if (currNavItem) {
          currNavItem.classList.remove('nav-item-active')
        }
        currNavItem = navItem;
        navItem.classList.add('nav-item-active');
      }

      if (!window.showdowns) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      const navDesc = navPage.querySelector('.page-desc');
      let navContent = navPage.querySelector('.page-content');
      if (!navContent) {
        navContent = document.createElement('div');
        navContent.classList.add('page-content', 'hidden');
        navDesc.parentNode.appendChild(navContent);
      }
      const showdowns = window.showdowns;
      const genHtml = (md) => {
        showdowns
          .makeHtml({ content: md, output: 'dom', exclusive: true })
          .then(res => {
            if (typeof res === 'string') {
              navContent.innerHTML = res;
            } else if (Array.isArray(res.html)) {
              navContent.replaceChildren();
              res.html.forEach((e) => {
                navContent.appendChild(e);
              })
              showdowns.completedHtml(res.scripts, '.page-content>.showdowns');
            }
            if (!navContent.classList.contains('main-toc-row')) {
              navContent.classList.add('main-toc-row');
            }
            if (navDesc && !navDesc.classList.contains('hidden')) {
              navDesc.classList.add('hidden');
            }
            navContent.classList.remove('hidden');
          }).catch(err => {
            navContent.innerText = err;
          });
      };

      window.fetch(navLink.href).then(response => {
        if (response.ok) {
          return response.text();
        }
      }).then(md => {
        genHtml(md);
      }).catch(error => {
        console.error('Failed to navigate to page:', error);
      });
    }
  });
}

const getOptions = (config = {}) => ({
  pageRender: null,
  ...config
});

export function showdownAsyncPageTabs(options) {
  const config = getOptions(options);

  return [
    {
      type: 'output',
      config: config,
      filter: function (obj) {
        const wrapper = obj.wrapper;
        const converter = obj.globals.converter;
        if (!wrapper || !converter.context.hasTabs) {
          return false;
        }

        const pageRender = converter.context.pageRender || this.config.pageRender;
        if (pageRender) {
          obj.scripts.push({
            id: `showdowns-get-page${converter.context.id}`,
            code: renderLocalPage(converter.context.id, pageRender),
            once: true
          })
        }
        obj.scripts.push({
          id: 'showdowns-page-tabs',
          code: observeraPageTabsClick
        });
        converter.context.hasTabs = false;
        return obj;
      }
    }
  ];
}


export default showdownPageTabs;
