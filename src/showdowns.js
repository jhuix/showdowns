'use strict';

import './less/preview.less';
import '../node_modules/katex/dist/katex.min.css';

import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import showdownToc from './extensions/showdown-toc.js';
import showdownAlign from './extensions/showdown-align.js';
import showdownMermaid from './extensions/showdown-mermaid.js';
import showdownPlantuml from './extensions/showdown-plantuml.js';
import showdownFootnotes from './extensions/showdown-footnotes.js';
import * as zlibcodec from './utils/zlib-codec.js';

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
    showdownKatex(),
    showdownPlantuml({ imageFormat: 'svg' })
  ].concat(extensions ? extensions : []);
};

const showdowns = {
  showdown: showdown,
  converter: null,
  defaultOptions: getExtensions(),
  defaultExtensions: getOptions(),
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
  init: function() {
    if (!this.converter) {
      // converter instance of showdown
      this.converter = new showdown.Converter({
        extensions: this.defaultOptions
      });

      // set options of this instance (include flavor)
      this.addOptions(this.defaultOptions);
    }
  },
  makeHtml: function(doc) {
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
    const html = this.converter
      ? this.converter.makeHtml(content)
      : '';
    return `<div class='markdown-preview'>${html}</div>`;
  }
};

export default showdowns;
