import fs from 'fs';
import path from 'path';

// 帮助寻找node_modules里的包
import resolve from 'rollup-plugin-node-resolve';
// rollup 的 babel 插件，ES6转ES5
import babel from 'rollup-plugin-babel';
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

const isMinBuild = process.env.MIN === 'true';
const isFormatCJS = process.env.TARGET === 'cjs';
const isDemoBuild = process.env.DEMO === 'true';
const isWithBrotli = process.env.BROTLI === 'true';
const version = process.env.VERSION || pkg.version;
const banner =
  '/*!\n' +
  ` * showdowns.js v${version}\n` +
  ` * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>\n` +
  ' * Released under the MIT License.\n' +
  ' */';

// 处理import '.wasm'文件的rollup plugin
const wasm = function() {
  return {
    name: 'wasm',
    load(id) {
      if (/\.wasm$/.test(id)) {
        return new Promise((res, reject) => {
          fs.readFile(id, (error, buffer) => {
            if (error != null) {
              reject(error);
            }
            res(buffer.toString('binary'));
          });
        });
      }
      return null;
    },
    transform(code, id) {
      if (code && /\.wasm$/.test(id)) {
        const src = Buffer.from(code, 'binary').toString('base64');
        const wasm_module_dir =
          path.relative(path.dirname(id), path.join(__dirname, 'src/utils')) ||
          '.';
        return {
          code: `import wasmModule from '${wasm_module_dir}/wasm-module.js'
                export default function(imports){ return wasmModule(false, '${src}', imports) }`,
          map: null
        };
      }
    }
  };
};

const config = {
  input: isWithBrotli ? 'src/showdowns.br.js' : 'src/showdowns.js',
  output: {
    file: pkg.main.replace('.min.js', isWithBrotli ? '.br.js' : '.js'),
    // 输出CJS格式，NODE.js模块规范通用
    format: 'cjs',
    // 打包后的全局变量，如浏览器端 window.showdowns;
    name: 'showdowns',
    sourcemap: true,
    banner: banner,
    globals: {
      raphael: 'Raphael',
      'flowchart.js': 'flowchart',
      'viz.js': 'Viz',
      mermaid: 'mermaid',
      katex: 'katex',
      wavedrom: 'WaveDrom'
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
    'wavedrom'
  ],
  plugins: [
    json(),
    postcss({
      use: isFormatCJS ? ['nmcss', 'less'] : ['less'],
      extract: true,
      minimize: isMinBuild,
      extensions: ['.css', '.less'],
      plugins: [autoprefixer(), simplevars(), nested()],
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
    }),
    isWithBrotli && wasm()
  ]
};

if (isFormatCJS) {
  config.external.push(
    'showdown',
    'zlib',
    'katex/dist/contrib/auto-render',
    'showdown-katex/src/asciimath-to-tex'
  );
} else {
  config.output.file = pkg.browser.replace(
    '.min.js',
    isWithBrotli ? '.br.js' : '.js'
  );
  // 输出UMD格式，各种模块规范通用
  config.output.format = 'umd';
  config.plugins.push(
    babel({
      exclude: '**/node_modules/**'
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
  config.output.file = config.output.file.replace('.js', '.min.js');
  config.plugins.push(
    terser({
      include: [/^.+\.min\.js$/],
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true
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
          // railroad-diagrams https://github.com/tabatkins/railroad-diagrams
          {
            src: 'node_modules/railroad-diagrams/railroad-diagrams.js',
            dest: 'docs/dist/diagrams/railroad'
          },
          {
            src: 'node_modules/railroad-diagrams/railroad-diagrams.css',
            dest: 'docs/dist/diagrams/railroad'
          },
          {
            src: 'node_modules/railroad-diagrams/package.json',
            dest: 'docs/dist/diagrams/railroad'
          },
          {
            src: 'node_modules/railroad-diagrams/README.md',
            dest: 'docs/dist/diagrams/railroad'
          },
          // @rokt33r/js-sequence-diagrams https://github.com/bramp/js-sequence-diagrams
          {
            src:
              'node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.*',
            dest: 'docs/dist/diagrams/sequence/dist'
          },
          {
            src:
              'node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram.*',
            dest: 'docs/dist/diagrams/sequence/dist'
          },
          {
            src: 'node_modules/@rokt33r/js-sequence-diagrams/dist/danielbd.*',
            dest: 'docs/dist/diagrams/sequence/dist'
          },
          {
            src: 'node_modules/@rokt33r/js-sequence-diagrams/package.json',
            dest: 'docs/dist/diagrams/sequence'
          },
          {
            src: 'node_modules/@rokt33r/js-sequence-diagrams/README.md',
            dest: 'docs/dist/diagrams/sequence'
          },
          {
            src: 'node_modules/@rokt33r/js-sequence-diagrams/LICENCE',
            dest: 'docs/dist/diagrams/sequence'
          },
          { src: 'public/*', dest: 'docs' },
          { src: 'demo', dest: 'docs' },
          { src: 'favicon.ico', dest: 'docs' }
        ]
      })
    );
  } else {
    config.plugins.push(
      copy({
        targets: [
          // railroad-diagrams https://github.com/tabatkins/railroad-diagrams
          {
            src: 'node_modules/railroad-diagrams/railroad-diagrams.js',
            dest: 'dist/diagrams/railroad'
          },
          {
            src: 'node_modules/railroad-diagrams/railroad-diagrams.css',
            dest: 'dist/diagrams/railroad'
          },
          {
            src: 'node_modules/railroad-diagrams/package.json',
            dest: 'dist/diagrams/railroad'
          },
          {
            src: 'node_modules/railroad-diagrams/README.md',
            dest: 'dist/diagrams/railroad'
          },
          // @rokt33r/js-sequence-diagrams https://github.com/bramp/js-sequence-diagrams
          {
            src:
              'node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram-min.*',
            dest: 'dist/diagrams/sequence/dist'
          },
          {
            src:
              'node_modules/@rokt33r/js-sequence-diagrams/dist/sequence-diagram.*',
            dest: 'dist/diagrams/sequence/dist'
          },
          {
            src: 'node_modules/@rokt33r/js-sequence-diagrams/dist/danielbd.*',
            dest: 'dist/diagrams/sequence/dist'
          },
          {
            src: 'node_modules/@rokt33r/js-sequence-diagrams/package.json',
            dest: 'dist/diagrams/sequence'
          },
          {
            src: 'node_modules/@rokt33r/js-sequence-diagrams/README.md',
            dest: 'dist/diagrams/sequence'
          },
          {
            src: 'node_modules/@rokt33r/js-sequence-diagrams/LICENCE',
            dest: 'dist/diagrams/sequence'
          },
          // Publish common dist resource
          { src: 'public/dist/*', dest: 'dist' }
        ]
      })
    );
  }
}

export default config;
