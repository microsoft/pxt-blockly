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
 * @fileoverview An object representing a single row on a rendered block and all
 * of its subcomponents.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.pxt.CollapsedInputRow');

goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

/**
 * An object containing information about a row representing a
 *   collapsed statement input.
 * @param {!Blockly.pxt.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Row}
 */
Blockly.pxt.CollapsedInputRow = function(constants) {
  Blockly.pxt.CollapsedInputRow.superClass_.constructor.call(this, constants);
  this.type |= Blockly.blockRendering.Types.INPUT_ROW;
};
Blockly.utils.object.inherits(Blockly.pxt.CollapsedInputRow,
    Blockly.blockRendering.Row);

/**
 * Inspect all subcomponents and populate all size properties on the row.
 * @package
 */
Blockly.pxt.CollapsedInputRow.prototype.measure = function() {
  this.width = this.minWidth;
  this.height = this.constants_.EMPTY_STATEMENT_INPUT_HEIGHT;
};