/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview pxt renderer.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.pxt.RenderInfo');

goog.require('Blockly.pxt.CollapsedInputRow');
goog.require('Blockly.utils.object');
goog.require('Blockly.zelos.RenderInfo');


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Blockly.pxt.Renderer} renderer The renderer in use.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @constructor
 * @extends {Blockly.zelos.RenderInfo}
 * @package
 */
Blockly.pxt.RenderInfo = function(renderer, block) {
  Blockly.pxt.RenderInfo.superClass_.constructor.call(this, renderer, block);
};
Blockly.utils.object.inherits(Blockly.pxt.RenderInfo,
    Blockly.zelos.RenderInfo);

/**
 * Adds a collapsed row element for custom collapsed block rendering
 * @param {!Blockly.blockRendering.Row} activeRow The row that is currently being
 *     populated.
 * @protected
 */
Blockly.pxt.RenderInfo.prototype.addCollapsedRow_ = function(activeRow) {
  this.rows.push(activeRow);
  activeRow = new Blockly.pxt.CollapsedInputRow(this.constants_);
  this.inputRowNum_ ++;
  activeRow.isCollapsedStack = true;
  activeRow.hasDummyInput = true;
  return activeRow;
};