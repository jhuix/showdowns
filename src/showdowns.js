'use strict';

import './less/preview.less';

import showdown from 'showdown';
import showdownToc from './extensions/showdown-toc.js';
import showdownViz from './extensions/showdown-viz.js';
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
// ```lang {"attr1": "1"}
//    code block
// ```
// OR
// ```lang ["attr1", "1"]
//    code block
// ```
showdown.subParser('githubCodeBlocks', function(text, options, globals) {
  'use strict';

  // early exit if option is not enabled
  if (!options.ghCodeBlocks) {
    return text;
  }

  text = globals.converter._dispatch(
    'githubCodeBlocks.before',
    text,
    options,
    globals
  );

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
        (language
          ? ' class="' + language + ' language-' + language + '"'
          : '') +
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

  return globals.converter._dispatch(
    'githubCodeBlocks.after',
    text,
    options,
    globals
  );
});

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

const getExtensions = (extensions = []) => {
  return [
    showdownToc,
    showdownAlign,
    showdownFootnotes,
    showdownMermaid,
    showdownFlowchart,
    showdownRailroad,
    showdownViz,
    showdownSequence,
    showdownKatex,
    showdownWavedrom,
    showdownPlantuml({ imageFormat: 'svg' })
  ].concat(extensions ? extensions : []);
};

const showdowns = {
  showdown: showdown,
  converter: null,
  defaultOptions: getOptions(),
  defaultExtensions: getExtensions(),
  markdownDecodeFilter: function(doc) {
    return '';
  },
  addOptions: function(options) {
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
  addExtensions: function(extensions) {
    if (this.converter) {
      this.converter.addExtension(extensions);
    }
  },
  init: function(cdnname, defScheme, distScheme) {
    if (typeof cdnname === 'string' && cdnname) {
      cdnjs.setCDN(cdnname, defScheme, distScheme);
    }
    if (!this.converter) {
      // converter instance of showdown
      this.converter = new showdown.Converter({
        extensions: this.defaultExtensions
      });

      // set options of this instance (include flavor)
      this.addOptions(this.defaultOptions);
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
    if (this.converter) {
      this.converter.addExtension(
        showdownCheckType(data => {
          if (typeof callback === 'function') {
            callback(data);
          }
        }),
        'showdown-checktype'
      );
      content = content ? this.converter.makeHtml(content) : '';
    } else {
      content = '';
    }
    return `<div class='markdown-preview'>${content}</div>`;
  },
  zDecode: function(zContent) {
    return zlibcodec.decode(zContent);
  },
  zEncode: function(content) {
    return zlibcodec.encode(content);
  }
};

export default showdowns;
