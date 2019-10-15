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
 * @fileoverview Text input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldTextInput');

goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.Colours');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('Blockly.pxtBlocklyUtils');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable text field.
 * @param {string=} opt_value The initial value of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a string & returns a validated
 *    string, or null to abort the change.
 * @param {RegExp=} opt_restrictor An optional regular expression to restrict
 *    typed text to. Text that doesn't match the restrictor will never show
 *    in the text field.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTextInput = function(opt_value, opt_validator, opt_restrictor) {
  opt_value = this.doClassValidation_(opt_value);
  if (opt_value === null) {
    opt_value = '';
  }
  Blockly.FieldTextInput.superClass_.constructor.call(this, opt_value,
      opt_validator);
  this.setRestrictor(opt_restrictor);
  this.addArgType('text');
};
goog.inherits(Blockly.FieldTextInput, Blockly.Field);

/**
 * Construct a FieldTextInput from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @return {!Blockly.FieldTextInput} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldTextInput.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.FieldTextInput(text, options['class']);
  if (typeof options['spellcheck'] === 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

/**
 * Length of animations in seconds.
 */
Blockly.FieldTextInput.ANIMATION_TIME = 0.25;

/**
 * Padding to use for text measurement for the field during editing, in px.
 */
Blockly.FieldTextInput.TEXT_MEASURE_PADDING_MAGIC = 45;

/**
 * The HTML input element for the user to type, or null if no FieldTextInput
 * editor is currently open.
 * @type {HTMLInputElement}
 * @private
 */
Blockly.FieldTextInput.htmlInput_ = null;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 */
Blockly.FieldTextInput.prototype.SERIALIZABLE = true;

/**
 * Point size of text.  Should match blocklyText's font-size in CSS.
 */
Blockly.FieldTextInput.FONTSIZE = 11;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldTextInput.prototype.CURSOR = 'text';

/**
 * Allow browser to spellcheck this field.
 * @private
 */
Blockly.FieldTextInput.prototype.spellcheck_ = true;

/**
 * pxt-blockly: Allow browser to auto-capitalize this field.
 * @private
 */
Blockly.FieldTextInput.prototype.autoCapitalize_ = true;

/**
 * Install this text field on a block.
 */
Blockly.FieldTextInput.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }

  // pxtblockly: and has more than one input.
  var notInShadow = !this.sourceBlock_.isShadow()
    && (this.sourceBlock_.inputList && this.sourceBlock_.inputList.length > 1);

  if (notInShadow) {
    this.className_ += ' blocklyEditableLabel';
  }

  Blockly.FieldTextInput.superClass_.init.call(this);
  // If not in a shadow block, draw a box
  if (notInShadow) {
    this.box_ = Blockly.utils.dom.createSvgElement('rect', {
      'rx': Blockly.BlockSvg.CORNER_RADIUS,
      'ry': Blockly.BlockSvg.CORNER_RADIUS,
      'x': 0,
      'y': 0,
      'width': this.size_.width,
      'height': this.size_.height,
      'fill': Blockly.Colours.textField,
      'stroke': this.sourceBlock_.getColourTertiary()
    });
    this.fieldGroup_.insertBefore(this.box_, this.textElement_);
  }

  if (this.sourceBlock_.isEditable() &&
    this.sourceBlock_.getOutputShape() == Blockly.OUTPUT_SHAPE_ROUND) {
    this.mouseOverWrapper_ =
        Blockly.bindEventWithChecks_(
            this.getClickTarget_(), 'mouseover', this, this.onMouseOver_);
    this.mouseOutWrapper_ =
        Blockly.bindEventWithChecks_(
            this.getClickTarget_(), 'mouseout', this, this.onMouseOut_);
  }
};

/**
 * Handle a mouse over event on a input field.
 * @param {!Event} e Mouse over event.
 * @private
 */
Blockly.FieldTextInput.prototype.onMouseOver_ = function(e) {
  if (this.sourceBlock_.isInFlyout) return;
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture && gesture.isDragging()) return;
  if (this.sourceBlock_.svgPath_) {
    Blockly.utils.dom.addClass(this.sourceBlock_.svgPath_, 'blocklyFieldHover');
  }
};

/**
 * Handle a mouse out event on a input field.
 * @param {!Event} e Mouse out event.
 * @private
 */
