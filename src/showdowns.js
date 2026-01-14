/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
'use strict';

import './less/preview.less';
import './less/container.less';
import './less/codetools.less';
import './less/toc.less';

import showdown from './parser/showdown.js';
import showdownAbc from './extensions/showdown-abc.js';
import showdownToc from './extensions/showdown-toc.js';
import showdownCss from './extensions/showdown-css.js';
import showdownViz from './extensions/showdown-viz.js';
import showdownTex from './extensions/showdown-tex.js';
import showdownVega from './extensions/showdown-vega.js';
import showdownAlign from './extensions/showdown-align.js';
import showdownKatex from './extensions/showdown-katex.js';
import showdownKroki from './extensions/showdown-kroki.js';
import showdownShiki from './extensions/showdown-shiki.js';
import showdownMathJax from './extensions/showdown-mathjax.js';
import showdownEcharts from './extensions/showdown-echarts.js';
import showdownMermaid from './extensions/showdown-mermaid.js';
import showdownPlantuml from './extensions/showdown-plantuml.js';
import showdownRailroad from './extensions/showdown-railroad.js';
import showdownSequence from './extensions/showdown-sequence.js';
import showdownWavedrom from './extensions/showdown-wavedrom.js';
import showdownFootnotes from './extensions/showdown-footnotes.js';
import showdownContainer from './extensions/showdown-container.js';
import showdownFlowchart from './extensions/showdown-flowchart.js';

import * as zlibcodec from './utils/zlib-codec.js';
import cdnjs from './extensions/cdn';
import format from './extensions/log';
import { deepMerge } from './extensions/utils.js';

//////////////////////////////////////////////////////////////////////
const getOptions = (options = {}) => {
  return {
    flavor: 'github',
    mathEngine: 'mathjax',
    ...options,
  };
};

const getExtension = (name, def) => {
  let obj = null;
  try {
    obj = showdown.extension(name);
  } catch {
    console.log(`Warning: not found ${name} extension.`);
  }
  return obj ? obj : def;
};

const getAsyncExtension = (name, def) => {
  let obj = null;
  try {
    obj = showdown.asyncExtension(name);
  } catch {
    console.log(`Warning: not found ${name} async extension.`);
  }
  return obj ? obj : def;
};

const getAsyncExtensions = (options, extensions = {}) => {
  const mermaidOptions = options ? options.mermaid || {} : {};
  const plantumlOptions = options ? options.plantuml || {} : {};
  const mathjaxOptions = options ? options.mathjax || {} : {};
  const texOptions = options ? options.tex || {} : {};
  const katexOptions = options ? options.katex || {} : {};
  const krokiOptions = options ? options.kroki || {} : {};
  const vegaOptions = options ? options.vega || {} : {};
  const shikiOptions = options ? options.shiki || {} : {};

  const asyncExtensions = {
    'showdown-toc': getExtension('showdown-toc', showdownToc),
    'showdown-plantuml': showdownPlantuml(plantumlOptions),
    'showdown-mermaid': showdownMermaid(mermaidOptions),
    'showdown-mathjax': showdownMathJax(mathjaxOptions),
    'showdown-tex': showdownTex(texOptions),
    'showdown-katex': showdownKatex(katexOptions),
    'showdown-kroki': showdownKroki(krokiOptions),
    'showdown-flowchart': showdownFlowchart(),
    'showdown-viz': showdownViz(),
    'showdown-vega': showdownVega(vegaOptions),
    'showdown-wavedrom': showdownWavedrom(),
    'showdown-railroad': showdownRailroad(),
    'showdown-abc': showdownAbc(),
    'showdown-echarts': showdownEcharts(),
    'showdown-sequence': getExtension('showdown-sequence', showdownSequence),
    ...extensions,
    'showdown-shiki': showdownShiki(shikiOptions),
    'showdow-css': showdownCss(),
  };

  let extnames = [];
  for (let prop in asyncExtensions) {
    if (asyncExtensions.hasOwnProperty(prop)) {
      showdown.asyncExtension(prop, asyncExtensions[prop]);
      extnames.push(prop);
    }
  }
  return extnames;
};

