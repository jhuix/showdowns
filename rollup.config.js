import path from 'path';

import resolve from 'rollup-plugin-node-resolve'; // 帮助寻找node_modules里的包
import babel from 'rollup-plugin-babel'; // rollup 的 babel 插件，ES6转ES5
import commonjs from 'rollup-plugin-commonjs'; // 将非ES6语法的包转为ES6可用
import { terser } from 'rollup-plugin-terser'; // 压缩包
import json from 'rollup-plugin-json'; // json
//import url from 'rollup-plugin-url'; // url
import builtins from 'rollup-plugin-node-builtins'; //集成zlib crypto等库
import globals from 'rollup-plugin-node-globals';
//import replace from "rollup-plugin-replace"; // 替换待打包文件里的一些变量，如 process在浏览器端是不存在的，需要被替换

// 新增 postcss plugins
import postcss from 'rollup-plugin-postcss'; // css
import autoprefixer from 'autoprefixer';
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import url from 'postcss-url'; // url
import copy from 'rollup-plugin-copy';

import pkg from './package.json';

const isMinBuild = process.env.MIN === 'true';
const isFormatCJS = process.env.TARGET === 'cjs';
const version = process.env.VERSION || pkg.version;
const banner =
  '/*!\n' +
  ` * showdowns.js v${version}\n` +
  ` * Copyright (c) 2019-present, Jhuix (jhuix0117@gmail.com)\n` +
  ' * Released under the MIT License.\n' +
  ' */';

const config = {
  input: 'src/showdowns.js',
  output: {
    file: pkg.main,
    format: 'umd', // 输出 ＵＭＤ格式，各种模块规范通用
    name: 'showdowns', // 打包后的全局变量，如浏览器端 window.ReactRedux;
    sourcemap: true,
    banner: banner,
    globals: {
      showdown: 'showdown',
      showdowns: 'showdowns'
    }
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
      plugins: [
        url({
          limit: 0,
          url: 'copy',
          basePath: path.join(__dirname, 'node_modules/katex/dist'),
          assetsPath: './',
          useHash: false
        }),
        autoprefixer(),
        simplevars(),
        nested()
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
    }),
    babel({
      exclude: '**/node_modules/**'
    })
  ]
};

if (isFormatCJS) {
  // node environment
  config.output.file = pkg.moduleMain;
  config.output.format = 'cjs';
  config.external.push('mermaid', 'showdown', 'showdown-katex', 'zlib');
} else {
  // web enviroment
  config.output.globals = {
    showdown: 'showdown'
  };
  config.plugins.push(
    resolve({
      //browser: true,
      preferBuiltins: true,
      customResolveOptions: {
        // 将自定义选项传递给解析插件
        moduleDirectory: 'node_modules'
      }
    }),
    commonjs({
      include: ['node_modules/**']
    }),
    /*
    // replace({
    //   "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`
    // }),
    */
    globals(),
    builtins(),
    copy({
      targets: [{ src: 'fonts', dest: 'dist' }]
    })
  );
}

if (isMinBuild) {
  config.output.file = config.output.file.replace('.js', '.min.js');
  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true
      }
    })
  );
}

export default config;