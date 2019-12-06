/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
/*
 * Modified by jhuix, 2019 (c) https://github.com/jhuix/showdowns
 * Based on wasm_brotli_browser.js, Version 2.0.2, Copyright (c) 2019 Dylan Frankland https://github.com/dfrankland/wasm-brotli.git
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import wasmBrotliBG from './wasm_brotli_browser_bg.wasm';

//Add async wasm of event, by jhuix in 2019
let wasm = {};
wasmBrotliBG({
  './wasm_brotli_browser.js': {
    __wbindgen_string_new: function(a0, a1) {
      return __wbindgen_string_new(a0, a1);
    },
    __wbindgen_rethrow: function(a0) {
      return __wbindgen_rethrow(a0);
    }
  }
}).then(mod => {
  wasm = (mod.instance || mod).exports;
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(
      new CustomEvent('wasm', {
        detail: {
          name: 'wasm_brotli_browser_bg.wasm',
          instance: wasm
        }
      })
    );
  } else {
    new require('events').EventEmitter().emit('wasm', [
      {
        name: 'wasm_brotli_browser_bg.wasm',
        instance: wasm
      }
    ]);
  }
});

let cachegetUint8Memory = null;
function getUint8Memory() {
  if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
    cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm(arg) {
  const ptr = wasm.__wbindgen_malloc(arg.length * 1);
  getUint8Memory().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

let cachegetInt32Memory = null;
function getInt32Memory() {
  if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
    cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory;
}

function getArrayU8FromWasm(ptr, len) {
  return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
}
/**
 * @param {Uint8Array} buffer
 * @returns {Uint8Array}
 */
export function compress(buffer) {
  const retptr = 8;
  const ret = wasm.compress(retptr, passArray8ToWasm(buffer), WASM_VECTOR_LEN);
  const memi32 = getInt32Memory();
  const v0 = getArrayU8FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
  wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
  return v0;
}

/**
 * @param {Uint8Array} buffer
 * @returns {Uint8Array}
 */
export function decompress(buffer) {
  const retptr = 8;
  const ret = wasm.decompress(retptr, passArray8ToWasm(buffer), WASM_VECTOR_LEN);
  const memi32 = getInt32Memory();
  const v0 = getArrayU8FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
  wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
  return v0;
}

let cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
});

cachedTextDecoder.decode();

function getStringFromWasm(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

function getObject(idx) {
  return heap[idx];
}

function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

export const __wbindgen_string_new = function(arg0, arg1) {
  const ret = getStringFromWasm(arg0, arg1);
  return addHeapObject(ret);
};

export const __wbindgen_rethrow = function(arg0) {
  throw takeObject(arg0);
};