Blockly.FieldTextInput.prototype.onMouseOut_ = function(e) {
  if (this.sourceBlock_.isInFlyout) return;
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture && gesture.isDragging()) return;
  if (this.sourceBlock_.svgPath_) {
    Blockly.utils.dom.removeClass(this.sourceBlock_.svgPath_, 'blocklyFieldHover');
  }
};

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldTextInput.prototype.dispose = function() {
  if (this.mouseOverWrapper_) {
    Blockly.unbindEvent_(this.mouseOverWrapper_);
    this.mouseOverWrapper_ = null;
  }
  if (this.mouseOutWrapper_) {
    Blockly.unbindEvent_(this.mouseOutWrapper_);
    this.mouseOutWrapper_ = null;
  }
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldTextInput.superClass_.dispose.call(this);
};

/**
 * Ensure that the input value casts to a valid string.
 * @param {string=} newValue The input value.
 * @return {?string} A valid string, or null if invalid.
 * @protected
 */
Blockly.FieldTextInput.prototype.doClassValidation_ = function(newValue) {
  if (newValue === null || newValue === undefined) {
    return null;
  }
  return String(newValue);
};

/**
 * Called by setValue if the text input is not valid. If the field is
 * currently being edited it reverts value of the field to the previous
 * value while allowing the display text to be handled by the htmlInput_.
 * @param {*} _invalidValue The input value that was determined to be invalid.
 *    This is not used by the text input because its display value is stored on
 *    the htmlInput_.
 * @protected
 */
Blockly.FieldTextInput.prototype.doValueInvalid_ = function(_invalidValue) {
  if (this.isBeingEdited_) {
    this.isTextValid_ = false;
    var oldValue = this.value_;
    // Revert value when the text becomes invalid.
    this.value_ = this.htmlInput_.untypedDefaultValue_;
    if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.sourceBlock_, 'field', this.name, oldValue, this.value_));
    }
  }
};

/**
 * Called by setValue if the text input is valid. Updates the value of the
 * field, and updates the text of the field if it is not currently being
 * edited (i.e. handled by the htmlInput_).
 * @param {string} newValue The new validated value of the field.
 * @protected
 */
Blockly.FieldTextInput.prototype.doValueUpdate_ = function(newValue) {
  this.isTextValid_ = true;
  this.value_ = newValue;
  if (!this.isBeingEdited_) {
    // This should only occur if setValue is triggered programmatically.
    this.text_ = String(newValue);
    this.isDirty_ = true;
  }
};

/**
 * Updates the colour of the htmlInput given the current validity of the
 * field's value.
 * @protected
 */
Blockly.FieldTextInput.prototype.render_ = function() {
  Blockly.FieldTextInput.superClass_.render_.call(this);
  // This logic is done in render_ rather than doValueInvalid_ or
  // doValueUpdate_ so that the code is more centralized.
  if (this.isBeingEdited_) {
    this.resizeEditor_();
    if (!this.isTextValid_) {
      Blockly.utils.dom.addClass(this.htmlInput_, 'blocklyInvalidInput');
    } else {
      Blockly.utils.dom.removeClass(this.htmlInput_, 'blocklyInvalidInput');
    }
  }
};

/**
 * Set whether this field is spellchecked by the browser.
 * @param {boolean} check True if checked.
 */
Blockly.FieldTextInput.prototype.setSpellcheck = function(check) {
  this.spellcheck_ = check;
};

/**
 * pxt-blockly: Set whether this field is auto-capitalized by the browser.
 * @param {boolean} autoCapitalize True if auto-capitalized.
 */
Blockly.FieldTextInput.prototype.setAutoCapitalize = function(autoCapitalize) {
  this.autoCapitalize_ = autoCapitalize;
};

/**
 * Set the restrictor regex for this text input.
 * Text that doesn't match the restrictor will never show in the text field.
 * @param {?RegExp} restrictor Regular expression to restrict text.
 */
Blockly.FieldTextInput.prototype.setRestrictor = function(restrictor) {
  this.restrictor_ = restrictor;
};

/**
 * Show the inline free-text editor on top of the text.
 * @param {!Event} e A mouse down or touch start event.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @param {boolean=} opt_readOnly True if editor should be created with HTML
 *     input set to read-only, to prevent virtual keyboards.
 * @param {boolean=} opt_withArrow True to show drop-down arrow in text editor.
 * @param {Function=} opt_arrowCallback Callback for when drop-down arrow clicked.
 * @protected
 */
