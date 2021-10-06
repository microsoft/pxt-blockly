/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Field for numbers. Includes validator and numpad on touch.
 * @author tmickel@mit.edu (Tim Mickel)
 */
'use strict';

goog.provide('Blockly.FieldNumber');

goog.require('Blockly.fieldRegistry');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Touch');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable number field.
 * @param {string|number=} opt_value The initial value of the field. Should cast
 *    to a number. Defaults to 0.
 * @param {?(string|number)=} opt_min Minimum value.
 * @param {?(string|number)=} opt_max Maximum value.
 * @param {?(string|number)=} opt_precision Precision for value.
 * @param {?Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a number & returns a validated
 *    number, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldNumber = function(opt_value, opt_min, opt_max, opt_precision,
    opt_validator, opt_config) {

    var numRestrictor = this.getNumRestrictor(opt_min, opt_max, opt_precision);
  /**
   * The minimum value this number field can contain.
   * @type {number}
   * @protected
   */
  this.min_ = -Infinity;

  /**
   * The maximum value this number field can contain.
   * @type {number}
   * @protected
   */
  this.max_ = Infinity;

  /**
   * The multiple to which this fields value is rounded.
   * @type {number}
   * @protected
   */
  this.precision_ = 0;

  /**
   * The number of decimal places to allow, or null to allow any number of
   * decimal digits.
   * @type {?number}
   * @private
   */
  this.decimalPlaces_ = null;

  Blockly.FieldNumber.superClass_.constructor.call(
      this, opt_value, opt_validator, opt_config);
      // TODO shakao check if need numRestriction, if opt_value needs default

  if (!opt_config) {  // Only do one kind of configuration or the other.
    this.setConstraints(opt_min, opt_max, opt_precision);
  }

  this.addArgType('number');
};
Blockly.utils.object.inherits(Blockly.FieldNumber, Blockly.FieldTextInput);

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
Blockly.FieldNumber.prototype.DEFAULT_VALUE = 0;

/**
 * Construct a FieldNumber from a JSON arg object.
 * @param {!Object} options A JSON object with options (value, min, max, and
 *                          precision).
 * @return {!Blockly.FieldNumber} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldNumber.fromJson = function(options) {
  return new Blockly.FieldNumber(options['value'],
      undefined, undefined, undefined, undefined, options);
};

/**
 *  * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
Blockly.FieldNumber.prototype.SERIALIZABLE = true;

/**
 * Fixed width of the num-pad drop-down, in px.
 * @type {number}
 * @const
 */
Blockly.FieldNumber.DROPDOWN_WIDTH = 168;

/**
 * Buttons for the num-pad, in order from the top left.
 * Values are strings of the number or symbol will be added to the field text
 * when the button is pressed.
 * @type {Array.<string>}
 * @const
 */
// Calculator order
Blockly.FieldNumber.NUMPAD_BUTTONS =
    ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '-', ' '];

/**
 * Src for the delete icon to be shown on the num-pad.
 * @type {string}
 * @const
 */
Blockly.FieldNumber.NUMPAD_DELETE_ICON = "data:image/svg+xml,%3Csvg " +
  "xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cpath " +
  "d='M28.89,11.45H16.79a2.86,2.86,0,0,0-2,.84L9.09,18a2.85,2.85,0,0" +
  ",0,0,4l5.69,5.69a2.86,2.86,0,0,0,2,.84h12.1a2.86,2.86,0,0,0,2.86-" +
  "2.86V14.31A2.86,2.86,0,0,0,28.89,11.45ZM27.15,22.73a1,1,0,0,1,0,1" +
  ".41,1,1,0,0,1-.71.3,1,1,0,0,1-.71-0.3L23,21.41l-2.73,2.73a1,1,0,0" +
  ",1-1.41,0,1,1,0,0,1,0-1.41L21.59,20l-2.73-2.73a1,1,0,0,1,0-1.41,1" +
  ",1,0,0,1,1.41,0L23,18.59l2.73-2.73a1,1,0,1,1,1.42,1.41L24.42,20Z'" +
  " fill='%23" + Blockly.Colours.numPadText.substr(1) + "'/%3E%3C/svg%3E"
