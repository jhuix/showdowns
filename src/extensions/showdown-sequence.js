/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown sequence extension for markdown
 */
'use strict';

if (typeof window === 'undefined') {
  throw Error('The showdown sequence extension can only be used in browser environment!');
}

import cdnjs from './cdn';
import utils from './utils';

if (typeof Raphael === 'undefined') {
  var Raphael = window.Raphael || undefined;
}

// js-sequence-diagrams can create a global object named Diagrams of window,
// To be compatible with railroad diagrams extension that also has window.Diagram object,
// You need to save the original Diagrams object of railroad diagrams extension here.
let diagram;
if (typeof window !== 'undefined') {
  if (window.Diagram) {
    diagram = window.Diagram;
    if (window.Diagram['Signal']) {
      var sequence = window.Diagram;
    }
  }
}

const themes = ['simple', 'hand'];
if (typeof sequence === 'undefined' && typeof window !== 'undefined') {
  var sequence = window.SequenceJS;
}

function hasRaphael() {
  return !!Raphael
}

function hasSequence() {
  return hasRaphael() && !!sequence;
}

function hasFlowchart() {
  return hasRaphael() && !!window.flowchart;
}

let dync = false;
const cssCdnName = 'sequenceCSS';
function dyncLoadScript() {
  const sync = hasSequence();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) { 
      dync = true;
      cdnjs.loadStyleSheet(cssCdnName);
      cdnjs
        .loadScript('WebFont')
        .then(() => {
          if (!hasRaphael()) {
            return cdnjs.loadScript('Raphael');
          }

          return 'Raphael';
        })
        .then((name) => {
          Raphael = utils.interopDefault(window[name]);
          return cdnjs.loadScript('Snap');
        })
        .then(() => {
          return cdnjs.loadScript('underscore');
        })
        .then(() => {
          // You need to save the original Diagrams object of sequence diagrams extension here.
          if (!diagram && window['Diagram']) {
            diagram = window['Diagram'];
          }
          return cdnjs.loadScript('sequence');
        })
        .then(() => {
          sequence = window['Diagram'];
          window.SequenceJS = sequence;
          // You need to replace the original Diagrams object of sequence diagrams extension here.
          if (diagram) {
            window['Diagram'] = diagram;
          }
        });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasSequence()) return;
  cdnjs.unloadScript('sequence');
  cdnjs.unloadScript('underscore');
  cdnjs.unloadScript('Snap');
  cdnjs.unloadScript('WebFont');
  cdnjs.unloadStyleSheet(cssCdnName);
  diagram = null;
  sequence = null;
  window.Diagram = null;
  window.SequenceJS = null;
  if (!hasFlowchart()) {
    cdnjs.unloadScript('Raphael');
    const es = document.getElementsByTagName('i');
    if (es && es.length > 0) {
      const body = document.body;
      for (let i = 0; i < es.length; i++) {
        const e = es[i];
        if (e.title && e.title === 'Raphaël Colour Picker') {
          body.removeChild(e);
        }
      }
    }
    Raphael = null;
    window.Raphael = null;
  }  
  dync = false;  
}

/**
 * render sequence graphs
 */
function renderSequence(element) {
  const langattr = element.dataset.lang;
  const langobj = langattr ? JSON.parse(langattr) : null;
  let diagramClass = '';
  if (langobj) {
    if (
      (typeof langobj.codeblock === 'boolean' && langobj.codeblock) ||
      (typeof langobj.codeblock === 'string' && langobj.codeblock.toLowerCase() === 'true')
    ) {
      return;
    }

    if (langobj.align) {
      //default left
      if (langobj.align === 'center') {
        diagramClass = 'diagram-center';
      } else if (langobj.align === 'right') {
        diagramClass = 'diagram-right';
      }
    }
  }
  const sync = dyncLoadScript();
  const cssLink = cdnjs.getSrc(cssCdnName);
  const code = element.textContent.trim();
  const name = 'js-sequence' + (!diagramClass ? '' : ' ') + diagramClass;
  const id = 'sequence-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  element.id = id;
  if (cssLink) {
    element.className = element.className + (!element.className ? '' : ' ') + 'css-sequence';
    element.dataset.css = cssLink;
  }
  if (!sync && typeof window !== 'undefined' && window.dispatchEvent) {
    Promise.resolve(id).then(elementid => {
      // dispatch sequence custom event
      window.dispatchEvent(
        new CustomEvent('sequence', {
          detail: {
            id: elementid,
            className: name,
            data: code,
            langattr: langattr,
            cssLink: cssLink
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
            langattr: langattr,
            cssLink: cssLink
          }
        })
      );
    }
  }
}

// <div class="sequence"></div>
function renderSequenceElements(elements) {
  if (!elements.length) {
    return false;
  }
  elements.forEach(element => {
    renderSequence(element);
  });
  return true;
}

function onRenderSequence(element) {
  if (hasSequence()) {
    const id = element.id;
    const name = element.className;
    const data = element.data;
    const cssLink = element.cssLink;
    let theme = 'hand';
    const langattr = element.langattr;
    if (langattr) {
      const obj = JSON.parse(langattr);
      if (obj && obj.theme && themes.indexOf(obj.theme) != -1) {
        theme = obj.theme;
      }
    }
    let el = window.document.getElementById(id);
    if (el) {
      el.parentNode.outerHTML = cssLink
        ? `<div id="${id}" class="${name} css-sequence" data-css="${cssLink}"></div>`
        : `<div id="${id}" class="${name}"></div>`;
      el = window.document.getElementById(id);
      const d = sequence.parse(data);
      const options = { theme: theme };
      d.drawSVG(el ? el : id, options);
      return;
    }
  }
  setTimeout(() => {
    onRenderSequence(element);
  }, 10);
}

function showdownSequence() {
  let hasEvent = false;
  const parser = new DOMParser();

  return [
    {
      type: 'output',
      filter: function(html) {
        // parse html
        const doc = parser.parseFromString(html, 'text/html');
        const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;

        // find the sequence in code blocks
        const elements = wrapper.querySelectorAll('code.sequence.language-sequence');
        if (elements.length) {
          if (!hasEvent) {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              hasEvent = true;
              // Listen sequence custom event
              window.addEventListener('sequence', event => {
                if (event.detail) {
                  onRenderSequence(event.detail);
                }
              });              
            }
          }

          this.config = {
            cssLink: cdnjs.getSrc(cssCdnName)
          };
        }
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
