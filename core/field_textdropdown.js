/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Combination text + drop-down field
 * @author tmickel@mit.edu (Tim Mickel)
 */
'use strict';

goog.provide('Blockly.FieldTextDropdown');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.userAgent');


/**
 * Class for a combination text + drop-down field.
 * @param {string} text The initial content of the text field.
 * @param {(!Array.<!Array.<string>>|!Function)} menuGenerator An array of
 *     options for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @param {RegExp=} opt_restrictor An optional regular expression to restrict
 *     typed text to. Text that doesn't match the restrictor will never show
 *     in the text field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldTextDropdown = function(text, menuGenerator, opt_validator, opt_restrictor) {
  this.menuGenerator_ = menuGenerator;
  Blockly.FieldDropdown.prototype.trimOptions_.call(this);
  Blockly.FieldTextDropdown.superClass_.constructor.call(this, text, opt_validator, opt_restrictor);
  this.addArgType('textdropdown');
};
Blockly.utils.object.inherits(Blockly.FieldTextDropdown, Blockly.FieldTextInput);

/**
 * Construct a FieldTextDropdown from a JSON arg object.
 * @param {!Object} options A JSON object with options (options).
 * @returns {!Blockly.FieldTextDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldTextDropdown.fromJson = function(options) {
  var field = new Blockly.FieldTextDropdown(options['text'], options['options']);
  if (typeof options['spellcheck'] == 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

Blockly.FieldTextDropdown.DROPDOWN_SVG_DATAURI = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaGVpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuNDEsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTDAuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNzFDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMCwxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiM1NzVFNzUiLz48L3N2Zz4K';

/**
 * Install this text drop-down field on a block.
 */
Blockly.FieldTextDropdown.prototype.initView = function() {
  Blockly.FieldTextDropdown.superClass_.initView.call(this);

  this.createSVGArrow_();
};

/**
 * Updates the size of the field based on the text.
 * @protected
 */
Blockly.FieldTextDropdown.prototype.updateSize_ = function() {
  Blockly.FieldTextDropdown.superClass_.updateSize_.call(this);
  var arrowWidth = this.positionSVGArrow_(this.size_.width,
    this.size_.height / 2 -
    this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE / 2);

  this.size_.width += arrowWidth;
};

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldTextDropdown.prototype.dispose = function() {
  if (this.mouseUpWrapper_) {
    Blockly.unbindEvent_(this.mouseUpWrapper_);
    this.mouseUpWrapper_ = null;
    Blockly.Touch.clearTouchIdentifier();
  }
  Blockly.FieldTextDropdown.superClass_.dispose.call(this);
};

/**
 * If the drop-down isn't open, show the text editor.
 * @param {!Event} e A mouse down or touch start event.
 */
Blockly.FieldTextDropdown.prototype.showEditor_ = function(e) {
  var readOnly = (Blockly.utils.userAgent.MOBILE || Blockly.utils.userAgent.ANDROID ||
    Blockly.utils.userAgent.IPAD);
  Blockly.FieldTextDropdown.superClass_.showEditor_.call(this, e, false, readOnly,
      true, function() {
        if (!this.dropDownOpen_) this.showDropdown_();
        Blockly.Touch.clearTouchIdentifier();
      });
};

/**
 * @return {boolean} True if the option list is generated by a function. Otherwise false.
 */
Blockly.FieldTextDropdown.prototype.isOptionListDynamic =
  Blockly.FieldDropdown.prototype.isOptionListDynamic;

/**
 * Return a list of the options for this dropdown.
 * See: Blockly.FieldDropDown.prototype.getOptions.
 * @return {!Array.<!Array.<string>>} Array of option tuples:
 *     (human-readable text, language-neutral name).
 * @private
 */
Blockly.FieldTextDropdown.prototype.getOptions = Blockly.FieldDropdown.prototype.getOptions;

/**
 * Create an SVG based arrow.
 * @protected
 */
Blockly.FieldTextDropdown.prototype.createSVGArrow_ = function() {
  this.svgArrow_ = Blockly.utils.dom.createSvgElement('image', {
    'height': this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px',
    'width': this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px'
  }, this.fieldGroup_);
  this.svgArrow_.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Blockly.FieldTextDropdown.DROPDOWN_SVG_DATAURI);
};

/**
 * Create the dropdown menu.
 * @private
 */
Blockly.FieldTextDropdown.prototype.showDropdown_ = Blockly.FieldDropdown.prototype.showEditor_;

/**
 * Create the dropdown editor.
 * @private
 */
Blockly.FieldTextDropdown.prototype.dropdownCreate_ =
    Blockly.FieldDropdown.prototype.dropdownCreate_;

/**
 * Disposes of events and dom-references belonging to the dropdown editor.
 * @private
 */
Blockly.FieldTextDropdown.prototype.dropdownDispose_ =
    Blockly.FieldDropdown.prototype.dropdownDispose_;

/**
 * Position a drop-down arrow at the appropriate location at render-time.
 * @param {number} x X position the arrow is being rendered at, in px.
 * @param {number} y Y position the arrow is being rendered at, in px.
 * @return {number} Amount of space the arrow is taking up, in px.
 * @private
 */
Blockly.FieldTextDropdown.prototype.positionSVGArrow_ =
    Blockly.FieldDropdown.prototype.positionSVGArrow_;

/**
 * Handle an action in the dropdown menu.
 * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
 * @private
 */
Blockly.FieldTextDropdown.prototype.handleMenuActionEvent_ =
    Blockly.FieldDropdown.prototype.handleMenuActionEvent_;

/**
 * Handle an action in the dropdown menu.
 * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
 * @private
 */
Blockly.FieldTextDropdown.prototype.onItemSelected_ = function(menu, menuItem) {
  var value = menuItem.getValue();
  if (value !== null) {
    this.setValue(value);

    Blockly.WidgetDiv.hideIfOwner(this);
  }
};

Blockly.fieldRegistry.register('field_textdropdown', Blockly.FieldTextDropdown);