/**
 * Currently active field during an edit.
 * Used to give a reference to the num-pad button callbacks.
 * @type {?FieldNumber}
 * @private
 */
Blockly.FieldNumber.activeField_ = null;

/**
 * Return an appropriate restrictor, depending on whether this FieldNumber
 * allows decimal or negative numbers.
 * @param {number|string|undefined} opt_min Minimum value.
 * @param {number|string|undefined} opt_max Maximum value.
 * @param {number|string|undefined} opt_precision Precision for value.
 * @return {!RegExp} Regular expression for this FieldNumber's restrictor.
 */
Blockly.FieldNumber.prototype.getNumRestrictor = function(opt_min, opt_max,
    opt_precision) {
  this.setConstraints(opt_min, opt_max, opt_precision);
  var pattern = "[\\d]"; // Always allow digits.
  if (this.decimalAllowed_) {
    pattern += "|[\\.]";
  }
  if (this.negativeAllowed_) {
    pattern += "|[-]";
  }
  return new RegExp(pattern);
};

/**
 * Configure the field based on the given map of options.
 * @param {!Object} config A map of options to configure the field based on.
 * @protected
 * @override
 */
Blockly.FieldNumber.prototype.configure_ = function(config) {
  Blockly.FieldNumber.superClass_.configure_.call(this, config);
  this.setMinInternal_(config['min']);
  this.setMaxInternal_(config['max']);
  this.setPrecisionInternal_(config['precision']);
};

/**
 * Set the maximum, minimum and precision constraints on this field.
 * Any of these properties may be undefined or NaN to be disabled.
 * Setting precision (usually a power of 10) enforces a minimum step between
 * values. That is, the user's value will rounded to the closest multiple of
 * precision. The least significant digit place is inferred from the precision.
 * Integers values can be enforces by choosing an integer precision.
 * @param {?(number|string|undefined)} min Minimum value.
 * @param {?(number|string|undefined)} max Maximum value.
 * @param {?(number|string|undefined)} precision Precision for value.
 */
Blockly.FieldNumber.prototype.setConstraints = function(min, max, precision) {
  this.decimalAllowed_ = (typeof precision == 'undefined') ||
    precision === null || isNaN(precision) || (precision == 0) ||
    (Math.floor(precision) != precision);
  this.negativeAllowed_ = (typeof min == 'undefined') || min === null ||
    isNaN(min) || min < 0;

  this.setMinInternal_(min);
  this.setMaxInternal_(max);
  this.setPrecisionInternal_(precision);

  this.setValue(this.getValue());
};

/**
 * Sets the minimum value this field can contain. Updates the value to reflect.
 * @param {?(number|string|undefined)} min Minimum value.
 */
Blockly.FieldNumber.prototype.setMin = function(min) {
  this.setMinInternal_(min);
  this.setValue(this.getValue());
};

/**
 * Sets the minimum value this field can contain. Called internally to avoid
 * value updates.
 * @param {?(number|string|undefined)} min Minimum value.
 * @private
 */
Blockly.FieldNumber.prototype.setMinInternal_ = function(min) {
  if (min == null) {
    this.min_ = -Infinity;
  } else {
    min = Number(min);
    if (!isNaN(min)) {
      this.min_ = min;
    }
  }
};

/**
 * Returns the current minimum value this field can contain. Default is
 * -Infinity.
 * @return {number} The current minimum value this field can contain.
 */
Blockly.FieldNumber.prototype.getMin = function() {
  return this.min_;
};

/**
 * Sets the maximum value this field can contain. Updates the value to reflect.
 * @param {?(number|string|undefined)} max Maximum value.
 */
Blockly.FieldNumber.prototype.setMax = function(max) {
  this.setMaxInternal_(max);
  this.setValue(this.getValue());
};

