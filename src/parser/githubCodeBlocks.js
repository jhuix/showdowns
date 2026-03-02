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

showdown.subParser('githubCodeBlocks', function (text, options, globals) {
  'use strict';

  // early exit if option is not enabled
  if (!options.ghCodeBlocks) {
    return text;
  }

  text = globals.converter._dispatch('githubCodeBlocks.before', text, options, globals);

  text += '¨0';

  const matchProcess = function (wholeMatch, delim, language, langattr, title, codeblock) {
    const _ = delim;
    var end = options.omitExtraWLInCodeBlocks ? '' : '\n';

    // First parse the github code block
    codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
    codeblock = showdown.subParser('detab')(codeblock, options, globals);
    codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
    codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing whitespace

    if (title) {
      title = showdown.subParser('spanGamut')(title, options, globals);
      title = `<span class="code-title">${title}</span>`;
    } else {
      title = '';
    }

    language = language || 'markdown';
    const dataLanguage = language ? ` data-language='${language}'` : '';
    language = language ? ` class="${language} language-${language}"` : '';
    langattr = langattr ? ` data-lang='${langattr}'` : '';
    codeblock = `<div class="codeblock-container"${dataLanguage}>${title}<pre><code${language}${langattr}>${codeblock}${end}</code></pre></div>`;
    codeblock = showdown.subParser('hashBlock')(codeblock, options, globals);

    // Since GHCodeblocks can be false positives, we need to
    // store the primitive text and the parsed text in a global var,
    // and then return a token
    return ('\n\n¨G' + (globals.ghCodeBlocks.push({ text: wholeMatch, codeblock: codeblock }) - 1) + 'G\n\n');
  }

  text = text.replace(
    /(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*?)(?:[ \t]*?)((?:\{[\S\t ]*\}|\[[\S\t ]*\])?)(?:title="([\S\t ]*)"[ \t]*)?\n([\s\S]*?)\n(?: {0,3})\1/g,
    matchProcess
  );

  // Support mermaid code of azure syntax
  text = text.replace(
    /(?:^|\n)(?: {0,3})(:::+)(?: *)(mermaid)(?:[ \t]*?)((?:\{[\S\t ]*\}|\[[\S\t ]*\])?)(?:title="([\S\t ]*)"[ \t]*)?\n([\s\S]*?)\n(?: {0,3})\1/g,
    matchProcess
  );

  // attacklab: strip sentinel
  text = text.replace(/¨0/, '');

  return globals.converter._dispatch('githubCodeBlocks.after', text, options, globals);
});
