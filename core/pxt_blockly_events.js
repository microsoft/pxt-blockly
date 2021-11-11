/**
 * @license
 * PXT Blockly fork
 *
 * The MIT License (MIT)
 *
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @fileoverview Events fired as a result of UI actions in a pxt-blockly editor that are not fired
 * in Blockly.
 */
'use strict';

goog.provide('Blockly.Events.EndBlockDrag');

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockBase');
goog.require('Blockly.utils.object');

/**
 * Class for a block end drag event.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @param {boolean} isOutside True if the moved block is outside of the
 *     blocks workspace.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.EndBlockDrag = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.EndBlockDrag.superClass_.constructor.call(this, block);
  this.recordUndo = false;
  this.blockId = block.id;
  this.allNestedIds = block.getDescendants().map(function(b) { return b.id; });
};
Blockly.utils.object.inherits(Blockly.Events.EndBlockDrag, Blockly.Events.BlockBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.EndBlockDrag.prototype.type = Blockly.Events.END_DRAG;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.EndBlockDrag.prototype.toJson = function() {
  var json = Blockly.Events.EndBlockDrag.superClass_.toJson.call(this);
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  if (this.allNestedIds) {
    json['allNestedIds'] = this.allNestedIds;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.EndBlockDrag.prototype.fromJson = function(json) {
  Blockly.Events.EndBlockDrag.superClass_.fromJson.call(this, json);
  this.blockId = json['blockId'];
  this.allNestedIds = json['allNestedIds'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
  Blockly.Events.END_DRAG, Blockly.Events.EndBlockDrag);