/**
 * Sets the maximum value this field can contain. Called internally to avoid
 * value updates.
 * @param {?(number|string|undefined)} max Maximum value.
 * @private
 */
Blockly.FieldNumber.prototype.setMaxInternal_ = function(max) {
  if (max == null) {
    this.max_ = Infinity;
  } else {
    max = Number(max);
    if (!isNaN(max)) {
      this.max_ = max;
    }
  }
};

/**
 * Returns the current maximum value this field can contain. Default is
 * Infinity.
 * @return {number} The current maximum value this field can contain.
 */
Blockly.FieldNumber.prototype.getMax = function() {
  return this.max_;
};

/**
 * Sets the precision of this field's value, i.e. the number to which the
 * value is rounded. Updates the field to reflect.
 * @param {?(number|string|undefined)} precision The number to which the
 *    field's value is rounded.
 */
Blockly.FieldNumber.prototype.setPrecision = function(precision) {
  this.setPrecisionInternal_(precision);
  this.setValue(this.getValue());
};

/**
 * Sets the precision of this field's value. Called internally to avoid
 * value updates.
 * @param {?(number|string|undefined)} precision The number to which the
 *    field's value is rounded.
 * @private
 */
Blockly.FieldNumber.prototype.setPrecisionInternal_ = function(precision) {
  this.precision_ = Number(precision) || 0;
  var precisionString = String(this.precision_);
  if (precisionString.indexOf('e') != -1) {
    // String() is fast.  But it turns .0000001 into '1e-7'.
    // Use the much slower toLocaleString to access all the digits.
    precisionString =
        this.precision_.toLocaleString('en-US', {maximumFractionDigits: 20});
  }
  var decimalIndex = precisionString.indexOf('.');
  if (decimalIndex == -1) {
    // If the precision is 0 (float) allow any number of decimals,
    // otherwise allow none.
    this.decimalPlaces_ = precision ? 0 : null;
  } else {
    this.decimalPlaces_ = precisionString.length - decimalIndex - 1;
  }
};

/**
 * Returns the current precision of this field. The precision being the
 * number to which the field's value is rounded. A precision of 0 means that
 * the value is not rounded.
 * @return {number} The number to which this field's value is rounded.
 */
Blockly.FieldNumber.prototype.getPrecision = function() {
  return this.precision_;
};

/**
 * Show the inline free-text editor on top of the text and the num-pad if
 * appropriate.
 * @param {!Event} e A mouse down or touch start event.
 * @param {boolean=} opt_showNumPad If true, show the num pad.
 * @private
 */
Blockly.FieldNumber.prototype.showEditor_ = function(e, opt_showNumPad) {
  Blockly.FieldNumber.activeField_ = this;
  // Do not focus on mobile devices so we can show the num-pad
  var showNumPad = (typeof opt_showNumPad !== "undefined") ? opt_showNumPad :
      (Blockly.utils.userAgent.MOBILE || Blockly.utils.userAgent.ANDROID || Blockly.utils.userAgent.IPAD);
  Blockly.FieldNumber.superClass_.showEditor_.call(this, e, showNumPad, showNumPad);

  // Show a numeric keypad in the drop-down on touch
  if (showNumPad) {
    this.showNumPad_();
  }
};

/**
 * Show the number pad.
 * @private
 */
Blockly.FieldNumber.prototype.showNumPad_ = function() {
  // If there is an existing drop-down someone else owns, hide it immediately
  // and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();

  // Accessibility properties
  contentDiv.setAttribute('role', 'menu');
  contentDiv.setAttribute('aria-haspopup', 'true');

  this.addButtons_(contentDiv);

  // Set colour and size of drop-down
  var numPadBackground = this.sourceBlock_.parentBlock_ ?
    this.sourceBlock_.parentBlock_.getColour() : Blockly.Colours.numPadBackground;
  var numPadBorder = this.sourceBlock_.parentBlock_ ?
    this.sourceBlock_.parentBlock_.style.colourTertiary : Blockly.Colours.numPadBorder;
  Blockly.DropDownDiv.setColour(numPadBackground, numPadBorder);
  contentDiv.style.width = Blockly.FieldNumber.DROPDOWN_WIDTH + 'px';

  Blockly.DropDownDiv.showPositionedByField(this, this.onHide_.bind(this));

  this.htmlInput_.select();
};