Blockly.FieldTextInput.prototype.showEditor_ = function(
    e, opt_quietInput, opt_readOnly, opt_withArrow, opt_arrowCallback) {
  this.workspace_ = this.sourceBlock_.workspace;
  var quietInput = opt_quietInput || false;
  var readOnly = opt_readOnly || false;
  if (!quietInput && (Blockly.utils.userAgent.MOBILE ||
                      Blockly.utils.userAgent.ANDROID ||
                      Blockly.utils.userAgent.IPAD)) {
    this.showPromptEditor_();
  } else {
    this.showInlineEditor_(quietInput, readOnly, opt_withArrow, opt_arrowCallback);
  }
};

/**
 * Create and show a text input editor that is a prompt (usually a popup).
 * Mobile browsers have issues with in-line textareas (focus and keyboards).
 * @private
 */
Blockly.FieldTextInput.prototype.showPromptEditor_ = function() {
  var fieldText = this;
  Blockly.prompt(Blockly.Msg['CHANGE_VALUE_TITLE'], this.text_,
      function(newValue) {
        fieldText.setValue(newValue);
      });
};

/**
 * Create and show a text input editor that sits directly over the text input.
 * @param {boolean} quietInput True if editor should be created without
 *     focus.
 * @param {boolean=} withArrow True to show drop-down arrow in text editor.
 * @param {Function=} arrowCallback Callback for when drop-down arrow clicked.
 * @private
 */
Blockly.FieldTextInput.prototype.showInlineEditor_ = function(
  quietInput, readOnly, withArrow, arrowCallback) {
  this.isBeingEdited_ = true;
  Blockly.WidgetDiv.show(
      this, this.sourceBlock_.RTL, this.widgetDispose_.bind(this));
  this.htmlInput_ = this.widgetCreate_(readOnly, withArrow, arrowCallback);

  // pxtblockly: execute the arrow callback when the editor is opened as well
  if (arrowCallback) {
    arrowCallback.call(this);
  }

  if (!quietInput) {
    this.focus();
    // iOS only
    this.htmlInput_.setSelectionRange(0, 99999);
  }
};

