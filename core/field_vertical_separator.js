/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Massachusetts Institute of Technology
 * https://developers.google.com/blockly/
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
 * @fileoverview Vertical separator field. Draws a vertical line.
 * @author ericr@media.mit.edu (Eric Rosenbaum)
 */
'use strict';

goog.provide('Blockly.FieldVerticalSeparator');

goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Size');


/**
 * Class for a vertical separator line.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldVerticalSeparator = function() {
  Blockly.FieldVerticalSeparator.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.FieldVerticalSeparator, Blockly.Field);

/**
 * Construct a FieldVerticalSeparator from a JSON arg object.
 * @param {!Object} _element A JSON object with options (unused, but passed in
 *     by Field.fromJson).
 * @returns {!Blockly.FieldVerticalSeparator} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldVerticalSeparator.fromJson = function(
    /* eslint-disable no-unused-vars */ _element
    /* eslint-enable no-unused-vars */) {
  return new Blockly.FieldVerticalSeparator();
};
/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldVerticalSeparator.prototype.EDITABLE = false;

/**
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldVerticalSeparator.prototype.initView = function() {
  var lineHeight = this.getConstants().ICON_SEPARATOR_HEIGHT;
  /** @type {SVGElement} */
  this.lineElement_ = Blockly.utils.dom.createSvgElement('line', {
    'stroke': this.sourceBlock_.style.colourSecondary,
    'stroke-linecap': 'round',
    'x1': 0,
    'y1': 0,
    'x2': 0,
    'y2': lineHeight
  }, this.fieldGroup_);

  this.size_ = new Blockly.utils.Size(1, lineHeight);

  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
};

/**
 * Set the height of the line element, without adjusting the field's height.
 * This allows the line's height to be changed without causing it to be
 * centered with the new height (needed for correct rendering of hat blocks).
 * @param {number} newHeight the new height for the line.
 * @package
 */
Blockly.FieldVerticalSeparator.prototype.setLineHeight = function(newHeight) {
  this.lineElement_.setAttribute('y2', newHeight);
};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldVerticalSeparator.prototype.dispose = function() {
  Blockly.utils.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  this.lineElement_ = null;
};

/**
 * Get the value of this field. A no-op in this case.
 * @return {string} null.
 * @override
 */
Blockly.FieldVerticalSeparator.prototype.getValue = function() {
  return null;
};

/**
 * Set the value of this field. A no-op in this case.
 * @param {?string} src New value.
 * @override
 */
Blockly.FieldVerticalSeparator.prototype.setValue = function(
    /* eslint-disable no-unused-vars */ src
    /* eslint-enable no-unused-vars */) {
  return;
};

/**
 * Set the text of this field. A no-op in this case.
 * @param {?string} alt New text.
 * @override
 */
Blockly.FieldVerticalSeparator.prototype.setText = function(
    /* eslint-disable no-unused-vars */ alt
    /* eslint-enable no-unused-vars */) {
  return;
};

/**
 * Separator lines are fixed width, no need to render.
 * @private
 */
Blockly.FieldVerticalSeparator.prototype.render_ = function() {
  // NOP
};

/**
 * Separator lines are fixed width, no need to update.
 * @private
 */
Blockly.FieldVerticalSeparator.prototype.updateWidth = function() {
 // NOP
};

Blockly.fieldRegistry.register(
    'field_vertical_separator', Blockly.FieldVerticalSeparator);
