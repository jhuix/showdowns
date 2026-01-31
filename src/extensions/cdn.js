/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: dynamic loading js libs for local or cdnjs or jsdelivr
 */
'use strict';

let cdnName = 'jsdelivr';
let scheme = document.location.protocol === 'file:' ? 'https://' : document.location.protocol + '//';
let defScheme = '';
let distScheme = '';
let uriPath = '';

/** CDN source
 *
 * @typedef {string | Record<string, string>} CDNLink
 *
 * @typedef {{type?:string, src?: string, module?:string, importmap?: {imports: Record<string, string>}}} CDNScript
 *
 * @typedef {CDNScript & {css?: CDNLink, skin?: CDNLink, plugins?: Record<string, string | CDNScript>}} CDNModule
 *
 * @typedef {Record<string, string | CDNModule>} CDNModules
 *
 * @type {Record<string, CDNModules>}
 */
const cdnSrc = {
  local: {
    ABCJS: {
      src: '../node_modules/abcjs/dist/abcjs-basic.js',
      css: '../node_modules/abcjs/abcjs-audio.css'
    },
    echarts: '../node_modules/echarts/dist/echarts.js',
    Viz: '../node_modules/@viz-js/viz/dist/viz-global.js',
    Raphael: '../node_modules/raphael/raphael.min.js',
    flowchart: '../dist/diagrams/flowchart/flowchart.min.js',
    mermaid: {
      src: '../node_modules/mermaid/dist/mermaid.js',
      plugins: {
        'mermaid-zenuml': '../node_modules/@mermaid-js/mermaid-zenuml/dist/mermaid-zenuml.min.js',
        'mermaid-mindmap': '../node_modules/@mermaid-js/mermaid-mindmap/dist/mermaid-mindmap.min.js',
        'mermaid-layout-elk': {
          type: 'module',
          module: '../node_modules/@mermaid-js/layout-elk/dist/mermaid-layout-elk.esm.min.mjs'
        }
      }
    },
    katex: {
      src: '../node_modules/katex/dist/katex.min.js',
      css: '../node_modules/katex/dist/katex.min.css'
    },
    renderMathInElement: '../node_modules/katex/dist/contrib/auto-render.js',
    MathJax: '../node_modules/mathjax/tex-mml-svg.js',
    railroad: {
      src: '../node_modules/railroad-diagrams/railroad-diagrams.js',
      css: '../node_modules/railroad-diagrams/railroad-diagrams.css'
    },
    Snap: '../node_modules/snapsvg/dist/snap.svg-min.js',
    WebFont: '../node_modules/webfontloader/webfontloader.js',
    underscore: '../node_modules/underscore/underscore-min.js',
    sequence: {
      src: '../node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.js',
      css: '../node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.css'
    },
    WaveDrom: {
      src: '../node_modules/wavedrom/wavedrom.min.js',
      skin: {
        default: '../node_modules/wavedrom/skins/default.js',
        lowkey: '../node_modules/wavedrom/skins/lowkey.js',
        narrow: '../node_modules/wavedrom/skins/narrow.js'
      }
    },
    vega: '../node_modules/vega/build/vega.min.js',
    vegaLite: '../node_modules/vega-lite/build/vega-lite.min.js',
    vegaEmbed: '../node_modules/vega-embed/build/vega-embed.min.js',
    Plotly: '../node_modules/plotly.js-dist-min/plotly.min.js',
    Shiki: {
      type: 'module',
      src: '../node_modules/@jhuix/shiki-loader/dist/index.js'
    },
    AntVInfographic: '../node_modules/@antv/infographic/dist/infographic.min.js',
    zenuml: '../node_modules/@zenuml/core/dist/zenuml.js'
  },
  unpkg: {
    ABCJS: {
      src: 'https://unpkg.com/abcjs/dist/abcjs-basic-min.js',
      css: 'https://unpkg.com/abcjs/dist/abcjs-audio.css'
    },
    echarts: 'https://unpkg.com/echarts/dist/echarts.min.js',
    Viz: 'https://unpkg.com/@viz-js/viz/dist/viz-global.js',
    Raphael: 'https://unpkg.com/raphael/raphael.min.js',
    flowchart: '../dist/diagrams/flowchart/flowchart.min.js',
    mermaid: {
      src: 'https://unpkg.com/mermaid/dist/mermaid.min.js',
      plugins: {
        'mermaid-layout-elk': {
          type: 'module',
          module: 'https://unpkg.com/@mermaid-js/layout-elk/dist/mermaid-layout-elk.esm.min.mjs'
        },
        'mermaid-zenuml': 'https://unpkg.com/@mermaid-js/mermaid-zenuml/dist/mermaid-zenuml.min.js',
        'mermaid-mindmap': 'https://unpkg.com/@mermaid-js/mermaid-mindmap/dist/mermaid-mindmap.min.js'
      }
    },
    katex: {
      src: 'https://unpkg.com/KaTeX/dist/katex.min.js',
      css: 'https://unpkg.com/KaTeX/dist/katex.min.css'
    },
    renderMathInElement: 'https://unpkg.com/KaTeX/dist/contrib/auto-render.js',
    MathJax: 'https://unpkg.com/mathjax/tex-mml-svg.js',
    railroad: {
      src: 'https://unpkg.com/railroad-diagrams/railroad-diagrams.js',
      css: 'https://unpkg.com/railroad-diagrams/railroad-diagrams.css'
    },
    Snap: 'https://unpkg.com/snapsvg/dist/snap.svg-min.js',
    WebFont: 'https://unpkg.com/webfontloader/webfontloader.js',
    underscore: 'https://unpkg.com/underscore/underscore-min.js',
    sequence: {
      src: 'https://unpkg.com/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.js',
      css: 'https://unpkg.com/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.css'
    },
    WaveDrom: {
      src: 'https://unpkg.com/wavedrom/wavedrom.min.js',
      skin: {
        default: 'https://unpkg.com/wavedrom/skins/default.js',
        lowkey: 'https://unpkg.com/wavedrom/skins/lowkey.js',
        narrow: 'https://unpkg.com/wavedrom/skins/narrow.js',
      }
    },
    vega: 'https://unpkg.com/vega/build/vega.min.js',
    vegaLite: 'https://unpkg.com/vega-lite/build/vega-lite.min.js',
    vegaEmbed: 'https://unpkg.com/vega-embed/build/vega-embed.min.js',
    Plotly: 'https://unpkg.com/plotly.js/dist/plotly.min.js',
    /** shiki for https://unpkg.com/shiki
     * {
     *     type: 'module',
     *     module: 'https://unpkg.com/shiki',
     *     importmap: {
     *       imports: {
     *           "@shikijs/": "https://unpkg.com/@shikijs/",
     *           "hast-util-to-html": "https://unpkg.com/hast-util-to-html",
     *           "html-void-elements": "https://unpkg.com/html-void-elements",
     *           "property-information": "https://unpkg.com/property-information",
     *           "zwitch": "https://unpkg.com/zwitch",
     *           "stringify-entities": "https://unpkg.com/stringify-entities",
     *           "character-entities-legacy": "https://unpkg.com/character-entities-legacy",
     *           "character-entities-html4": "https://unpkg.com/character-entities-html4",
     *           "ccount": "https://unpkg.com/ccount",
     *           "comma-separated-tokens": "https://unpkg.com/comma-separated-tokens",
     *           "space-separated-tokens": "https://unpkg.com/space-separated-tokens",
     *           "hast-util-whitespace": "https://unpkg.com/hast-util-whitespace",
     *           "oniguruma-to-es": "https://unpkg.com/oniguruma-to-es/dist/esm/index.js",
     *           "oniguruma-parser/parser": "https://unpkg.com/oniguruma-parser/dist/parser/parse.js",
     *           "oniguruma-parser/traverser": "https://unpkg.com/oniguruma-parser/dist/traverser/traverse.js",
     *           "regex/internals": "https://unpkg.com/regex/src/internals.js",
     *           "regex-recursion": "https://unpkg.com/regex-recursion/src/index.js",
     *           "regex-utilities": "https://unpkg.com/regex-utilities/src/index.js",
     *           "shiki/": "https://unpkg.com/shiki/"
     *       }
     *     }
     * }
     */
    Shiki: {
      type: 'module',
      src: 'https://esm.sh/shiki'
    },
    AntVInfographic: 'https://unpkg.com/@antv/infographic/dist/infographic.min.js',
    zenuml: 'https://unpkg.com/@zenuml/core/dist/zenuml.js'
  },
  jsdelivr: {
    ABCJS: {
      src: 'https://cdn.jsdelivr.net/npm/abcjs/dist/abcjs-basic-min.js',
      css: 'https://cdn.jsdelivr.net/npm/abcjs/abcjs-audio.css'
    },
    echarts: 'https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js',
    Viz: 'https://cdn.jsdelivr.net/npm/@viz-js/viz/dist/viz-global.js',
    Raphael: 'https://cdn.jsdelivr.net/npm/raphael/raphael.min.js',
    flowchart: '../dist/diagrams/flowchart/flowchart.min.js',
    mermaid: {
      type: 'module',
      module: 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs',
      plugins: {
        'mermaid-layout-elk': 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk/dist/mermaid-layout-elk.esm.min.mjs',
        'mermaid-zenuml': 'https://cdn.jsdelivr.net/npm/@mermaid-js/mermaid-zenuml/dist/mermaid-zenuml.esm.min.mjs',
        'mermaid-mindmap': 'https://cdn.jsdelivr.net/npm/@mermaid-js/mermaid-mindmap/dist/mermaid-mindmap.esm.min.mjs'
      }
    },
    katex: {
      src: 'https://cdn.jsdelivr.net/npm/katex/dist/katex.min.js',
      css: 'https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css'
    },
    renderMathInElement: 'https://cdn.jsdelivr.net/npm/katex/dist/contrib/auto-render.js',
    MathJax: 'https://cdn.jsdelivr.net/npm/mathjax/tex-mml-svg.js',
    railroad: {
      src: 'https://cdn.jsdelivr.net/npm/railroad-diagrams/railroad-diagrams.min.js',
      css: 'https://cdn.jsdelivr.net/npm/railroad-diagrams/railroad-diagrams.css'
    },
    Snap: 'https://cdn.jsdelivr.net/npm/snapsvg/dist/snap.svg-min.js',
    WebFont: 'https://cdn.jsdelivr.net/npm/webfontloader/webfontloader.js',
    underscore: 'https://cdn.jsdelivr.net/npm/underscore/underscore-min.js',
    sequence: {
      src: 'https://cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.js',
      css: 'https://cdn.jsdelivr.net/npm/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.css'
    },
    WaveDrom: {
      src: 'https://cdn.jsdelivr.net/npm/wavedrom/wavedrom.min.js',
      skin: {
        default: 'https://cdn.jsdelivr.net/npm/wavedrom/skins/default.js',
        lowkey: 'https://cdn.jsdelivr.net/npm/wavedrom/skins/lowkey.js',
        narrow: 'https://cdn.jsdelivr.net/npm/wavedrom/skins/narrow.js'
      }
    },
    vega: 'https://cdn.jsdelivr.net/npm/vega/build/vega.min.js',
    vegaLite: 'https://cdn.jsdelivr.net/npm/vega-lite/build/vega-lite.min.js',
    vegaEmbed: 'https://cdn.jsdelivr.net/npm/vega-embed/build/vega-embed.min.js',
    Plotly: 'https://cdn.jsdelivr.net/npm/plotly.js-dist-min/plotly.min.js',
    Shiki: {
      type: 'module',
      src: 'https://cdn.jsdelivr.net/npm/shiki/+esm'
    },
    AntVInfographic: 'https://cdn.jsdelivr.net/npm/@antv/infographic/dist/infographic.min.js',
    zenuml: 'https://cdn.jsdelivr.net/npm/@zenuml/core/dist/zenuml.min.js'
  },
};

