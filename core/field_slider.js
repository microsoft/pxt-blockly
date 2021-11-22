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
goog.require('Blockly.utils.object');
goog.require('goog.math');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');

goog.require('goog.ui.Slider');

/**
 * Class for an editable number field.
 * @param {(string|number)=} opt_value The initial content of the field. The value
 *     should cast to a number, and if it does not, '0' will be used.
 * @param {(string|number)=} opt_min Minimum value.
 * @param {(string|number)=} opt_max Maximum value.
 * @param {(string|number)=} opt_precision Precision for value.
 * @param {(string|number)=} opt_step Step.
 * @param {(string|number)=} opt_labelText Label text.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.FieldNumber}
 * @constructor
 */
Blockly.FieldSlider = function(opt_value, opt_min, opt_max, opt_precision,
    opt_step, opt_labelText, opt_validator) {
  Blockly.FieldSlider.superClass_.constructor.call(this, opt_value, null,
    null, null, opt_validator);
  this.setConstraints(opt_min, opt_max, opt_precision);

  this.step_ = parseFloat(opt_step) || undefined;
  this.labelText_ = opt_labelText;
};
Blockly.utils.object.inherits(Blockly.FieldSlider, Blockly.FieldNumber);

/**
 * Minimum value
 * @type {number}
 * @protected pxt-blockly
 */
Blockly.FieldSlider.prototype.min_ = null;

/**
 * Maximum value
 * @type {number}
 * @protected pxt-blockly
 */
Blockly.FieldSlider.prototype.max_ = null;

/**
 * Step value
 * @type {number}
 * @protected pxt-blockly
 */
Blockly.FieldSlider.prototype.step_ = null;

/**
 * Precision for value
 * @type {number}
 * @protected pxt-blockly
 */
Blockly.FieldSlider.prototype.precision_ = null;

/**
 * Label text
 * @type {string}
 * @protected pxt-blockly
 */
Blockly.FieldSlider.prototype.labelText_ = null;

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
  this.setConstraints(min, max, precision);

  this.step_ = parseFloat(step) || undefined;

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
 * @param {!Event=} e A mouse down or touch start event.
 * @private
 */
Blockly.FieldSlider.prototype.showEditor_ = function(e) {
  Blockly.FieldSlider.superClass_.showEditor_.call(this, e);
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

Blockly.FieldSlider.prototype.addSlider_ = function(contentDiv) {
  if (this.labelText_) {
    var elements = this.createLabelDom_(this.labelText_);
    contentDiv.appendChild(elements[0]);
    this.readout_ = elements[1];
  }
  this.slider_ = new goog.ui.Slider();
  this.slider_.setMinimum(this.min_);
  this.slider_.setMaximum(this.max_);
  this.slider_.setMoveToPointEnabled(!this.step_);
  if (this.step_) this.slider_.setBlockIncrement(this.step_);
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
        if (val !== null) {
          thisField.setValue(val);
          var htmlInput = thisField.htmlInput_;
          if (htmlInput) { // pxt-blockly
            htmlInput.value = val;
            htmlInput.focus();
          }
        }
      });

  Blockly.FieldSlider.focusEventKey_ = goog.events.listen(this.slider_.getElement(),
      goog.ui.Component.EventType.FOCUS,
      function(/*event*/) {
        // Switch focus to the HTML input field
        thisField.htmlInput_.focus();
      });
};

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
 * Set the slider value.
 * @param {string} value The new slider value.
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

Blockly.FieldSlider.prototype.setBackground_ = function(slider) {
  if (this.sliderColor_) {
    goog.style.setStyle(slider, 'background', this.sliderColor_);
  }
  else if (this.sourceBlock_.isShadow() && this.sourceBlock_.parentBlock_) {
    goog.style.setStyle(slider, 'background', this.sourceBlock_.parentBlock_.getColourTertiary());
  }
};

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

Blockly.fieldRegistry.register('field_slider', Blockly.FieldSlider);
