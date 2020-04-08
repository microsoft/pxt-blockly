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
 * @fileoverview String field.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */

'use strict';
goog.provide('Blockly.FieldString');

goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.userAgent');

/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {RegExp=} opt_restrictor An optional regular expression to restrict
 *     typed text to. Text that doesn't match the restrictor will never show
 *     in the text field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldString = function(text, opt_validator, opt_restrictor) {
  Blockly.FieldString.superClass_.constructor.call(this, text,
      opt_validator);
  this.setRestrictor(opt_restrictor);
  this.addArgType('text');
};
Blockly.utils.object.inherits(Blockly.FieldString, Blockly.FieldTextInput);

/**
 * Construct a FieldString from a JSON arg object.
 * @param {!Object} options A JSON object with options (text).
 * @returns {!Blockly.FieldString} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldString.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.FieldString(text, options['class']);
  if (typeof options['spellcheck'] == 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

/**
 * Quote padding.
 * @type {number}
 * @public
 */
Blockly.FieldString.quotePadding = 0;

/**
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldString.prototype.initView = function() {
  // Add quotes around the string
  // Positioned on render, after text size is calculated.
  this.quoteSize_ = 16;
  this.quoteWidth_ = 8;
  this.quoteLeftX_ = 0;
  this.quoteRightX_ = 0;
  this.quoteY_ = 10;
  if (this.quoteLeft_) this.quoteLeft_.parentNode.removeChild(this.quoteLeft_);
  this.quoteLeft_ = Blockly.utils.dom.createSvgElement('text', {
    'font-size': this.quoteSize_ + 'px',
    'class': 'field-text-quote'
  }, this.fieldGroup_);


  Blockly.FieldString.superClass_.initView.call(this);

  if (this.quoteRight_) this.quoteRight_.parentNode.removeChild(this.quoteRight_);
  this.quoteRight_ = Blockly.utils.dom.createSvgElement('text', {
    'font-size': this.quoteSize_ + 'px',
    'class': 'field-text-quote'
  }, this.fieldGroup_);
  this.quoteLeft_.appendChild(document.createTextNode('"'));
  this.quoteRight_.appendChild(document.createTextNode('"'));

  this.mouseOverWrapper_ =
      Blockly.bindEvent_(
          this.getClickTarget_(), 'mouseover', this, this.onMouseOver_);
  this.mouseOutWrapper_ =
      Blockly.bindEvent_(
          this.getClickTarget_(), 'mouseout', this, this.onMouseOut_);
};

/**
 * Updates the size of the field based on the text.
 * @protected
 */
Blockly.FieldString.prototype.updateSize_ = function() {
  Blockly.FieldString.superClass_.updateSize_.call(this);

  var sWidth = this.value_ ? this.size_.width : 1;

  var xPadding = 3;
  var addedWidth = this.positionLeft(sWidth + xPadding);
  this.textElement_.setAttribute('x', addedWidth);
  addedWidth += this.positionRight(addedWidth + sWidth + xPadding);

  this.size_.width = sWidth + addedWidth;
};

// Position Left
Blockly.FieldString.prototype.positionLeft = function(x) {
  if (!this.quoteLeft_) {
    return 0;
  }
  var addedWidth = 0;
  if (this.sourceBlock_.RTL) {
    this.quoteLeftX_ = x + this.quoteWidth_ + Blockly.FieldString.quotePadding * 2;
    addedWidth = this.quoteWidth_ + Blockly.FieldString.quotePadding;
  } else {
    this.quoteLeftX_ = 0;
    addedWidth = this.quoteWidth_ + Blockly.FieldString.quotePadding;
  }
  this.quoteLeft_.setAttribute('transform',
      'translate(' + this.quoteLeftX_ + ',' + this.quoteY_ + ')'
  );
  return addedWidth;
};

// Position Right
Blockly.FieldString.prototype.positionRight = function(x) {
  if (!this.quoteRight_) {
    return 0;
  }
  var addedWidth = 0;
  if (this.sourceBlock_.RTL) {
    this.quoteRightX_ = Blockly.FieldString.quotePadding;
    addedWidth = this.quoteWidth_ + Blockly.FieldString.quotePadding;
  } else {
    this.quoteRightX_ = x + Blockly.FieldString.quotePadding;
    addedWidth = this.quoteWidth_ + Blockly.FieldString.quotePadding;
  }
  this.quoteRight_.setAttribute('transform',
      'translate(' + this.quoteRightX_ + ',' + this.quoteY_ + ')'
  );
  return addedWidth;
};

Blockly.fieldRegistry.register('field_string', Blockly.FieldString);