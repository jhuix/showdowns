/*
 * Copyright (c) 2020-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown container extension for markdown
 * https://talk.commonmark.org/t/generic-directives-plugins-syntax/444
 * https://github.com/micromark/micromark-extension-directive#syntax
 */
'use strict';

import showdown from 'showdown';
import i18n from './i18n';
import EventBus from '../utils/event-bus';

const leafDirectiveEventName = 'leafDirective';
const textDirectiveEventName = 'textDirective';

const admonTypes = [
  // "note",  //rgba(68,138,255,.1)
  "summary", "abstract", "tldr",  //rgba(0,176,255,.1)
  "info", "todo",   //rgba(0,184,212,.1)
  "tip", "hint",   //rgba(0,191,165,.1)
  "success", "check", "done",  //rgba(0,200,83,.1)
  "question", "help", "faq",  //rgba(100,221,23,.1)
  "warning", "attention", "caution", //rgba(255,145,0,.1)
  "failure", "fail", "missing",  //rgba(255,82,82,.1)
  "danger", "error", "bug", //rgba(255,23,68,.1)
  "example", "snippet", //rgba(101,31,255,.1)
  "quote", "cite",   //rgba(158, 158, 158, .1)
];

// const sgvSymbols = [
//   '<symbol id="icon-pro-note" viewBox="0 0 14 16"><path fill-rule="evenodd" d="M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"></path></symbol>',
//   '<symbol id="icon-pro-tip" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"></path></symbol>',
//   '<symbol id="icon-pro-info" viewBox="0 0 14 16"><path fill-rule="evenodd" d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"></path></symbol>',
//   '<symbol id="icon-pro-warning" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"></path></symbol>',
//   '<symbol id="icon-pro-danger" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"></path></symbol>',
// ];

function splitAndStripQuotes(str) {
  return str.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g).map((token) => {
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      return token.slice(1, -1);
    }
    return token;
  });
}

function parseSvgType(name) {
  switch (name) {
    case 'success':
    case '成功':
      return 'success';
    case 'tip':
    case '提示':
      return 'tip';
    case 'info':
    case '信息':
      return 'info';
    case 'warning':
    case '警告':
      return 'warning';
    case 'error':
    case '错误':
      return 'error';
    case 'danger':
    case '危险':
      return 'danger';
    case 'summary':
    case '概要':
      return 'summary';
    case 'tldr':
    case '摘要':
      return 'tldr';
    case 'abstract':
    case '抽象':
      return 'abstract';
    case 'todo':
    case '待办':
      return 'todo';
    case 'hint':
    case '小窍门':
      return 'hint';
    case 'check':
    case '检测':
      return 'check';
    case 'done':
    case '完成':
      return 'done';
    case 'help':
    case '帮助':
      return 'help';
    case 'question':
    case '问题':
      return 'question';
    case 'faq':
    case '问答':
      return 'faq';
    case 'attention':
    case '关注':
      return 'attention';
    case 'caution':
    case '提醒':
      return 'caution';
    case 'failure':
    case '故障':
      return 'failure';
    case 'fail':
    case '失败':
      return 'fail';
    case 'missing':
    case '缺失':
      return 'missing';
    case 'bug':
    case '缺陷':
      return 'bug';
    case 'example':
    case '示例':
      return 'example';
    case 'snippet':
    case '片段':
      return 'snippet';
    case 'quote':
    case '引用':
      return 'quote';
    case 'cite':
    case '引文':
      return 'cite';
    case 'important':
    case '重点':
      return 'important';
    case 'key':
    case '要点':
      return 'key';
    default:
      return name;
  }
}


