/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown toc extension for markdown
 */
'use strict';

import format from './log';

function createHeadingElement(wrapper, element, toc, headingLevel, nexthead) {
  try {
    if (nexthead) {
      if (headingLevel > 1) {
        const parent = toc.parentNode;
        if (parent && parent.tagName === 'UL') {
          parent.classList.add('toc-multi');
        }
      }
      const title = toc.querySelector('div');
      if (title) {
        title.classList.remove('toc-title');
        title.classList.add('toc-multi-title');
        const icon = title.querySelector('i');
        if (icon) {
          icon.classList.remove('toc-chapter');
          icon.classList.add('toc-multi-chapter');
          icon.innerHTML = '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-expand"></use></svg>';
        }
      }
      toc = toc.appendChild(wrapper.ownerDocument.createElement('ul'));
      if (headingLevel > 1) {
        toc.classList.add(`toc-level-${headingLevel}`);
      } else {
        toc.classList.add('toc-main');
      }
    }
    toc = toc.appendChild(wrapper.ownerDocument.createElement('li'));
    if (element) {
      const child = toc.appendChild(wrapper.ownerDocument.createElement('div'));
      child.classList.add(`toc-title-${headingLevel}`, `toc-title`);
      const icon = child.appendChild(wrapper.ownerDocument.createElement('i'));
      icon.classList.add('iconfont', 'toc-chapter');
      icon.innerHTML = '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-chapter-l"></use></svg>';
      const link = child.appendChild(wrapper.ownerDocument.createElement('a'));
      link.appendChild(wrapper.ownerDocument.createTextNode(element.textContent));
      link.href = '#' + element.id;
    }
  } catch {
    console.warn(format('append child error:'), wrapper);
  }
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
    currTocNode.preLevel++;
    while (headingLevel > currTocNode.preLevel) {
      currTocNode.toc = createHeadingElement(wrapper, null, currTocNode.toc, headingLevel, true);
      currTocNode.preLevel++;
    }
    currTocNode.toc = createHeadingElement(wrapper, element, currTocNode.toc, headingLevel, true);
  } else {
    while (headingLevel < currTocNode.preLevel) {
      if (currTocNode.toc) currTocNode.toc = currTocNode.toc.parentNode;
      if (currTocNode.toc) currTocNode.toc = currTocNode.toc.parentNode;
      currTocNode.preLevel--;
    }
    if (currTocNode.toc) currTocNode.toc = currTocNode.toc.parentNode;
    currTocNode.toc = createHeadingElement(wrapper, element, currTocNode.toc, headingLevel, false);
  }

  if (currTocNode.parentNode) appendTocElement(wrapper, element, currTocNode.parentNode, headingLevel);
  return currTocNode;
}

