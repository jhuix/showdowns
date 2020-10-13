/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
import path from 'path';

// 帮助寻找node_modules里的包
import resolve from 'rollup-plugin-node-resolve';
// rollup 的 babel 插件，ES6转ES5
import babel from '@rollup/plugin-babel';
// 将非ES6语法的包转为ES6可用
import commonjs from 'rollup-plugin-commonjs';
// 混淆JS文件
import { terser } from 'rollup-plugin-terser';
// 集成zlib crypto等库
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

//postcss plugins
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import banner from 'postcss-banner';

const isMinBuild = process.env.MIN === 'true';
const isFormatCJS = process.env.TARGET === 'cjs';
const isDemoBuild = process.env.DEMO === 'true';
const version = process.env.VERSION || pkg.version;

const out_file = (isFormatCJS ? pkg.module : pkg.main).replace(
  '.min.js',
  isMinBuild ? '.min.js' : '.js'
);
const filename = path.basename(out_file);

const jsbanner =
  '/*!\n' +
  ` * ${filename} v${version}\n` +
  ` * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>\n` +
  ' * Released under the MIT License.\n' +
  ' */';
const cssbanner =
  `css of showdowns v${version}\n` +
  'Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>\n' +
  'Released under the MIT License.';

const config = {
  input: 'src/showdowns.js',
  output: {
    file: out_file,
    // 输出CJS格式，NODE.js模块规范通用;
    // 输出UMD格式，各种模块规范通用.
    format: isFormatCJS ? 'cjs' : 'umd',
    // 打包后的全局变量，如浏览器端 window.showdowns;
    name: 'showdowns',
    sourcemap: true,
    banner: jsbanner,
    globals: {
      raphael: 'Raphael',
      'flowchart.js': 'flowchart',
      'viz.js': 'Viz',
      mermaid: 'mermaid',
      katex: 'katex',
      wavedrom: 'WaveDrom',
      vega: 'vega',
      'vega-lite': 'vegaLite',
      'vega-embed': 'vegaEmbed',
      '@rokt33r/js-sequence-diagrams': 'Diagram',
      'katex/dist/contrib/auto-render': 'renderMathInElement'
    }
  },
  onwarn: (msg, warn) => {
    if (!/Circular/.test(msg)) {
      warn(msg);
    }
  },
  // 作用：指出应将哪些模块视为外部模块，否则会被打包进最终的代码里
  external: [
    'mermaid',
    'katex',
    'raphael',
    'flowchart.js',
    'viz.js',
    'wavedrom',
    'vega',
    'vega-lite',
    'vega-embed',
    '@rokt33r/js-sequence-diagrams',
    'katex/dist/contrib/auto-render'
  ],
  plugins: [
    json(),
    postcss({
      use: isFormatCJS ? ['nmcss', 'less'] : ['less'],
      extract: true,
      minimize: isMinBuild,
      extensions: ['.css', '.less'],
      plugins: [
        autoprefixer(),
        simplevars(),
        nested(),
        banner({
          banner: cssbanner,
          important: true
        })
      ],
      loaders: [
        {
          //生成CJS格式时，不处理node_modules目录下的相关CSS文件
          name: 'nmcss',
          test: /.*?(\\|\/)node_modules(\\|\/).*?\.css$/,
          process: (context, payload) => {
            return new Promise((resolve, reject) => {
              resolve({ code: '' });
            });
          }
        }
      ]
    })
  ]
};

if (isFormatCJS) {
  config.external.push('showdown', 'zlib', 'showdown-katex/src/asciimath-to-tex');
} else {
  config.plugins.push(
    babel({
      exclude: '**/node_modules/**',
      babelHelpers: 'bundled'
    }),
    resolve({
      browser: true,
      preferBuiltins: true,
      customResolveOptions: {
        // 将自定义选项传递给解析插件
        moduleDirectory: 'node_modules'
      }
    }),
    commonjs({
      include: ['node_modules/**']
    }),
    globals(),
    builtins()
  );
}

if (isMinBuild) {
  config.plugins.push(
    terser({
      include: [/^.+\.min\.js$/],
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        drop_console: !isDemoBuild
      }
    })
  );
}

if (!isFormatCJS) {
  if (isDemoBuild) {
    config.output.file = 'docs/' + config.output.file;
    config.plugins.push(
      copy({
        targets: [
          { src: 'public/*', dest: 'docs' },
          { src: 'demo', dest: 'docs' },
          { src: 'logo.png', dest: 'docs' },
          { src: 'favicon.ico', dest: 'docs' }
        ]
      })
    );
  } else {
    config.plugins.push(
      copy({
        targets: [
          // Publish common dist resource
          { src: 'public/dist/*', dest: 'dist' }
        ]
      })
    );
  }
}

export default config;
