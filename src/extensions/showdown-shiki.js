/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown plantuml extension for markdown
 */
'use strict';

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

if (typeof Shiki === 'undefined') {
  var Shiki = window.Shiki || undefined;
}

function hasShiki() {
  Shiki = window.Shiki;
  return typeof Shiki !== 'undefined' && Shiki ? true : false;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasShiki();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      cdnjs.loadScript('Shiki', false, cdnjs.getCDN() === 'local' ? 'link' : 'import').then(name => {
        Shiki = utils.interopDefault(window[name]);
      }).catch(e => {
        console.error('load script error: ' + e);
      });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasShiki()) return;
  cdnjs.unloadScript('Shiki');
  Shiki = null;
  window.Shiki = null;
  dync = false;
}

let tools;
let refContainer = 0;
/** example html
<div class="select-items select-theme-items">
  <div class="options-item selected-item"  data-theme="GitHub Light" title="GitHub Light">
    <span class="select-item-content">GitHub Light</span>
  </div>
  ...
</div>
 */
function ceateThemes(doc) {

  function ceateThemeItem(root, theme, name) {
    const item = doc.createElement('div');
    item.classList.add('options-item');
    item.dataset.theme = theme;
    item.dataset.name = name;
    item.title = name;
    const content = doc.createElement('span');
    content.classList.add('select-item-content');
    content.textContent = name;
    item.appendChild(content);
    item.addEventListener('click', function (e) {
      const item = e.currentTarget;
      item.classList.add('selected-item');
      // remove other selected
      Array.from(root.children).forEach(function (child) {
        if (child !== item) {
          child.classList.remove('selected-item');
        }
      });
      // change theme
      if (tools) {
        tools.themeSelect.selector.dataset.theme = item.dataset.theme;
        tools.themeSelect.selector.title = item.dataset.name;
        tools.themeSelect.content.textContent = item.title;
        tools.currContainer.dataset.theme = item.dataset.theme;
        tools.currContainer.dataset.themeName = item.dataset.name;
        const langId = tools.currContainer.dataset.language;
        const themeId = tools.currContainer.dataset.theme;
        const codeblock = tools.currContainer.querySelector('pre code');
        if (codeblock) {
          const code = codeblock?.textContent;
          Shiki.codeToHtml(code, { lang: langId, theme: themeId }).then((output) => {
            codeblock.parentNode.outerHTML = output;
          });
        }
      }
      root.style = '';
    });
    return { option: item, content: content };
  }

  const options = doc.createElement('div');
  options.classList.add('select-items', 'select-theme-items');

  const items = [];
  Shiki.bundledThemesInfo.forEach((info) => {
    const item = ceateThemeItem(options, info.id, info.displayName);
    options.appendChild(item.option);
    items.push(item);
  });
  return { options, items };
}

function createCodeTools(doc) {
  if (tools) return;

  tools = {};
  tools.root = doc.createElement('div');
  tools.root.classList.add('codeblock-tools');
  tools.root.innerHTML = `<div class="start-nav">
  <div class="tools-select tools-select-lanuage">
    <div class="tools-select-selector">
      <span class="tools-select-selection-item"></span>
    </div>
  </div>
</div>
<div class="end-nav">
  <div class="tools-select tools-select-theme">
    <div class="tools-select-selector">
      <span class="tools-select-selection-item"></span>
    </div>
    <span class="tools-select-arrow" unselectable="on" aria-hidden="true">
      <div class="tools-icon" data-name="ArrowDown">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" fill-rule="evenodd"
          class="svg-icon svg-icon-arrow-down" width="1em" height="1em" style="width: 16px; height: 16px;">
          <path
            d="M57.297 102.865c3.834-3.834 10.007-3.904 13.927-.21l.215.21 48.99 48.99c3.834 3.834 10.007 3.904 13.927.209l.215-.21 48.99-48.99c3.905-3.904 10.237-3.904 14.142 0 3.834 3.835 3.904 10.008.21 13.928l-.21.215-48.99 48.99c-11.598 11.599-30.331 11.714-42.073.348l-.353-.348-48.99-48.99c-3.905-3.905-3.905-10.237 0-14.142Z">
          </path>
        </svg>
      </div>
    </span>
  </div>
</div>
<div class="tools-divider tools-divider-vertical"></div>
<div class="codeblock-tools-button tools-copy-button" title="Action Copy">
  <div class="tools-icon" data-name="ActionCopy">
    <svg width="1em" height="1em" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"
      class="svg-icon svg-icon-action-copy">
      <g fill="currentColor" fill-rule="nonzero">
        <path
          d="M198 28h-80c-16.569 0-30 13.431-30 30v80c0 16.569 13.431 30 30 30h80c16.569 0 30-13.431 30-30V58c0-16.569-13.431-30-30-30Zm-80 20h80c5.523 0 10 4.477 10 10v80c0 5.523-4.477 10-10 10h-80c-5.523 0-10-4.477-10-10V58c0-5.523 4.477-10 10-10Z">
        </path>
        <path
          d="M97.6 88v20H58c-5.43 0-9.848 4.327-9.996 9.72L48 118v80c0 5.43 4.327 9.848 9.72 9.996L58 208h80c5.43 0 9.848-4.327 9.996-9.72L148 198v-40.705h20V198c0 16.403-13.164 29.731-29.504 29.996L138 228H58c-16.403 0-29.731-13.164-29.996-29.504L28 198v-80c0-16.403 13.164-29.731 29.504-29.996L58 88h39.6Z">
        </path>
      </g>
    </svg>
  </div>
</div>`;

  const langSelect = tools.root.querySelector('.tools-select-lanuage')
  if (langSelect) {
    tools.langSelect = { select: langSelect };
    tools.langSelect.selector = langSelect.querySelector('.tools-select-selector');
    tools.langSelect.content = langSelect.querySelector('.tools-select-selection-item');
  }
  const themeSelect = tools.root.querySelector('.tools-select-theme');
  if (themeSelect) {
    tools.themeSelect = { select: themeSelect };
    tools.themeSelect.selector = themeSelect.querySelector('.tools-select-selector');
    tools.themeSelect.content = themeSelect.querySelector('.tools-select-selection-item');
    tools.themes = ceateThemes(doc);
    tools.root.appendChild(tools.themes.options);
    themeSelect.addEventListener('click', function () {
      if (!tools.currContainer) return;
      if (tools.themes) {
        let activeOption;
        tools.themes.items.forEach(function (item) {
          if (tools.currContainer.dataset.theme === item.option.dataset.theme) {
            activeOption = item.option;
            item.option.classList.add('selected-item');
          } else {
            item.option.classList.remove('selected-item');
          }
        });

        tools.themes.options.style.top = (tools.root.clientHeight - 1) + 'px';
        tools.themes.options.style.right = 0;
        tools.themes.options.classList.remove('hidden');
        if (activeOption) {
          activeOption.scrollIntoView({ container: "nearest" });
        }
      }
    });
  }
  const copyer = tools.root.querySelector('.tools-copy-button');
  if (copyer) {
    copyer.addEventListener('click', function () {
      if (!tools.currContainer) return;
      const codeblock = tools.currContainer.querySelector('pre code');
      const text = codeblock?.textContent;
      navigator.clipboard.writeText(text).then(function () {
        console.log('Copy success!');
      }, function (err) {
        console.error('Copy failed:', err);
      });
    });
  }
}