/**
 * Create the text input editor widget.
 * @return {!HTMLInputElement} The newly created text input editor.
 * @param {boolean=} withArrow True to show drop-down arrow in text editor.
 * @param {Function=} arrowCallback Callback for when drop-down arrow clicked.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetCreate_ = function(
    readOnly, withArrow, arrowCallback) {
  var div = Blockly.WidgetDiv.DIV;
  // Apply text-input-specific fixed CSS
  Blockly.utils.dom.addClass(div, 'fieldTextInput');
  var htmlInput = document.createElement('input');
  htmlInput.className = 'blocklyHtmlInput';
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  if (readOnly) {
    htmlInput.setAttribute('readonly', 'true');
  }
  // pxt-blockly: disable auto-capitalization if configured to do so.
  if (!this.autoCapitalize_) {
    htmlInput.setAttribute('autocapitalize', 'none');
  }
  // The animated properties themselves
  htmlInput.style.fontSize = Blockly.BlockSvg.FIELD_TEXTINPUT_FONTSIZE_FINAL + 'pt';
  div.appendChild(htmlInput);

  if (withArrow) {
    // Move text in input to account for displayed drop-down arrow.
    if (this.sourceBlock_.RTL) {
      htmlInput.style.paddingLeft = (this.arrowSize_ + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING) + 'px';
    } else {
      htmlInput.style.paddingRight = (this.arrowSize_ + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING) + 'px';
    }
    // Create the arrow.
    var dropDownArrow = document.createElement('img');
    dropDownArrow.className = 'blocklyTextDropDownArrow';
    dropDownArrow.style.width = this.arrowSize_ + 'px';
    dropDownArrow.style.height = this.arrowSize_ + 'px';
    dropDownArrow.style.top = this.arrowY_ + 'px';
    dropDownArrow.style.cursor = 'pointer';
    // Magic number for positioning the drop-down arrow on top of the text editor.
    var dropdownArrowMagic = '11px';
    if (this.sourceBlock_.RTL) {
      dropDownArrow.style.left = dropdownArrowMagic;
    } else {
      dropDownArrow.style.right = dropdownArrowMagic;
    }
    if (arrowCallback) {
      htmlInput.dropDownArrowMouseWrapper_ = Blockly.bindEventWithChecks_(dropDownArrow,
          'mousedown', this, arrowCallback);
    }
    div.appendChild(dropDownArrow);
  }

  htmlInput.value = htmlInput.defaultValue = this.value_;
  htmlInput.untypedDefaultValue_ = this.value_;
  htmlInput.oldValue_ = null;
  this.resizeEditor_();

  this.bindInputEvents_(htmlInput);

  return htmlInput;
};

/**
 * Close the editor, save the results, and dispose any events bound to the
 * text input's editor.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetDispose_ = function() {
  // Finalize value.
  this.isBeingEdited_ = false;
  // No need to call setValue because if the widget is being closed the
  // latest input text has already been validated.
  if (this.value_ !== this.text_) {
    // At the end of an edit the text should be the same as the value. It
    // may not be if the input text is different than the validated text.
    // We should fix that.
    this.text_ = String(this.value_);
    this.isTextValid_ = true;
    this.forceRerender();
  }

  // Otherwise don't rerender.

  // Call onFinishEditing
  // TODO: Get rid of this or make it less of a hack.
  if (this.onFinishEditing_) {
    this.onFinishEditing_(this.value_);
  }

  // Remove htmlInput events.
  this.unbindInputEvents_();
  if (this.htmlInput_.dropDownArrowMouseWrapper_) {
    Blockly.unbindEvent_(this.htmlInput_.dropDownArrowMouseWrapper_);
  }
  Blockly.Events.setGroup(false);

  // Animation of disposal
  this.htmlInput_.style.fontSize = Blockly.BlockSvg.FIELD_TEXTINPUT_FONTSIZE_INITIAL + 'pt';

  // Clean up widget div styling
  var div = Blockly.WidgetDiv.DIV;
  Blockly.utils.dom.removeClass(div, 'fieldTextInput');
  div.style = {};
}

/**
 * Bind handlers for user input on the text input field's editor.
 * @param {!HTMLInputElement} htmlInput The htmlInput to which event
 *    handlers will be bound.
 * @private
 */
Blockly.FieldTextInput.prototype.bindInputEvents_ = function(htmlInput) {
  // Trap Enter without IME and Esc to hide.
  this.onKeyDownWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keydown', this, this.onHtmlInputKeyDown_);
  // Resize after every keystroke.
  this.onKeyUpWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keyup', this, this.onHtmlInputChange_);
  // Repeatedly resize when holding down a key.
  this.onKeyPressWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keypress', this, this.onHtmlInputChange_);

  // pxt-blockly: For modern browsers (IE 9+, Chrome, Firefox, etc.) that support the
  // DOM input event, also trigger onHtmlInputChange_ then. The input event
  // is triggered on keypress but after the value of the text input
  // has updated, allowing us to resize the block at that time.
  this.onInputWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'input', this, this.onHtmlInputChange_);

  // TODO: Figure out if this is necessary.
  this.onWorkspaceChangeWrapper_ = this.resizeEditor_.bind(this);
  this.workspace_.addChangeListener(this.onWorkspaceChangeWrapper_);
};

/**
 * Unbind handlers for user input and workspace size changes.
 * @private
 */
Blockly.FieldTextInput.prototype.unbindInputEvents_ = function() {
  Blockly.unbindEvent_(this.onKeyDownWrapper_);
  Blockly.unbindEvent_(this.onKeyUpWrapper_);
  Blockly.unbindEvent_(this.onKeyPressWrapper_);
  Blockly.unbindEvent_(this.onInputWrapper_);
  this.workspace_.removeChangeListener(this.onWorkspaceChangeWrapper_);
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
  var tabKey = 9, enterKey = 13, escKey = 27;
  if (e.keyCode == enterKey) {
    Blockly.WidgetDiv.hide(true);
    Blockly.DropDownDiv.hideWithoutAnimation();
  } else if (e.keyCode == escKey) {
    this.htmlInput_.value = this.htmlInput_.defaultValue;
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation(); // TODO shakao necessary?
  } else if (e.keyCode == tabKey) {
    Blockly.WidgetDiv.hide(true);
    Blockly.DropDownDiv.hideWithoutAnimation();
    this.sourceBlock_.tab(this, !e.shiftKey);
    e.preventDefault();
  }
};

