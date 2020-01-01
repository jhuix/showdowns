/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
'use strict';

import './less/preview.less';

import showdown from 'showdown';
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
import showdownFlowchart from './extensions/showdown-flowchart.js';
import showdownCheckType from './extensions/showdown-checktype.js';

import * as zlibcodec from './utils/zlib-codec.js';
import cdnjs from './extensions/cdn';

// Override githubCodeBlocks parser;
// Support language attribute, see the following format:
// ```lang {"theme": "github", "align": "center"}
//    code block
// ```
// OR
// ```lang ["theme": "vox", "align": "right"]
//    code block
// ```
showdown.subParser('githubCodeBlocks', function(text, options, globals) {
  'use strict';

  // early exit if option is not enabled
  if (!options.ghCodeBlocks) {
    return text;
  }

  text = globals.converter._dispatch('githubCodeBlocks.before', text, options, globals);

  text += '¨0';

  text = text.replace(
    /(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*?)(?:[ \t]*?)((?:\{[\S\t ]*\}|\[[\S\t ]*\])?)\n([\s\S]*?)\n(?: {0,3})\1/g,
    function(wholeMatch, delim, language, langattr, codeblock) {
      var end = options.omitExtraWLInCodeBlocks ? '' : '\n';

      // First parse the github code block
      codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
      codeblock = showdown.subParser('detab')(codeblock, options, globals);
      codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
      codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing whitespace

      codeblock =
        '<pre><code' +
        (language ? ' class="' + language + ' language-' + language + '"' : '') +
        (langattr ? ` data-lang='${langattr}'` : '') +
        '>' +
        codeblock +
        end +
        '</code></pre>';

      codeblock = showdown.subParser('hashBlock')(codeblock, options, globals);

      // Since GHCodeblocks can be false positives, we need to
      // store the primitive text and the parsed text in a global var,
      // and then return a token
      return (
        '\n\n¨G' +
        (globals.ghCodeBlocks.push({
          text: wholeMatch,
          codeblock: codeblock
        }) -
          1) +
        'G\n\n'
      );
    }
  );

  // attacklab: strip sentinel
  text = text.replace(/¨0/, '');

  return globals.converter._dispatch('githubCodeBlocks.after', text, options, globals);
});

const _asyncExtensions = {};

/**
 * Gets or registers an async extension
 * @static
 * @param {string} name
 * @param {object|function=} ext
 * @returns {*}
 */
showdown.asyncExtension = function(name, ext) {
  'use strict';

  if (!showdown.helper.isString(name)) {
    throw Error("Extension 'name' must be a string");
  }

  name = showdown.helper.stdExtName(name);

  // Getter
  if (showdown.helper.isUndefined(ext)) {
    if (!_asyncExtensions.hasOwnProperty(name)) {
      throw Error('Async Extension named ' + name + ' is not registered!');
    }
    return _asyncExtensions[name];

    // Setter
  } else {
    // Expand extension if it's wrapped in a function
    if (typeof ext === 'function') {
      ext = ext();
    }

    // Ensure extension is an array
    if (!showdown.helper.isArray(ext)) {
      ext = [ext];
    }

    if (showdown.validateExtension(ext)) {
      _asyncExtensions[name] = ext;
    }
  }
};
/**
 * Remove an async extension
 * @param {string} name
 */
showdown.removeAsyncExtension = function(name) {
  'use strict';
  delete _asyncExtensions[name];
};

/**
 * Removes all async extensions
 */
showdown.resetAsyncExtensions = function() {
  'use strict';
  _asyncExtensions = {};
};
//////////////////////////////////////////////////////////////////////
const getOptions = (options = {}) => {
  return {
    flavor: 'github',
    strikethrough: true,
    tables: true,
    tasklists: true,
    underline: true,
    emoji: true,
    ghCompatibleHeaderId: false,
    rawHeaderId: true,
    ...options
  };
};

