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

function loadCodeTools() {
  function load() {
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
              window.Shiki.codeToHtml(code, { lang: langId, theme: themeId }).then((output) => {
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
      window.Shiki.bundledThemesInfo.forEach((info) => {
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
  <div class="tools-message hidden">
    <div class="tools-message-notice">
    <span role="img" class="tools-message-icon">
      <svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path
          d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z">
        </path>
      </svg>
    </span>
    <span class="tools-message-content"></span>
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
      const message = tools.root.querySelector('.tools-message');
      if (message) {
        tools.message = { select: message };
        tools.message.notice = message.querySelector('.tools-message-notice');
        tools.message.content = message.querySelector('.tools-message-content');
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
            if (tools.message) {
              tools.message.content.textContent = '复制成功';
              tools.message.select.classList.remove('hidden');
              tools.message.notice.classList.add('show');
              if (tools.message.timer){
                clearTimeout(tools.message.timer);
                tools.message.timer = null;
              }
              tools.message.timer = setTimeout(()=>{
                tools.message.notice.classList.remove('show');
                tools.message.select.classList.add('hidden');
                tools.message.content.textContent = '';
                tools.message.timer = null;
              }, 5000)
            }
            console.log('Copy success!');
          }, function (err) {
            console.error('Copy failed:', err);
          });
        });
      }
    }


    createCodeTools(document);
    const containers = document.querySelectorAll('.codeblock-container');
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      container.addEventListener('mouseenter', function (e) {
        refContainer++;
        if (tools) {
          const currContainer = e.target;
          if (currContainer === tools.currContainer) return;

          tools.currContainer = currContainer;
          // clear tools timer
          if (tools.timer) {
            clearTimeout(tools.timer);
            tools.timer = null;
          }
          tools.timer = setTimeout(() => {
            // clean message
            if (tools.message.timer){
                clearTimeout(tools.message.timer);
                tools.message.timer = null;
            }
            tools.message.notice.classList.remove('show');
            tools.message.select.classList.add('hidden');
            tools.message.content.textContent = '';

            // set language and name
            tools.langSelect.selector.dataset.language = currContainer.dataset.language;
            tools.langSelect.selector.dataset.title = currContainer.dataset.langName;
            tools.langSelect.content.textContent = currContainer.dataset.langName;

            // set theme and name
            tools.themeSelect.selector.dataset.theme = currContainer.dataset.theme;
            tools.themeSelect.selector.dataset.title = currContainer.dataset.themeName;
            tools.themeSelect.content.textContent = currContainer.dataset.themeName;

            // set tools position
            const rect = currContainer.getBoundingClientRect();
            tools.themes.options.style = '';
            tools.themes.options.classList.add('hidden');
            tools.root.style.top = (rect.top + window.scrollY) + 'px';
            tools.root.style.width = '500px';
            tools.root.style.right = (document.body.offsetWidth - rect.right) + 'px';
            if (!tools.parent) {
              const showdowns = document.querySelector('.showdowns');
              if (showdowns) {
                tools.parent = showdowns.parentElement;
              } else {
                tools.parent = document.body;
              }
            }
            // set tools to parent
            if (!tools.parent.contains(tools.root)) {
              tools.parent.appendChild(tools.root);
            }
            tools.timer = null;
          }, 1500);
        }
      });
      container.addEventListener('mouseleave', function (e) {
        refContainer--;
        // clear tools timer
        if (tools.timer) {
          clearTimeout(tools.timer);
          tools.timer = null;
        }
        if (e.relatedTarget?.closest('.codeblock-tools') === tools.root) return;
        if (tools && tools.parent && tools.parent.contains(tools.root)) {
          // hidden theme options
          tools.themes.options.style = '';
          tools.themes.options.classList.add('hidden');
          // remove tools from parent
          tools.parent.removeChild(tools.root);
          // clean message
          if (tools.message.timer){
              clearTimeout(tools.message.timer);
              tools.message.timer = null;
          }
          tools.message.notice.classList.remove('show');
          tools.message.select.classList.add('hidden');
          tools.message.content.textContent = '';
          tools.currContainer = null;
        }
      });
    }
  }

  if (!window || !('Shiki' in window)) {
    import('https://esm.sh/shiki@3.21.0').then((shiki) => {
      if ('default' in shiki && shiki['default']) {
        window['Shiki'] = shiki['default']
      } else {
        window['Shiki'] = shiki;
      }
      load();
    })
    console.log('dyncload remote shiki')
    return;
  }

  load();
}

function onRenderShiki(resolve, element, options) {
  if (hasShiki()) {
    const code = element.textContent.trim();
    const language = element.classList[0];
    const doc = element.ownerDocument;
    const lang = utils.parseLangAttr(element.dataset.lang);
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

        const script = {
          id: 'shiki-ext',
          code: loadCodeTools,
          module: true,
        };
        obj.scripts.push(script);
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
