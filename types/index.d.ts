// Type definitions for src/showdowns.js
// Project: https://github.com/jhuix/showdowns.git
// Definitions by: Jhuix [Hui  Jin] <jhuix0117@gmail.com>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

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
  function addExtensions(
    extensions: ShowdownExtension[] | ShowdownExtension
  ): void;

  /**
   *
   * @return
   */
  function init(): /* !this */ any;

  /**
   *
   * @param doc
   * @return
   */
  function makeHtml(
    doc: { type: string; content: string } | string,
    callback: (type: object) => void | undefined
  ): string;

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

  /**
   *
   * @param data
   * @return string
   */
  function brDecode(data: string): string;

  /**
   *
   * @param data
   * @return string
   */
  function brEncode(data: string): string;
}

export default showdowns;
