<p align="center"><a href="https://jhuix.github.io/showdowns" target="_blank" rel="noopener noreferrer"><img width="128" src="https://jhuix.github.io/showdowns/logo.png" alt="showdowns logo"></a></p>

<h1 align="center">Showdowns</h1>

[Showdowns](https://github.com/jhuix/showdowns) is a lib that make markdown to html with some extensions features(include more diagrams extensions) of showdown.js.

**In browser environment, it is implemented to dynamically load js lib files related to more showdown diagrams extension for using [showdowns >= 0.3.0 version](https://github.com/jhuix/showdowns).**

> If you think the showdowns library can help you or also hope to encourage the author, click on the top right corner to give me a [Star](https://github.com/jhuix/showdowns)⭐️.

## Markdown To Html

[Showdowns](https://github.com/jhuix/showdowns) can converte markdown content to html that using the [showdown.js](https://github.com/showdownjs/showdown).

[Showdown](https://github.com/showdownjs/showdown) is a Javascript Markdown to HTML converter, based on the original works by John Gruber. Showdown can be used client side (in the browser) or server side (with NodeJs). For more information, refer to the following document:

- [Showdowns Features Syntax](https://jhuix.github.io/showdowns/demo/index.html)
- [Showdown's Markdown Syntax](https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax)
- [Showdown Options](https://github.com/showdownjs/showdown/wiki/Showdown-options)

### Live Demo Editor —— `showdowns-editor`

Check a live demo editor here https://jhuix.github.io/vue-showdowns-editor

### Table Extension

- The following features are extended based on the showdown's table:

  - Cell spans over columns
  - Cell spans over rows (optional)
  - Omitted table header (optional)

- Showdown's table

cell style syntax has "-{2,}",":-{2,}",":-{2,}:","-{2,}:", means default (align left), align left, align center, and align right style

    | Return Code | Style | Value | DESC      |
    | ----------- | :-----: | :----- | ---------: |
    | OK          | int   | 1     | Succeeded |
    | ERROR       | int   | 0     | Failed '\|'    |

| Return Code | Style | Value | DESC      |
| ----------- | :-----: | :----- | ---------: |
| OK          | int   | 1     | Succeeded |
| ERROR       | int   | 0     | Failed    |

- Colspan table

"||" indicates cells being merged left.

    | Return Code | Style | Value | DESC      |
    | ====== | :-----: | ===== | ===== |
    | **OK**          | int   | 1     | [Succeeded](https://www.baidu.com) |
    | ERROR       | int   | 0     ||
    | ERROR       || 0     ||

<table>
<thead>
<tr>
<th id="return_code">Return Code</th>
<th id="style" style="text-align:center;">Style</th>
<th id="value">Value</th>
<th id="desc">DESC</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>OK</strong></td>
<td style="text-align:center;">int</td>
<td>1</td>
<td><a href="https://www.baidu.com">Succeeded</a></td>
</tr>
<tr>
<td>ERROR</td>
<td style="text-align:center;">int</td>
<td colspan="2">0</td>
</tr>
<tr>
<td colspan="2">ERROR</td>
<td colspan="2">0</td>
</tr>
</tbody>
</table>

- Rowspan table (optional: tablesRowspan)

"^^" indicates cells being merged above.

    | Return Code | Style | Value | DESC      |
    | ====== | :-----: | ===== | ===== |
    | ^^         || 1     | [Succeeded](https://www.baidu.com) |
    | ^^       || 0     ||
    | ERROR       | int   | 0     ||
    | ERROR       || 0     ||
    | ^^       || 0     ||

<table>
<thead>
<tr>
<th id="return_code">Return Code</th>
<th id="style" style="text-align:center;">Style</th>
<th id="value">Value</th>
<th id="desc">DESC</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="2" colspan="2">^^</td>
<td>1</td>
<td><a href="https://www.baidu.com">Succeeded</a></td>
</tr>
<tr>
<td colspan="2">0</td>
</tr>
<tr>
<td>ERROR</td>
<td style="text-align:center;">int</td>
<td colspan="2">0</td>
</tr>
<tr>
<td rowspan="2" colspan="2">ERROR</td>
<td colspan="2">0</td>
</tr>
<tr>
<td colspan="2">0</td>
</tr>
</tbody>
</table>

- Headerless table (optional: tablesHeaderless)

Table header can be eliminated.

    |--|--|--|--|--|--|--|--|
    |♜|  |♝|♛|♚|♝|♞|♜|
    |  |♟|♟|♟|  |♟|♟|♟|
    |♟|  |♞|  |  |  |  |  |
    |  |♗|  |  |♟|  |  |  |
    |  |  |  |  |♙|  |  |  |
    |  |  |  |  |  |♘|  |  |
    |♙|♙|♙|♙|  |♙|♙|♙|
    |♖|♘|♗|♕|♔|  |  |♖|

<table>
<tbody>
<tr>
<td>♜</td>
<td></td>
<td>♝</td>
<td>♛</td>
<td>♚</td>
<td>♝</td>
<td>♞</td>
<td>♜</td>
</tr>
<tr>
<td></td>
<td>♟</td>
<td>♟</td>
<td>♟</td>
<td></td>
<td>♟</td>
<td>♟</td>
<td>♟</td>
</tr>
<tr>
<td>♟</td>
<td></td>
<td>♞</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td>♗</td>
<td></td>
<td></td>
<td>♟</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
<td>♙</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>♘</td>
<td></td>
<td></td>
</tr>
<tr>
<td>♙</td>
<td>♙</td>
<td>♙</td>
<td>♙</td>
<td></td>
<td>♙</td>
<td>♙</td>
<td>♙</td>
</tr>
<tr>
<td>♖</td>
<td>♘</td>
<td>♗</td>
<td>♕</td>
<td>♔</td>
<td></td>
<td></td>
<td>♖</td>
</tr>
</tbody>
</table>

### Supporting some markdown extension features

[Footnotes](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#footnotes)

[Container](https://github.com/jhuix/showdowns/blob/master/docs/showdowns-features.md#container)

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

4.  Support compress markdown content with zip.

### Quick Example

#### Node

    var showdowns = require('showdowns'),
    showdowns.init()
    var text = '# hello, markdown!',
    showdowns.makeHtml(text).then(html => {
      //Do something for 'html'
    });

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
          .fetch("https://jhuix.github.io/showdowns/showdowns-features.md")
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
            showdowns.makeHtml(md).then(html => {
              element.innerHTML = html;
            });
          })
          .catch(function(error) {
            console.log(error);
            if (md) {
              showdowns.makeHtml(md).then(html => {
                element.innerHTML = html;
              });
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
      },
      plantuml: { imageFormat: 'svg' },
      mermaid: { theme: 'default' },
      katex: { mathDelimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '@@', right: '@@', display: true, asciimath: true },
        { left: '@ ', right: ' @', display: false, asciimath: true },
        { left: '~ ', right: ' ~', display: false, asciimath: true }
      ]},
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
      }

- mermaid: mermaid options object

  For more mermaid options, refer to the following document:

  [Mermaid Options](http://mermaid-js.github.io/mermaid/#/mermaidAPI)

- katex: katex options object

  For more katex options, refer to the following document:

  [Katex AutoRender Options](https://katex.org/docs/autorender.html#api)
  [Katex Render Options](https://katex.org/docs/options.html)

  In addition, mathDelimiters is another format::

      {
        mathDelimiters: {
          texmath: {
            display: [
               {left: "$$", right: "$$"},
               {left: '\\[', right: '\\]'}
            ],
            inline:  [
              {left: "$", right: "$"},
              {left: '\\(', right: '\\)'}
            ]
          },
          asciimath: {
            display: [ {left: "@@", right: "@@"}],
            inline:  [
              {left: "@ ", right: " @"},
              {left: "~ ", right: " ~"},
            ]
          }
        }
      }

- vega: vega-embed options object

  For more vega-embed options, refer to the following document:

  [Vega-embed Options](https://github.com/vega/vega-embed#options)

#### defaultExtensions

Type: Array of showdown extensions

Default extensions is described below:

    defaultExtensions = {
      'showdown-toc': showdownToc,
      'showdown-align': showdownAlign,
      'showdown-footnotes': showdownFootnotes,
      'showdown-container': showdownContainer,
      'showdown-sequence': showdownSequence
    }

For more showdown extensions, refer to the following document:

[Showdown Extensions](https://github.com/showdownjs/showdown/blob/master/README.md#extensions)

#### defaultAsyncExtensions

Type: Array of showdown async extensions

Default async extensions is described below:

    defaultAsyncExtensions = {
      'showdown-plantuml': showdownPlantuml(plantumlOptions),
      'showdown-mermaid': showdownMermaid(mermaidOptions),
      'showdown-katex': showdownKatex(katexOptions),
      'showdown-flowchart': showdownFlowchart,
      'showdown-viz': showdownViz,
      'showdown-vega': showdownVega(vegaOptions),
      'showdown-wavedrom': showdownWavedrom,
      'showdown-railroad': showdownRailroad,
    }

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

#### setFlavor

Type: {name: string} => void

A function to add or update flavor of showdown and showdown.convertor.

#### addOptions

Type: {options: object} => void

A function to add or update options of showdown and showdown.convertor.

#### addExtension

Type: \[name, extension] => void

A function to add or update extension of showdown and showdown.convertor.

#### removeExtension

Type: \[name] => void

A function to remove extension of showdown and showdown.convertor.

#### addAyncExtension

Type: \[name, extension] => void

A function to add or update aync extension of showdowns.

#### removeAyncExtension

Type: \[name] => void

A function to remove aync extension of showdowns.

#### setCDN

Type: (cdnname: string, defSheme: string, distScheme: string) => void

A function to set cdn source when dynamically load js lib files related to more showdown diagrams extension.

- Parameter `cdnname` can be selected 'local' or 'cdnjs' or 'jsdelivr' source.
- Parameter `defSheme` is default prefix scheme string of source url.
- Parameter `distScheme` is dist prefix scheme string of source url that has prefix string is '../dist/'.

#### setShowdownFlavor

Type: (name: string) => void

A function to set default flavor of showdown. When showdown.convertor instance be created, it can update flavor of the showdown and convertor.convertor.

See [showdown options of defaultOptions](#defaultoptions).

- flavor field value: ['github', 'ghost', 'vanilla', 'original', 'allon'], default set to 'github' flavor.

#### setShowdownOptions

Type: (options: object) => object

A function to set default options of showdown. When showdown.convertor instance be created, it can update options of the showdown and convertor.convertor.

See [showdown options of defaultOptions](#defaultoptions).

#### setPlantumlOptions

Type: (options: object) => object

A function to set default options of plantuml extension. When showdown.convertor instance be created, it can reset plantuml extension using the new default options.

See [plantuml options of defaultOptions](#defaultoptions).

- imageFormat field value: "svg" | "png" | "jpg", default 'png'.

#### setMermaidOptions

Type: (options: object) => object

A function to set default options of mermaid extension. When showdown.convertor instance be created, it can reset mermaid extension using the new default options.

See [mermaid options of defaultOptions](#defaultoptions).

- mermaid theme field value be selected in ['default', 'forest', 'dark', 'neutral']; When it be set empty, default set to 'default' theme.

#### setKatexOptions

Type: (options: object) => object

A function to set default options of katex extension. When showdown.convertor instance be created, it can reset katex extension using the new default options.

See [katex options of defaultOptions](#defaultoptions).

#### setVegaOptions

Type: (options: object) => object

A function to set default options of vega extension. When showdown.convertor instance be created, it can reset vega extension using the new default options.

See [vega-embed options of defaultOptions](#defaultoptions).

- vega theme field value be selected in ['excel', 'ggplot2', 'quartz', 'vox', 'dark']; When it be set empty, default set to 'vox' theme.

#### init

Type: (reset?: boolean | {option: boolean, extension: boolean}) => showdonws

A function to init that be created showdown.convertor instance or update default showdown options of the showdown.convertor and reset the extensions using default extension options(as mermaid options, vega options, plantul options) for showdowns.

- Parameter `reset`: After showdown.convertor instance be created; If `option` of reset object is ture, you update default showdown options; If `extension` of reset object is ture, reset the extensions using default extension options(as mermaid options, vega options, plantul options); If `reset` is true, same as value is `{option: true, extension: true}`.

#### makeHtml

Type: ({type:'zip', content: string} | string,
       (csstypes?: {
          hasKatex: boolean;
          hasRailroad: boolean;
          hasSequence: boolean
       }) => void) => Promise<string>

A async function to make markdown to html that showdown.convertor converte it in current showdowns instance.

#### zDecode

Type: (data: string) => string

A function to decode data that be encoded using [zEncode](#zencode).

#### zEncode

Type: (content: string) => string

A function to encode content with zlib.

## License

[MIT](https://github.com/jhuix/showdowns/blob/master/LICENSE)

Copyright (c) 2019-present, [Jhuix](mailto:jhuix0117@gmail.com) (Hui Jin)
