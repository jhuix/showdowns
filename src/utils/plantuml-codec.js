/*
 * @Description: plantuml codec for PlantUML website
 * @Author: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @Date: 2019-08-30 10:02:40
 * @LastEditors: Jhuix (Hui Jin) <jhuix0117@gmail.com>
 * @LastEditTime: 2019-09-07 19:50:50
 * Encode/Decode code taken from the PlantUML website:
 * http://plantuml.sourceforge.net/codejavascript2.html
 */

"use strict";

import * as zlibcodec from "./zlib-codec.js";

function encodeuml(data) {
  const startuml = "@startuml";
  const enduml = "@enduml";
  const s = `${startuml}${String(data.split(startuml)[1]).split(enduml)[0] ||
    ""}${enduml}`;
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