/**
 * Key codes that are whitelisted from the restrictor.
 * These are only needed and used on Gecko (Firefox).
 * See: https://github.com/LLK/scratch-blocks/issues/503.
 */
Blockly.FieldTextInput.GECKO_KEYCODE_WHITELIST = [
  97, // Select all, META-A.
  99, // Copy, META-C.
  118, // Paste, META-V.
  120 // Cut, META-X.
];

/**
 * Handle a change to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function(e) {
  // Check if the key matches the restrictor.
  if (e.type === 'keypress' && this.restrictor_) {
    var keyCode;
    var isWhitelisted = false;
    if (Blockly.utils.userAgent.GECKO) {
      // e.keyCode is not available in Gecko.
      keyCode = e.charCode;
      // Gecko reports control characters (e.g., left, right, copy, paste)
      // in the key event - whitelist these from being restricted.
      // < 32 and 127 (delete) are control characters.
      // See: http://www.theasciicode.com.ar/ascii-control-characters/delete-ascii-code-127.html
      if (keyCode < 32 || keyCode == 127) {
        isWhitelisted = true;
      } else if (e.metaKey || e.ctrlKey) {
        // For combos (ctrl-v, ctrl-c, etc.), Gecko reports the ASCII letter
        // and the metaKey/ctrlKey flags.
        isWhitelisted = Blockly.FieldTextInput.GECKO_KEYCODE_WHITELIST.indexOf(keyCode) > -1;
      }
    } else {
      keyCode = e.keyCode;
    }
    var char = String.fromCharCode(keyCode);
    if (!isWhitelisted && !this.restrictor_.test(char) && e.preventDefault) {
      // Failed to pass restrictor.
      e.preventDefault();
      return;
    }
  }

  // Update source block.
  var text = this.htmlInput_.value;
  if (text !== this.htmlInput_.oldValue_) {
    this.htmlInput_.oldValue_ = text;

    // TODO(#2169): Once issue is fixed the setGroup functionality could be
    //              moved up to the Field setValue method. This would create a
    //              broader fix for all field types.
    Blockly.Events.setGroup(true);
    this.setValue(text);
  } else if (Blockly.utils.userAgent.WEBKIT) {
    // Cursor key.  Render the source block to show the caret moving.
    // Chrome only (version 26, OS X).
    this.sourceBlock_.render();
  }
  // Always render the input text.
  this.text_ = this.htmlInput_.value;
  this.forceRerender();
  Blockly.Events.setGroup(false);
  this.resizeEditor_();
};

/**
 * pxt-blockly: Focus and select the input.
 */
Blockly.FieldTextInput.prototype.focus = function() {
  this.htmlInput_.focus();
  this.htmlInput_.select();
}

/**
 * Resize the editor to fit the text.
 * @protected
 */
