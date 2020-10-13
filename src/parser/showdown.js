
/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
'use strict';

import showdown from 'showdown';
import './githubCodeBlocks.js'
import './tables.js'

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
 * Get an async extension
 * @param {string} name
 */
showdown.getAsyncExtension = function(name) {
  'use strict';
  return _asyncExtensions[name];
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

export default showdown
