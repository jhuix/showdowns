import fs from 'fs';
import path from 'path';

import resolve from 'rollup-plugin-node-resolve'; // 帮助寻找node_modules里的包
import babel from 'rollup-plugin-babel'; // rollup 的 babel 插件，ES6转ES5
import commonjs from 'rollup-plugin-commonjs'; // 将非ES6语法的包转为ES6可用
import { terser } from 'rollup-plugin-terser'; // 压缩包
import json from 'rollup-plugin-json'; // json
import builtins from 'rollup-plugin-node-builtins'; //集成zlib crypto等库
import globals from 'rollup-plugin-node-globals';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

//postcss plugins
import postcss from 'rollup-plugin-postcss'; // css
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
        return `import wasmModule from '${wasm_module_dir}/wasm-module.js'
                export default function(imports){ return wasmModule(false, '${src}', imports) }`;
      }
    }
  };
};

const config = {
  input: isWithBrotli ? 'src/showdowns.br.js' : 'src/showdowns.js',
  output: {
    file: pkg.main.replace('.min.js', isWithBrotli ? '.br.js' : '.js'),
    format: 'cjs', // 输出CJS格式，NODE.js模块规范通用
    name: 'showdowns', // 打包后的全局变量，如浏览器端 window.ReactRedux;
    sourcemap: true,
    banner: banner
  },
  onwarn: (msg, warn) => {
    if (!/Circular/.test(msg)) {
      warn(msg);
    }
  },
  external: [], // 作用：指出应将哪些模块视为外部模块，否则会被打包进最终的代码里
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
  config.external.push('mermaid', 'showdown', 'showdown-katex', 'zlib');
} else {
  config.output.file = pkg.browser.replace(
    '.min.js',
    isWithBrotli ? '.br.js' : '.js'
  );
  config.output.format = 'umd'; //输出UMD格式，各种模块规范通用
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
          { src: 'node_modules/katex/dist/fonts', dest: 'docs/dist' },
          { src: 'node_modules/katex/dist/katex.min.css', dest: 'docs/dist' },
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
          { src: 'node_modules/katex/dist/fonts', dest: 'dist' },
          { src: 'node_modules/katex/dist/katex.min.css', dest: 'dist' }
        ]
      })
    );
  }
}

export default config;
