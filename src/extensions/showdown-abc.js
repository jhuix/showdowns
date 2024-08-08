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

const scriptCode = `
var abcOptions = {
	add_classes: true,
	responsive: "resize"
};

function cursorControl(id) {
	const self = this;

	self.onReady = function() {
	};
	self.onStart = function() {
    const tag = "#"+ id + " svg";
		const svg = document.querySelector(tag);
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

		const className = "#"+ id + " svg .highlight";
		const lastSelection = document.querySelectorAll(className);
		for (let k = 0; k < lastSelection.length; k++)
			lastSelection[k].classList.remove("highlight");

		for (let i = 0; i < ev.elements.length; i++ ) {
			const note = ev.elements[i];
			for (let j = 0; j < note.length; j++) {
				note[j].classList.add("highlight");
			}
		}

    const tag = "#"+ id + " svg .abcjs-cursor";
		const cursor = document.querySelector(tag);
		if (cursor) {
			cursor.setAttribute("x1", ev.left - 2);
			cursor.setAttribute("x2", ev.left - 2);
			cursor.setAttribute("y1", ev.top);
			cursor.setAttribute("y2", ev.top + ev.height);
		}
	};
	self.onFinished = function() {
		const className = "#"+ id + " svg .highlight";
		const els = document.querySelectorAll(className);
		for (let i = 0; i < els.length; i++ ) {
			els[i].classList.remove("highlight");
		}
    const tag = "#"+ id + " svg .abcjs-cursor";
		const cursor = document.querySelector(tag);
		if (cursor) {
			cursor.setAttribute("x1", 0);
			cursor.setAttribute("x2", 0);
			cursor.setAttribute("y1", 0);
			cursor.setAttribute("y2", 0);
		}
	};
}

function load(audio, render) {
  let synthControl;
  const id = "#" + audio;
	if (ABCJS.synth.supportsAudio()) {
		synthControl = new ABCJS.synth.SynthController();
		synthControl.load(id, new cursorControl(render.id), {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});
	} else {
		document.querySelector(id).innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
	}
	setTune(render, false, synthControl);
}

function setTune(render, userAction, synthControl) {
  const id = render.id;
  const abc = render.data;
  if (!synthControl) {
    ABCJS.renderAbc(id, abc, abcOptions)[0];
    return;
  }

  synthControl.disable(true);
	const visualObj = ABCJS.renderAbc(id, abc, abcOptions)[0];
	const midiBuffer = new ABCJS.synth.CreateSynth();
	midiBuffer.init({
		visualObj: visualObj,
	}).then(function (response) {
		// console.log(response);
		synthControl.setTune(visualObj, userAction).then(function (response) {
			console.log(format("Audio successfully loaded."));
		}).catch(function (error) {
			console.warn("Audio problem:", error);
		});
	}).catch(function (error) {
		console.warn("Audio problem:", error);
	});
}
`;

function onRenderAbc(resolve, scripts, meta) {
  if (hasAbc()) {
    const id = meta.id;
    const name = meta.className;
    const container = meta.container;
    let html = `<div id="${container}">`;
    html += `<div id="${id}" class="${name}"></div>`;
    if (!meta.lang || !meta.lang.audio) {
      const data = meta.data;
      const doc = meta.element.ownerDocument;
      html += '</div>';
      meta.element.parentNode.outerHTML = html;
      const element = doc.getElementById(id);
      ABCJS.renderAbc(element, data);
      return resolve(true);
    }

    const cssLink = meta.cssLink;
    const data = meta.data;
    const audio = id + '-audio';
    html += cssLink 
    ? `<div id="${audio}" class="css-abc" data-css="${cssLink}"></div>`
    : `<div id="${audio}"></div>`;
    html += '</div>';
    meta.element.parentNode.outerHTML = html;
    const script = {
      id: container,
      code: `(function() {
              load('${audio}', {
                id:'${id}',
                class:'${name}',
                data:\`${data}\`
              });
            })();`
    }
    scripts.push(script);
    return resolve(true);
  }

  setTimeout(() => {
    onRenderAbc(resolve, scripts, meta);
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
  const script = {
    outer:[
      {
        name: 'ABCJS',
        src: cdnjs.getSrc('ABCJS','jsdelivr')
      }
    ],
    id: 'abcjs-ext',    
    code: scriptCode,
    inner: []
  };
  scripts.push(script); 
  dyncLoadScript();
  return new Promise(resolve => {
    const promiseArray = [];
    elements.forEach(element => {
      promiseArray.push(renderAbc(element, script.inner));
    });
    Promise.all(promiseArray).then(() => {
      resolve(true);
    });
  });
}


function showdownAbc() {
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