function setCDN(name, scheme_default, scheme_dist, uri_path) {
  if (name in cdnSrc) {
    cdnName = name;
  }

  if (typeof scheme_default === 'string' && scheme_default) {
    defScheme = scheme_default;
  }

  if (typeof scheme_dist === 'string' && scheme_dist) {
    distScheme = scheme_dist;
  }

  if (typeof uri_path === 'string' && uri_path) {
    if (uriPath.at(uriPath.length - 1) !== '/') {
      uri_path += '/';
    }
    uriPath = uri_path;
  }
}

function getCDN() {
  return cdnName;
}

function getUrl(url) {
  try {
    const uri = new URL(url);
    if (uri.protocol === 'dist:') {
      url = url.substring(uri.protocol.length + 2);
      if (url.substring(0, 8) === '../dist/') {
        url = distScheme + url;
      } else {
        url = defScheme + url;
      }
      return url;
    }

    if (uri.protocol === 'file:') {
      if (uriPath) {
        const preUri = new URL(uriPath);
        url = preUri.origin + '/' + url.substring(8);
        return url;
      }
    }
  } catch {
    if (uriPath) {
      const prefix = './';
      if (url.substring(0, prefix.length) === prefix) {
        url = url.substring(prefix.length);
      }
      url = uriPath + url;
    }
  }
  return url;
}

