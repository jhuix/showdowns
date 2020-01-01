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

function hasSequence() {
  return !!sequence;
}

let dync = false;
const cssCdnName = 'sequenceCSS';
function dyncLoadScript() {
  const sync = hasSequence();
  if (typeof window !== 'undefined') {
    if (!sync && !dync) {
      dync = true;
      cdnjs.loadStyleSheet(cssCdnName);
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
  return sync;
}

function onRenderSequence(resolve, res) {
  if (hasSequence()) {
    const id = res.id;
    const name = res.className;
    const data = res.data;
    const cssLink = res.cssLink;
    let theme = 'hand';
    const langattr = res.langattr;
    if (langattr) {
      const obj = JSON.parse(langattr);
      if (obj && obj.theme && themes.indexOf(obj.theme) != -1) {
        theme = obj.theme;
      }
    }
    let element = res.element;
    const doc = element.ownerDocument;
    cdnjs.renderCacheElement(doc, id, name, el => {
      el.style.left = '-50%';
      el.style.top = '-50%';
      el.style.position = 'absolute';
      el.style.display = '';
      if (cssLink) {
        el.className = el.className + (!el.className ? '' : ' ') + 'css-sequence';
        el.dataset.css = cssLink;
      }
      const d = sequence.parse(data);
      const options = { theme: theme };
      d.drawSVG(el, options);
      return new Promise(solve => {
        //Async draw svg, need to check whether the drawing is completed regularly.
        function checkDraw() {
          if (el.childNodes.length > 0) {
            element.parentNode.outerHTML = el.outerHTML;
            //Replace display element
            element = doc.getElementById(id);
            if (element) {
              element.style.left = '';
              element.style.top = '';
              element.style.position = '';
              element.style.display = '';
            }
            resolve(true);
            solve(el);
          } else {
            setTimeout(checkDraw, 50);
          }
        }
        checkDraw();
      });
    });
  } else {
    setTimeout(() => {
      onRenderSequence(resolve, res);
    }, 50);
  }
}
/**
 * render sequence graphs
 */
function renderSequence(element) {
  return new Promise(resolve => {
    const langattr = element.dataset.lang;
    const langobj = langattr ? JSON.parse(langattr) : null;
    let diagramClass = '';
    if (langobj) {
      if (
        (typeof langobj.codeblock === 'boolean' && langobj.codeblock) ||
        (typeof langobj.codeblock === 'string' && langobj.codeblock.toLowerCase() === 'true')
      ) {
        return resolve(false);
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
    const cssLink = cdnjs.getSrc(cssCdnName);
    const code = element.textContent.trim();
    const name = 'js-sequence' + (!diagramClass ? '' : ' ') + diagramClass;
    const id = 'sequence-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    const res = {
      element: element,
      id: id,
      className: name,
      data: code,
      cssLink: cssLink,
      langattr: langattr
    };
    onRenderSequence(resolve, res);
  });
}

// <div class="sequence"></div>
function renderSequenceElements(elements) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderSequence(element));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}

function showdownSequence() {
  return [
    {
      type: 'output',
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the sequence in code blocks
        const elements = wrapper.querySelectorAll('code.sequence.language-sequence');
        if (!elements.length) {
          return false;
        }
        console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} Begin render sequence elements.`);
        return renderSequenceElements(elements).then(() => {
          console.log(`${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} End render sequence elements.`);
          return obj;
        });
      }
    }
  ];
}

export default showdownSequence;
