/*
 * Copyright (c) 2024-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown echarts extension for markdown
 */
'use strict';

const extName = "echarts";

if (typeof window === 'undefined') {
  throw Error(`The showdown ${extName} extension can only be used in browser environment!`);
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

if (typeof echarts === 'undefined') {
  var echarts = window.echarts || undefined;
}

function hasEcharts() {
  return !!echarts;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasEcharts();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      cdnjs.loadScript(extName).then(name => {
        echarts = utils.interopDefault(window[name]);
      });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasEcharts()) return;
  cdnjs.unloadScript(extName);
  echarts = null;
  window.echarts = null;
  dync = false;
}

function onRenderEcharts(resolve, res) {
  if (hasEcharts()) {
    const id = res.id;
    const name = res.className;
    const node = res.element.parentNode;
    // // 在 SSR 模式下第一个参数不需要再传入 DOM 对象
    // let chart = echarts.init(null, null, {
    //   renderer: 'svg', // 必须使用 SVG 模式
    //   ssr: true,
    //   width: res.config.width, // 需要指明高和宽
    //   height: res.config.height
    // });
    // // 像正常使用一样 setOption
    // const option = JSON.parse(data);
    // chart.setOption(option);
    // // 输出字符串
    // const svg = chart.renderToSVGString();
    // // 如果不再需要图表，调用 dispose 以释放内存
    // chart.dispose();
    // chart = null;
    node.outerHTML = `<div id="${id}" class="${name}"></div>`;
    return resolve(true);
  }

  setTimeout(() => {
    onRenderEcharts(resolve, res);
  }, 20);
}


/**
 * render echarts graphs
 */
function renderEcharts(element, scripts, config) {
  const meta = utils.createElementMeta(extName, element);
  if (!meta) {
    return Promise.resolve(false);
  }

  config = JSON.stringify({ ...config, ssr: false });
  const data = JSON.stringify(JSON.parse(meta.data));
  const script = {
    id: meta.id,
    code: `(function() {
        let el = document.getElementById('${meta.id}');
        if (el){
          let config = JSON.parse('${config}');
          let chart = echarts.init(el, null, config);
          let option = JSON.parse('${data}');
          chart.setOption(option);
        }
      })();`
  }
  scripts.push(script);
  return new Promise(resolve => {
    onRenderEcharts(resolve, meta);
  });
}

// <div class="echarts"></div>
function renderEchartsElements(elements, scripts, config) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderEcharts(element, scripts, config));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

// echarts default config
const getConfig = (config = {}) => ({
  renderer: 'svg',
  ssr: false,
  width: 400,
  height: 300,
  tooltip: {
    show: true
  },
  animation: true,
  ...config
});

function showdownEcharts(userConfig) {
  const config = getConfig(userConfig);
  return [
    {
      type: 'output',
      config: config,
      filter: function (obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the echarts in code blocks
        const elements = wrapper.querySelectorAll(`code.${extName}.language-${extName}`);
        if (!elements.length) {
          return false;
        }

        console.log(format(`Begin render ${extName} elements.`));
        return renderEchartsElements(elements, obj.scripts, this.config).then(() => {
          console.log(format(`End render ${extName} elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownEcharts;
