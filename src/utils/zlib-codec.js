/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: zlib codec for PlantUML website
 * Encode/Decode code taken from the PlantUML website:
 * http://plantuml.sourceforge.net/codejavascript2.html
 */
'use strict';

import zlib from 'zlib';

function encode64(data) {
  var r = '';
  for (var i = 0; i < data.length; i += 3) {
    if (i + 2 == data.length) {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
    } else if (i + 1 == data.length) {
      r += append3bytes(data.charCodeAt(i), 0, 0);
    } else {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2));
    }
  }
  return r;
}

function append3bytes(b1, b2, b3) {
  var c1 = b1 >> 2;
  var c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  var c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  var c4 = b3 & 0x3f;
  var r = '';
  r += encode6bit(c1 & 0x3f);
  r += encode6bit(c2 & 0x3f);
  r += encode6bit(c3 & 0x3f);
  r += encode6bit(c4 & 0x3f);
  return r;
}

function encode6bit(b) {
  if (b < 10) {
    return String.fromCharCode(48 + b);
  }
  b -= 10;
  if (b < 26) {
    return String.fromCharCode(65 + b);
  }
  b -= 26;
  if (b < 26) {
    return String.fromCharCode(97 + b);
  }
  b -= 26;
  if (b == 0) {
    return '-';
  }
  if (b == 1) {
    return '_';
  }
  return '?';
}

function decode6bit(cc) {
  var c = cc.charCodeAt(0);
  if (cc === '_') return 63;
  if (cc === '-') return 62;
  if (c >= 97) return c - 61; // - 97 + 26 + 10
  if (c >= 65) return c - 55; // - 65 + 10
  if (c >= 48) return c - 48;
  return '?';
}

function extract3bytes(data) {
  var c1 = decode6bit(data[0]);
  var c2 = decode6bit(data[1]);
  var c3 = decode6bit(data[2]);
  var c4 = decode6bit(data[3]);
  var b1 = (c1 << 2) | ((c2 >> 4) & 0x3f);
  var b2 = ((c2 << 4) & 0xf0) | ((c3 >> 2) & 0xf);
  var b3 = ((c3 << 6) & 0xc0) | (c4 & 0x3f);
  return [b1, b2, b3];
}

function decode64(data) {
  var r = '';
  var i = 0;
  for (i = 0; i < data.length; i += 4) {
    var t = extract3bytes(data.substring(i, i + 4));
    r = r + String.fromCharCode(t[0]);
    r = r + String.fromCharCode(t[1]);
    r = r + String.fromCharCode(t[2]);
  }
  return r;
}

function encode(data) {
  return encode64(
    zlib
      .deflateRawSync(data, {
        level: 9
      })
      .toString('binary')
  );
}

function decode(data) {
  return zlib.inflateRawSync(Buffer.from(decode64(data), 'binary')).toString();
}

function zEncode(data) {
  return zlib
    .deflateRawSync(data, {
      level: 9
    })
    .toString('base64');
}

function zDecode(data) {
  return zlib.inflateRawSync(Buffer.from(data, 'base64')).toString();
}

const brEncode =
  typeof zlib.brotliCompressSync === 'undefined'
    ? undefined
    : function(data) {
        return zlib
          .brotliCompressSync(Buffer.from(data), {
            params: {
              [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
              [zlib.constants.BROTLI_PARAM_QUALITY]: 11
            }
          })
          .toString('base64');
      };

const brDecode =
  typeof zlib.brotliDecompressSync === 'undefined'
    ? undefined
    : function(data) {
        return zlib.brotliDecompressSync(Buffer.from(data, 'base64')).toString();
      };

const zlibcodec = { encode, decode, brEncode, brDecode };
export { zlibcodec as default, encode, decode, zEncode, zDecode, brEncode, brDecode };