function filterUrl(native, url) {
  if (native || url.startsWith('http://') || url.startsWith('https://') || url.startsWith(scheme)) {
    return url;
  }

  if (url.startsWith('../dist/')) {
    return distScheme + url;
  }

  return defScheme + url;
}

function getModule(native, name, src) {
  if (typeof src === 'undefined' || !src || src === 'default') {
    src = getCDN();
  }

  if (cdnSrc.hasOwnProperty(src)) {
    const cdn = cdnSrc[src];
    const module = cdn[name];
    if (module) {
      if (typeof module === 'string') {
        return { src: filterUrl(native, module) };
      }

      if (module.src) {
        module.src = filterUrl(native, module.src)
      }
      if (module.module) {
        module.module = filterUrl(native, module.module);
      }
      if (module.css) {
        if (typeof module.css === 'string') {
          module.css = filterUrl(native, module.css);
        } else {
          for (const [k, v] of Object.entries(module.css)) {
            module.css[k] = filterUrl(native, v);
          }
        }
      }
      if (module.skin) {
        if (typeof module.skin === 'string') {
          module.skin = filterUrl(native, module.skin);
        } else {
          for (const [k, v] of Object.entries(module.skin)) {
            module.skin[k] = filterUrl(native, v);
          }
        }
      }
      if (module.plugins) {
        for (const [k, v] of Object.entries(module.plugins)) {
          if (typeof v === 'string') {
            module.plugins[k] = filterUrl(native, v);
            continue;
          }
          if (v.src) {
            module.plugins[k].src = filterUrl(native, v.src)
          }
          if (v.module) {
            module.plugins[k].module = filterUrl(native, v.module);
          }
        }
      }
      if (module.src || module.module) {
        return module;
      }
    }
  }
}

