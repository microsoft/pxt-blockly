/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Colour input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldColourSlider');

goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.DropDownDiv');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.object');
goog.require('goog.ui.Slider');

/**
 * Class for a slider-based colour input field.
 * @param {string} colour The initial colour in '#rrggbb' format.
 * @param {Function=} opt_validator A function that is executed when a new
 *     colour is selected.  Its sole argument is the new colour value.  Its
 *     return value becomes the selected colour, unless it is undefined, in
 *     which case the new colour stands, or it is null, in which case the change
 *     is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldColourSlider = function(colour, opt_validator) {
  Blockly.FieldColourSlider.superClass_.constructor.call(this, colour, opt_validator);
  this.addArgType('colour');
};
Blockly.utils.object.inherits(Blockly.FieldColourSlider, Blockly.Field);

/**
 * Construct a FieldColourSlider from a JSON arg object.
 * @param {!Object} options A JSON object with options (colour).
 * @returns {!Blockly.FieldColourSlider} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldColourSlider.fromJson = function(options) {
  return new Blockly.FieldColourSlider(options['colour']);
};

/**
 * Install this field on a block.
 * @param {!Blockly.Block=} block The block containing this field.
 */
Blockly.FieldColourSlider.prototype.init = function(block) {
  Blockly.FieldColourSlider.superClass_.init.call(this, block);
  this.setValue(this.getValue());
};

/**
 * Return the current colour.
 * @return {string} Current colour in '#rrggbb' format.
 */
Blockly.FieldColourSlider.prototype.getValue = function() {
  return this.colour_;
};

/**
 * Set the colour.
 * @param {string} colour The new colour in '#rrggbb' format.
 */
Blockly.FieldColourSlider.prototype.setValue = function(colour) {
  if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
      this.colour_ != colour) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name, this.colour_, colour));
  }
  this.colour_ = colour;
  if (this.sourceBlock_) {
    // Set the primary, secondary and tertiary colour to this value.
    // The renderer expects to be able to use the secondary colour as the fill for a shadow.
    this.sourceBlock_.setColour(colour, colour, this.sourceBlock_.style.colourTertiary);
  }
  this.updateSliderHandles_();
  this.updateDom_();
};

/**
 * Create the hue, saturation or value CSS gradient for the slide backgrounds.
 * @param {string} channel – Either "hue", "saturation" or "value".
 * @return {string} Array colour hex colour stops for the given channel
 * @private
 */
Blockly.FieldColourSlider.prototype.createColourStops_ = function(channel) {
  var stops = [];
  for (var n = 0; n <= 360; n += 20) {
    switch (channel) {
      case 'hue':
        stops.push(Blockly.utils.colour.hsvToHex(n, this.saturation_, this.brightness_));
        break;
      case 'saturation':
        stops.push(Blockly.utils.colour.hsvToHex(this.hue_, n / 360, this.brightness_));
        break;
      case 'brightness':
        stops.push(Blockly.utils.colour.hsvToHex(this.hue_, this.saturation_, 255 * n / 360));
        break;
      default:
        throw new Error("Unknown channel for colour sliders: " + channel);
    }
  }
  return stops;
};

/**
 * Set the gradient CSS properties for the given node and channel
 * @param {Node} node - The DOM node the gradient will be set on.
 * @param {string} channel – Either "hue", "saturation" or "value".
 * @private
 */
Blockly.FieldColourSlider.prototype.setGradient_ = function(node, channel) {
  var gradient = this.createColourStops_(channel).join(',');
  goog.style.setStyle(node, 'background',
      '-moz-linear-gradient(left, ' + gradient + ')');
  goog.style.setStyle(node, 'background',
      '-webkit-linear-gradient(left, ' + gradient + ')');
  goog.style.setStyle(node, 'background',
      '-o-linear-gradient(left, ' + gradient + ')');
  goog.style.setStyle(node, 'background',
      '-ms-linear-gradient(left, ' + gradient + ')');
  goog.style.setStyle(node, 'background',
      'linear-gradient(left, ' + gradient + ')');
};

/**
 * Update the readouts and slider backgrounds after value has changed.
 * @private
 */
Blockly.FieldColourSlider.prototype.updateDom_ = function() {
  if (this.hueSlider_) {
    // Update the slider backgrounds
    this.setGradient_(this.hueSlider_.getElement(), 'hue');
    this.setGradient_(this.saturationSlider_.getElement(), 'saturation');
    this.setGradient_(this.brightnessSlider_.getElement(), 'brightness');

    // Update the readouts
    this.hueReadout_.textContent = Math.floor(100 * this.hue_ / 360).toFixed(0);
    this.saturationReadout_.textContent = Math.floor(100 * this.saturation_).toFixed(0);
    this.brightnessReadout_.textContent = Math.floor(100 * this.brightness_ / 255).toFixed(0);
  }
};

/**
 * Update the slider handle positions from the current field value.
 * @private
 */
Blockly.FieldColourSlider.prototype.updateSliderHandles_ = function() {
  if (this.hueSlider_) {
    this.hueSlider_.setValue(this.hue_);
    this.saturationSlider_.setValue(this.saturation_);
    this.brightnessSlider_.setValue(this.brightness_);
  }
};

/**
 * Get the text from this field.  Used when the block is collapsed.
 * @return {string} Current text.
 */
