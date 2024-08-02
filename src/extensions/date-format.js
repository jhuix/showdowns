/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: Date format extension
 */
'use strict';
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h/H)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 1970-01-01 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 1970-1-1 8:9:4.18
Date.prototype.Format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'H+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };
  if (!fmt) fmt = 'yyyy-MM-dd hh:mm:ss.S';
  const matches = /(y+)/.exec(fmt);
  if (matches) fmt = fmt.replace(matches[1], (this.getFullYear() + '').substring(4 - matches[1].length));
  for (const k in o) {
    const m = new RegExp('(' + k + ')').exec(fmt)
    if (m) {
      let n = o[k];
      if (m[1].length == 1) n = ('000' + o[k]).substring(('' + o[k]).length);
      else if (m[1].length == 2) n = ('00' + o[k]).substring(('' + o[k]).length);
      fmt = fmt.replace(m[1], n);
    }
  }
  return fmt;
};