function parseAttribute(attribute, container, exclude) {
  if (!attribute) return;

  const attrs = splitAndStripQuotes(attribute);

  let obj = container ?? {};
  attrs.forEach((attr) => {
    if (attr) {
      if (attr[0] === '#' || attr[0] === '.') {
        const classes = attr.split('.');
        if (classes[0][0] === '#') {
          obj.id = classes[0].substring(1);
          classes.shift();
        }
        if (classes.length > 0) {
          if (!obj.classList) {
            obj.classList = [];
          }
          if (!exclude) {
            classes.forEach((classname) => {
              if (classname && !obj.classList.includes(classname)) {
                obj.classList.push(classname);
              }
            });
          } else {
            classes.forEach((classname) => {
              if (classname) {
                if (!obj.svgType) {
                  const svgType = parseSvgType(classname);
                  if (svgType) {
                    obj.svgType = svgType;
                  }
                }
                if (classname !== exclude && !obj.classList.includes(classname)) {
                  obj.classList.push(classname);
                }
              }
            });
          }
        }
      } else {
        const kv = attr.split('=');
        if (!obj.attribute) {
          obj.attribute = {};
        }
        const key = kv[0].toLowerCase();
        if (kv.length > 1) {
          if (key !== 'id' && key !== 'class') {
            let value = kv[1];
            if (value.toLowerCase() === 'true') {
              value = true;
            } else if (value.toLowerCase() === 'false') {
              value = false;
            } else if (!isNaN(value)) {
              value = Number(value);
            } else {
              value = value.replace(/^(['"]{0,1})(.*)\1$/, '$2');
            }
            obj.attribute[key] = value;
          }
        } else {
          obj.attribute[key] = undefined;
        }
      }
    }
  });
  return obj;
}

function attributeToString(attribute) {
  if (!attribute) return '';

  let result = '';
  for (const [k, v] of Object.entries(attribute)) {
    result += ' ' + k;
    switch (typeof v) {
      case 'boolean':
        result += '=' + v ? 'true' : 'false';
        break;
      case 'number':
        result += '=' + `${v}`;
        break;
      case 'undefined':
        break;
      default:
        result += '=' + `"${v}"`;
        break;
    }
  }
  return result;
}

function showdownDirective() {
  return [
    {
      type: 'listener',
      listeners: {
        'blockGamut.before': (_, text, converter, options, globals) => {
          text = converter._dispatch('directive.before', text, options, globals);
          text += '¨0';

          // container directive
          text = text.replace(
            /^ {0,3}((?::::+)|(?:!!!+))[ \t]*([-\w]+)[ \t]*(?:([^\f\v\r\n\[\]\{\}]*)|(?:\[([^\[\]]*)\])?[ \t]*(?:\{([^\{\}]*)\})?)[: \t]*\n([\s\S]*?)\n {0,3}\1[: \t]*/gm,
            function (wholeMatch, delim, name, title0, title, attribute, content) {
              const container = {
                classList: ['admonition'],
              };
              let id = '';
              let attrs = '';
              if (title0 || (!title && !attribute)) {
                const classes = name.split('-');
                if (!classes.includes('alert') && !classes.includes('note')) {
                  container.classList.push('note');
                }
                classes.forEach((classname) => {
                  if (classname) {
                    if (!container.svgType) {
                      const svgType = parseSvgType(classname);
                      if (svgType) {
                        container.svgType = svgType;
                      }
                    }
                    if (!container.classList.includes(classname)) {
                      container.classList.push(classname);
                    }
                  }
                });
                title = title0;
              } else {
                switch (name) {
                  case 'note':
                  case '备注':
                    container.classList.push('note');
                    parseAttribute(attribute, container, 'alert');
                    break;
                  case 'alert':
                  case '注意':
                    defaultTitle = i18n.getLangString('alert', 'alert');
                    container.classList.push('alert');
                    parseAttribute(attribute, container, 'note');
                    break;
                  default:
                    parseAttribute(attribute, container);
                    container.svgType = parseSvgType(name);
                    if (!container.classList.includes('alert') && !container.classList.includes('note')) {
                      container.classList.push('note');
                    }
                }
              }
              if (!container.svgType) {
                container.svgType = 'default';
              }
              if (!container.classList.includes(container.svgType)) {
                container.classList.push(container.svgType);
              }
              if (title) {
                title = showdown.subParser('spanGamut')(title, options, globals);
                title = `<div class="admonition-title">${title}</div>`;
              } else {
                const defaultTitle = !container.svgType ? i18n.getLangString('note', 'note') :
                  i18n.getLangString(container.svgType, container.svgType);
                title = `<div class="admonition-title">${defaultTitle}</div>`;
                title = `<div class="admonition-title">${defaultTitle}</div>`;
              }
              if (content) {
                content = showdown.subParser('githubCodeBlocks')(content, options, globals);
                content = showdown.subParser('blockGamut')(content, options, globals);
                content = `<div class="admonition-content">${content}</div>`;
              } else {
                content = '';
              }
              if (container.id) {
                id = `id="${container.id}" `;
              }
              if (container.attribute) {
                attrs = attributeToString(container.attribute);
              }
              const code = `<div ${id}class="${container.classList.join(' ')}"${attrs}>${title}${content}</div>`;
              return showdown.subParser('hashBlock')(code, options, globals);
            },
          );

          text = text.replace(/^!!! ((?:[^"\n]+[ \t]+)*)(?:"([^"\n]+)")?[ \t]*\n((?:(?:    |\t)[^\r\n]*(?:\n|$)|\n)*)/gm,
            function (wholeMatch, name, title, content) {
              const container = {
                classList: ['admonition'],
              };
              const classes = name.split(' ');
              if (!classes.includes('alert') && !classes.includes('note')) {
                container.classList.push('note');
              }
              classes.forEach((classname) => {
                if (classname) {
                  if (!container.svgType) {
                    const svgType = parseSvgType(classname);
                    if (svgType) {
                      container.svgType = svgType;
                    }
                  }
                  if (!container.classList.includes(classname)) {
                    container.classList.push(classname);
                  }
                }
              });
              if (!container.svgType) {
                container.svgType = 'default';
              }
              if (!container.classList.includes(container.svgType)) {
                container.classList.push(container.svgType);
              }
              if (title) {
                title = showdown.subParser('spanGamut')(title, options, globals);
                title = `<div class="admonition-title">${title}</div>`;
              } else {
                const defaultTitle = !container.svgType ? i18n.getLangString('note', 'note') :
                  i18n.getLangString(container.svgType, container.svgType);
                title = `<div class="admonition-title">${defaultTitle}</div>`;
              }
              if (content) {
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                  if (line) {
                    const pos = line[0] === '\t' ? 1 : 4;
                    lines[index] = line.substring(pos);
                  }
                })
                content = showdown.subParser('githubCodeBlocks')(lines.join('\n'), options, globals);
                content = showdown.subParser('blockGamut')(content, options, globals);
                content = `<div class="admonition-content">${content}</div>`;
              } else {
                content = '';
              }
              const code = `<div class="${container.classList.join(' ')}">${title}${content}</div>`;
              return showdown.subParser('hashBlock')(code, options, globals);
            });

          // leaf directive
          text = text.replace(
            /^ {0,3}(?<!:)::[ \t]*([-\w]+)[ \t]*(?:\[([^\[\]]*)\])?[ \t]*\{([^\{\}]*)\}[ \t]*$/gm,
            function (wholeMatch, name, title, attribute) {
              const directive = {};
              parseAttribute(attribute, directive);
              if (name === 'media' || name === '媒体') {
                let id = '';
                let attrs = '';
                let className = '';
                if (title) {
                  title = showdown.subParser('spanGamut')(title, options, globals);
                  title = `<div class="media-title">${title}</div>`;
                } else {
                  title = '';
                }
                if (directive.id) {
                  id = `id="${directive.id}"`;
                }
                if (directive.attribute) {
                  attrs = attributeToString(directive.attribute);
                }
                if (directive.classList) {
                  className = ` class="${directive.classList.join(' ')}"`;
                }
                const code = `<iframe ${id}${className}${attrs}>${title}}</iframe>`;
                return showdown.subParser('hashBlock')(code, options, globals);
              }

              if (name === 'css-link') {
                let id = '';
                let attrs = '';
                if (directive.id) {
                  id = `id="${directive.id}"`;
                }
                if (directive.attribute) {
                  attrs = attributeToString(directive.attribute);
                }
                const code = `<link ${id}${attrs}>`;
                return showdown.subParser('hashBlock')(code, options, globals);
              }

              if (name === 'css' && title) {
                let id = '';
                let attrs = '';
                if (directive.id) {
                  id = `id="${directive.id}"`;
                }
                if (!title) {
                  title = '';
                }
                if (directive.attribute) {
                  attrs = attributeToString(directive.attribute);
                }
                const code = `<style ${id}${attrs}>${title}</style>`;
                return showdown.subParser('hashBlock')(code, options, globals);
              }

              let content = '';
              const callback = (code) => {
                content = code;
              };
              if (EventBus.emit(leafDirectiveEventName, name, title, directive, callback) && content) {
                return showdown.subParser('hashBlock')(content, options, globals);
              }
            },
          );

          // text directive
          text = text.replace(
            /(?<!:):([-\w]+)\[([^\[\]]*)\]\{([^\{\}]*)\}/g,
            function (wholeMatch, name, title, attribute) {
              const directive = {};
              parseAttribute(attribute, directive);
              let id = '';
              let attrs = '';
              if (directive.id) {
                id = `id="${directive.id}"`;
              }
              if (directive.attribute) {
                attrs = attributeToString(directive.attribute);
              }
              let className = '';
              if (directive.classList) {
                className = ` class="${directive.classList.join(' ')}"`;
              }
              if (title) {
                title = showdown.subParser('spanGamut')(title, options, globals);
              } else {
                title = '';
              }

              let content = '';
              const callback = (code) => {
                content = code;
              };
              if (!EventBus.emit(textDirectiveEventName, name, title, directive, callback)) {
                content = `<${name} ${id}${className}${attrs}>${title}</${name}>`;
              }
              return showdown.subParser('hashBlock')(content, options, globals);
            },
          );

          // attacklab: strip sentinel
          text = text.replace(/¨0/, '');

          return converter._dispatch('directive.after', text, options, globals);
        },
      },
    },
  ];
}

export default showdownDirective;
