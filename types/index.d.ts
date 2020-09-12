/*
 * Copyright (c) 2019-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Type definitions for src/showdowns.js
 * Project: https://github.com/jhuix/showdowns.git
 */

import { ShowdownExtension, ShowdownOptions } from 'showdown';
/**
 *
 */
declare namespace showdowns {
  var defaultOptions: ShowdownOptions;

  var defaultExtensions: ShowdownExtension[];

  /**
   *
   * @param options
   */
  function addOptions(options: ShowdownOptions): void;

  /**
   *
   * @param extensions
   */
  function addExtensions(extensions: ShowdownExtension[] | ShowdownExtension): void;

  /**
   *
   * @return
   */
  function init(reset?: boolean | {option: boolean, extension: boolean}): /* !this */ any;

  /**
   *
   * @param doc
   * @return
   */
  function makeHtml(
    doc: { type: string; content: string } | string,
    callback?: (cssTypes: object) => void
  ): Promise<string>;

  /**
   *
   * @param data
   * @return string
   */
  function zDecode(data: string): string;

  /**
   *
   * @param data
   * @return string
   */
  function zEncode(data: string): string;
}

export default showdowns;
