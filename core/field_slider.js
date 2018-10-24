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
 * @param {number|string|undefined} opt_labelText Label text
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.FieldNumber}
 * @constructor
 */
Blockly.FieldSlider = function(value_, opt_min, opt_max, opt_precision,
    opt_step, opt_labelText, opt_validator) {
  Blockly.FieldSlider.superClass_.constructor.call(this, value_,
      opt_validator);
  this.min_ = parseFloat(opt_min);
  this.max_ = parseFloat(opt_max);
  this.step_ = parseFloat(opt_step);
  this.labelText_ = opt_labelText;
  this.precision_ = parseFloat(opt_precision);
};
goog.inherits(Blockly.FieldSlider, Blockly.FieldNumber);

/**
 * Construct a FieldSlider from a JSON arg object.
 * @param {!Object} options A JSON object with options (value, min, max, and
 *                          precision, step, labelText).
 * @returns {!Blockly.FieldSlider} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldSlider.fromJson = function(options) {
  return new Blockly.FieldSlider(options['value'],
      options['min'], options['max'], options['precision'],
      options['step'], options['labelText']);
};

Blockly.FieldSlider.prototype.setOptions = function(min, max, step, precision) {
  this.min_ = parseFloat(min);
  this.max_ = parseFloat(max);
  this.step_ = parseFloat(step) || undefined;
  this.precision_ = parseFloat(precision) || undefined;

  var numRestrictor = this.getNumRestrictor(this.min_, this.max_, this.precision_);
  this.setRestrictor(numRestrictor);
};

Blockly.FieldSlider.prototype.setLabel = function(labelText) {
  if (labelText != undefined) this.labelText_ = labelText;
};

Blockly.FieldSlider.prototype.setColor = function(color) {
  if (color != undefined) this.sliderColor_ = color;
};

Blockly.FieldSlider.prototype.init = function() {
  Blockly.FieldTextInput.superClass_.init.call(this);
  this.setValue(this.getValue());

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
 * Show the inline free-text editor on top of the text.
 * @param {!Event} e A mouse down or touch start event.
 * @private
 */
Blockly.FieldSlider.prototype.showEditor_ = function(e) {
  Blockly.FieldSlider.superClass_.showEditor_.call(this, e, false);
  if (this.max_ == Infinity || this.min_ == -Infinity) {
    return;
  }

  this.showSlider_();

  this.setValue(this.getValue());
};

/**
 * Show the slider.
 * @private
 */
Blockly.FieldSlider.prototype.showSlider_ = function() {
  // If there is an existing drop-down someone else owns, hide it immediately
  // and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();

  // Accessibility properties
  contentDiv.setAttribute('role', 'menu');
  contentDiv.setAttribute('aria-haspopup', 'true');

  this.addSlider_(contentDiv);

  // Set colour and size of drop-down
  Blockly.DropDownDiv.setColour('#ffffff', '#dddddd');
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

  if (this.slider_) this.slider_.setVisible(true);
};

/**
 * Add the slider.
 * @private
 */
Blockly.FieldSlider.prototype.addSlider_ = function(contentDiv) {
  if (this.labelText_) {
    var elements = this.createLabelDom_(this.labelText_);
    contentDiv.appendChild(elements[0]);
    this.readout_ = elements[1];
  }
  this.slider_ = new goog.ui.Slider();
  this.slider_.setMoveToPointEnabled(false);
  this.slider_.setMinimum(this.min_);
  this.slider_.setMaximum(this.max_);
  if (this.step_) this.slider_.setUnitIncrement(this.step_);
  this.slider_.setRightToLeft(this.sourceBlock_.RTL);

  var value = parseFloat(this.getValue());
  value = isNaN(value) ? 0 : value;
  this.slider_.setValue(value);

  this.slider_.render(contentDiv);

  // Configure event handler.
  var thisField = this;
  Blockly.FieldSlider.changeEventKey_ = goog.events.listen(this.slider_,
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
          htmlInput.focus();
        }
      });

  Blockly.FieldSlider.focusEventKey_ = goog.events.listen(this.slider_.getElement(),
      goog.ui.Component.EventType.FOCUS,
      function(/*event*/) {
        // Switch focus to the HTML input field
        var htmlInput = Blockly.FieldTextInput.htmlInput_;
        htmlInput.focus();
      });
};

/**
 * Create label DOM.
 * @private
 */
Blockly.FieldSlider.prototype.createLabelDom_ = function(labelText) {
  var labelContainer = document.createElement('div');
  labelContainer.setAttribute('class', 'blocklyFieldSliderLabel');
  var readout = document.createElement('span');
  readout.setAttribute('class', 'blocklyFieldSliderReadout');
  var label = document.createElement('span');
  label.setAttribute('class', 'blocklyFieldSliderLabelText');
  label.innerHTML = labelText;
  labelContainer.appendChild(label);
  labelContainer.appendChild(readout);
  return [labelContainer, readout];
};

/**
 * Set value.
 */
Blockly.FieldSlider.prototype.setValue = function(value) {
  Blockly.FieldSlider.superClass_.setValue.call(this, value);
  this.updateSliderHandles_();
  this.updateDom_();
};

/**
 * Update the DOM.
 * @private
 */
Blockly.FieldSlider.prototype.updateDom_ = function() {
  if (this.slider_ && this.readout_) {
    // Update the slider background
    this.setBackground_(this.slider_.getElement());
    this.setReadout_(this.readout_, this.getValue());
  }
};

/**
 * Set the slider background.
 * @private
 */
Blockly.FieldSlider.prototype.setBackground_ = function(slider) {
  if (this.sliderColor_) {
    goog.style.setStyle(slider, 'background', this.sliderColor_);
  }
  else if (this.sourceBlock_.isShadow() && this.sourceBlock_.parentBlock_) {
    goog.style.setStyle(slider, 'background', this.sourceBlock_.parentBlock_.getColourTertiary());
  }
};

/**
 * Set readout.
 * @private
 */
Blockly.FieldSlider.prototype.setReadout_ = function(readout, value) {
  readout.innerHTML = value;
};

/**
 * Update slider handles.
 * @private
 */
Blockly.FieldSlider.prototype.updateSliderHandles_ = function() {
  if (this.slider_) {
    this.slider_.setValue(parseFloat(this.getValue()));
  }
};

Blockly.FieldSlider.prototype.onHtmlInputChange_ = function(e) {
  Blockly.FieldSlider.superClass_.onHtmlInputChange_.call(this, e);
  if (this.slider_) {
    this.slider_.setValue(parseFloat(this.getValue()));
  }
};

/**
 * Close the slider if this input is being deleted.
 */
Blockly.FieldSlider.prototype.dispose = function() {
  if (Blockly.FieldSlider.changeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldSlider.changeEventKey_);
  }
  if (Blockly.FieldSlider.focusEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldSlider.focusEventKey_);
  }
  Blockly.Events.setGroup(false);
  Blockly.FieldSlider.superClass_.dispose.call(this);
};

Blockly.Field.register('field_slider', Blockly.FieldSlider);
