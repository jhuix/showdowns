/*
 * Copyright (c) 2025-present, Jhuix (Hui Jin) <jhuix0117@gmail.com>. All rights reserved.
 * Use of this source code is governed by a MIT license that can be found in the LICENSE file.
 * Description: event bus
 */

'use strict';

/**
 * @typedef {(...args: any[]) => any} Callback
 *
 * class EventEmitter
 */
class EventEmitter {
  /** @type { [key: string]: Set<Callback> } */
  events = {};

  /** Event on
   *
   * @param {string} event
   * @param {Callback} callback
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = new Set();
    }
    this.events[event].add(callback);
  }

  /** Event off
   *
   * @param {string} event
   * @param {Callback} callback
   */
  off(event, callback) {
    this.events[event]?.delete(callback);
  }

  /** Event emit
   *
   * @param {string} event
   * @param {...any[]} [data]
   *
   * @returns {number}
   */
  emit(event, ...data) {
    let count = 0;
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(...data)
        count++;
      });
    }
    return count;
  }
}

const EventBus = new EventEmitter();

export { EventBus as default, EventBus };
