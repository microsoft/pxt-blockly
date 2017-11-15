/**
 * @license
 * PXT Blockly
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * https://github.com/Microsoft/pxt-blockly
 *
 * See LICENSE file for details.
 */
/**
 * @fileoverview Number slider input field.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.FieldSlider');

goog.require('Blockly.FieldNumber');
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
 * @extends {Blockly.FieldNumber}
 * @constructor
 */
Blockly.FieldSlider = function (opt_value, opt_min, opt_max, opt_precision,
  opt_validator) {
  opt_value = (opt_value && !isNaN(opt_value)) ? String(opt_value) : '0';
  Blockly.FieldSlider.superClass_.constructor.call(
    this, opt_value, opt_validator);
  this.setConstraints(opt_min, opt_max, opt_precision);
};
goog.inherits(Blockly.FieldSlider, Blockly.FieldNumber);

/**
 * Show the inline free-text editor on top of the text.
 * @private
 */
Blockly.FieldSlider.prototype.showEditor_ = function () {
  Blockly.FieldSlider.superClass_.showEditor_.call(this, true);
  if (this.max_ == Infinity || this.min_ == -Infinity) {
    return;
  }
  var slider = new goog.ui.Slider();
  /** @type {!HTMLInputElement} */
  this.slider_ = slider;
  slider.setMoveToPointEnabled(true);
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
  Blockly.FieldSlider.changeEventKey_ = goog.events.listen(slider, goog.ui.Component.EventType.CHANGE, function (event) {
    var val = event.target.getValue() || 0;
    if (thisField.sourceBlock_) {
      // Call any validation function, and allow it to override.
      val = thisField.callValidator(val);
    }
    if (val !== null) {
      thisField.setValue(val);
      var htmlInput = Blockly.FieldTextInput.htmlInput_;
      htmlInput.value = val;
      htmlInput.focus();
    }
  });

  Blockly.FieldSlider.focusEventKey_ = goog.events.listen(slider.getElement(), goog.ui.Component.EventType.FOCUS, function (event) {
    // Switch focus to the HTML input field
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    htmlInput.focus();
  });
};

Blockly.FieldSlider.prototype.onHtmlInputChange_ = function (e) {
  Blockly.FieldSlider.superClass_.onHtmlInputChange_.call(this);
  if (this.slider_) {
    this.slider_.setValue(parseFloat(this.getValue()));
  }
};

/**
 * Close the slider if this input is being deleted.
 */
Blockly.FieldSlider.prototype.dispose = function () {
  if (Blockly.FieldSlider.changeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldSlider.changeEventKey_);
  }
  if (Blockly.FieldSlider.focusEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldSlider.focusEventKey_);
  }
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldSlider.superClass_.dispose.call(this);
};
