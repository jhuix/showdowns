'use strict';

import './less/preview.less';
//import "../node_modules/katex/dist/fonts/KaTeX_AMS-Regular.woff2";
import '../node_modules/katex/dist/katex.min.css';

import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import showdownToc from './extensions/showdown-toc.js';
import showdownAlign from './extensions/showdown-align.js';
import showdownMermaid from './extensions/showdown-mermaid.js';
import showdownPlantuml from './extensions/showdown-plantuml.js';
import showdownFootnotes from './extensions/showdown-footnotes.js';
import * as zlibcodec from './utils/zlib-codec.js';

const getOptions = options => {
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

const getExtensions = extensions => {
  return [
    showdownToc,
    showdownAlign,
    showdownFootnotes,
    showdownMermaid,
    showdownKatex(),
    showdownPlantuml({ imageFormat: 'svg' })
  ].concat(extensions ? extensions : []);
};

const showdowns = {
  showdown: showdown,
  converter: null,
  options: {},
  extensions: [],
  setOptions: options => {
    if (showdowns.converter) {
      for (const key in options) {
        if (key === 'flavor') {
          showdowns.converter.setFlavor(options[key]);
        } else {
          showdowns.converter.setOption(key, options[key]);
        }
      }
    }
  },
  setExtensions: extensions => {
    if (showdowns.converter) {
      showdowns.converter.addExtension(extensions);
    }
  },
  init: () => {
    if (!showdowns.converter) {
      // converter instance of showdown
      showdowns.converter = new showdown.Converter({
        extensions: getExtensions(showdowns.extensions)
      });

      // set options of this instance (include flavor)
      const options = getOptions(showdowns.options);
      showdowns.setOptions(options);
    }
  },
  makeHtml: doc => {
    let content = '';
    if (typeof doc === 'object') {
      if (doc.content !== 'string') {
        return;
      }

      if (typeof doc.type === 'string' && doc.type === 'zip') {
        content = zlibcodec.decode(doc.content);
      } else {
        content = doc.content;
      }
    } else {
      content = doc;
    }
    const html = showdowns.converter
      ? showdowns.converter.makeHtml(content)
      : '';
    return `<div class='markdown-preview'>${html}</div>`;
  }
};

export default showdowns;