const getExtensions = (options, extensions = {}) => {
  const nativeExtensions = {
    'showdown-toc': showdownToc(options.toc),
    'showdown-align': showdownAlign(),
    'showdown-footnotes': showdownFootnotes(),
    'showdown-container': showdownContainer(),
    'showdown-sequence': showdownSequence(),
    ...extensions,
  };

  let extnames = [];
  for (let prop in nativeExtensions) {
    if (nativeExtensions.hasOwnProperty(prop)) {
      showdown.extension(prop, nativeExtensions[prop]);
      extnames.push(prop);
    }
  }
  return extnames;
};

const loadScript = (id, code, parent) => {
  if (!id || !code || typeof document === 'undefined') {
    return false;
  }

  let element = document.getElementById(id);
  if (!element) {
    if (!parent) {
      parent = document.body;
    } else if (typeof parent === 'string') {
      parent = document.querySelector(parent);
    }
    element = parent;
  }
  const tag = element.tagName;
  const scriptID = `script-${id}`;
  let script = document.querySelector(`${tag} > #${scriptID}`);
  if (script) {
    return true;
  }

  script = document.createElement('script');
  script.id = scriptID;
  script.type = 'text/javascript';
  script.text = code;
  element.appendChild(script);
  return true;
};

const insertScript = (id, code, parent) => {
  if (!id || !code || typeof document === 'undefined') {
    return false;
  }

  let element = document.getElementById(id);
  if (!element) {
    if (!parent) {
      parent = document.body;
    } else if (typeof parent === 'string') {
      parent = document.querySelector(parent);
    }
    element = parent;
  }
  const tag = element.tagName;
  const scriptID = `script-${id}`;
  let script = document.querySelector(`${tag} > #${scriptID}`);
  if (script) {
    return true;
  }

  script = document.createElement('script');
  script.id = scriptID;
  script.type = 'text/javascript';
  script.text = code;
  element.insertBefore(script, element.children[0]);
  return true;
};

function appendScript(name, src) {
  return new Promise((resovle, reject) => {
    if (!name || !src || typeof document === 'undefined') {
      reject('Args is invaild!');
    }

    const id = 'script-' + name.toLowerCase();
    let script = document.getElementById(id);
    if (script) {
      return resovle(name);
    }

    const head = document.head || document.getElementsByTagName('head')[0];
    script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.onload = () => {
      resovle(name);
    };
    head.appendChild(script);
  });
}

function addCssLink(obj, link, id) {
  if (!obj.cssLinks) {
    obj.cssLinks = [];
  } else {
    if (!Array.isArray(obj.cssLinks)) {
      obj.cssLinks = [obj.cssLinks];
    }
  }
  obj.cssLinks.push({
    id: id,
    link: link,
  });
  return obj;
}

const opScript = function (script, root, promise) {
  let host = root;
  if (script.host && typeof script.host === 'string') {
    host = document.querySelector(script.host);
  }
  if (!script.inner) {
    if (!script.code) {
      return false;
    }

    if (typeof script.code === 'function') {
      const method = script.code;
      if (promise) {
        promise.then(() => {
          method();
        });
        return true;
      }

      method();
      return true;
    }

    if (promise) {
      promise.then(() => {
        loadScript(script.id, script.code, host);
      });
      return true;
    }
    return loadScript(script.id, script.code, host);
  }

  if (!showdown.helper.isArray(script.inner)) {
    script.inner = [script.inner];
  }
  if (script.code) {
    if (typeof script.code === 'function') {
      const method = script.code;
      if (promise) {
        promise.then(() => {
          method();
        });
      } else {
        method();
      }
    } else {
      if (promise) {
        promise.then(() => {
          if (!insertScript(script.id, script.code, host)) {
            console.log(format('Args is invaild with insert script!'), script);
          }
        });
      } else if (!insertScript(script.id, script.code, host)) {
        console.log(format('Args is invaild with insert script!'), script);
      }
    }
  }
  if (script.inner.length > 0) {
    for (let j = 0; j < script.inner.length; ++j) {
      const s = script.inner[j];
      if (!s.code) continue;

      if (typeof s.code === 'function') {
        const method = s.code;
        if (promise) {
          promise.then(() => {
            method();
          });
        } else {
          method();
        }
        continue;
      }

      let innerHost = host;
      if (s.host && typeof s.host === 'string') {
        innerHost = document.querySelector(s.host);
      }
      if (promise) {
        promise.then(() => {
          loadScript(s.id, s.code, innerHost);
        });
        continue;
      }
      loadScript(s.id, s.code, innerHost);
    }
  }
  return true;
};

