/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown toc extension for markdown
 */
'use strict';

function createHeadingElement(wrapper, element, toc, nexthead) {
  if (nexthead) {
    toc = toc.appendChild(wrapper.ownerDocument.createElement('ul'));
  }

  const child = toc
    .appendChild(wrapper.ownerDocument.createElement('li'))
    .appendChild(wrapper.ownerDocument.createElement('a'));
  child.appendChild(wrapper.ownerDocument.createTextNode(element.textContent));
  child.href = '#' + element.id;
  return toc;
}

function appendTocElement(wrapper, element, currTocNode, headingLevel) {
  // If the current heading level is not greater than the heading level of current toc node,
  // return the toc node whose heading level is less than the current heading level in the toc node list.
  // At the same time, clearing the invalid toc node.
  if (headingLevel <= currTocNode.headingLevel) {
    let tempTocNode = null;
    while (currTocNode) {
      if (headingLevel > currTocNode.headingLevel) break;
      tempTocNode = currTocNode;
      currTocNode = tempTocNode.parentNode;
      // Remove toc node from node list and clean it.
      tempTocNode.parentNode = null;
      tempTocNode.toc = null;
      tempTocNode.headingLevel = null;
      tempTocNode.preLevel = null;
    }
    if (currTocNode) appendTocElement(wrapper, element, currTocNode, headingLevel);
    return currTocNode;
  }

  // If the current heading level is greater than the heading level of
  // the latest heading of the current toc node,
  // you need to create a new level heading with out list.
  // Otherwise add a heading of the same heading level.
  if (headingLevel > currTocNode.preLevel) {
    currTocNode.toc = createHeadingElement(wrapper, element, currTocNode.toc, true);
    currTocNode.preLevel = headingLevel;
  } else {
    while (headingLevel < currTocNode.preLevel) {
      currTocNode.toc = currTocNode.toc.parentNode;
      currTocNode.preLevel--;
    }
    createHeadingElement(wrapper, element, currTocNode.toc, false);
  }

  if (currTocNode.parentNode) appendTocElement(wrapper, element, currTocNode.parentNode, headingLevel);
  return currTocNode;
}

function renderTocElements(wrapper) {
  let element = null;
  let headingLevel = 0;
  let currTocNode = null;
  let result = false;
  const elements = wrapper.querySelectorAll('p,h1,h2,h3,h4,h5,h6');
  for (let i = 0; i < elements.length; i++) {
    element = elements[i];

    // Match the element text is [toc].
    // And replace this element with out list that classname is 'showdown-toc'.
    if (element.textContent.trim().toLowerCase() == '[toc]') {
      // New table of contents container.
      let toc = wrapper.ownerDocument.createElement('ul');
      toc.className = 'showdown-toc';
      element.parentNode.replaceChild(toc, element);
      let tocNode = {
        parentNode: null,
        toc: toc,
        headingLevel: headingLevel,
        preLevel: 0
      };
      if (currTocNode) {
        // If the heading level of the TOC node is higher than
        // that of the previous TOC node,
        // the TOC node is a child of the previous TOC node.
        // Otherwise, look up the TOC node in the node list
        // whose heading level is not greater than the TOC node.
        if (headingLevel > currTocNode.headingLevel) {
          tocNode.parentNode = currTocNode;
        } else {
          // The code will never be executed, just to prevent logic loss.
          // Because invalid nodes have been cleared in appendTocElement method.
          let prev = currTocNode;
          while (headingLevel < prev.headingLevel) {
            prev = prev.parentNode;
          }
          if (prev) {
            if (headingLevel === prev.headingLevel) {
              tocNode.parentNode = prev.parentNode;
            } else {
              tocNode.parentNode = prev;
            }
          }
        }
      }
      currTocNode = tocNode;
      result = true;
    }
    // That's going to be what we use as contents entries
    // for this table of contents.
    else if (element['tagName']) {
      switch (element['tagName']) {
        case 'H1':
        case 'H2':
        case 'H3':
        case 'H4':
        case 'H5':
        case 'H6':
          headingLevel = parseInt(element['tagName'].substr(1));
          if (currTocNode) {
            if (!currTocNode.preLevel) {
              currTocNode.preLevel = headingLevel;
            }

            currTocNode = appendTocElement(wrapper, element, currTocNode, headingLevel);
          }
          break;
      }
    }
  }

  // Final, clear all toc node in node list.
  while (currTocNode) {
    let tempTocNode = currTocNode;
    currTocNode = tempTocNode.parentNode;
    // Clean toc node.
    tempTocNode.parentNode = null;
    tempTocNode.toc = null;
    tempTocNode.headingLevel = null;
    tempTocNode.preLevel = null;
  }
  return result;
}

function showdownToc() {
  const parser = new DOMParser();
  return [
    {
      type: 'output',
      filter: function(html) {
        // parse html
        const doc = parser.parseFromString(html, 'text/html');
        const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;
        if (!renderTocElements(wrapper)) {
          return html;
        }
        // return html text content
        return wrapper.innerHTML;
      }
    }
  ];
}

export default showdownToc;
