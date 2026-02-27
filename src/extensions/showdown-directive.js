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
  // "default", "note",  //rgba(68,138,255,.1)
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
  "important", "key", //rgba(230, 32, 196, .1)
];

function splitAndStripQuotes(str) {
  return str.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g).map((token) => {
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      return token.slice(1, -1);
    }
    return token;
  });
}

function parseContainerStyle(name) {
  switch (name) {
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
    case 'success':
    case '成功':
      return 'success';
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
    case 'container':
    case '容器':
      return 'container';
    case 'row':
    case '行':
      return 'row';
    case 'col':
    case '列':
      return 'col';
    default:
      return name;
  }
}

/** Parse attribute string to object
 *
 * @param {string} attribute
 * @param {{}} container
 * @param {string[]} excludes
 * @returns {{}|undefined}
 */
function parseAttribute(attribute, container, excludes) {
  if (!attribute) return container;

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
          if (!excludes || excludes.length === 0) {
            classes.forEach((classname) => {
              if (classname && !obj.classList.includes(classname)) {
                obj.classList.push(classname);
              }
            });
          } else {
            classes.forEach((classname) => {
              if (classname) {
                if (!obj.style) {
                  const containerStyle = parseContainerStyle(classname);
                  if (containerStyle) {
                    obj.style = containerStyle;
                  }
                }
                if (!excludes.includes(classname) && !obj.classList.includes(classname)) {
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

const detailsStrings = ['details', '详情', 'details+', '详情+', 'details-', '详情-'];

function showdownDirective() {
  return [
    {
      type: 'listener',
      listeners: {
        'blockGamut.before': (_, text, converter, options, globals) => {
          text = converter._dispatch('directive.before', text, options, globals);
          text += '¨0';

          // Support obsidian callout style (https://help.obsidian.md/callouts)
          text = text.replace(/^ {0,3}>[ \t]*\[\!([^\f\v\r\n\[\]\{\}]+)\]([\+-]?)[ \t]+([^\r\n]*)[ \t]*\n((?: {0,3}>(?:[^\r\n]*(?:\n|$)))*)/gm,
            function (wholeMatch, name, details, title, content) {
              const container = {
                classList: ['callout', 'note'],
              };
              name = name.toLowerCase();
              container.style = parseContainerStyle(name);
              container.classList.push(container.style);
              if (details) {
                if (title) {
                  title = showdown.subParser('spanGamut')(title, options, globals);
                  title = `<summary class="callout-title">${title}</summary>`;
                } else {
                  const defaultTitle = !container.style ? i18n.getLangString('note', 'note') :
                    i18n.getLangString(container.style, container.style);
                  title = `<summary class="callout-title">${defaultTitle}</summary>`;
                }
                if (content) {
                  content = content.replace(/^ {0,3}>[ \t]?/gm, ''); // trim one level of quoting
                  content = content.replace(/¨0/g, ''); // clean up hack
                  content = content.replace(/^[ \t]+$/gm, ''); // trim whitespace-only lines
                  content = showdown.subParser('githubCodeBlocks')(content, options, globals);
                  content = showdown.subParser('blockGamut')(content, options, globals);
                  content = `<div class="callout-content">${content}</div>`;
                } else {
                  content = '';
                }
                const open = details === '+' ? ' open' : '';
                const code = `<details class="${container.classList.join(' ')}"${open}>${title}${content}</details>`;
                return showdown.subParser('hashBlock')(code, options, globals);
              }

              if (title) {
                title = showdown.subParser('spanGamut')(title, options, globals);
                title = `<div class="callout-title">${title}</div>`;
              } else {
                const defaultTitle = !container.style ? i18n.getLangString('note', 'note') :
                  i18n.getLangString(container.style, container.style);
                title = `<div class="callout-title">${defaultTitle}</div>`;
              }
              if (content) {
                content = content.replace(/^ {0,3}>[ \t]?/gm, ''); // trim one level of quoting
                content = content.replace(/¨0/g, ''); // clean up hack
                content = content.replace(/^[ \t]+$/gm, ''); // trim whitespace-only lines
                content = showdown.subParser('githubCodeBlocks')(content, options, globals);
                content = showdown.subParser('blockGamut')(content, options, globals);
                content = `<div class="callout-content">${content}</div>`;
              } else {
                content = '';
              }
              const code = `<div class="${container.classList.join(' ')}">${title}${content}</div>`;
              return showdown.subParser('hashBlock')(code, options, globals);
            }
          );


          // Support rST style (https://docutils.sourceforge.io/docs/ref/rst/directives.html#specific-admonitions),
          // Also support admonition style of mkdocs-material https://squidfunk.github.io/mkdocs-material/reference/admonitions
          text = text.replace(/^(!!!|\?\?\?[\+]?) ((?:[^"\f\v\r\n]+[ \t]*)+)(?:"([^"\r\n]*)")?[ \t]*\n((?:(?:    |\t)[^\r\n]*(?:\n|$)|\n(?![\S]))*)/gm,
            function (wholeMatch, delim, name, title, content) {
              const container = {
                classList: ['admonition'],
              };
              name = name.toLowerCase();
              const classes = name.split(' ');
              if (!classes.includes('alert') && !classes.includes('note') && !classes.includes('simple')) {
                container.classList.push('simple');
              }
              classes.forEach((classname, index) => {
                if (classname) {
                  if (!container.style) {
                    const containerStyle = parseContainerStyle(classname);
                    if (containerStyle) {
                      container.style = containerStyle;
                    }
                  }
                  if (!container.classList.includes(classname)) {
                    container.classList.push(classname);
                  }
                }
              });
              if (!container.style) {
                container.style = 'default';
              }
              if (!container.classList.includes(container.style)) {
                container.classList.push(container.style);
              }

              // ??? is rendered as details by default, and can be configured to be open by adding + after ???
              if (delim.startsWith('???')) {
                if (title) {
                  title = showdown.subParser('spanGamut')(title, options, globals);
                  title = `<summary class="admonition-title">${title}</summary>`;
                } else {
                  const defaultTitle = !container.style ? i18n.getLangString('note', 'note') :
                    i18n.getLangString(container.style, container.style);
                  title = `<summary class="admonition-title">${defaultTitle}</summary>`;
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
                const open = (delim.length > 3 && delim[3] === '+') ? ' open' : '';
                const code = `<details class="${container.classList.join(' ')}"${open}>${title}${content}</details>`;
                return showdown.subParser('hashBlock')(code, options, globals);
              }

              // !!! is rendered as div by default
              if (title) {
                title = showdown.subParser('spanGamut')(title, options, globals);
                title = `<div class="admonition-title">${title}</div>`;
              } else {
                const defaultTitle = !container.style ? i18n.getLangString('note', 'note') :
                  i18n.getLangString(container.style, container.style);
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
            }
          );

          // container directive
          text = text.replace(
            /^ {0,3}((?::::+)|(?:!!!+))[ \t]*([^\f\v\r\n\[\]\{\}]*)[ \t]*(?:([^\f\v\r\n\[\]\{\}]*)|(?:\[([^\[\]]*)\])?[ \t]*(?:\{([^\{\}]*)\})?)[: \t]*\n([\s\S]*?)\n {0,3}\1[:! \t]*(?:¨0)?$/gm,
            function (wholeMatch, delim, name, title0, title, attribute, content) {
              name = name.toLowerCase();
              if (detailsStrings.includes(name)) {
                if (title0 || (!title && !attribute)) {
                  title = title0 || '';
                }
                const container = parseAttribute(attribute, {});
                if (title) {
                  title = showdown.subParser('spanGamut')(title, options, globals);
                }
                title = `<summary class="details-title">${title}</summary>`;
                if (content) {
                  content = showdown.subParser('githubCodeBlocks')(content, options, globals);
                  content = showdown.subParser('blockGamut')(content, options, globals);
                  content = `<div class="details-content">${content}</div>`;
                }
                const id = container.id ? `id="${container.id}" ` : '';
                const attrs = container.attribute ? attributeToString(container.attribute) : '';
                let folder = '';
                let open = '';
                const lastChar = name[name.length - 1];
                if (lastChar === '+' || lastChar === '-') {
                  folder = ' folder';
                  if (lastChar === '+') {
                    open = ' open';
                  }
                }
                const code = `<details ${id}class="details${folder}"${attrs}${open}>${title}${content}</details>`;
                return showdown.subParser('hashBlock')(code, options, globals);
              }

              if (!name) name = 'container';
              const container = { classList: [] };
              let id = '';
              let attrs = '';
              let defaultTitle = '';
              if (title0 || (!title && !attribute)) {
                const classes = name.split('-');
                name = classes[0];
                classes.forEach((classname, index) => {
                  if (index > 0 && classname) {
                    if (!container.style) {
                      const containerStyle = parseContainerStyle(classname);
                      if (containerStyle) {
                        container.style = containerStyle;
                      }
                    }
                    if (!container.classList.includes(classname)) {
                      container.classList.push(classname);
                    }
                  }
                });
                title = title0 || '';
              }

              let admonition = false;
              switch (name) {
                case 'note':
                case '备注':
                  admonition = true;
                  container.type = 'admonition';
                  defaultTitle = i18n.getLangString('note', 'note');
                  container.classList.unshift('admonition', 'note');
                  parseAttribute(attribute, container, ['simple', 'alert', 'container', 'row', 'col']);
                  break;
                case 'alert':
                case '注意':
                  admonition = true;
                  container.type = 'admonition';
                  defaultTitle = i18n.getLangString('alert', 'alert');
                  container.classList.unshift('admonition', 'alert');
                  parseAttribute(attribute, container, ['simple', 'note', 'container', 'row', 'col']);
                  break;
                case 'simple':
                case '简单':
                  admonition = true;
                  container.type = 'admonition';
                  defaultTitle = i18n.getLangString('simple', 'simple');
                  container.classList.unshift('admonition', 'simple');
                  parseAttribute(attribute, container, ['note', 'alert', 'container', 'row', 'col']);
                  break;
                case 'container':
                case '容器':
                  container.type = 'container';
                  parseAttribute(attribute, container);
                  container.classList.unshift('container');
                  break;
                case 'row':
                case '行':
                  container.type = 'row';
                  parseAttribute(attribute, container);
                  container.classList.unshift('row');
                  break;
                case 'col':
                case '列':
                  container.type = 'col';
                  parseAttribute(attribute, container);
                  container.classList.unshift('col');
                  break;
                default:
                  admonition = true;
                  container.type = 'admonition';
                  container.style = parseContainerStyle(name);
                  parseAttribute(attribute, container, ['container', 'row', 'col']);
                  if (container.classList.includes('alert') || container.classList.includes('note') || container.classList.includes('simple')) {
                    container.classList.unshift('admonition');
                  } else {
                    container.classList.unshift('admonition', 'note');
                  }
              }
              if (admonition) {
                if (!container.style) {
                  container.style = 'default';
                }
                if (!container.classList.includes(container.style)) {
                  container.classList.push(container.style);
                }
              }
              if (title) {
                title = showdown.subParser('spanGamut')(title, options, globals);
                title = `<div class="${container.type}-title">${title}</div>`;
              } else if (admonition) {
                defaultTitle = (defaultTitle || !container.style) ?? i18n.getLangString(container.style, container.style);
                title = `<div class="admonition-title">${defaultTitle}</div>`;
              }
              if (content) {
                content = showdown.subParser('githubCodeBlocks')(content, options, globals);
                content = showdown.subParser('blockGamut')(content, options, globals);
                content = `<div class="${container.type}-content">${content}</div>`;
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

          // leaf directive
          text = text.replace(
            /^ {0,3}(?<!:)::[ \t]*([^\f\v\r\n\[\]\{\}]+)[ \t]*(?:\[([^\[\]]*)\])?[ \t]*(?:\{([^\{\}]*)\})?[ \t]*(?:¨0)?$/gm,
            function (wholeMatch, name, title, attribute) {
              const directive = {};
              parseAttribute(attribute, directive);
              if (name === 'media' || name === 'video' || name === '媒体' || name === '音视频') {
                if (!directive.attribute || !directive.attribute.src) {
                  return;
                }

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
                if (!directive.attribute || !directive.attribute.href) {
                  return;
                }

                let id = '';
                let attrs = '';
                if (directive.id) {
                  id = `id="${directive.id}"`;
                }
                attrs = attributeToString(directive.attribute);
                const code = `<link ${id}${attrs}>`;
                return showdown.subParser('hashBlock')(code, options, globals);
              }

              if (name === 'css') {
                if (!title) {
                  return;
                }

                let id = '';
                let attrs = '';
                const content = title;
                if (directive.id) {
                  id = `id="${directive.id}"`;
                }
                if (directive.attribute) {
                  attrs = attributeToString(directive.attribute);
                }
                const code = `<style ${id}${attrs}>${content}</style>`;
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
            /(?<!:):([-\w]+)\[([^\[\]]*)\](?:\{([^\{\}]*)\})?/g,
            function (wholeMatch, name, content, attribute) {
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
              if (content) {
                content = showdown.subParser('spanGamut')(content, options, globals);
              } else {
                content = '';
              }

              const callback = (code) => {
                content = code;
              };
              if (!EventBus.emit(textDirectiveEventName, name, content, directive, callback)) {
                content = `<${name} ${id}${className}${attrs}>${content}</${name}>`;
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