/**
 * Add number, punctuation, and erase buttons to the numeric keypad's content
 * div.
 * @param {Element} contentDiv The div for the numeric keypad.
 * @private
 */
Blockly.FieldNumber.prototype.addButtons_ = function(contentDiv) {
  var buttonColour = this.sourceBlock_.parentBlock_ ?
    this.sourceBlock_.parentBlock_.getColour() : Blockly.Colours.numPadBackground;
  var buttonBorderColour = this.sourceBlock_.parentBlock_ ?
    this.sourceBlock_.parentBlock_.style.colourTertiary :
    this.sourceBlock_.style.colourTertiary;

  // Add numeric keypad buttons
  var buttons = Blockly.FieldNumber.NUMPAD_BUTTONS;
  for (var i = 0, buttonText; buttonText = buttons[i]; i++) {
    var button = document.createElement('button');
    button.setAttribute('role', 'menuitem');
    button.setAttribute('class', 'blocklyNumPadButton');
    button.setAttribute('style',
        'background:' + buttonColour + ';' +
        'border: 1px solid ' + buttonBorderColour + ';');
    button.title = buttonText;
    button.innerHTML = buttonText;
    Blockly.bindEvent_(button, 'mousedown', this,
        this.numPadButtonTouch);
    if (buttonText == '.' && !this.decimalAllowed_) {
      // Don't show the decimal point for inputs that must be round numbers
      button.setAttribute('style', 'visibility: hidden');
    } else if (buttonText == '-' && !this.negativeAllowed_) {
      continue;
    } else if (buttonText == ' ' && !this.negativeAllowed_) {
      continue;
    } else if (buttonText == ' ' && this.negativeAllowed_) {
      button.setAttribute('style', 'visibility: hidden');
    }
    contentDiv.appendChild(button);
  }
  // Add erase button to the end
  var eraseButton = document.createElement('button');
  eraseButton.setAttribute('role', 'menuitem');
  eraseButton.setAttribute('class', 'blocklyNumPadButton');
  eraseButton.setAttribute('style',
      'background:' + buttonColour + ';' +
      'border: 1px solid ' + buttonBorderColour + ';');
  eraseButton.title = 'Delete';

  var eraseImage = document.createElement('img');
  eraseImage.src = Blockly.FieldNumber.NUMPAD_DELETE_ICON;
  eraseButton.appendChild(eraseImage);

  Blockly.bindEvent_(eraseButton, 'mousedown', this,
      this.numPadEraseButtonTouch);
  contentDiv.appendChild(eraseButton);
};

/**
 * Call for when a num-pad number or punctuation button is touched.
 * Determine what the user is inputting and update the text field appropriately.
 */
Blockly.FieldNumber.prototype.numPadButtonTouch = function(e) {
  // String of the button (e.g., '7')
  var spliceValue = e.target.innerText;
  // Old value of the text field
  var oldValue = this.htmlInput_.value;
  // Determine the selected portion of the text field
  var selectionStart = this.htmlInput_.selectionStart;
  var selectionEnd = this.htmlInput_.selectionEnd;

  // Splice in the new value
  var newValue = oldValue.slice(0, selectionStart) + spliceValue +
      oldValue.slice(selectionEnd);

  // pxtblockly: workaround iframe + android issue where it inserts values to the front
  if (selectionEnd - selectionStart == 0) { // Length of selection == 0
    newValue = oldValue + spliceValue;
  }

  this.updateDisplay_(newValue);

  // This is just a click.
  Blockly.Touch.clearTouchIdentifier();

  e.preventDefault();
};

/**
 * Call for when the num-pad erase button is touched.
 * Determine what the user is asking to erase, and erase it.
 */
