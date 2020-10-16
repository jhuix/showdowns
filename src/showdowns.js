/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
'use strict';

import './less/preview.less';
import './less/container.less';

import showdown from './parser/showdown.js';
import showdownToc from './extensions/showdown-toc.js';
import showdownViz from './extensions/showdown-viz.js';
import showdownVega from './extensions/showdown-vega.js';
import showdownAlign from './extensions/showdown-align.js';
import showdownKatex from './extensions/showdown-katex.js';
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

//////////////////////////////////////////////////////////////////////
const getOptions = (options = {}) => {
  return {
    flavor: 'github',
    ...options
  };
};

const getAsyncExtensions = (options, extensions = {}) => {
  const mermaidOptions = options ? options.mermaid || {} : {};
  const plantumlOptions = options ? options.plantuml || {} : {};
  const katexOptions = options ? options.katex || {} : {};
  const vegaOptions = options ? options.vega || {} : {};

  const asyncExtensions = {
    'showdown-plantuml': showdownPlantuml(plantumlOptions),
    'showdown-mermaid': showdownMermaid(mermaidOptions),
    'showdown-katex': showdownKatex(katexOptions),
    'showdown-flowchart': showdownFlowchart,
    'showdown-viz': showdownViz,
    'showdown-vega': showdownVega(vegaOptions),
    'showdown-wavedrom': showdownWavedrom,
    'showdown-railroad': showdownRailroad,
    ...extensions
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
    'showdown-toc': showdownToc,
    'showdown-align': showdownAlign,
    'showdown-footnotes': showdownFootnotes,
    'showdown-container': showdownContainer,
    'showdown-sequence': showdownSequence,
    ...extensions
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

const showdownFlavors = ['github', 'ghost', 'vanilla', 'original', 'allon'];
const mermaidThemes = ['default', 'forest', 'dark', 'neutral'];
const vegaThemes = ['excel', 'ggplot2', 'quartz', 'vox', 'dark'];
const vegaRenderers = ['canvas', 'svg'];
const plantumlImgFmts = ['svg', 'png', 'jpg'];

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
    plantuml: { imageFormat: 'svg' },
    mermaid: { theme: 'default' },
    katex: {},
    vega: { theme: 'vox' }
  },
  defaultExtensions: {},
  defaultAsyncExtensions: {},
  markdownDecodeFilter: function(doc) {
    return '';
  },
  initDefaultOptions: function() {
    if (!this.defaultOptions) {
      this.defaultOptions = {
        showdown: {},
        plantuml: {},
        mermaid: {},
        katex: {},
        vega: {}
      };
    }
  },
  setFlavor: function(name) {
    this.showdown.setFlavor(name);
    if (this.converter) {
      this.converter.setFlavor(name);
    }
  },
  addOptions: function(options) {
    for (const key in options) {
      if (key !== 'flavor') {
        this.showdown.setOption(key, options[key]);
        if (this.converter) {
          this.converter.setOption(key, options[key]);
        }
      }
    }
  },
  addExtension: function(name, extension) {
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
  removeExtension: function(name) {
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
  addAsyncExtension: function(name, extension) {
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
  removeAsyncExtension: function(name) {
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
  setCDN: function(cdnname, defScheme, distScheme) {
    if (typeof cdnname === 'string' && cdnname) {
      cdnjs.setCDN(cdnname, defScheme, distScheme);
    }
  },
  setShowdownFlavor: function(name) {
    this.initDefaultOptions();
    if (name) {
      if (showdownFlavors.indexOf(name) === -1) {
        name = 'github';
      }
      this.defaultOptions.showdown.flavor = name;
      this.setFlavor(name);
    }
  },
  setShowdownOptions: function(options) {
    this.initDefaultOptions();
    if (typeof options !== 'object' || !options) options = {};
    this.defaultOptions.showdown = Object.assign(this.defaultOptions.showdown || {}, options);
    this.setShowdownFlavor(this.defaultOptions.showdown.flavor);
    this.addOptions(this.defaultOptions.showdown);
    return this.defaultOptions.showdown;
  },
  setPlantumlOptions: function(options) {
    this.initDefaultOptions();
    if (typeof options !== 'object' || !options) options = {};
    this.defaultOptions.plantuml = Object.assign(this.defaultOptions.plantuml || {}, options);
    const imageFormat = this.defaultOptions.plantuml.imageFormat;
    if (imageFormat && plantumlImgFmts.indexOf(imageFormat) === -1) {
      this.defaultOptions.plantuml.imageFormat = 'png';
    }
    if (this.converter) {
      this.addAsyncExtension('showdown-plantuml', showdownPlantuml(this.defaultOptions.plantuml));
    }
    return this.defaultOptions.plantuml;
  },
  setMermaidOptions: function(options) {
    this.initDefaultOptions();
    if (typeof options !== 'object' || !options) options = {};
    this.defaultOptions.mermaid = Object.assign(this.defaultOptions.mermaid || {}, options);
    const theme = this.defaultOptions.mermaid.theme;
    if (theme && mermaidThemes.indexOf(theme) === -1) {
      this.defaultOptions.mermaid.theme = 'default';
    }
    if (this.converter) {
      this.addAsyncExtension('showdown-mermaid', showdownMermaid(this.defaultOptions.mermaid));
    }
    return this.defaultOptions.mermaid;
  },
  setKatexOptions: function(options) {
    this.initDefaultOptions();
    if (typeof options !== 'object' || !options) options = {};
    this.defaultOptions.katex = Object.assign(this.defaultOptions.katex || {}, options);
    if (this.converter) {
      this.addAsyncExtension('showdown-katex', showdownKatex(this.defaultOptions.katex));
    }
    return this.defaultOptions.katex;
  },
  setVegaOptions: function(options) {
    this.initDefaultOptions();
    if (typeof options !== 'object' || !options) options = {};
    this.defaultOptions.vega = Object.assign(this.defaultOptions.vega || {}, options);
    const theme = this.defaultOptions.vega.theme;
    if (theme && vegaThemes.indexOf(theme) === -1) {
      this.defaultOptions.vega.theme = 'vox';
    }
    const renderer = this.defaultOptions.vega.renderer;
    if (renderer && vegaRenderers.indexOf(renderer) === -1) {
      this.defaultOptions.vega.renderer = 'canvas';
    }
    if (this.converter) {
      this.addAsyncExtension('showdown-vega', showdownVega(this.defaultOptions.vega));
    }
    return this.defaultOptions.vega;
  },
  init: function(reset) {
    if (!this.converter) {
      const showdownOptions = this.defaultOptions ? this.defaultOptions.showdown || {} : {};
      const options = getOptions(showdownOptions);
      const extensions = getExtensions(this.defaultOptions, this.defaultExtensions);
      const asyncExtensions = getAsyncExtensions(this.defaultOptions, this.defaultAsyncExtensions);
      this.setFlavor(options.flavor);
      // converter instance of showdown
      this.converter = new showdown.Converter({
        extensions: extensions
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
          this.addOptions(options);
        }
        if (resetOptions.hasOwnProperty('extension') && resetOptions.extension) {
          this.addAsyncExtension('showdown-plantuml', showdownPlantuml(this.defaultOptions.plantuml));
          this.addAsyncExtension('showdown-mermaid', showdownMermaid(this.defaultOptions.mermaid));
          this.addAsyncExtension('showdown-vega', showdownVega(this.defaultOptions.vega));
        }
      }
    }
    return this;
  },
  makeHtml: function(doc, callback) {
    let content = '';
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
    } else {
      content = doc;
    }

    if (this.converter && content) {
      function _getCssLink(wrapper, className, extName) {
        // find elements that has csslink
        const element = wrapper.querySelector(className);
        let cssLink = '';
        if (element) {
          cssLink = element.dataset.css;
        } else {
          let ext;
          try {
            ext = showdown.extension(extName);
          } catch {}

          if (!ext) {
            try {
              ext = showdown.asyncExtension(extName);
            } catch {}
          }

          if (ext) {
            if (Array.isArray(ext)) {
              for (var i = 0; i < ext.length; ++i) {
                if (ext[i].hasOwnProperty('config') && ext[i].config.hasOwnProperty('cssLink')) {
                  cssLink = ext[i].config.cssLink;
                  break;
                }
              }
            } else if (typeof ext === 'object') {
              if (ext.hasOwnProperty('config') && ext.config.hasOwnProperty('cssLink')) {
                cssLink = ext.config.cssLink;
              }
            }
          }
        }
        return cssLink;
      }

      function _checkCssTypes(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }

        return new Promise(resolve => {
          const katexCssLink = _getCssLink(wrapper, '.css-katex', 'showdown-katex');
          const sequenceCssLink = _getCssLink(wrapper, '.css-sequence', 'showdown-sequence');
          const railroadCssLink = _getCssLink(wrapper, '.css-railroad', 'showdown-railroad');

          obj.cssTypes = {
            hasKatex: katexCssLink ? true : false,
            hasSequence: sequenceCssLink ? true : false,
            hasRailroad: railroadCssLink ? true : false,
            css: {
              katex: katexCssLink,
              sequence: sequenceCssLink,
              railroad: railroadCssLink
            }
          };
          if (typeof callback === 'function' && callback) {
            callback(obj.cssTypes);
          }
          return resolve(obj);
        });
      }

      return this.converter.asyncMakeHtml(content, _checkCssTypes).then(html => {
        content = `<div class='showdowns'>${html}</div>`;
        return content;
      });
    }
    return Promise.reject(!content ? 'Content is empty.' : 'Converter is invaild.');
  },
  zDecode: function(zContent) {
    return zlibcodec.zDecode(zContent);
  },
  zEncode: function(content) {
    return zlibcodec.zEncode(content);
  }
};

export default showdowns;
