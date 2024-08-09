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

function onRenderEcharts(resolve, meta) {
  if (hasEcharts()) {
    const id = meta.id;
    const container = meta.container;
    const name = meta.className;
    const node = meta.element.parentNode;
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
    if (!meta.lang) {
      meta.lang = {width:'400px', height:'300px'};
    } else {
      if (!meta.lang.width) meta.lang.width = '400px';
      if (!meta.lang.height) meta.lang.height = '300px';
    }
    const style = `width:${meta.lang.width}; height:${meta.lang.height};`;    
    node.outerHTML = `<div id="${container}" class="${name}" style="${style}"><div id="${id}" style="width:100%;height:100%;display:inline-block"></div></div>`;
    return resolve(true);
  }

  setTimeout(() => {
    onRenderEcharts(resolve, meta);
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

  config = { ...config, ssr: false };
  config = JSON.stringify(config);
  let code = `(function() {
    let el = document.getElementById('${meta.id}');
    if (el){
      let chart = echarts.getInstanceByDom(el);
      if (!chart) {
        el.innerHTML = '';
      }
      let config = JSON.parse('${config}');
      chart = echarts.init(el, null, config);
  `;
  
  if (meta.lang && meta.lang.type && typeof meta.lang.type === 'string'
     && meta.lang.type.toLowerCase() == 'javascript') {
    code += '    ' + meta.data;
  } else { // JSON string
    const data = JSON.stringify(JSON.parse(meta.data));
    code += `    const option = JSON.parse(\`${data}\`);`;
  }
  code += `
      chart.setOption(option);
    }
  })();`
  const script = {
    id: meta.container,
    code: code
  }
  scripts.push(script);
  return new Promise(resolve => {
    onRenderEcharts(resolve, meta);
  });
}

// <div class="echarts"></div>
function renderEchartsElements(elements, scripts, config) {
  const script = {
    outer: [
      {
        name: extName,
        src: cdnjs.getSrc(extName,'jsdelivr')
      }
    ],
    inner: []
  };
  scripts.push(script); 
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderEcharts(element, script.inner, config));
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
  tooltip: {
    show: true
  },
  animation: true,
  useDirtyRect: false,
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