function onRenderShiki(resolve, element, options) {
  if (hasShiki()) {
    const code = element.textContent.trim();
    const language = element.classList[0];
    const doc = element.ownerDocument;
    const lang = utils.parseLangAttr(element.dataset.lang);
    createCodeTools(doc);
    const theme = (lang?.theme) ? lang.theme : options.theme;
    let themeName = theme;
    for (let i = 0; i < Shiki.bundledThemesInfo.length; i++) {
      if (Shiki.bundledThemesInfo[i].id === themeName) {
        themeName = Shiki.bundledThemesInfo[i].displayName
        break;
      }
    }
    let langName = language;
    for (let i = 0; i < Shiki.bundledLanguagesInfo.length; i++) {
      if (Shiki.bundledLanguagesInfo[i].id === langName) {
        langName = Shiki.bundledLanguagesInfo[i].name
        break;
      }
    }
    Shiki.codeToHtml(code, { lang: language, theme: theme }).then((output) => {
      const container = doc.createElement('div');
      container.classList.add('codeblock-container');
      container.dataset.theme = theme;
      container.dataset.themeName = themeName;
      container.dataset.language = language;
      container.dataset.langName = langName;
      container.innerHTML = output;
      element.parentNode.replaceWith(container);

      container.addEventListener('mouseenter', function (e) {
        refContainer++;
        if (tools) {
          const currContainer = e.target;
          tools.currContainer = currContainer;

          if (tools.timer) {
            clearTimeout(tools.timer);
            tools.timer = null;
          }
          tools.timer = setTimeout(() => {
            tools.langSelect.selector.dataset.language = currContainer.dataset.language;
            tools.langSelect.selector.dataset.title = currContainer.dataset.langName;
            tools.langSelect.content.textContent = currContainer.dataset.langName;

            tools.themeSelect.selector.dataset.theme = currContainer.dataset.theme;
            tools.themeSelect.selector.dataset.title = currContainer.dataset.themeName;
            tools.themeSelect.content.textContent = currContainer.dataset.themeName;

            const rect = currContainer.getBoundingClientRect();

            tools.themes.options.style = '';
            tools.themes.options.classList.add('hidden');
            tools.root.style.top = (rect.top + window.scrollY) + 'px';
            tools.root.style.width = '400px';
            tools.root.style.right = (document.body.offsetWidth - rect.right) + 'px';
            if (!tools.parent) {
              const showdowns = document.querySelector('.showdowns');
              if (showdowns) {
                tools.parent = showdowns.parentElement;
              } else {
                tools.parent = document.body;
              }
            }
            tools.parent.appendChild(tools.root);
            tools.timer = null;
          }, 1500);
        }
      });
      container.addEventListener('mouseleave', function (e) {
        refContainer--;
        if (tools.timer) {
          clearTimeout(tools.timer);
          tools.timer = null;
        }
        if (e.relatedTarget?.closest('.codeblock-tools') === tools.root) return;
        if (tools && tools.parent) {
          tools.themes.options.style = '';
          tools.themes.options.classList.add('hidden');
          tools.parent.removeChild(tools.root);
        }
      });
      resolve(true);
    }).catch((err) => {
      console.error('Shiki render failed:', err)
      resolve(false);
    })
    return;
  }

  setTimeout(() => {
    onRenderShiki(resolve, element, options);
  }, 100);
}

function renderShiki(element, options) {
  return new Promise(resolve => {
    onRenderShiki(resolve, element, options);
  });
}

function renderBlockElements(elements, config) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderShiki(element, config));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

const getConfig = (config = {}) => ({
  theme: 'ayu-dark',
  ...config
});

function showdownShiki(userConfig) {
  const config = getConfig(userConfig);

  return [
    {
      type: 'output',
      config: config,
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the language in code blocks
        const elements = wrapper.querySelectorAll('code[class*="language-"]');
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render shiki elements.`));
        return renderBlockElements(elements, this.config).then(() => {
          console.log(format(`End render shiki elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownShiki;
