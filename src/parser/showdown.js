/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
'use strict';

import showdown from 'showdown';
import './converter.js';
import './githubCodeBlocks.js';
import './tables.js';

let currFlavor = 'vanilla',
  flavors = {
    github: {
      ghCompatibleHeaderId: false,
      underline: true,
      rawHeaderId: true,
      tablesHeaderless: true,
      tablesMerge: true,
      tablesRowspan: true
    },
    ghost: {
      tablesHeaderless: true,
      tablesMerge: true,
      tablesRowspan: true
    },
    allOn: {
      tablesHeaderless: true,
      tablesMerge: true,
      tablesRowspan: true
    }
  },
  _asyncExtensions = {};

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
  name = showdown.helper.stdExtName(name);
  delete _asyncExtensions[name];
};

/**
 * Removes all async extensions
 */
showdown.resetAsyncExtensions = function() {
  'use strict';
  _asyncExtensions = {};
};

/**
 * Remove an extension
 * @param {string} name
 */
showdown.removeExtension = function(name) {
  'use strict';
  name = showdown.helper.stdExtName(name);
  delete showdown.getAllExtensions[name];
};

const orgSetFlavor = showdown.setFlavor;
const orgGetFlavorOptions = showdown.getFlavorOptions;

/**
 * Set the flavor showdown should use as default
 * @param {string} name
 */
showdown.setFlavor = function(name) {
  'use strict';

  try {
    orgSetFlavor(name);
    currFlavor = name;
    if (!flavors.hasOwnProperty(name)) return;
  } catch {
    if (!flavors.hasOwnProperty(name)) return;
    showdown.resetOptions();
    currFlavor = name;
  }
  var preset = flavors[name];
  for (var option in preset) {
    if (preset.hasOwnProperty(option)) {
      showdown.getOptions()[option] = preset[option];
    }
  }
};

/**
 * Get the currently set flavor
 * @returns {string}
 */
showdown.getFlavor = function() {
  'use strict';
  return currFlavor;
};

showdown.setFlavorOptions = function(name, options) {
  if (options) {
    flavors[name] = Object.assign(flavors[name] || {}, options);
  }
};

/**
 * Get the options of a specified flavor. Returns undefined if the flavor was not found
 * @param {string} name Name of the flavor
 * @returns {{}|undefined}
 */
showdown.getFlavorOptions = function(name) {
  'use strict';
  const flavor = orgGetFlavorOptions(name);
  if (!showdown.helper.isUndefined(flavor)) {
    if (!flavors.hasOwnProperty(name)) {
      return flavor;
    }
    return Object.assign(flavor, flavors[name]);
  }

  if (flavors.hasOwnProperty(name)) {
    return flavors[name];
  }
};

export default showdown;
