/*
 * @Description: showdown mermaid extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
 */

"use strict";

import mermaid from "mermaid";

/**
 * render mermaid graphs
 */
function renderMermaid(element) {
  const code = element.textContent.trim();
  const name = element.className;
  return new Promise((resolve, reject) => {
    try {
      const svgId = "mermaid-" + Date.now();
      mermaid.render(svgId, code, svgCode => {
        element.parentNode.outerHTML = `<div class="${name}">${svgCode}</div>`;
      });
    } catch (error) {
      element.parentNode.outerHTML = `<div class="${name}"><pre class="language-text">${error.str.toString()}</pre></div>`;
    }
    return resolve();
  });
}

// <div class="mermaid"></div>
function renderMermaidElements(elements) {
  if (!elements.length) {
    return false;
  }
  elements.forEach(element => {
    renderMermaid(element);
  });
  return true;
}

// mermaid default config
const getConfig = (config = {}) => ({
  theme: "forest",
  logLevel: 3,
  startOnLoad: false,
  arrowMarkerAbsolute: false,
  flowchart: {
    curve: "basis"
  },
  gantt: {
    axisFormat: "%m/%d/%Y"
  },
  sequence: {
    actorMargin: 50
  },
  ...config
});

function showdownMermaid(userConfig) {
  const parser = new DOMParser();
  const config = getConfig(userConfig);
  mermaid.initialize(config);

  return [
    {
      type: "output",
      filter: function(html) {
        // parse html
        const doc = parser.parseFromString(html, "text/html");
        const wrapper = typeof doc.body !== "undefined" ? doc.body : doc;

        // find the mermaid in code blocks
        const elements = wrapper.querySelectorAll(
          "code.mermaid.language-mermaid"
        );

        if (!renderMermaidElements(elements)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownMermaid;