Blockly.FieldNumber.prototype.numPadEraseButtonTouch = function(e) {
  // Old value of the text field
  var oldValue = this.htmlInput_.value;
  // Determine what is selected to erase (if anything)
  var selectionStart = this.htmlInput_.selectionStart;
  var selectionEnd = this.htmlInput_.selectionEnd;
  // Cut out anything that was previously selected
  var newValue = oldValue.slice(0, selectionStart) +
      oldValue.slice(selectionEnd);
  if (selectionEnd - selectionStart == 0) { // Length of selection == 0
    // Delete the last character if nothing was selected
    newValue = selectionEnd == 0 ? oldValue.slice(0, oldValue.length - 1) :
      oldValue.slice(0, selectionStart - 1) + oldValue.slice(selectionStart);
  }
  this.updateDisplay_(newValue);

  // This is just a click.
  Blockly.Touch.clearTouchIdentifier();

  e.preventDefault();
};

/**
 * Update the displayed value and resize/scroll the text field as needed.
 * @param {string} newValue The new text to display.
 * @protected pxt-blockly
 */
Blockly.FieldNumber.prototype.updateDisplay_ = function(newValue) {
  // Updates the display. The actual setValue occurs when editing ends.
  this.htmlInput_.value = newValue;
  // Resize and scroll the text field appropriately
  Blockly.FieldNumber.superClass_.resizeEditor_.call(
      this);
  this.htmlInput_.setSelectionRange(newValue.length,
      newValue.length);
  this.htmlInput_.scrollLeft =
      this.htmlInput_.scrollWidth;
  this.onHtmlInputChange_({})
};

/**
 * Callback for when the drop-down is hidden.
 */
Blockly.FieldNumber.prototype.onHide_ = function() {
  // Clear accessibility properties
  Blockly.DropDownDiv.content_.removeAttribute('role');
  Blockly.DropDownDiv.content_.removeAttribute('aria-haspopup');
};

/**
 * Ensure that the input value is a valid number (must fulfill the
 * constraints placed on the field).
 * @param {*=} opt_newValue The input value.
 * @return {?number} A valid number, or null if invalid.
 * @protected
 * @override
 */
Blockly.FieldNumber.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null) {
    return null;
  }
  // Clean up text.
  var newValue = String(opt_newValue);
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  newValue = newValue.replace(/O/ig, '0');
  // Strip out thousands separators.
  newValue = newValue.replace(/,/g, '');
  // Ignore case of 'Infinity'.
  newValue = newValue.replace(/infinity/i, 'Infinity');

  // Clean up number.
  var n = Number(newValue || 0);
  if (isNaN(n)) {
    // Invalid number.
    return null;
  }
  // Get the value in range.
  // pxt-blockly: allow out-of-range values in number
  // n = Math.min(Math.max(n, this.min_), this.max_);
  // Round to nearest multiple of precision.
  if (this.precision_ && isFinite(n)) {
    n = Math.round(n / this.precision_) * this.precision_;
  }
  // Clean up floating point errors.
  if (this.decimalPlaces_ != null) {
    n = Number(n.toFixed(this.decimalPlaces_));
  }
  return n;
};

/**
 * Create the number input editor widget.
 * @return {!HTMLElement} The newly created number input editor.
 * @protected
 * @override
 */
Blockly.FieldNumber.prototype.widgetCreate_ = function(
    readOnly, withArrow, arrowCallback) {
  var htmlInput = Blockly.FieldNumber.superClass_.widgetCreate_.call(this, readOnly, withArrow, arrowCallback);

  // Set the accessibility state
  if (this.min_ > -Infinity) {
    Blockly.utils.aria.setState(htmlInput,
        Blockly.utils.aria.State.VALUEMIN, this.min_);
  }
  if (this.max_ < Infinity) {
    Blockly.utils.aria.setState(htmlInput,
        Blockly.utils.aria.State.VALUEMAX, this.max_);
  }
  return htmlInput;
};

Blockly.fieldRegistry.register('field_number', Blockly.FieldNumber);
