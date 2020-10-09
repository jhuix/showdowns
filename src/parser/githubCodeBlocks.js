/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Override githubCodeBlocks parser;
 * Support language attribute, see the following format:
 * ```lang {"theme": "github", "align": "center"}
 *    code block
 * ```
 * OR
 * ```lang ["theme": "vox", "align": "right"]
 *    code block
 * ```
 */
'use strict';

import showdown from 'showdown';

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
