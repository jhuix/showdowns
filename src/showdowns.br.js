import showdowns from './showdowns';
import * as zlibcodec from './utils/zlib-codec.js';
import * as wasmBrotli from './utils/wasm_brotli_browser.js';

showdowns.brEncode = function(data) {
  if (zlibcodec.brEncode) {
    return zlibcodec.brEncode(data);
  }

  return Buffer.from(wasmBrotli.compress(Buffer.from(data))).toString('base64');
};

showdowns.brDecode = function(data) {
  if (zlibcodec.brDecode) {
    return zlibcodec.brDecode(data);
  }

  return Buffer.from(
    wasmBrotli.decompress(Buffer.from(data, 'base64'))
  ).toString();
};

showdowns.markdownDecodeFilter = function(doc) {
  switch (doc.type) {
    case 'br':
      return this.brDecode(doc.content);
  }
  return null;
};

export default showdowns;
