/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
'use strict';

function loadStyle(name, css) {
  if (!name || !css || typeof document === 'undefined') {
    return false;
  }

  const id = 'css-' + name.toLowerCase();
  const script = document.getElementById(id);
  if (!script) {
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.id = id;
    style.type = 'text/css';
    style.innerText = css;
    head.appendChild(style);
  }
  return true;
}

function loadScript(id, code, element) {
    return new Promise((res, rej) => {
        if (!id || !code || typeof document === 'undefined') {
            return rej('Args is invaild!');
        }

        let script = document.getElementById(id);
        if (script) {
          return res(true);
        }

        if (!element) {
          element = document.body;
        } else if (typeof element === 'string') {
          element = document.querySelector(element);
        }
        script = document.createElement('script');
        script.id = id;
        script.type = "text/javascript";
        script.text = code;
        element.appendChild(script);
        res(true);
    });
}

function interopDefault(ex) {
    return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

function renderCacheElement(doc, id, name, callback) {
    if (typeof window !== 'undefined' && window.document) {
        doc = window.document;
    }
    const el = doc.createElement('div');
    el.id = id;
    el.className = name;
    el.style.display = 'none';
    doc.body.appendChild(el);
    if (typeof callback === 'function' && callback) {
        const result = callback(el);
        if (result instanceof Promise) {
            result.then(el => {
                doc.body.removeChild(el);
                el.style.display = '';
            });
            return el.outerHTML;
        }
    }
    doc.body.removeChild(el);
    el.style.display = '';
    return el.outerHTML;
}

function renderElement(doc, id, name) {
    if (typeof window !== 'undefined' && window.document) {
        doc = window.document;
    }
    const el = doc.createElement('div');
    el.id = id;
    el.className = name;
    doc.body.appendChild(el);
    return el
}

function createElementMeta(name, element, callback) {
    const langattr = element.dataset.lang;
    const langobj = langattr ? JSON.parse(langattr) : null;
    let diagramClass = '';
    if (langobj) {
      if (
        (typeof langobj.codeblock === 'boolean' && langobj.codeblock) ||
        (typeof langobj.codeblock === 'string' && langobj.codeblock.toLowerCase() === 'true')
      ) {
        return false;
      }

      if (langobj.align) {
        //default left
        if (langobj.align === 'center') {
          diagramClass = 'diagram-center';
        } else if (langobj.align === 'right') {
          diagramClass = 'diagram-right';
        }
      }
      if (langobj.width) {
        if (typeof langobj.width !== 'string') {
          langobj.width = langobj.width + 'px';
        }
      }
      if (langobj.height) {
        if (typeof langobj.height !== 'string') {
          langobj.height = langobj.height + 'px';
        }
      }
    }

    let code = element.textContent.trim();
    if (callback && typeof callback === 'function') {
        code = callback(code);
    }
    const className =
      (element.classList.length > 0 ? element.classList[0] : '') +
      (!element.className || !diagramClass ? '' : ' ') +
      diagramClass;
    const id = name.toLowerCase() + '-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    element.id = id;
    return {
      id: id,
      container: id + '-container',
      className: className,
      data: code,
      element: element,
      lang: langobj
    };
}

const utils = {
    interopDefault,
    loadStyle,
    loadScript,
    renderCacheElement,
    renderElement,
    createElementMeta,
};

export default utils;