Blockly.FieldTextInput.prototype.resizeEditor_ = function() {
  var scale = this.sourceBlock_.workspace.scale;
  var div = Blockly.WidgetDiv.DIV;

  var initialWidth;
  if (this.sourceBlock_.isShadow() || this.getTotalFields_() == 1) {
    initialWidth = this.sourceBlock_.getHeightWidth().width * scale;
  } else {
    initialWidth = this.size_.width * scale;
  }

  var width;
  if (Blockly.BlockSvg.FIELD_TEXTINPUT_EXPAND_PAST_TRUNCATION) {
    // Resize the box based on the measured width of the text, pre-truncation
    var textWidth = Blockly.pxtBlocklyUtils.measureText(
        Blockly.FieldTextInput.htmlInput_.style.fontSize,
        Blockly.FieldTextInput.htmlInput_.style.fontFamily,
        Blockly.FieldTextInput.htmlInput_.style.fontWeight,
        Blockly.FieldTextInput.htmlInput_.value
    );
    // Size drawn in the canvas needs padding and scaling
    textWidth += Blockly.FieldTextInput.TEXT_MEASURE_PADDING_MAGIC;
    textWidth *= scale;
    width = textWidth;
  } else {
    // Set width to (truncated) block size.
    width = initialWidth;
  }
  // The width must be at least FIELD_WIDTH and at most FIELD_WIDTH_MAX_EDIT
  width = Math.max(width, Blockly.BlockSvg.FIELD_WIDTH_MIN_EDIT * scale);
  width = Math.min(width, Blockly.BlockSvg.FIELD_WIDTH_MAX_EDIT * scale);

  var inputHeight = this.getTotalFields_() == 1 ?
    this.sourceBlock_.getHeightWidth().height : Blockly.BlockSvg.FIELD_HEIGHT_MAX_EDIT;

  // Add 1px to width and height to account for border (pre-scale)
  div.style.width = (width / scale + 1) + 'px';
  div.style.height = (inputHeight + 1) + 'px';
  div.style.transform = 'scale(' + scale + ')';

  // Use margin-left to animate repositioning of the box (value is unscaled).
  // This is the difference between the default position and the positioning
  // after growing the box.
  div.style.marginLeft = -0.5 * (width - initialWidth) + 'px';

  // Add 0.5px to account for slight difference between SVG and CSS border
  var borderRadius = this.getBorderRadius() + 0.5;
  div.style.borderRadius = borderRadius + 'px';
  //Blockly.FieldTextInput.htmlInput_.style.borderRadius = borderRadius + 'px';
  // Pull stroke colour from the existing shadow block
  var strokeColour = this.sourceBlock_.getColourTertiary();
  div.style.borderColor = strokeColour;

  var xy = this.getAbsoluteXY_();
  // Account for border width, post-scale
  xy.x -= scale / 2;
  xy.y -= scale / 2;
  // In RTL mode block fields and LTR input fields the left edge moves,
  // whereas the right edge is fixed.  Reposition the editor.
  if (this.sourceBlock_.RTL) {
    xy.x += width;
    xy.x -= div.offsetWidth * scale;
    xy.x += 1 * scale;
  }
  // Shift by a few pixels to line up exactly.
  xy.y += 1 * scale;
  if (Blockly.utils.userAgent.GECKO && Blockly.WidgetDiv.DIV.style.top) {
    // Firefox mis-reports the location of the border by a pixel
    // once the WidgetDiv is moved into position.
    xy.x += 2 * scale;
    xy.y += 1 * scale;
  }
  if (Blockly.utils.userAgent.WEBKIT) {
    xy.y -= 1 * scale;
  }
  // Finally, set the actual style
  div.style.left = xy.x + 'px';
  div.style.top = xy.y + 'px';
};

/**
 * Border radius for drawing this field, called when rendering the owning shadow block.
 * @return {Number} Border radius in px.
*/
Blockly.FieldTextInput.prototype.getBorderRadius = function() {
  if (this.sourceBlock_.getOutputShape() == Blockly.OUTPUT_SHAPE_ROUND) {
    return Blockly.BlockSvg.NUMBER_FIELD_CORNER_RADIUS;
  }
  return Blockly.BlockSvg.TEXT_FIELD_CORNER_RADIUS;
};

Blockly.FieldTextInput.prototype.maybeSaveEdit_ = function() {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  // Save the edit (if it validates).
  var text = htmlInput.value;
  if (this.sourceBlock_) {
    var text1 = this.callValidator(text);
    if (text1 === null) {
      // Invalid edit.
      text = htmlInput.defaultValue;
    } else {
      // Validation function has changed the text.
      text = text1;
      if (this.onFinishEditing_) {
        this.onFinishEditing_(text);
      }
    }
  }
  this.setText(text);
  this.sourceBlock_.rendered && this.sourceBlock_.render();
  // pxtblockly: Fire a UI event that an edit was complete
  if (this.sourceBlock_.workspace) {
    Blockly.Events.fire(new Blockly.Events.Ui(
        this.sourceBlock_, 'saveEdit', undefined, text));
  }
};

/**
 * Ensure that only a number may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid number, or null if invalid.
 * @deprecated
 */
Blockly.FieldTextInput.numberValidator = function(text) {
  console.warn('Blockly.FieldTextInput.numberValidator is deprecated. ' +
               'Use Blockly.FieldNumber instead.');
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
  return isNaN(n) ? null : String(n);
};

/**
 * Ensure that only a nonnegative integer may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid int, or null if invalid.
 * @deprecated
 */
Blockly.FieldTextInput.nonnegativeIntegerValidator = function(text) {
  var n = Blockly.FieldTextInput.numberValidator(text);
  if (n) {
    n = String(Math.max(0, Math.floor(n)));
  }
  return n;
};

Blockly.Field.register('field_input', Blockly.FieldTextInput);