function loadLinkStyle(name, css) {
  const id = 'css-' + name.toLowerCase();
  let link = document.getElementById(id);
  var head = document.head || document.getElementsByTagName('head')[0];
  if (link) {
    link.remove();
  }
  link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = css;
  head.appendChild(link);
}

function loadLinkScript(name, script) {
  return new Promise((resolve) => {
    const lowerName = name.toLowerCase();
    const id = 'script-' + lowerName;
    let element = document.getElementById(id);
    if (!element) {
      var head = document.head || document.getElementsByTagName('head')[0];
      var s = document.createElement('script');
      s.id = id;
      if (typeof script === 'string') {
        s.src = script;
      } else {
        if (script.type) {
          s.type = script.type;
          if (script.type === 'module' && script.module) {
            const objName = lowerName.replaceAll(/[-@+.]/g, '');
            s.textContent = `
import ${objName} from '${script.module}';
if (!('${name}' in window)) {
  if ('default' in ${objName} && ${objName}['default']) {
    window['${name}'] = ${objName}['default']
  } else {
    window['${name}'] = ${objName};
  }
}
const s = document.querySelector('#${id}');
if (s && s.onload) {
  s.onload();
}
`;
          }
        }
        if (script.src) {
          s.src = script.src;
        }
      }
      s.onload = () => {
        resolve(name);
      };
      head.appendChild(s);
      return;
    }

    resolve(name);
  })
}

