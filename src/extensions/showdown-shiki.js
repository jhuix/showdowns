/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown shiki extension for markdown
 * Reference: https://shiki.style
 */
'use strict';

import format from './log';
import cdnjs from './cdn';
import utils from './utils';
import i18n from './i18n';

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
      cdnjs.loadScript('Shiki').then(name => {
        Shiki = utils.interopDefault(window[name]);
      }).catch((e) => {
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
    let themes;
    /** example theme options
    <div class="select-items select-theme-items">
      <div class="options-item selected-item"  data-theme="GitHub Light" title="GitHub Light">
        <span class="select-item-content">GitHub Light</span>
      </div>
      ...
    </div>
     */
    function getThemes(doc) {
      if (themes) return themes;

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
          if (themes && themes.container) {
            const container = themes.container;
            const themer = themes.themer;
            const tools = themes.tools;
            container.dataset.theme = item.dataset.theme;
            container.dataset.themeName = item.dataset.name;
            if (themer) {
              const themePrefix = i18n.getLangString('code-theme-prefix');
              themer.dataset.title = themePrefix + item.dataset.name;
            }
            const langId = container.dataset.language;
            const themeId = item.dataset.theme;
            const codeblock = container.querySelector('pre code');
            if (codeblock) {
              const code = codeblock?.textContent;
              window.Shiki.codeToHtml(code, { lang: langId, theme: themeId }).then((output) => {
                codeblock.parentNode.outerHTML = output;
              });
            }
            if (tools) {
              tools.classList.remove('show-theme-options');
            }
            themes.container = null;
            themes.themer = null;
            themes.tools = null;
          }
          root.style = '';
          root.remove();
          e.stopPropagation();
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
      const langs = []
      window.Shiki.bundledLanguagesInfo.forEach((info) => {
        langs.push(info.id);
        if (info.aliases) {
          info.aliases.forEach((alias) => {
            langs.push(alias);
          })
        }
      });
      themes = { options, items, langs };
      return themes;
    }

    function showMessageNotice(message, text) {
      if (message.content) {
        message.content.textContent = text;
      }
      if (message.root) {
        message.root.classList.remove('hidden');
      }
      if (message.timer) {
        clearTimeout(message.timer);
        message.timer = null;
      }
      message.timer = setTimeout(() => {
        if (message.content) {
          message.content.textContent = '';
        }
        if (message.root) {
          message.root.classList.add('hidden');
        }
        message.timer = null;
        message.content = null;
        message.root = null;
      }, 5000);
    }

    const containers = document.querySelectorAll('.codeblock-container');
    if (!containers?.length) return;

    getThemes(document);
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      const tools = container.querySelector('.codeblock-tools');
      const copyer = container.querySelector('.tools-button-copy');
      if (copyer) {
        copyer.addEventListener('click', function () {
          const codeblock = container.querySelector('pre code');
          const message = {
            root: container.querySelector('.tools-message'),
            content: container.querySelector('.tools-message-content')
          };
          const text = codeblock?.textContent;
          navigator.clipboard.writeText(text).then(function () {
            showMessageNotice(message, i18n.getLangString('msg-copy-success'));
          }, function (err) {
            showMessageNotice(message, i18n.getLangString('msg-copy-failed'));
          });
        });
      }
      const themer = container.querySelector('.tools-button-theme');
      if (themer) {
        themer.addEventListener('click', function (ev) {
          if (themes) {
            if (themes.container && themes.options) {
              themes.options.remove();
            }
            themes.container = container;
            themes.themer = themer;
            themes.tools = tools;
            if (themes.tools) {
              themes.tools.classList.add('show-theme-options');
            }
            let activeOption;
            themes.items.forEach(function (item) {
              if (container.dataset.theme === item.option.dataset.theme) {
                activeOption = item.option;
                item.option.classList.add('selected-item');
              } else {
                item.option.classList.remove('selected-item');
              }
            });
            const currBound = themer.getBoundingClientRect();
            const parentBound = themes.container.getBoundingClientRect();
            themes.options.style.top = (currBound.bottom - parentBound.top - 1) + 'px';
            themes.options.style.right = 0;
            themes.container.appendChild(themes.options);
            themes.options.classList.remove('hidden');
            if (activeOption) {
              activeOption.scrollIntoView({ container: "nearest" });
            }
            ev.stopPropagation();
          }
        });
      }
    }

    document.addEventListener('click', function () {
      if (themes?.options?.parentNode) {
        themes.options.style = '';
        themes.options.remove();
        if (themes.tools) {
          themes.tools.classList.remove('show-theme-options');
        }
        themes.container = null;
        themes.themer = null;
        themes.tools = null;
      }
    }, false);
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

function createCodeTools(doc, language, theme) {
  const copyTitle = i18n.getLangString('code-copy');
  const themePrefix = i18n.getLangString('code-theme-prefix');
  const langPrefix = i18n.getLangString('code-lang-prefix');
  const tools = doc.createElement('div');
  tools.classList.add('codeblock-tools', 'toolbar-hover');
  tools.innerHTML = `<div class="tools-message hidden">
      <div class="tools-icon tools-message-icon">
        <svg xmlns="http://www.w3.org/2000/svg">
          <use xlink:href="#svg-icon-info"/>
        </svg>
      </div>
      <span class="tools-message-content"></span>
  </div>
  <div class="tools-icon tools-button-lang" rel="tooltip" data-title="${langPrefix}${language}">
    <svg xmlns="http://www.w3.org/2000/svg">
      <use xlink:href="#svg-icon-language"/>
    </svg>
  </div>
  <div class="tools-icon tools-button-theme" rel="tooltip" data-title="${themePrefix}${theme}">
    <svg xmlns="http://www.w3.org/2000/svg">
      <use xlink:href="#svg-icon-theme"/>
    </svg>
  </div>
  <div class="tools-icon tools-button-copy" rel="tooltip" data-title="${copyTitle}">
    <svg xmlns="http://www.w3.org/2000/svg">
      <use xlink:href="#svg-icon-copy"/>
    </svg>
  </div>`;
  return tools;
}

let tempDiv
function getTempDiv(doc) {
  if (tempDiv) return tempDiv;

  tempDiv = doc.createElement('div');
  return tempDiv;
}

function onRenderShiki(resolve, element, options) {
  if (hasShiki()) {
    // https://shiki.style/languages
    const language = element.classList[0];
    let langName = '';
    for (let i = 0; i < Shiki.bundledLanguagesInfo.length; i++) {
      const info = Shiki.bundledLanguagesInfo[i];
      if (info.id === language) {
        langName = info.name
        break;
      }

      if (info.aliases && info.aliases.includes(language)) {
        langName = info.name
        break;
      }
    }
    if (!langName) {
      console.warn('language be not exist in shiki: ', language)
      resolve(false);
      return;
    }

    const code = element.textContent.trim();
    const doc = element.ownerDocument;
    const lang = utils.parseAttribute(element.dataset.lang);
    const theme = (lang?.theme) ? lang.theme : (language === 'markdown' || language === 'md') ? options.markdownTheme : options.theme;
    let themeName = theme;
    for (let i = 0; i < Shiki.bundledThemesInfo.length; i++) {
      if (Shiki.bundledThemesInfo[i].id === themeName) {
        themeName = Shiki.bundledThemesInfo[i].displayName
        break;
      }
    }
    Shiki.codeToHtml(code, { lang: language, theme: theme }).then((output) => {
      let container = element.closest('.codeblock-container');
      const tools = createCodeTools(doc, langName, themeName);
      if (!container) {
        container = doc.createElement('div');
        container.dataset.theme = theme;
        container.dataset.themeName = themeName;
        container.dataset.language = language;
        container.dataset.langName = langName;
        container.appendChild(tools);
        const temp = getTempDiv(doc);
        temp.innerHTML = output;
        const codeblock = temp.children[0];
        codeblock.remove();
        container.appendChild(codeblock);
        element.parentNode.replaceWith(container);
        return resolve(true);
      }
      container.dataset.theme = theme;
      container.dataset.themeName = themeName;
      container.dataset.language = language;
      container.dataset.langName = langName;
      const parent = element.parentNode;
      parent.remove();
      container.appendChild(tools);
      container.appendChild(parent);
      parent.outerHTML = output;
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
  markdownTheme: 'catppuccin-latte',
  ...config
});

const svgSymbols = [
  '<symbol id="svg-icon-info" viewBox="64 64 896 896" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path></symbol>',
  '<symbol id="svg-icon-language" viewBox="0 0 1024 1024" fill="currentColor"><path d="M512 1024C229.248 1024 0 794.752 0 512S229.248 0 512 0s512 229.248 512 512-229.248 512-512 512z m0-938.666667C276.352 85.333333 85.333333 276.352 85.333333 512s191.018667 426.666667 426.666667 426.666667 426.666667-191.018667 426.666667-426.666667A426.666667 426.666667 0 0 0 512 85.333333z m0 682.666667a42.666667 42.666667 0 0 1-42.368-42.666667v-255.573333a42.368 42.368 0 1 1 84.693333 0V725.333333A42.410667 42.410667 0 0 1 512 768z m0-426.666667a42.325333 42.325333 0 1 1-0.085333-84.650666A42.325333 42.325333 0 0 1 512 341.333333z m42.325333-42.666666v0z"></path></symbol>',
  '<symbol id="svg-icon-theme" viewBox="0 0 1024 1024" fill="currentColor"><path d="M42.666667 512C42.666667 251.733333 251.733333 42.666667 512 42.666667s469.333333 187.733333 469.333333 422.4c0 72.533333-29.866667 145.066667-81.066666 200.533333-51.2 51.2-123.733333 81.066667-200.533334 81.066667h-85.333333c-12.8 0-25.6 12.8-29.866667 25.6 0 8.533333 4.266667 17.066667 8.533334 21.333333 21.333333 21.333333 29.866667 46.933333 29.866666 76.8 0 64-51.2 110.933333-115.2 115.2C251.733333 981.333333 42.666667 772.266667 42.666667 512z m85.333333 0c0 213.333333 170.666667 384 384 384 17.066667 0 29.866667-12.8 29.866667-29.866667 0-4.266667 0-8.533333-4.266667-12.8l-4.266667-4.266666c-17.066667-21.333333-25.6-46.933333-29.866666-76.8 0-64 51.2-110.933333 115.2-110.933334h85.333333c51.2 0 102.4-21.333333 136.533333-55.466666 38.4-38.4 55.466667-85.333333 55.466667-136.533334 0-187.733333-170.666667-341.333333-384-341.333333s-384 170.666667-384 384z m593.066667 21.333333c-21.333333-21.333333-25.6-51.2-17.066667-76.8 12.8-25.6 38.4-42.666667 64-42.666666 38.4 0 68.266667 34.133333 72.533333 72.533333 0 29.866667-17.066667 55.466667-42.666666 64-8.533333 4.266667-17.066667 4.266667-25.6 4.266667-17.066667 0-38.4-8.533333-51.2-21.333334z m-520.533334 0c-21.333333-21.333333-25.6-51.2-17.066666-76.8 12.8-25.6 38.4-42.666667 64-42.666666 38.4 0 68.266667 34.133333 72.533333 72.533333 0 29.866667-17.066667 55.466667-42.666667 64-8.533333 4.266667-17.066667 4.266667-25.6 4.266667-21.333333 0-38.4-8.533333-51.2-21.333334z m379.733334-187.733333c-21.333333-21.333333-25.6-51.2-17.066667-76.8 12.8-25.6 38.4-42.666667 64-42.666667 38.4 0 68.266667 34.133333 72.533333 72.533334 0 29.866667-17.066667 55.466667-42.666666 64-8.533333 4.266667-17.066667 4.266667-25.6 4.266666-21.333333 0-38.4-8.533333-51.2-21.333333zM341.333333 345.6c-17.066667-21.333333-25.6-51.2-12.8-76.8 12.8-25.6 38.4-42.666667 64-42.666667 38.4 0 68.266667 34.133333 72.533334 72.533334 0 29.866667-17.066667 55.466667-42.666667 64l-29.866667 4.266666c-17.066667 0-34.133333-8.533333-51.2-21.333333z"></path></symbol>',
  '<symbol id="svg-icon-copy" viewBox="0 0 16 16" fill="currentColor"><path d="M7 5h2a3 3 0 0 0 3-3 2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2 3 3 0 0 0 3 3zM6 2a2 2 0 1 1 4 0 1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"></path></symbol>'
];

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
        obj.symbols.push(...svgSymbols);
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
