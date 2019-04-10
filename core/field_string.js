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
goog.require('goog.math');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.userAgent');

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
goog.inherits(Blockly.FieldString, Blockly.FieldTextInput);

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
 * Install this string on a block.
 */
Blockly.FieldString.prototype.init = function() {
  Blockly.FieldTextInput.superClass_.init.call(this);

  // Add quotes around the string
  // Positioned on render, after text size is calculated.
  this.quoteSize_ = 16;
  this.quoteWidth_ = 8;
  this.quoteLeftX_ = 0;
  this.quoteRightX_ = 0;
  this.quoteY_ = 22;
  if (this.quoteLeft_) this.quoteLeft_.parentNode.removeChild(this.quoteLeft_);
  this.quoteLeft_ = Blockly.utils.createSvgElement('text', {
    'font-size': this.quoteSize_ + 'px',
    'class': 'field-text-quote'
  });
  if (this.quoteRight_) this.quoteRight_.parentNode.removeChild(this.quoteRight_);
  this.quoteRight_ = Blockly.utils.createSvgElement('text', {
    'font-size': this.quoteSize_ + 'px',
    'class': 'field-text-quote'
  });
  this.quoteLeft_.appendChild(document.createTextNode('"'));
  this.quoteRight_.appendChild(document.createTextNode('"'));

  // Force a reset of the text to add the arrow.
  var text = this.text_;
  this.text_ = null;
  this.setText(text);

  this.mouseOverWrapper_ =
      Blockly.bindEvent_(
          this.getClickTarget_(), 'mouseover', this, this.onMouseOver_);
  this.mouseOutWrapper_ =
      Blockly.bindEvent_(
          this.getClickTarget_(), 'mouseout', this, this.onMouseOut_);
};

Blockly.FieldString.prototype.setText = function(text) {
  if (text === null || text === this.text_) {
    // No change if null.
    return;
  }
  this.text_ = text;
  if (this.textElement_) {
    this.textElement_.parentNode.appendChild(this.quoteLeft_);
  }
  this.updateTextNode_();
  if (this.textElement_) {
    this.textElement_.parentNode.appendChild(this.quoteRight_);
  }
  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
  }
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

// // Position Right
Blockly.FieldString.prototype.positionArrow = function(x) {
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

Blockly.Field.register('field_string', Blockly.FieldString);