function renderTocElements(wrapper) {
  let element = null;
  let headingLevel = 0;
  let currTocNode = null;
  let result = false;
  let firstHeadOne = false;

  const tocSvgs = wrapper.ownerDocument.createElement('div');
  tocSvgs.id = 'toc-svgs';
  tocSvgs.classList.add('hidden');
  tocSvgs.innerHTML = '<svg aria-hidden="true" style="position: absolute; width: 0px; height: 0px; overflow: hidden;"><symbol id="icon-chapter-s" viewBox="0 0 1024 1024"><path d="M725.108359 579.864261c11.519371-117.753568-94.714826-195.829303-165.110981-247.666471l-10.879406-7.679581-21.118846-15.359161c-40.317798-28.798427-81.915525-58.876784-95.994756-95.994756-15.999126-41.597728-13.439266-74.235945 7.67958-97.274686 26.878532-29.438392 90.235071-35.838042 120.313428-11.519371 26.238567 20.478881 26.878532 53.117098 24.958637 70.396154-2.55986 24.318672 14.719196 46.717448 39.037867 49.917274 24.318672 2.55986 46.717448-14.719196 49.917274-39.037868 7.039615-60.796679-14.079231-115.833673-58.236819-151.03175C547.838042-19.143018 432.644335-8.903578 373.127586 55.732892c-44.157588 47.997378-53.117098 115.193708-24.958637 189.429652 8.319546 23.038742 21.758811 42.877658 37.117973 60.156714-36.478007 34.558112-73.59598 78.075735-79.355665 138.872414C294.411886 561.94524 400.646083 640.020975 471.042237 691.858143l10.879406 7.679581 21.118846 15.359161c40.317798 28.798427 81.915525 58.876784 95.994757 95.994756 15.999126 41.597728 13.439266 74.235945-7.679581 97.274686-26.878532 29.438392-90.235071 35.838042-120.313428 11.519371-26.238567-20.478881-26.878532-53.117098-24.958636-70.396154 2.55986-24.318672-14.719196-46.717448-39.037868-49.917274s-46.717448 14.719196-49.917273 39.037868c-7.039615 60.796679 14.079231 115.833673 58.236819 151.03175 29.438392 23.038742 67.196329 34.558112 106.234197 34.558112 50.557238 0 102.394407-19.198951 135.672589-55.676959 44.157588-47.997378 53.117098-115.193708 24.958636-189.429652-8.319546-23.038742-21.758811-42.877658-37.117972-60.156714 36.478007-34.558112 74.235945-78.075735 79.99563-138.872414z m-201.588988 39.677833c-60.156714-44.157588-135.672589-99.834547-129.272939-166.390911 3.199825-33.278182 28.158462-60.156714 57.596854-87.675211 7.679581 5.759685 15.999126 11.519371 23.678707 17.279056 7.039615 5.11972 13.439266 9.599476 19.838916 14.719196l10.879406 8.319546c60.156714 44.157588 135.672589 99.834547 129.272938 166.39091-3.199825 33.278182-28.158462 60.156714-57.596854 87.675211-8.319546-5.759685-15.999126-11.519371-23.678706-17.279056-7.039615-5.11972-13.439266-9.599476-19.838917-14.719196l-10.879405-8.319545z"></path></symbol><symbol id="icon-chapter-l" viewBox="0 0 1024 1024"><path d="M791.272727 11.636364a81.454545 81.454545 0 0 1 81.175273 74.752L872.727273 93.090909v884.363636a34.909091 34.909091 0 0 1-51.060364 30.999273l-4.142545-2.606545-142.615273-101.888-142.615273 101.934545a34.909091 34.909091 0 0 1-30.813091 4.840727l-5.026909-2.048-4.747636-2.792727L349.090909 903.912727l-142.615273 101.934546a34.955636 34.955636 0 0 1-53.946181-18.944l-0.93091-4.654546L151.272727 977.454545V93.090909A81.454545 81.454545 0 0 1 226.024727 11.915636L232.727273 11.636364h558.545454z m-139.636363 605.090909H372.363636l-4.747636 0.325818A34.909091 34.909091 0 0 0 372.363636 686.545455h279.272728l4.747636-0.325819A34.909091 34.909091 0 0 0 651.636364 616.727273z m0-186.181818H372.363636l-4.747636 0.325818A34.909091 34.909091 0 0 0 372.363636 500.363636h279.272728l4.747636-0.325818A34.909091 34.909091 0 0 0 651.636364 430.545455z m0-186.181819H372.363636l-4.747636 0.325819A34.909091 34.909091 0 0 0 372.363636 314.181818h279.272728l4.747636-0.325818A34.909091 34.909091 0 0 0 651.636364 244.363636z"></path></symbol><symbol id="icon-toc" viewBox="0 0 1024 1024"><path d="M62.500473 512.163729l61.447491-40.958854 387.221112 202.039529L898.394281 471.204875l61.443397 40.958854-448.668603 244.728794L62.500473 512.163729zM62.500473 308.228013l448.668603-244.732887 448.668603 244.732887-448.668603 244.724701L62.500473 308.228013zM511.169075 877.18012l387.225205-202.035436 61.443397 40.958854L511.169075 960.836425 62.500473 716.104561l61.447491-40.958854L511.169075 877.18012z"></path></symbol><symbol id="icon-collapse" viewBox="0 0 1024 1024"><path d="M85.781832 219.399571h73.720856c20.35996 0 36.879928-16.359968 36.879928-36.559928s-16.519968-36.559929-36.879928-36.559929h-73.719856c-20.35996 0-36.860928 16.359968-36.860928 36.559929 0 20.199961 16.499968 36.559929 36.859928 36.559928zM50.462901 475.419071c0 20.199961 16.500968 36.579929 36.859928 36.579929h72.179859c20.35996 0 36.879928-16.379968 36.879928-36.579929s-16.519968-36.579929-36.879928-36.579928h-72.179859c-20.35996 0-36.859928 16.379968-36.859928 36.579928z m145.919715 292.577429c0-20.199961-16.519968-36.595929-36.879928-36.595929h-73.719856c-20.35996 0-36.860928 16.395968-36.860928 36.595929 0 20.180961 16.499968 36.562929 36.859928 36.562929h73.720856c20.35996 0 36.879928-16.381968 36.879928-36.562929z"></path><path d="M933.660176 38.839924l-73.718856-2.279995c0-20.198961-16.519968-36.559929-36.879928-36.559929h-661.998707c-20.35996 0-36.879928 16.359968-36.879928 36.559929v70.879861h36.879928s73.359857 6.840987 73.359857 73.140857c0 0 0.779998 73.279857-75.239853 73.279857l-34.999932 2.119996 0.759999 144.019719 34.399933-0.02s75.879852-0.02 75.879852 77.699848c0 0-7.057986 70.879862-76.179852 70.879862l-34.699932 0.019-0.619999 143.980718h36.740929s73.559856 2.279996 73.559856 75.437853c0 0-0.14 75.402853-76.179851 75.402853l-33.199935-2.279996-0.46 73.159857s42.239918 109.718786 106.759792 109.718786h705.018623s34.557933-6.877987 34.557932-34.298933V75.421853s-6.899987-36.580929-36.859928-36.580929zM306.9634 255.9795h479.238064v292.579429h-479.239064V255.9795zM897.939246 916.55821s1.159998 34.279933-37.999926 34.279933H233.243544s-38.019926-12.559975-38.019925-37.719926l627.838773-0.36c20.35996 0 36.879928-16.379968 36.879928-36.579928V69.719864l37.998926 12.559975v834.278371z"></path><path d="M694.042644 329.119357H399.14022c-10.19998 0-18.439964 8.199984-18.439964 18.319964 0 10.07998 8.239984 18.259964 18.439964 18.259965h294.901424c10.17898 0 18.418964-8.179984 18.418964-18.259965 0-10.11898-8.239984-18.319964-18.419964-18.319964z m0 109.719786H399.14022c-10.19998 0-18.439964 8.199984-18.439964 18.279964 0 10.11998 8.239984 18.299964 18.439964 18.299964h294.901424c10.17898 0 18.418964-8.179984 18.418964-18.299964 0-10.07998-8.239984-18.279964-18.419964-18.279964z"></path></symbol><symbol id="icon-chapter" viewBox="0 0 1024 1024"><path d="M832 128v768H256V128h576m64-64H192v896h704V64z"  ></path><path d="M161.3 296.2v-0.2H320v-40H161.3c-35.5 0-64.3 28.7-64.3 64s28.8 64 64.3 64h90v-40h-90v-0.2c-13.3 0-24.1-10.7-24.1-23.8 0-13.1 10.8-23.8 24.1-23.8z m0 192v-0.2H320v-40H161.3c-35.5 0-64.3 28.7-64.3 64s28.8 64 64.3 64h90v-40h-90v-0.2c-13.3 0-24.1-10.7-24.1-23.8 0-13.1 10.8-23.8 24.1-23.8z m0 192v-0.2H320v-40H161.3c-35.5 0-64.3 28.7-64.3 64s28.8 64 64.3 64h90v-40h-90v-0.2c-13.3 0-24.1-10.7-24.1-23.8 0-13.1 10.8-23.8 24.1-23.8z"  ></path><path d="M288 277a32 32 0 1 0 64 0 32 32 0 1 0-64 0zM288 469a32 32 0 1 0 64 0 32 32 0 1 0-64 0zM288 662a32 32 0 1 0 64 0 32 32 0 1 0-64 0zM384 256h385v40H384z m0 128h385v40H384z m0 128h385v40H384z m0 128h256v40H384z"  ></path></symbol><symbol id="icon-expand" viewBox="0 0 1024 1024"><path d="M731.093333 128c82.346667 0 158.08 20.906667 218.88 56.32 6.4 3.626667 10.026667 10.88 10.026667 18.346667v667.306666c0 12.16-9.386667 20.906667-19.84 20.906667-2.986667 0-5.76-0.64-8.746667-2.133333-57.386667-29.226667-126.08-46.08-200.32-46.08s-141.866667 17.066667-199.04 45.653333c-2.986667 1.493333-5.973333 2.986667-8.96 4.693333-0.426667 0.213333-0.853333 0.64-1.493333 0.853334-5.973333 3.2-13.226667 3.2-19.2 0-3.413333-1.92-6.826667-3.626667-10.453333-5.546667-56.96-28.586667-125.44-45.653333-199.04-45.653333s-143.146667 16.853333-200.32 46.08c-2.773333 1.493333-5.76 2.133333-8.746667 2.133333-10.453333 0-19.84-8.746667-19.84-20.906667V202.453333c0-7.68 3.84-14.72 10.026667-18.346666C134.826667 148.693333 210.56 128 292.906667 128S451.2 149.333333 512 184.746667C572.8 149.333333 648.746667 128 731.093333 128zM701.866667 187.733333c-71.466667 0-137.386667 17.92-189.866667 47.786667-52.693333-29.866667-118.613333-47.786667-189.866667-47.786667s-136.96 17.493333-189.653333 47.36c-5.546667 3.2-8.746667 9.173333-8.746667 15.573334v563.626666c0 10.24 8.106667 17.493333 17.066667 17.493334 2.56 0 5.12-0.64 7.466667-1.92 49.706667-24.533333 109.44-38.826667 173.653333-38.826667s123.093333 14.293333 172.373333 38.4c3.2 1.493333 6.186667 2.986667 9.173334 4.693333 5.12 2.773333 11.52 2.773333 16.64 0 0.64-0.213333 0.853333-0.426667 1.493333-0.853333l7.68-3.84c49.493333-24.106667 108.8-38.4 172.373333-38.4s123.946667 14.293333 173.653334 38.826667c2.56 1.28 5.12 1.92 7.466666 1.92 8.96 0 17.066667-7.466667 17.066667-17.493334V250.666667c0-6.4-3.2-12.373333-8.746667-15.573334-52.693333-29.866667-118.186667-47.573333-189.653333-47.573333z"  ></path><path d="M949.333333 771.84c-123.306667-71.68-260.266667-80.64-407.466666-26.666667V221.866667c0-16.426667-13.44-29.866667-29.866667-29.866667s-29.866667 13.44-29.866667 29.866667v529.066666c-120.533333-55.466667-253.226667-53.973333-395.093333 5.12-10.88 4.48-16 17.066667-11.52 27.946667 4.48 10.88 17.066667 16 27.946667 11.52 139.306667-58.026667 263.253333-57.173333 378.666666 2.773333v46.506667c0 16.426667 13.44 29.866667 29.866667 29.866667s29.866667-13.44 29.866667-29.866667v-53.973333c142.08-56.32 268.586667-50.56 386.133333 17.706666 3.413333 1.92 7.04 2.986667 10.666667 2.986667 7.253333 0 14.506667-3.84 18.56-10.666667a21.290667 21.290667 0 0 0-7.68-29.226666z"  ></path></symbol></svg>';
  wrapper.insertBefore(tocSvgs, wrapper.firstChild);

  const elements = wrapper.querySelectorAll('p,h1,h2,h3,h4,h5,h6');
  for (let i = 0; i < elements.length; i++) {
    element = elements[i];
    if (!firstHeadOne && element.tagName.toLowerCase() == 'h1') {
      firstHeadOne = true;
    }
    // Match the element text is [toc].
    // And replace this element with out list that classname is 'showdown-toc'.
    if (element.textContent.trim().toLowerCase() == '[toc]') {
      // New table of contents container.
      let showdownToc = wrapper.ownerDocument.createElement('div');
      showdownToc.classList.add('showdown-toc');
      if (!firstHeadOne) {
        const swtichToc = wrapper.ownerDocument.createElement('div');
        swtichToc.id = 'toc-switch-button';
        swtichToc.classList.add('toc-switch', 'hidden');
        swtichToc.innerHTML = '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-chapter-l"></use></svg>';
        element.parentNode.insertBefore(swtichToc, element);

        showdownToc.id = 'total-showdown-toc';
        showdownToc.classList.add('total-toc', 'hidden');
        showdownToc.innerHTML =
          '<div class="toc-pin"><span class="toc-pin-text">目录</span><div class="toc-fold-wrap"><div id="toc-fold-icon" class="toc-fold toc-icon" data-name="toc-expand"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-toc"></use></svg></div><div id="toc-close-icon" class="toc-close toc-icon"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-chapter-s"></use></svg></div></div></div>';
      }
      let tocView = wrapper.ownerDocument.createElement('div');
      tocView.className = 'toc-view';
      // let toc = wrapper.ownerDocument.createElement('ul');
      // tocView.appendChild(toc);
      showdownToc.appendChild(tocView);
      let tocNode = {
        parentNode: null,
        toc: tocView,
        headingLevel: headingLevel,
        preLevel: headingLevel,
        standalone: false,
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
      currTocNode.standalone = !firstHeadOne;
      element.parentNode.replaceChild(showdownToc, element);
      continue;
    }

    // That's going to be what we use as contents entries
    // for this table of contents.
    if (element['tagName']) {
      switch (element['tagName']) {
        case 'H1':
        case 'H2':
        case 'H3':
        case 'H4':
        case 'H5':
        case 'H6':
          headingLevel = parseInt(element['tagName'].substr(1));
          if (currTocNode) {
            // if (!currTocNode.preLevel) {
            //  currTocNode.preLevel = headingLevel;
            // }

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

function loadIconEvent() {
  const totalShowdownToc = document.querySelector('#total-showdown-toc');
  if (!totalShowdownToc) return;

  // if (totalShowdownToc.parentNode)
  //   totalShowdownToc.parentNode.classList.add('main-toc-row');

  const tocFoldIcon = document.querySelector('#toc-fold-icon');
  if (tocFoldIcon) {
    tocFoldIcon.onclick = (e) => {
      const chapters = document.querySelectorAll('.total-toc ul');
      const icons = document.querySelectorAll('.total-toc ul:not(.toc-main) .toc-multi-chapter use');
      if (tocFoldIcon.dataset.name === 'toc-expand') {
        chapters.forEach((element) => {
          if (!element.classList.contains('toc-main') && !element.classList.contains('toc-level-2')) {
            element.classList.add('hidden');
          }
        });
        icons.forEach((icon) => {
          icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#icon-collapse');
        });
        tocFoldIcon.dataset.name = 'toc-fold';
        return;
      }

      chapters.forEach((element) => {
        element.classList.remove('hidden');
      });
      icons.forEach((icon) => {
        icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#icon-expand');
      });
      tocFoldIcon.dataset.name = 'toc-expand';
    };
  }

  const tocCloseIcon = document.querySelector('#toc-close-icon');
  if (tocCloseIcon) {
    tocCloseIcon.onclick = (e) => {
      const totalToc = document.querySelector('#total-showdown-toc');
      if (totalToc) totalToc.classList.add('hidden');
      const switchToc = document.querySelector('#toc-switch-button');
      if (switchToc) switchToc.classList.remove('hidden');
    }
  }

  const tocSwitch = document.querySelector('#toc-switch-button');
  if (tocSwitch) {
    tocSwitch.onclick = (e) => {
      e.currentTarget.classList.add('hidden');
      const totalToc = document.querySelector('#total-showdown-toc');
      if (totalToc) totalToc.classList.remove('hidden');
    }
  }  

  const chapterIcons = document.querySelectorAll('.total-toc .toc-multi-chapter');
  chapterIcons.forEach((icon) => {
    icon.onclick = (e) => {
      let parent = e.currentTarget.parentNode;
      if (!parent) return;
      parent = parent.parentNode;
      if (!parent) return;

      const chapters = parent.querySelectorAll('ul');
      const icons = parent.querySelectorAll('.toc-multi-chapter use');
      const iconUse = e.currentTarget.querySelector('use');
      if (iconUse) {
        const href = iconUse.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        if (href === '#icon-expand') {
          chapters.forEach((element) => {
            element.classList.add('hidden');
          });
          icons.forEach((icon) => {
            icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#icon-collapse');
          });
          return;
        }

        chapters.forEach((element) => {
          element.classList.remove('hidden');
        });
        icons.forEach((icon) => {
          icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#icon-expand');
        });
      }
    };
  });
};

function showdownToc() {
  return [
    {
      type: 'output',
      filter: function (html) {
        if (typeof html === 'string') {
          // parse html
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const wrapper = typeof doc.body !== 'undefined' ? doc.body : doc;
          if (!renderTocElements(wrapper)) {
            return html;
          }
          // return html text content
          return wrapper.innerHTML;
        }

        const wrapper = html.wrapper;
        if (!wrapper) {
          return false;
        }

        let element = wrapper.querySelector('#toc-svgs');
        if (!element) {
          return false;
        }

        element.parentNode.removeChild(element);
        if (!html.extras) {
          html.extras = [];
        }
        if (!Array.isArray(html.extras)) {
          html.extras = [html.extras];
        }
        html.extras.push(element.outerHTML);

        element = wrapper.querySelector('#total-showdown-toc');
        if (!element) {
          return html;
        }

        element.parentNode.removeChild(element);
        element.classList.remove('hidden');
        html.extras.push(element.outerHTML);

        element = wrapper.querySelector('#toc-switch-button');
        if (element) {
          element.parentNode.removeChild(element);
          html.extras.push(element.outerHTML);
        }
       
        // 附加动态脚本
        if (html.scripts) {
           html.scripts = [];
        }
        if (!Array.isArray(html.scripts)) {
          html.scripts = [html.scripts];
        }
        const script = {
          inner: [
            {
              id: 'showdown-toc',
              code: loadIconEvent,
              host: '#total-showdown-toc'
            }
          ],
        };
        html.scripts.push(script);
        return html;
      },
    },
  ];
}

export default showdownToc;
