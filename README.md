<p align="center"><a href="https://jhuix.github.io/showdowns" target="_blank" rel="noopener noreferrer"><img width="128" src="https://jhuix.github.io/showdowns/logo.png" alt="showdowns logo"></a></p>

<h1 align="center">Showdowns</h1>

A lib that make markdown to html with some extensions of showdown.js.

**In browser environment, it is implemented to dynamically load js lib files related to more showdown diagrams extension for using [showdowns >= 0.3.0 version](https://github.com/jhuix/showdowns).**

## Markdown To Html

It can converte markdown content to html that using the [showdown.js](https://github.com/showdownjs/showdown).

[Showdown](https://github.com/showdownjs/showdown) is a Javascript Markdown to HTML converter, based on the original works by John Gruber. Showdown can be used client side (in the browser) or server side (with NodeJs). For more information, refer to the following document:

- [Showdown's Markdown syntax](https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax)
- [Showdown Options](https://github.com/showdownjs/showdown/wiki/Showdown-options)

### Supporting some markdown extension features

[Table of Contents](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#table-of-contents)

[LaTeX math and AsciiMath](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#latex-math-and-asciimath)

[Mermaid](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#mermaid)

[Plantuml](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#plantuml)

[Flowchart](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#flowchart)

[Network Sequence](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#network-sequence)

[Graphviz's dot](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#graphviz-s-dot)

[Railroad diagrams](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#railroad-diagrams)

[WaveDrom](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#wavedrom)

[Footnotes](https://github.com/jhuix/showdowns/blob/master/docs/demo.md#footnotes)

See more information, refer to the following document:

[Extensions Examples](https://github.com/jhuix/showdowns/blob/master/docs/demo.md)

### Demos

View [Extensions Examples](https://github.com/jhuix/showdowns/blob/master/docs/demo.md) is previewed as [Showdowns Demos](https://jhuix.github.io/showdowns/)

## Usage

### Installation

Using npm:

    npm install @jhuix/showdowns

Note: add --save if you are using npm < 5.0.0

In a browser:

    <link rel="stylesheet" href="dist/showdowns.min.css">
    <script src="dist/showdowns.min.js"></script>

In Node.js:

For commonjs

    var showdowns = require('showdowns');

or

    import 'showdowns/dist/showdowns.core.min.css';
    import showdowns from 'showdowns';

For umd

    var showdowns = require('showdowns/dist/showdowns.min.js');

or

    import 'showdowns/dist/showdowns.min.css';
    import showdowns from 'showdowns/dist/showdowns.min.js';

Support compress markdown content with [wasm-brotli](https://github.com/dfrankland/wasm-brotli) for [google brotli](https://github.com/google/brotli), use the following file:

    showdowns/dist/showdowns.br.min.js

### Quick Example

Node

    var showdowns  = require('showdowns'),
    showdowns.init()
    var text      = '# hello, markdown!',
    var html      = showdowns.makeHtml(text);

Browser

    <link rel="stylesheet" href="../dist/showdowns.min.css" />

    <div id="main" class="workspace-container"></div>
    <script src="../dist/showdowns.min.js"></script>
    <script>
      (function(element) {
        showdowns.init();
        let md = "";
        window
          .fetch("https://jhuix.github.io/showdowns/demo.md")
          .then(function(response) {
            if (response.ok) {
              return response.text();
            }
          })
          .then(function(text) {
            md = text;
            return window.fetch(
              "https://jhuix.github.io/showdowns/Showdown's-Markdown-syntax.md"
            );
          })
          .then(function(response) {
            if (response.ok) {
              return response.text();
            }
          })
          .then(function(text) {
            md = md + `\n\n## Showdown's Markdown syntax\n\n` + text;
            element.innerHTML = showdowns.makeHtml(md);
          })
          .catch(function(error) {
            console.log(error);
            if (md) {
              element.innerHTML = showdowns.makeHtml(md);
            }
          });
      })(document.getElementById("main"));
    </script>

### Options

For more showdown options and extensions, refer to the following document:

[Showdown Options](https://github.com/showdownjs/showdown/blob/master/README.md#options)

[Showdown Extensions](https://github.com/showdownjs/showdown/blob/master/README.md#extensions)

#### defaultOptions

Type: Object

Default options is described below:

    defaultOptions = {
      flavor: 'github',
      strikethrough: true,
      tables: true,
      tasklists: true,
      underline: true,
      emoji: true,
      ghCompatibleHeaderId: false,
      rawHeaderId: true
    };

#### defaultExtensions

Type: Array

Default extensions is described below:

    defaultExtensions = [
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
    ];

### Properties

#### showdown

Type: showdown

Default: showdown

Output showdown.js native object for global.

#### convertor

Type: showdown.convertor | null

Default: null

Output showdown.convertor native object in current showdowns Instance.

### Methods

#### addOptions

Type: {options} => void

A function to add or update options of showdown.convertor.

#### addExtensions

Type: \[extensions] => void

A function to add or update extensions of showdown.convertor.

#### init

Type: (cdnname: string, defSheme: string, distScheme: string) => showdonws

A function to init that be created showdown.convertor instance for showdowns.
Parameter cdnname can be selected 'local' or 'cdnjs'.
Parameter defSheme is default prefix scheme string of source url.
Parameter distScheme is dist prefix scheme string of source url that has prefix string is '../dist/'.

#### makeHtml

Type: ({type:'zip', content: string} | string, (types) => void) => string

A function to make markdown to html that showdown.convertor converte it in current showdowns instance.

#### zDecode

Type: (data: string) => string

A function to decode data that be encoded using [zEncode](#zencode).

#### zEncode

Type: (content: string) => string

A function to encode content with zlib.

## License

[MIT](https://github.com/jhuix/showdowns/blob/master/LICENSE)

Copyright (c) 2019-present, [Jhuix](mailto:jhuix0117@gmail.com) (Hui Jin)
