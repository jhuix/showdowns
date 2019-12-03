<p align="center"><a href="https://jhuix.github.io/showdowns" target="_blank" rel="noopener noreferrer"><img width="128" src="https://jhuix.github.io/showdowns/logo.png" alt="showdowns logo"></a></p>

<h1 align="center">Showdowns</h1>

[Showdowns](https://github.com/jhuix/showdowns) is a lib that make markdown to html with some extensions features(include more diagrams extensions) of showdown.js.

**In browser environment, it is implemented to dynamically load js lib files related to more showdown diagrams extension for using [showdowns >= 0.3.0 version](https://github.com/jhuix/showdowns).**

## Markdown To Html

It can converte markdown content to html that using the [showdown.js](https://github.com/showdownjs/showdown).

[Showdown](https://github.com/showdownjs/showdown) is a Javascript Markdown to HTML converter, based on the original works by John Gruber. Showdown can be used client side (in the browser) or server side (with NodeJs). For more information, refer to the following document:

- [Showdown's Markdown syntax](https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax)
- [Showdown Options](https://github.com/showdownjs/showdown/wiki/Showdown-options)

### Supporting some markdown extension features

[Footnotes](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#footnotes)

[Table of Contents](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#table-of-contents)

[LaTeX math and AsciiMath](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#latex-math-and-asciimath)

[Mermaid](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#mermaid)

[Plantuml](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#plantuml)

[Flowchart](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#flowchart)

[Network Sequence](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#network-sequence)

[Graphviz's dot](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#graphviz-s-dot)

[Railroad diagrams](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#railroad-diagrams)

[WaveDrom](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#wavedrom)

[Vega and Vega-Lite](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#vega-and-vega-lite)

See more information, refer to the following document:

[Extensions Examples](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md)

### Preview

- View [Extensions Examples](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md) is previewed as [Showdowns Features](https://jhuix.github.io/showdowns/)

- View video

[![demovideo](https://jhuix.github.io/showdowns/media/demo-video.jpg)](https://jhuix.github.io/showdowns/media/demo.mp4)

## Usage

### Installation

1.  Using npm:

        npm install @jhuix/showdowns

    Note: add --save if you are using npm < 5.0.0

2.  In a browser:

    put the following line into your HTML page \<header> or \<body>:

        <link rel="stylesheet" href="dist/showdowns.min.css">
        <script src="dist/showdowns.min.js"></script>

3.  In Node.js:

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

4.  Support compress markdown content with [wasm-brotli](https://github.com/dfrankland/wasm-brotli) for [google brotli](https://github.com/google/brotli), use the following file:

        showdowns/dist/showdowns.br.min.js

### Quick Example

#### Node

    var showdowns  = require('showdowns'),
    showdowns.init()
    var text      = '# hello, markdown!',
    var html      = showdowns.makeHtml(text);

#### Browser

Put the following line into your HTML page \<header> or \<body>:

    <link rel="stylesheet" href="../dist/showdowns.min.css" />

    <div id="main" class="workspace-container"></div>
    <script src="../dist/showdowns.min.js"></script>
    <script>
      (function(element) {
        showdowns.init();
        let md = "";
        window
          .fetch("https://jhuix.github.io/showdowns/showdowns-features")
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

#### defaultOptions

Type: {showdown: object, plantuml: object, mermaid: object, vega: object }

Default options is described below:

    defaultOptions = {
      showdown: {
        flavor: 'github',
        strikethrough: true,
        tables: true,
        tasklists: true,
        underline: true,
        emoji: true,
        ghCompatibleHeaderId: false,
        rawHeaderId: true
      },
      plantuml: { imageFormat: 'svg' },
      mermaid: { theme: 'default' },
      vega: { theme: 'vox' }
    };

- showdown: showdown options object

  For more showdown options, refer to the following document:

  [Showdown Options](https://github.com/showdownjs/showdown/blob/master/README.md#options)

- plantuml: plantuml options object

  For more plantuml options:

    {
      umlWebSite: "www.plantuml.com/plantuml",
      imageFormat: "svg" | "png" | "jpg"
    };

- mermaid: mermaid options object

  For more mermaid options, refer to the following document:

  [Mermaid Options](http://mermaid-js.github.io/mermaid/#/mermaidAPI)

- vega: vega-embed options object

  For more vega-embed options, refer to the following document:

  [Vega-embed Options](https://github.com/vega/vega-embed#options)

#### defaultExtensions

Type: Array of showdown extensions

Default extensions is described below:

    defaultExtensions = [
      showdownToc,
      showdownAlign,
      showdownFootnotes,
      showdownMermaid(mermaidOptions),
      showdownFlowchart,
      showdownRailroad,
      showdownViz,
      showdownSequence,
      showdownKatex,
      showdownVega(vegaOptions),
      showdownWavedrom,
      showdownPlantuml(plantumlOptions)
    ];

For more showdown extensions, refer to the following document:

[Showdown Extensions](https://github.com/showdownjs/showdown/blob/master/README.md#extensions)

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

#### setCDN

Type: (cdnname: string, defSheme: string, distScheme: string) => void

A function to set cdn source when dynamically load js lib files related to more showdown diagrams extension.

- Parameter cdnname can be selected 'local' or 'cdnjs' or 'jsdelivr' source.
- Parameter defSheme is default prefix scheme string of source url.
- Parameter distScheme is dist prefix scheme string of source url that has prefix string is '../dist/'.

#### setShowdownOptions

Type: (options: object) => objecto

See [showdown options of defaultOptions](#defaultoptions).

- flavor field value: ['github', 'ghost', 'vanilla', 'allOn'],default set to 'github' flavor.

#### setPlantumlOptions

Type: (options: object) => object

See [plantuml options of defaultOptions](#defaultoptions).

- imageFormat field value: "svg" | "png" | "jpg", default 'png'.

#### setMermaidOptions

Type: (options: object) => object

See [mermaid options of defaultOptions](#defaultoptions).

- mermaid theme field value be selected in ['default', 'forest', 'dark', 'neutral']; When it be set empty, default set to 'default' theme.

#### setVegaOptions

Type: (options: object) => object

See [vega-embed options of defaultOptions](#defaultoptions).

- vega theme field value be selected in ['excel', 'ggplot2', 'quartz', 'vox', 'dark']; When it be set empty, default set to 'vox' theme.

#### init

Type: (void) => showdonws

A function to init that be created showdown.convertor instance for showdowns.

#### makeHtml

Type: ({type:'zip', content: string} | string, (csstypes: { hasKatex: boolean; hasRailroad: boolean; hasSequence: boolean }) => void) => string

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
