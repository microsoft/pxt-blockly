/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Serialized label field.  Behaves like a normal label but is
 *     always serialized to XML.  It may only be edited programmatically.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FieldLabelHover');

goog.require('Blockly.FieldLabel');


/**
 * Class for a variable getter field.
 * @param {string} text The initial content of the field.
 * @param {string} opt_class Optional CSS class for the field's text.
 * @extends {Blockly.FieldLabel}
 * @constructor
 *
 */
Blockly.FieldLabelHover = function(text, opt_class) {
  Blockly.FieldLabelHover.superClass_.constructor.call(this, text,
      opt_class);
  // Used in base field rendering, but we don't need it.
  this.arrowWidth_ = 0;
};
goog.inherits(Blockly.FieldLabelHover, Blockly.FieldLabel);

/**
 * Install this field on a block.
 */
Blockly.FieldLabelHover.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  Blockly.FieldLabelHover.superClass_.init.call(this);

  if (this.sourceBlock_.isEditable()) {
    this.mouseOverWrapper_ =
        Blockly.bindEvent_(
            this.getClickTarget_(), 'mouseover', this, this.onMouseOver_);
    this.mouseOutWrapper_ =
        Blockly.bindEvent_(
            this.getClickTarget_(), 'mouseout', this, this.onMouseOut_);
  }
};

/**
 * Construct a FieldLabelHover from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, and class).
 * @returns {!Blockly.FieldLabelHover} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldLabelHover.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  return new Blockly.FieldLabelHover(text, options['class']);
};

/**
 * Editable fields usually show some sort of UI for the user to change them.
 * This field should be serialized, but only edited programmatically.
 * @type {boolean}
 * @public
 */
Blockly.FieldLabelHover.prototype.EDITABLE = false;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not.  This field should be serialized, but only edited programmatically.
 * @type {boolean}
 * @public
 */
Blockly.FieldLabelHover.prototype.SERIALIZABLE = true;

/**
 * Updates the width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails. Once
 * it eventually does succeed, the result will be cached.
 **/
Blockly.FieldLabelHover.prototype.updateWidth = function() {
  // Set width of the field.
  // Unlike the base Field class, this doesn't add space to editable fields.
  this.size_.width = Blockly.Field.getCachedWidth(this.textElement_);
};

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.FieldLabelHover.prototype.render_ = function() {
  if (this.visible_ && this.textElement_) {
    // Replace the text.
    goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_));
    var textNode = document.createTextNode(this.getDisplayText_());
    this.textElement_.appendChild(textNode);
    this.updateWidth();

    // Update text centering, based on newly calculated width.
    var centerTextX = this.size_.width / 2;

    // If half the text length is not at least center of
    // visible field (FIELD_WIDTH), center it there instead.
    var minOffset = Blockly.BlockSvg.FIELD_WIDTH / 2;
    if (this.sourceBlock_.RTL) {
      // X position starts at the left edge of the block, in both RTL and LTR.
      // First offset by the width of the block to move to the right edge,
      // and then subtract to move to the same position as LTR.
      var minCenter = this.size_.width - minOffset;
      centerTextX = Math.min(minCenter, centerTextX);
    } else {
      // (width / 2) should exceed Blockly.BlockSvg.FIELD_WIDTH / 2
      // if the text is longer.
      centerTextX = Math.max(minOffset, centerTextX);
    }
    // Apply new text element x position.
    this.textElement_.setAttribute('x', centerTextX);
  }
};

/**
 * Handle a mouse over event on a input field.
 * @param {!Event} e Mouse over event.
 * @private
 */
Blockly.FieldLabelHover.prototype.onMouseOver_ = function(e) {
  if (this.sourceBlock_.isInFlyout || !this.sourceBlock_.isShadow()) return;
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture && gesture.isDragging()) return;
  if (this.sourceBlock_.svgPath_) {
    Blockly.utils.addClass(this.sourceBlock_.svgPath_, 'blocklyFieldHover');
    this.sourceBlock_.svgPath_.style.strokeDasharray = '2';
  }
};

/**
 * Clear hover effect on the block
 * @param {!Event} e Clear hover effect
 */
Blockly.FieldLabelHover.prototype.clearHover = function() {
  if (this.sourceBlock_.svgPath_) {
    Blockly.utils.removeClass(this.sourceBlock_.svgPath_, 'blocklyFieldHover');
    this.sourceBlock_.svgPath_.style.strokeDasharray = '';
  }
};

/**
 * Handle a mouse out event on a input field.
 * @param {!Event} e Mouse out event.
 * @private
 */
Blockly.FieldLabelHover.prototype.onMouseOut_ = function(e) {
  if (this.sourceBlock_.isInFlyout || !this.sourceBlock_.isShadow()) return;
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture && gesture.isDragging()) return;
  this.clearHover();
};

/**
 * Dispose of this field.
 * @public
 */
Blockly.FieldLabelHover.dispose = function() {
  if (this.mouseOverWrapper_) {
    Blockly.unbindEvent_(this.mouseOverWrapper_);
    this.mouseOverWrapper_ = null;
  }
  if (this.mouseOutWrapper_) {
    Blockly.unbindEvent_(this.mouseOutWrapper_);
    this.mouseOutWrapper_ = null;
  }
  Blockly.FieldLabelHover.superClass_.dispose.call(this);
  this.workspace_ = null;
  this.variableMap_ = null;
};

Blockly.Field.register('field_label_hover', Blockly.FieldLabelHover);
