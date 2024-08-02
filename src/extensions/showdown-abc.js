/*
 * Copyright (c) 2024-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: showdown abc extension for markdown
 */
'use strict';

const extName = 'abc';
const cssCdnName = 'ABCJSCSS';

if (typeof window === 'undefined') {
  throw Error('The showdown abcjs extension can only be used in browser environment!');
}

import format from './log';
import cdnjs from './cdn';
import utils from './utils';

if (typeof ABCJS === 'undefined') {
    var ABCJS = window.ABCJS || undefined;
}  

function hasAbc() {
    return !!ABCJS;
}

let dync = false;
function dyncLoadScript() {
  const sync = hasAbc();
  if (typeof window !== 'undefined') {
    if (dync) {
      return sync;
    }

    if (!sync) {
      dync = true;
      cdnjs.loadStyleSheet(cssCdnName);
      utils.loadStyle('abc-audio', '.highlight{fill: #0a9ecc;} .abcjs-cursor{stroke: red;}' +
         ' .abcjs-inline-audio .abcjs-midi-loop.abcjs-pushed{border: none;}' +
         ' .abcjs-inline-audio .abcjs-midi-loop.abcjs-pushed svg path{fill: #6eaa49;}');
      cdnjs.loadScript('ABCJS').then(name => {
        ABCJS = utils.interopDefault(window[name]);
      });
    }
  }
  return sync;
}

function unloadScript() {
  if (!hasAbc()) return;
  cdnjs.unloadScript('ABCJS');
  cdnjs.unloadStyleSheet(cssCdnName);
  ABCJS = null;
  window.ABCJS = null;
  dync = false;
}

var abcOptions = {
	add_classes: true,
	responsive: "resize"
};

function CursorControl(id) {
	const self = this;

	self.onReady = function() {
	};
	self.onStart = function() {
		const svg = document.querySelector(`#${id} svg`);
		const cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
		cursor.setAttribute("class", "abcjs-cursor");
		cursor.setAttributeNS(null, 'x1', 0);
		cursor.setAttributeNS(null, 'y1', 0);
		cursor.setAttributeNS(null, 'x2', 0);
		cursor.setAttributeNS(null, 'y2', 0);
		svg.appendChild(cursor);

	};
	self.beatSubdivisions = 2;
	self.onBeat = function(beatNumber, totalBeats, totalTime) {
	};
	self.onEvent = function(ev) {
		if (ev.measureStart && ev.left === null)
			return; // this was the second part of a tie across a measure line. Just ignore it.

		const lastSelection = document.querySelectorAll(`#${id} svg .highlight`);
		for (let k = 0; k < lastSelection.length; k++)
			lastSelection[k].classList.remove("highlight");

		for (let i = 0; i < ev.elements.length; i++ ) {
			const note = ev.elements[i];
			for (let j = 0; j < note.length; j++) {
				note[j].classList.add("highlight");
			}
		}

		const cursor = document.querySelector(`#${id} svg .abcjs-cursor`);
		if (cursor) {
			cursor.setAttribute("x1", ev.left - 2);
			cursor.setAttribute("x2", ev.left - 2);
			cursor.setAttribute("y1", ev.top);
			cursor.setAttribute("y2", ev.top + ev.height);
		}
	};
	self.onFinished = function() {
		const els = document.querySelectorAll(`#${id} svg .highlight`);
		for (let i = 0; i < els.length; i++ ) {
			els[i].classList.remove("highlight");
		}
		const cursor = document.querySelector(`#${id} svg .abcjs-cursor`);
		if (cursor) {
			cursor.setAttribute("x1", 0);
			cursor.setAttribute("x2", 0);
			cursor.setAttribute("y1", 0);
			cursor.setAttribute("y2", 0);
		}
	};
}

let synthControl;

function load(audio, render, abc) {
	if (ABCJS.synth.supportsAudio()) {
		synthControl = new ABCJS.synth.SynthController();
		synthControl.load(`#${audio}`, new CursorControl(render), {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});
	} else {
		document.querySelector(`#${audio}`).innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
	}
	setTune(render, false, abc);
}

function setTune(render, userAction, abc) {
	synthControl.disable(true);
	const visualObj = ABCJS.renderAbc(`${render}`, abc, abcOptions)[0];
	const midiBuffer = new ABCJS.synth.CreateSynth();
	midiBuffer.init({
		visualObj: visualObj,
	}).then(function (response) {
		// console.log(response);
		if (synthControl) {
			synthControl.setTune(visualObj, userAction).then(function (response) {
				console.log(format("Audio successfully loaded."));
			}).catch(function (error) {
				console.warn("Audio problem:", error);
			});
		}
	}).catch(function (error) {
		console.warn("Audio problem:", error);
	});
}

function onRenderAbc(resolve, scripts, res) {
  if (hasAbc()) {
    const id = res.id;
    const name = res.className;
    const data = btoa(res.data);
    const cssLink = res.cssLink;
    // const doc = res.element.ownerDocument;
    const audio = id + '-audio';
    let html = cssLink
      ? `<div id="${id}" class="${name} css-abc" data-css="${cssLink}"></div>`
      : `<div id="${id}" class="${name}"></div>`;
    html +=`<div id="${audio}"></div>`;
    res.element.parentNode.outerHTML = html;
    // const renderElement = doc.getElementById(id);
    // ABCJS.renderAbc(element, data);
    const script = {
      id: id,
      code: `(function() {
              if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('abcjs',{
                  detail: {
                    audio: '${audio}',
                    render: '${id}',
                    data: '${data}'
                  }
                }));
              }
            })();`
    }
    scripts.push(script);
    return resolve(true);
  }

  setTimeout(() => {
    onRenderAbc(resolve, scripts, res);
  }, 10);
}

/**
 * render abc graphs
 */
function renderAbc(element, scripts) {
  return new Promise(resolve => {
    let meta = utils.createElementMeta(extName, element);
    if (!meta) {
      return resolve(false);
    }

    meta.cssLink = cdnjs.getSrc(cssCdnName);
    onRenderAbc(resolve, scripts, meta);
  });
}

// <div class="abc"></div>
function renderAbcElements(elements, scripts) {
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderAbc(element, scripts));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}


function showdownAbc() {
  let hasEvent = false;
  return [
    {
      type: 'output',
      filter: function(obj) {
        const wrapper = obj.wrapper;
        if (!wrapper) {
          return false;
        }
        // find the abc in code blocks
        const elements = wrapper.querySelectorAll(`code.${extName}.language-${extName}`);
        if (!elements.length) {
          return false;
        }

        if (!hasEvent) {
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            hasEvent = true;
            // Listen sequence custom event
            window.addEventListener('abcjs', event => {
              if (event.detail) {
                load(event.detail.audio, event.detail.render, atob(event.detail.data));
              }
            });              
          }
        }

        this.config = {
          cssLink: cdnjs.getSrc(cssCdnName)
        };
        console.log(format(`Begin render ${extName} elements.`));
        return renderAbcElements(elements, obj.scripts).then(() => {
          console.log(format(`End render ${extName} elements.`));
          return obj;
        });
      }
    }
  ];
}

export default showdownAbc;