const showdownFlavors = ['github', 'ghost', 'vanilla', 'original', 'allon'];
const mermaidThemes = ['default', 'forest', 'dark', 'neutral'];
const vegaThemes = ['excel', 'ggplot2', 'quartz', 'vox', 'dark'];
const vegaRenderers = ['canvas', 'svg'];
const plantumlImgFmts = ['svg', 'png', 'jpg'];
const mathEngines = ['mathjax', 'katex'];

// defaultOptions.vega is embedOptions of vega-embed;
// defaultOptions.katex is config of katex,
//   format is { delimiters: [ { left: '$$', right: '$$', display: true | false | undefined, asciimath: true | undefined }] };
// defaultOptions.mermaid is config of mermaidAPI;
// defaultOptions.plantuml is {umlWebSite: string, imageFormat: string};
// defaultOptions.showdown is flavor and ShowdownOptions of showdown
const showdowns = {
  showdown: showdown,
  converter: null,
  defaultOptions: {
    showdown: getOptions(),
    toc: {},
    plantuml: { imageFormat: 'svg' },
    mermaid: { theme: 'default' },
    mathjax: {},
    katex: {},
    kroki: {},
    vega: { theme: 'vox' },
    shiki: {},
  },
  defaultExtensions: {},
  defaultAsyncExtensions: {},
  markdownDecodeFilter: function (doc) {
    return '';
  },
  initDefaultOptions: function () {
    if (!this.defaultOptions) {
      this.defaultOptions = {
        showdown: {},
        toc: {},
        plantuml: {},
        mermaid: {},
        mathjax: {},
        katex: {},
        kroki: {},
        vega: {},
        shiki: {},
      };
    }
  },
  setFlavor: function (name) {
    this.showdown.setFlavor(name);
    if (this.converter) {
      this.converter.setFlavor(name);
    }
  },
  addOptions: function (options) {
    for (const key in options) {
      if (key !== 'flavor' && key !== 'mathEngine') {
        this.showdown.setOption(key, options[key]);
        if (this.converter) {
          this.converter.setOption(key, options[key]);
        }
      }
    }
  },
  addExtension: function (name, extension) {
    this.removeExtension(name);
    if (typeof name === 'string') {
      try {
        showdown.extension(name, extension);
        if (this.converter) {
          this.converter.addExtension(name);
        }
      } catch (err) {
        console.log(err);
      }
    }
  },
  removeExtension: function (name) {
    if (typeof name !== 'string') return;
    if (this.converter) {
      let ext = null;
      try {
        ext = showdown.extension(name);
      } catch (err) {
        console.log(err);
      }
      if (!ext) return;
      this.converter.removeExtension(ext);
    }
    showdown.removeExtension(name);
  },
  addAsyncExtension: function (name, extension) {
    this.removeAsyncExtension(name);
    if (typeof name === 'string') {
      try {
        showdown.asyncExtension(name, extension);
        if (this.converter) {
          this.converter.addAsyncExtension(name);
        }
      } catch (err) {
        console.log(err);
      }
    }
  },
  removeAsyncExtension: function (name) {
    if (typeof name !== 'string') return;
    if (this.converter) {
      let ext = null;
      try {
        ext = showdown.asyncExtension(name);
      } catch (err) {
        console.log(err);
      }
      if (!ext) return;
      this.converter.removeAsyncExtension(ext);
    }
    showdown.removeAsyncExtension(name);
  },
  setCDN: function (cdnname, defScheme, distScheme, uriPath) {
    if (typeof cdnname === 'string' && cdnname) {
      cdnjs.setCDN(cdnname, defScheme, distScheme, uriPath);
    }
  },
  setShowdownFlavor: function (name) {
    this.initDefaultOptions();
    if (name) {
      if (showdownFlavors.indexOf(name) === -1) {
        name = 'github';
      }
      this.defaultOptions.showdown.flavor = name;
      this.setFlavor(name);
    }
  },
  setMathEngine: function (engineName) {
    this.initDefaultOptions();
    if (engineName) {
      if (mathEngines.indexOf(engineName) === -1) {
        engineName = 'mathjax';
      }
      this.defaultOptions.showdown.mathEngine = engineName;
      this.setExtensionOptions('katex', { engine: engineName });
      this.setExtensionOptions('mathjax', { engine: engineName });
    }
  },
  setLanuageTheme: function (theme) {
    this.initDefaultOptions();
    if (theme) {
      this.defaultOptions.shiki.theme = theme;
      this.setExtensionOptions('shiki', { theme: theme });
    }
  },
  setShowdownOptions: function (options) {
    this.initDefaultOptions();
    if (typeof options !== 'object' || !options) options = {};
    this.defaultOptions.showdown = Object.assign(this.defaultOptions.showdown || {}, options);
    this.setShowdownFlavor(this.defaultOptions.showdown.flavor);
    this.setMathEngine(this.defaultOptions.showdown.mathEngine);
    this.addOptions(this.defaultOptions.showdown);
    return this.defaultOptions.showdown;
  },
  setExtensionOptions: function (name, options) {
    if (!options || typeof options !== 'object') {
      return false;
    }

    name = `showdown-${name}`;
    let extensions = getAsyncExtension(name);
    if (!extensions) {
      extensions = getExtension(name);
      if (!extensions) {
        return false;
      }
    }

    if (!extensions.length) {
      return false;
    }

    for (let i = 0; i < extensions.length; i++) {
      const extension = extensions[i];
      if (extension && extension.type === 'output' && extension.config) {
        deepMerge(extension.config, options);
        return true;
      }
    }

    return false;
  },
  setPlantumlOptions: function (options) {
    return this.setExtensionOptions('plantuml', options);
  },
  setMermaidOptions: function (options) {
    return this.setExtensionOptions('mermaid', options);
  },
  setKatexOptions: function (options) {
    return this.setExtensionOptions('katex', options);
  },
  setKrokiOptions: function (options) {
    return this.setExtensionOptions('kroki', options);
  },
  setVegaOptions: function (options) {
    return this.setExtensionOptions('vega', options);
  },
  init: function (reset) {
    if (!this.converter) {
      const showdownOptions = this.defaultOptions ? this.defaultOptions.showdown || {} : {};
      const options = getOptions(showdownOptions);
      const extensions = getExtensions(this.defaultOptions, this.defaultExtensions);
      const asyncExtensions = getAsyncExtensions(this.defaultOptions, this.defaultAsyncExtensions);
      this.setFlavor(options.flavor);
      this.setMathEngine(options.mathEngine);
      // converter instance of showdown
      this.converter = new showdown.Converter({
        extensions: extensions,
      }).initConvertExtObj(options.flavor, asyncExtensions);
      this.addOptions(options);
    } else {
      let resetOptions = {};
      if (typeof reset === 'boolean' && reset) {
        resetOptions = { option: true, extension: true };
      } else {
        resetOptions = reset;
      }
      if (typeof resetOptions === 'object') {
        if (resetOptions.hasOwnProperty('option') && resetOptions.option) {
          const showdownOptions = this.defaultOptions ? this.defaultOptions.showdown || {} : {};
          const options = getOptions(showdownOptions);
          this.setFlavor(options.flavor);
          this.setMathEngine(options.mathEngine);
          this.addOptions(options);
        }
        if (resetOptions.hasOwnProperty('extension') && resetOptions.extension) {
          for (let [key, val] in this.defaultOptions) {
            if (key !== 'showdown') {
              this.setExtensionOptions(key, val);
            }
          }
        }
      }
    }
    return this;
  },
  makeHtml: function (doc, callback) {
    let content = '';
    let output = 'html';
    if (typeof doc === 'object') {
      if (typeof doc.content === 'string') {
        if (typeof doc.type === 'string') {
          switch (doc.type) {
            case 'zip':
              content = this.zDecode(doc.content);
              break;
            default:
              content = this.markdownDecodeFilter(doc) || doc.content;
              break;
          }
        } else {
          content = doc.content;
        }
      }
      if (doc.output === 'dom') {
        output = 'dom';
      }
    } else {
      content = doc;
    }

    if (this.converter && content) {
      // Compatible with old versions, be deprecated in the future.
      function _checkCssTypes(obj) {
        return new Promise((resolve) => {
          if (obj.cssLinks && Array.isArray(obj.cssLinks)) {
            obj.cssTypes = { css: {} };
            obj.cssLinks.forEach((css) => {
              if (css.id === 'css-abc') {
                obj.cssTypes.hasAbc = true;
                obj.cssTypes.css.abc = css.link;
                return;
              }

              if (css.id === 'css-katex') {
                obj.cssTypes.hasKatex = true;
                obj.cssTypes.css.katex = css.link;
                return;
              }

              if (css.id === 'css-railroad') {
                obj.cssTypes.hasRailroad = true;
                obj.cssTypes.css.railroad = css.link;
                return;
              }

              if (css.id === 'css-sequence') {
                obj.cssTypes.hasSequence = true;
                obj.cssTypes.css.sequence = css.link;
              }
            });
            if (typeof callback === 'function' && callback) {
              callback(obj.cssTypes);
            }
          }
          return resolve(obj);
        });
      }

      return this.converter.asyncMakeHtml(content, _checkCssTypes).then((obj) => {
        if (typeof obj.html !== 'string') {
          if (typeof document !== 'undefined' && output === 'dom') {
            let doms = [obj.html];
            if (obj.extras) {
              let extraContent = '';
              let extras = obj.extras;
              if (!showdown.helper.isArray(extras)) {
                extras = [extras];
              }
              for (let i = 0; i < extras.length; ++i) {
                if (typeof extras[i] !== 'string') {
                  doms.push(extras[i]);
                  continue
                };
                extraContent += extras[i];
              }
              if (extraContent.length > 0) {
                const div = document.createElement('div');
                div.innerHTML = extraContent;
                doms.push(...div.childNodes);
                div.replaceChildren();
              }
            }
            return { html: doms, scripts: obj.scripts, cssLinks: obj.cssLinks };
          }

          content = obj.html.outerHTML;
        } else {
          content = obj.html;
        }
        if (obj.extras) {
          let extras = obj.extras;
          if (!showdown.helper.isArray(extras)) {
            extras = [extras];
          }
          for (let i = 0; i < extras.length; ++i) {
            if (typeof extras[i] !== 'string'){
               content += extras.outerHTML;
               continue
            };
            content += extras[i];
          }
        }
        return { html: content, scripts: obj.scripts, cssLinks: obj.cssLinks };
      });
    }
    return Promise.reject(!content ? 'Content is empty.' : 'Converter is invaild.');
  },
  completedHtml: function (scripts, element) {
    if (!showdown.helper.isArray(scripts)) {
      scripts = [scripts];
    }

    return new Promise((revole, reject) => {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      for (let i = 0; i < scripts.length; ++i) {
        const script = scripts[i];
        if (script.outer) {
          if (!showdown.helper.isArray(script.outer)) {
            script.outer = [script.outer];
          }
          let o = script.outer[0];
          let result = appendScript(o.name, o.src);
          for (let k = 1; k < script.outer.length; ++k) {
            o = script.outer[k];
            result = result.then(() => {
              return appendScript(o.name, o.src);
            });
          }

          opScript(script, element, result);
          continue;
        }

        if (!opScript(script, element)) {
          return reject('Args is invaild!');
        }
      }
      revole(true);
    });
  },
  zDecode: function (zContent) {
    return zlibcodec.zDecode(zContent);
  },
  zEncode: function (content) {
    return zlibcodec.zEncode(content);
  },
};

export default showdowns;