const getAsyncExtensions = (options, extensions = {}) => {
  const mermaidOptions = options ? options.mermaid || {} : {};
  const plantumlOptions = options ? options.plantuml || {} : {};
  const vegaOptions = options ? options.vega || {} : {};

  const asyncExtensions = {
    'showdown-mermaid': showdownMermaid(mermaidOptions),
    'showdown-flowchart': showdownFlowchart,
    'showdown-railroad': showdownRailroad,
    'showdown-viz': showdownViz,
    'showdown-sequence': showdownSequence,
    'showdown-katex': showdownKatex,
    'showdown-vega': showdownVega(vegaOptions),
    'showdown-wavedrom': showdownWavedrom,
    'showdown-plantuml': showdownPlantuml(plantumlOptions),
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

const showdownFlavors = ['github', 'ghost', 'vanilla'];
const mermaidThemes = ['default', 'forest', 'dark', 'neutral'];
const vegaThemes = ['excel', 'ggplot2', 'quartz', 'vox', 'dark'];
const vegaRenderers = ['canvas', 'svg'];
const plantumlImgFmts = ['svg', 'png', 'jpg'];

// defaultOptions.vega is EmbedOptions of vega-embed;
// defaultOptions.mermaid is Config of mermaidAPI;
// defaultOptions.plantuml is {umlWebSite: string, imageFormat: string};
// defaultOptions.showdown is flavor and ShowdownOptions of showdown
const showdowns = {
  showdown: showdown,
  converter: null,
  defaultOptions: {
    showdown: getOptions(),
    plantuml: { imageFormat: 'svg' },
    mermaid: { theme: 'default' },
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
        vega: {}
      };
    }
  },
  addOptions: function(options) {
    for (const key in options) {
      if (key === 'flavor') {
        this.showdown.setFlavor(options[key]);
      } else {
        this.showdown.setOption(key, options[key]);
      }
    }
    if (this.converter) {
      for (const key in options) {
        if (key === 'flavor') {
          this.converter.setFlavor(options[key]);
        } else {
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
  setShowdownOptions: function(options) {
    this.initDefaultOptions();
    if (typeof options !== 'object' || !options) options = {};
    this.defaultOptions.showdown = Object.assign(this.defaultOptions.showdown || {}, options);
    const flavor = this.defaultOptions.showdown.flavor;
    if (flavor && showdownFlavors.indexOf(flavor) === -1) {
      this.defaultOptions.showdown.flavor = 'github';
    }
    if (this.converter) {
      this.addOptions(this.defaultOptions.showdown);
    }
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
      // converter instance of showdown
      this.converter = new showdown.Converter({
        extensions: extensions
      });

      // set options of this instance (include flavor)
      this.addOptions(options);
      const outputAsyncModifiers = [];
      this.converter.outputAsyncModifiers = outputAsyncModifiers;
      const asyncExtensions = getAsyncExtensions(this.defaultOptions, this.defaultAsyncExtensions);
      /**
       * Parse sync extension
       * @param {*} ext
       * @param {string} [name='']
       * @private
       */
      function _parseAsyncExtension(ext, name) {
        name = name || null;
        // If it's a string, the extension was previously loaded
        if (showdown.helper.isString(ext)) {
          ext = showdown.helper.stdExtName(ext);
          name = ext;

          if (!showdown.helper.isUndefined(_asyncExtensions[ext])) {
            ext = _asyncExtensions[ext];
          } else {
            throw Error(
              'Extension "' + ext + '" could not be loaded. It was either not found or is not a valid aync extension.'
            );
          }
        }

        if (typeof ext === 'function') {
          ext = ext();
        }

        if (!showdown.helper.isArray(ext)) {
          ext = [ext];
        }

        if (showdown.validateExtension(ext)) {
          for (var i = 0; i < ext.length; ++i) {
            switch (ext[i].type) {
              case 'output':
                outputAsyncModifiers.push(ext[i]);
                break;
            }
          }
        }
      }

      this.converter.addAsyncExtension = function(extension, name) {
        name = name || null;
        _parseAsyncExtension(extension, name);
      };

      this.converter.removeAsyncExtension = function(extension) {
        if (!showdown.helper.isArray(extension)) {
          extension = [extension];
        }
        for (var a = 0; a < extension.length; ++a) {
          const ext = extension[a];
          for (var j = 0; j < this.outputAsyncModifiers.length; ++j) {
            if (this.outputAsyncModifiers[j] === ext) {
              this.outputAsyncModifiers.splice(j, 1);
            }
          }
        }
      };

      // Because removeExtension function of converter has bug in showdown.js,
      // it needs to override.
      this.converter.removeExtension = function(extension) {
        if (!showdown.helper.isArray(extension)) {
          extension = [extension];
        }
        const exts = this.getAllExtensions();
        let langExtensions = exts.language;
        let outputModifiers = exts.output;
        for (var a = 0; a < extension.length; ++a) {
          const ext = extension[a];
          for (var i = 0; i < langExtensions.length; ++i) {
            if (langExtensions[i] === ext) {
              langExtensions.splice(i, 1);
            }
          }
          for (var j = 0; j < outputModifiers.length; ++j) {
            if (outputModifiers[j] === ext) {
              outputModifiers.splice(j, 1);
            }
          }
        }
      };

      showdown.helper.forEach(asyncExtensions, _parseAsyncExtension);
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
          this.addAsyncExtension('showdown-mermaid', showdownMermaid(this.defaultOptions.mermaid));
          this.addAsyncExtension('showdown-vega', showdownVega(this.defaultOptions.vega));
          this.addAsyncExtension('showdown-plantuml', showdownPlantuml(this.defaultOptions.plantuml));
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
      content = `<div class='showdowns'>${this.converter.makeHtml(content)}</div>`;
      var globals = {
        outputAsyncModifiers: this.converter.outputAsyncModifiers,
        converter: this
      };
      let extCheckType = null;
      if (typeof callback === 'function' && callback) {
        extCheckType = showdownCheckType(data => {
          callback(data);
        });
        this.converter.addAyncExtension(extCheckType, 'showdown-checktype');
      }
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;
      const options = this.converter.options;
      const converter = this.converter;
      let result = Promise.resolve({ wrapper, options, globals });
      //forEach写法
      this.converter.outputAsyncModifiers.forEach(function(ext) {
        result = result.then(obj => {
          const filter = ext.filter(obj);
          if (filter) {
            return filter;
          }
        });
      });
      return result.then(obj => {
        if (extCheckType) {
          converter.removeAyncExtension(extCheckType);
        }
        return obj.wrapper.innerHTML;
      });
    }
    return new Promise((resolve, reject) => {
      return reject(!content ? 'Content is empty.' : 'Converter is invaild.');
    });
  },
  zDecode: function(zContent) {
    return zlibcodec.zDecode(zContent);
  },
  zEncode: function(content) {
    return zlibcodec.zEncode(content);
  }
};

export default showdowns;