function loadModule(name, module, resolve) {
  const lowerName = name.toLowerCase();
  const id = 'script-' + lowerName;
  let script = document.getElementById(id);
  if (script) {
    return resolve(name);
  }

  const head = document.head || document.getElementsByTagName('head')[0];
  script = document.createElement('script');
  script.id = id;
  let importModule = false;
  if (module.type) {
    script.type = module.type;
    if (module.type === 'module' && module.module) {
      importModule = true;
      let importPluginsCode = '';
      let namespaces = '';
      const pluginnames = [];
      script.onloaded = (args) => {
        resolve(!args ? name : args);
      }
      for (const [k, v] of Object.entries(module.plugins)) {
        pluginnames.push(`'${k}'`);
        const kName = k.toLowerCase().replaceAll(/[-@+.]/g, '');
        importPluginsCode += `import ${kName} from '${v}';
if (!('${k}' in window)) {
  if ('default' in ${kName} && ${kName}['default']) {
    window['${k}'] = ${kName}['default']
  } else {
    window['${k}'] = ${kName};
  }
}
`;
      }
      if (pluginnames.length > 0) {
        namespaces = `['${name}',${pluginnames.join(',')}]`;
      }
      const objName = lowerName.replaceAll(/[-@+.]/g, '');
      script.textContent = `
import ${objName} from '${module.module}';
if (!('${name}' in window)) {
  if ('default' in ${objName} && ${objName}['default']) {
    window['${name}'] = ${objName}['default']
  } else {
    window['${name}'] = ${objName};
  }
}
${importPluginsCode}
const s = document.querySelector('#${id}');
if (s && s.onloaded) {
  s.onloaded(${namespaces});
}
`;
    }
  }
  if (module.src) {
    script.src = module.src;
  }
  if (module.defer) {
    script.defer = true;
  }

  if (!importModule) {
    if (module.plugins) {
      script.onload = () => {
        const promiseArray = [];
        promiseArray.push(new Promise((r) => {
          r(name);
        }));
        for (const [k, v] of Object.entries(module.plugins)) {
          promiseArray.push(loadLinkScript(k, v));
        }
        Promise.all(promiseArray).then((results) => {
          resolve(results);
        });
      };
    } else {
      script.onload = () => {
        resolve(name);
      };
    }
  }
  head.appendChild(script);
}

function loadScript(name, src, cssName, skinName) {
  return new Promise((resolve, reject) => {
    if (!name || typeof document === 'undefined') {
      return reject('Args is invaild!');
    }

    if (!src) {
      src = '';
    }

    const module = getModule(false, name, src);
    if (!module) {
      return reject(name + ' script source invaild!');
    }

    if (module.css) {
      if (typeof module.css === 'string') {
        loadLinkStyle(name, module.css);
      } else if (cssName && cssName.length > 0 && cssName in module.css) {
        loadLinkStyle(name, module.css[cssName]);
      }
    }
    if (module.skin) {
      let skin = '';
      if (typeof module.skin === 'string') {
        skin = module.skin;
        skinName = 'skin';
      } else if (skinName && skinName.length > 0 && skinName in module.skin) {
        skin = module.skin[skinName];
      }
      if (skin.length > 0) {
        loadLinkScript(name + '-' + skinName, skin).then(() => {
          loadModule(name, module, resolve);
        });
        return;
      }
    }

    loadModule(name, module, resolve);
  });
}

function unloadScript(name, skinName) {
  const elements = document.querySelectorAll(`[id^="script-${name.toLowerCase()}"]`);
  if (elements) {
    elements.forEach((e) => { e.remove(); });
  }
  if (!skinName || !skinName.length) {
    skinName = 'skin';
  }
  const e = document.getElementById('script-' + name.toLowerCase() + '-' + skinName.toLowerCase());
  if (e) {
    e.remove();
  }
  unloadStyleSheet(name);
}

function loadStyleSheet(name, src, cssName) {
  if (!name || typeof document === 'undefined') {
    return '';
  }

  const module = getModule(false, name, src);
  if (!module || !module.css) {
    return '';
  }

  let css = '';
  if (typeof module.css === 'string') {
    css = module.css;
  } else if (cssName && cssName in module.css) {
    css = module.css[cssName];
  }
  if (css.length > 0) {
    loadLinkStyle(name, module.css[cssName]);
  }
  return src === 'local' ? '' : css;
}

function unloadStyleSheet(name) {
  const e = document.getElementById('css-' + name.toLowerCase());
  if (e) {
    e.remove();
  }
}

function getCSS(native, name, src, cssName) {
  const module = getModule(native, name, src, cssName);
  if (module) return module.css;
}

function getSrc(native, name, src) {
  const module = getModule(native, name, src);
  if (module) return module.src;
}

const cdnjs = {
  setCDN,
  getCDN,
  getCSS,
  getSrc,
  getUrl,
  getModule,
  loadScript,
  unloadScript,
  loadStyleSheet,
  unloadStyleSheet
};

export default cdnjs;