Blockly.FieldColourSlider.prototype.getText = function() {
  var colour = this.colour_;
  // Try to use #rgb format if possible, rather than #rrggbb.
  var m = colour.match(/^#(.)\1(.)\2(.)\3$/);
  if (m) {
    colour = '#' + m[1] + m[2] + m[3];
  }
  return colour;
};

/**
 * Create label and readout DOM elements, returning the readout
 * @param {string} labelText - Text for the label
 * @return {Array} The container node and the readout node.
 * @private
 */
Blockly.FieldColourSlider.prototype.createLabelDom_ = function(labelText) {
  var labelContainer = document.createElement('div');
  labelContainer.setAttribute('class', 'blocklyColourPickerLabel');
  var readout = document.createElement('span');
  readout.setAttribute('class', 'blocklyColourPickerReadout');
  var label = document.createElement('span');
  label.setAttribute('class', 'blocklyColourPickerLabelText');
  label.textContent = labelText;
  labelContainer.appendChild(label);
  labelContainer.appendChild(readout);
  return [labelContainer, readout];
};

/**
 * Factory for creating the different slider callbacks
 * @param {string} channel - One of "hue", "saturation" or "brightness"
 * @return {Function} the callback for slider update
 * @private
 */
Blockly.FieldColourSlider.prototype.sliderCallbackFactory_ = function(channel) {
  var thisField = this;
  return function(event) {
    var channelValue = event.target.getValue();
    var hsv = Blockly.utils.colour.hexToHsv(thisField.getValue());
    switch (channel) {
      case 'hue':
        hsv[0] = thisField.hue_ = channelValue;
        break;
      case 'saturation':
        hsv[1] = thisField.saturation_ = channelValue;
        break;
      case 'brightness':
        hsv[2] = thisField.brightness_ = channelValue;
        break;
    }
    var colour = Blockly.utils.colour.hsvToHex(hsv[0], hsv[1], hsv[2]);
    if (colour !== null) {
      thisField.setValue(colour, true);
    }
  };
};

/**
 * Create hue, saturation and brightness sliders under the colour field.
 * @private
 */
Blockly.FieldColourSlider.prototype.showEditor_ = function() {
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  var div = Blockly.DropDownDiv.getContentDiv();

  // Init color component values that are used while the editor is open
  // in order to keep the slider values stable.
  var hsv = Blockly.utils.colour.hexToHsv(this.getValue());
  this.hue_ = hsv[0];
  this.saturation_ = hsv[1];
  this.brightness_ = hsv[2];

  var hueElements = this.createLabelDom_('Hue');
  div.appendChild(hueElements[0]);
  this.hueReadout_ = hueElements[1];
  this.hueSlider_ = new goog.ui.Slider();
  this.hueSlider_.setUnitIncrement(5);
  this.hueSlider_.setMinimum(0);
  this.hueSlider_.setMaximum(360);
  this.hueSlider_.render(div);

  var saturationElements = this.createLabelDom_('Saturation');
  div.appendChild(saturationElements[0]);
  this.saturationReadout_ = saturationElements[1];
  this.saturationSlider_ = new goog.ui.Slider();
  this.saturationSlider_.setUnitIncrement(0.01);
  this.saturationSlider_.setStep(0.001);
  this.saturationSlider_.setMinimum(0);
  this.saturationSlider_.setMaximum(1.0);
  this.saturationSlider_.render(div);

  var brightnessElements = this.createLabelDom_('Brightness');
  div.appendChild(brightnessElements[0]);
  this.brightnessReadout_ = brightnessElements[1];
  this.brightnessSlider_ = new goog.ui.Slider();
  this.brightnessSlider_.setUnitIncrement(2);
  this.brightnessSlider_.setMinimum(0);
  this.brightnessSlider_.setMaximum(255);
  this.brightnessSlider_.render(div);

  Blockly.FieldColourSlider.hueChangeEventKey_ = goog.events.listen(this.hueSlider_,
      goog.ui.Component.EventType.CHANGE,
      this.sliderCallbackFactory_('hue'));
  Blockly.FieldColourSlider.saturationChangeEventKey_ = goog.events.listen(this.saturationSlider_,
      goog.ui.Component.EventType.CHANGE,
      this.sliderCallbackFactory_('saturation'));
  Blockly.FieldColourSlider.brightnessChangeEventKey_ = goog.events.listen(this.brightnessSlider_,
      goog.ui.Component.EventType.CHANGE,
      this.sliderCallbackFactory_('brightness'));

  Blockly.DropDownDiv.setColour('#ffffff', '#dddddd');
  Blockly.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

  this.setValue(this.getValue());
};

Blockly.FieldColourSlider.prototype.dispose = function() {
  if (Blockly.FieldColourSlider.hueChangeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldColourSlider.hueChangeEventKey_);
  }
  if (Blockly.FieldColourSlider.saturationChangeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldColourSlider.saturationChangeEventKey_);
  }
  if (Blockly.FieldColourSlider.brightnessChangeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldColourSlider.brightnessChangeEventKey_);
  }
  Blockly.Events.setGroup(false);
  Blockly.FieldColourSlider.superClass_.dispose.call(this);
};

Blockly.fieldRegistry.register('field_colour_slider', Blockly.FieldColourSlider);
