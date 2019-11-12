'use strict';

import './less/preview.less';

import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import showdownToc from './extensions/showdown-toc.js';
import showdownAlign from './extensions/showdown-align.js';
import showdownMermaid from './extensions/showdown-mermaid.js';
import showdownPlantuml from './extensions/showdown-plantuml.js';
import showdownFootnotes from './extensions/showdown-footnotes.js';
import showdownCheckType from './extensions/showdown-checktype.js';
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
  defaultOptions: getOptions(),
  defaultExtensions: getExtensions(),
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
        if (typeof doc.type === 'string' && doc.type === 'zip') {
          content = this.zDecode(doc.content);
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
