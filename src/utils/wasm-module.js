/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 */
function _loadWasmModule(sync, src, imports) {
  var buf = null;
  var isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  if (isNode) {
    buf = Buffer.from(src, 'base64');
  } else {
    var raw = window.atob(src);
    var rawLength = raw.length;
    buf = new Uint8Array(new ArrayBuffer(rawLength));
    for (var i = 0; i < rawLength; i++) {
      buf[i] = raw.charCodeAt(i);
    }
  }

  if (imports && !sync) {
    return WebAssembly.instantiate(buf, imports);
  } else if (!imports && !sync) {
    return WebAssembly.compile(buf);
  } else {
    var mod = new WebAssembly.Module(buf);
    return imports ? new WebAssembly.Instance(mod, imports) : mod;
  }
}

export default _loadWasmModule;
