/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: plantuml codec for PlantUML website
 * Encode/Decode code taken from the PlantUML website:
 * http://plantuml.sourceforge.net/codejavascript2.html
 */

'use strict';

import * as zlibcodec from './zlib-codec.js';

function encodeuml(data) {
  const startuml = '@startuml';
  const enduml = '@enduml';
  const s = `${startuml}${String(data.split(startuml)[1]).split(enduml)[0] || ''}${enduml}`;
  return zlibcodec.encode(s);
}

function decodeuml(data) {
  return zlibcodec.decode(data);
}

const plantumlcodec = {
  encodeuml,
  decodeuml
};

export { plantumlcodec as default, encodeuml, decodeuml };
