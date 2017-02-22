/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Number input field
 * @author fenichel@google.com (Rachel Fenichel)
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.FieldNumber');

goog.require('Blockly.FieldTextInput');
goog.require('goog.math');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');

goog.require('goog.ui.Slider');

/**
 * Class for an editable number field.
 * @param {number|string} value The initial content of the field.
 * @param {number|string|undefined} opt_min Minimum value.
 * @param {number|string|undefined} opt_max Maximum value.
 * @param {number|string|undefined} opt_precision Precision for value.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldNumber =
    function(value, opt_min, opt_max, opt_precision, opt_validator) {
  value = String(value);
  Blockly.FieldNumber.superClass_.constructor.call(this, value, opt_validator);
  this.setConstraints(opt_min, opt_max, opt_precision);
};
goog.inherits(Blockly.FieldNumber, Blockly.FieldTextInput);

/**
 * Set the maximum, minimum and precision constraints on this field.
 * Any of these properties may be undefiend or NaN to be disabled.
 * Setting precision (usually a power of 10) enforces a minimum step between
 * values. That is, the user's value will rounded to the closest multiple of
 * precision. The least significant digit place is inferred from the precision.
 * Integers values can be enforces by choosing an integer precision.
 * @param {number|string|undefined} min Minimum value.
 * @param {number|string|undefined} max Maximum value.
 * @param {number|string|undefined} precision Precision for value.
 */
Blockly.FieldNumber.prototype.setConstraints = function(min, max, precision) {
  precision = parseFloat(precision);
  this.precision_ = isNaN(precision) ? 0 : precision;
  min = parseFloat(min);
  this.min_ = isNaN(min) ? -Infinity : min;
  max = parseFloat(max);
  this.max_ = isNaN(max) ? Infinity : max;
  this.setValue(this.callValidator(this.getValue()));
};

/**
 * Ensure that only a number in the correct range may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid number, or null if invalid.
 */
Blockly.FieldNumber.prototype.classValidator = function(text) {
  if (text === null) {
    return null;
  }
  text = String(text);
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  text = text.replace(/O/ig, '0');
  // Strip out thousands separators.
  text = text.replace(/,/g, '');
  var n = parseFloat(text || 0);
  if (isNaN(n)) {
    // Invalid number.
    return null;
  }
  // Round to nearest multiple of precision.
  if (this.precision_ && isFinite(n)) {
    n = Math.round(n / this.precision_) * this.precision_;
  }
  // Get the value in range.
  n = goog.math.clamp(n, this.min_, this.max_);
  return String(n);
};

/**
 * Show the inline free-text editor on top of the text.
 * @private
 */
Blockly.FieldNumber.prototype.showEditor_ = function() {
  Blockly.FieldNumber.superClass_.showEditor_.call(this);
  if (this.max_ == Infinity || this.min_ == -Infinity) {
    return;
  }

  var slider = new goog.ui.Slider();
  /** @type {!HTMLInputElement} */
  Blockly.FieldNumber.slider_ = slider;
  slider.setMoveToPointEnabled(true)
  slider.setMinimum(this.min_);
  slider.setMaximum(this.max_);
  slider.setRightToLeft(this.sourceBlock_.RTL);
  
  // Position the palette to line up with the field.
  // Record windowSize and scrollOffset before adding the palette.
  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var xy = this.getAbsoluteXY_();
  var borderBBox = this.getScaledBBox_();
  var div = Blockly.WidgetDiv.DIV;
  
  slider.render(div);
  
  var value = parseFloat(this.getValue());
  value = isNaN(value) ? 0 : value;
  slider.setValue(value);

  // Configure event handler.
  var thisField = this;
  Blockly.FieldNumber.changeEventKey_ = goog.events.listen(slider,
      goog.ui.Component.EventType.CHANGE,
      function(event) {
        var val = event.target.getValue() || 0;
        if (thisField.sourceBlock_) {
          // Call any validation function, and allow it to override.
          val = thisField.callValidator(val);
        }
        if (val !== null) {
          thisField.setValue(val);
          var htmlInput = Blockly.FieldTextInput.htmlInput_;
          htmlInput.value = val;
        }
      });
};

Blockly.FieldNumber.prototype.onHtmlInputChange_ = function(e) {
  Blockly.FieldNumber.superClass_.onHtmlInputChange_.call(this);
  if (Blockly.FieldNumber.slider_) {
    Blockly.FieldNumber.slider_.setValue(this.getValue())
  }
}

/**
 * Close the slider if this input is being deleted.
 */
Blockly.FieldNumber.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldNumber.superClass_.dispose.call(this);
};

/**
 * Hide the slider.
 * @private
 */
Blockly.FieldNumber.widgetDispose_ = function() {
  if (Blockly.FieldNumber.changeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldNumber.changeEventKey_);
  }
  Blockly.Events.setGroup(false);
};