/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
'use strict';

import showdown from 'showdown';

showdown.ConverterExtObj = function(flavor, asyncExtensions) {
  'use strict';

  let outputAsyncModifiers = [],
    /**
     * The flavor set in this converter
     */
    currConvFlavor = flavor;

  _constructor();

  /**
   * Converter constructor
   * @private
   */
  function _constructor() {
    if (asyncExtensions) {
      showdown.helper.forEach(asyncExtensions, _parseAsyncExtension);
    }
  }

  /**
   * Parse async extension
   * @param {*} ext
   * @param {string} [name='']
   * @private
   */
  function _parseAsyncExtension(ext, name) {
    name = name || null;
    // If it's a string, the extension was previously loaded
    if (showdown.helper.isString(ext)) {
      name = showdown.helper.stdExtName(ext);
      ext = showdown.asyncExtension(name);
      if (showdown.helper.isUndefined(ext)) {
        throw Error(
          'Extension "' + name + '" could not be loaded. It was either not found or is not a valid aync extension.'
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

  this.addAsyncExtension = function(extension, name) {
    name = name || null;
    _parseAsyncExtension(extension, name);
  };

  this.removeAsyncExtension = function(extension) {
    if (!showdown.helper.isArray(extension)) {
      extension = [extension];
    }
    for (var a = 0; a < extension.length; ++a) {
      const ext = extension[a];
      for (var j = 0; j < outputAsyncModifiers.length; ++j) {
        if (outputAsyncModifiers[j] === ext) {
          outputAsyncModifiers.splice(j, 1);
        }
      }
    }
  };

  this.getAsyncExtensions = function() {
    return outputAsyncModifiers;
  };

  /**
   * Get the currently flavor name of this converter
   * @returns {string}
   */
  this.getCurrFlavor = function() {
    return currConvFlavor;
  };

  /**
   * Set the currently flavor name of this converter
   * @param {string} flavor name
   */
  this.setCurrFlavor = function(name) {
    currConvFlavor = name;
  };
};

showdown.Converter.prototype.initConvertExtObj = function(flavor, asyncExtensions) {
  this.extObj = new showdown.ConverterExtObj(flavor, asyncExtensions);

  this.resetOptions = function(converterOptions) {
    converterOptions = converterOptions || {};

    const globalOptions = showdown.getOptions();
    let options = this.getOptions();
    for (var gOpt in globalOptions) {
      if (globalOptions.hasOwnProperty(gOpt)) {
        options[gOpt] = globalOptions[gOpt];
      }
    }

    // Merge options
    if (typeof converterOptions === 'object') {
      for (var opt in converterOptions) {
        if (converterOptions.hasOwnProperty(opt)) {
          options[opt] = converterOptions[opt];
        }
      }
    }
  };

  /**
   * Set the flavor THIS converter should use
   * @param {string} name
   */
  this.setFlavor = function(name) {
    let preset = showdown.getFlavorOptions(name);
    if (showdown.helper.isUndefined(preset)) return;
    this.extObj.setCurrFlavor(name);
    let defaultOptions = showdown.getDefaultOptions(true);
    for (var option in defaultOptions) {
      if (defaultOptions.hasOwnProperty(option)) {
        this.getOptions()[option] = defaultOptions[option];
      }
    }
    for (var option in preset) {
      if (preset.hasOwnProperty(option)) {
        this.getOptions()[option] = preset[option];
      }
    }
  };

  /**
   * Get the currently set flavor of this converter
   * @returns {string}
   */
  this.getFlavor = function() {
    return this.extObj.getCurrFlavor();
  };

  this.addAsyncExtension = function(extension, name) {
    this.extObj.addAsyncExtension(extension, name);
  };

  this.removeAsyncExtension = function(extension) {
    this.extObj.removeAsyncExtension(extension);
  };

  // Because removeExtension function of converter has bug in showdown.js,
  // it needs to be overrode.
  this.removeExtension = function(extension) {
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

  /**
   * Async converts a markdown string into HTML
   * @param {string} text
   * @returns {*}
   */
  this.asyncMakeHtml = function(text, callback) {
    const content = this.makeHtml(text);
    const outputs = this.extObj.getAsyncExtensions();
    if (!outputs.length) {
      return Promise.resolve(content);
    }

    var globals = {
      outputs: outputs,
      converter: this
    };
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;
    const options = this.getOptions();
    let result = Promise.resolve({ wrapper, options, globals });
    //forEach写法
    outputs.forEach(function(ext) {
      result = result.then(obj => {
        const filter = ext.filter(obj);
        return filter ? filter : obj;
      });
    });
    return result.then(obj => {
      if (typeof callback === 'function' && callback) {
        const promise = callback(obj);
        if (promise instanceof Promise) {
          return promise.then(obj => {
            return obj.wrapper.innerHTML;
          });
        }
      }
      return obj.wrapper.innerHTML;
    });
  };

  return this;
};
