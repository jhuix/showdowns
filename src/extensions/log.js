/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: dynamic loading js libs for local or cdnjs or jsdelivr
 */
'use strict';

import './date-format.js';

function format(s) {
    return `${new Date().Format('yyyy-MM-dd HH:mm:ss.S')} ${s}`
}

export default format;
