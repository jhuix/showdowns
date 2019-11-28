/*
 * @Description: js-sequence-diagrams showdown extension for markdown
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-09-01 11:19:37
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-10-27 19:02:07
 */

'use strict';

import cdnjs from './cdn';

// js-sequence-diagrams can create a global object named Diagrams of window,
// To be compatible with railroad diagrams extension that also has window.Diagram object,
// You need to save the original Diagrams object of railroad diagrams extension here.
let diagram;
if (typeof window !== 'undefined' && window.Diagram) {
  diagram = window.Diagram;
  if (window.Diagram['Signal']) {
    var sequence = window.Diagram;
  }
}

const themes = ['simple', 'hand'];
if (typeof sequence === 'undefined' && typeof window !== 'undefined') {
  var sequence = window.SequenceJS;
}

function hasSequence() {
  return !!sequence;
}

/**
 * render sequence graphs
 */
function renderSequence(element, sync) {
  const code = element.textContent.trim();
  const name = element.className;
  const langattr = element.dataset.lang;
  const id = 'sequence-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  element.id = id;
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    Promise.resolve(id).then(elementid => {
      // dispatch sequence custom event
      window.dispatchEvent(
        new CustomEvent('sequence', {
          detail: {
            id: elementid,
            className: name,
            data: code,
            langattr: langattr
          }
        })
      );
    });
  } else {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      // dispatch sequence custom event
      window.dispatchEvent(
        new CustomEvent('sequence', {
          detail: {
            id: id,
            className: name,
            data: code,
            langattr: langattr
          }
        })
      );
    } else {
      new require('events').EventEmitter().emit('sequence', [
        {
          detail: {
            id: id,
            className: name,
            data: code,
            langattr: langattr
          }
        }
      ]);
    }
  }
}

// <div class="sequence"></div>
function renderSequenceElements(elements) {
  if (!elements.length) {
    return false;
  }

  const sync = hasSequence();
  if (typeof window !== 'undefined') {
    if (!sync) {
      cdnjs.loadStyleSheet('sequenceCSS');
      cdnjs
        .loadScript('WebFont')
        .then(() => {
          return cdnjs.loadScript('Snap');
        })
        .then(() => {
          return cdnjs.loadScript('underscore');
        })
        .then(() => {
          // You need to save the original Diagrams object of railroad diagrams extension here.
          if (!diagram && window['Diagram']) {
            diagram = window['Diagram'];
          }
          return cdnjs.loadScript('sequence');
        })
        .then(() => {
          sequence = window['Diagram'];
          window.SequenceJS = sequence;
          // You need to replace the original Diagrams object of railroad diagrams extension here.
          if (diagram) {
            window['Diagram'] = diagram;
          }
        });
    }
  }

  elements.forEach(element => {
    renderSequence(element, sync);
  });
  return true;
}

function onRenderSequence(element) {
  Promise.resolve({ canRender: hasSequence(), element: element }).then(res => {
    if (res.canRender) {
      const id = res.element.id;
      const name = res.element.className;
      const data = res.element.data;
      let theme = 'hand';
      const langattr = res.element.langattr;
      if (langattr) {
        const obj = JSON.parse(langattr);
        if (obj && obj.theme && themes.indexOf(obj.theme) != -1) {
          theme = obj.theme;
        }
      }
      let el = window.document.getElementById(id);
      if (el) {
        el.parentNode.outerHTML = `<div id="${id}" class="${name}"></div>`;
        el = window.document.getElementById(id);
        const d = sequence.parse(data);
        const options = { theme: theme };
        d.drawSVG(el ? el : id, options);
      }
    } else {
      setTimeout(() => {
        onRenderSequence(res.element);
      }, 100);
    }
  });
}

function showdownSequence() {
  const parser = new DOMParser();

  if (typeof window !== 'undefined' && window.dispatchEvent) {
    // Listen sequence custom event
    window.addEventListener('sequence', event => {
      if (event.detail) {
        onRenderSequence(event.detail);
      }
    });
  }

  return [
    {
      type: 'output',
      filter: function(html) {
        // parse html
        const doc = parser.parseFromString(html, 'text/html');
        const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;

        // find the sequence in code blocks
        const elements = wrapper.querySelectorAll(
          'code.sequence.language-sequence'
        );
        if (!renderSequenceElements(elements)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownSequence;
