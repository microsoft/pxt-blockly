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
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldDropdown');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.string');
goog.require('Blockly.utils.uiMenu');
goog.require('Blockly.utils.userAgent');

goog.require('goog.events');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');


/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a language-neutral dropdown
 *    option & returns a validated language-neutral dropdown option, or null to
 *    abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldDropdown = function(menuGenerator, opt_validator) {
  this.menuGenerator_ = menuGenerator;
  this.trimOptions_();

  // pxt-blockly: validate result of getOptions, as menuGenerator is sometimes
  // null (as in case of old pxt functions)
  let options = this.getOptions();
  Blockly.FieldDropdown.validateOptions_(options);
  var firstTuple = options[0];

  // Call parent's constructor.
  Blockly.FieldDropdown.superClass_.constructor.call(this, firstTuple[1],
      opt_validator);
  this.addArgType('dropdown');
};
goog.inherits(Blockly.FieldDropdown, Blockly.Field);

/**
 * Construct a FieldDropdown from a JSON arg object.
 * @param {!Object} options A JSON object with options (options).
 * @return {!Blockly.FieldDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldDropdown.fromJson = function(options) {
  return new Blockly.FieldDropdown(options['options']);
};

/**
 * Editable fields usually show some sort of UI for the user to change them.
 * This field should be serialized, but only edited programmatically.
 * @type {boolean}
 * @public
 */
Blockly.FieldDropdown.prototype.EDITABLE = false;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 */
Blockly.FieldDropdown.prototype.SERIALIZABLE = true;

/**
 * Horizontal distance that a checkmark overhangs the dropdown.
 */
Blockly.FieldDropdown.CHECKMARK_OVERHANG = 25;

/**
 * Maximum height of the dropdown menu, as a percentage of the viewport height.
 */
Blockly.FieldDropdown.MAX_MENU_HEIGHT_VH = 0.45;

/**
 * Used to position the imageElement_ correctly.
 * @type {number}
 * @const
 */
Blockly.FieldDropdown.IMAGE_Y_OFFSET = 5;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDropdown.prototype.CURSOR = 'pointer';

/**
 * Closure menu item currently selected.
 * @type {?goog.ui.MenuItem}
 */
Blockly.FieldDropdown.prototype.selectedItem = null;

/**
 * Language-neutral currently selected string or image object.
 * @type {string|!Object}
 * @private
 */
Blockly.FieldDropdown.prototype.value_ = '';

/**
 * SVG image element if currently selected option is an image, or null.
 * @type {SVGElement}
 * @private
 */
Blockly.FieldDropdown.prototype.imageElement_ = null;

/**
 * Object with src, height, width, and alt attributes if currently selected
 * option is an image, or null.
 * @type {Blockly.ImageJson}
 * @private
 */
Blockly.FieldDropdown.prototype.imageJson_ = null;


Blockly.FieldDropdown.DROPDOWN_SVG_DATAURI = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaGVpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuNDEsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTDAuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNzFDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMCwxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';

/**
 * Create the block UI for this dropdown.
 * @package
 */
Blockly.FieldDropdown.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }

  Blockly.FieldDropdown.superClass_.initView.call(this);

  // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
  // Positioned on render, after text size is calculated.
  /** @type {Number} */
  this.arrowSize_ = 12;
  /** @type {Number} */
  this.arrowX_ = 0;
  /** @type {Number} */
  this.arrowY_ = 11;

  // IE and iOS have issues with the <use> element, place the image inline instead
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use#Browser_compatibility
  var placeImageInline = Blockly.utils.userAgent.IE || Blockly.utils.userAgent.IOS;
  var arrowElement = placeImageInline ? 'image' : 'use';
  var arrowHref = placeImageInline ? Blockly.FieldDropdown.DROPDOWN_SVG_DATAURI : '#blocklyDropdownArrowSvg';

  this.arrow_ = Blockly.utils.dom.createSvgElement(arrowElement, {
    'height': this.arrowSize_ + 'px',
    'width': this.arrowSize_ + 'px'
  });
  this.arrow_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', arrowHref);
  this.className_ += ' blocklyDropdownText';

  Blockly.FieldDropdown.superClass_.init.call(this);
  // If not in a shadow block, draw a box.
  if (this.shouldShowRect_()) {
    this.box_ = Blockly.utils.dom.createSvgElement('rect', {
      'rx': Blockly.BlockSvg.CORNER_RADIUS,
      'ry': Blockly.BlockSvg.CORNER_RADIUS,
      'x': 0,
      'y': 0,
      'width': this.size_.width,
      'height': this.size_.height,
      'stroke': this.sourceBlock_.getColourTertiary(),
      'fill': this.sourceBlock_.getColour(),
      'class': 'blocklyBlockBackground',
      'fill-opacity': 1
    }, null);
    this.fieldGroup_.insertBefore(this.box_, this.textElement_);
  }
  // Force a reset of the text to add the arrow.
  var text = this.text_;
  this.text_ = null;
  this.setText(text);

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
 * Handle a mouse over event on a dropdown field.
 * @param {!Event} e Mouse over event.
 * @private
 */
Blockly.FieldDropdown.prototype.onMouseOver_ = function(e) {
  if (this.sourceBlock_.isInFlyout) return;
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture && gesture.isDragging()) return;
  if (this.box_) {
    Blockly.utils.dom.addClass(this.box_, 'blocklyFieldHover');
  }
  else if (this.sourceBlock_.svgPath_) {
    Blockly.utils.dom.addClass(this.sourceBlock_.svgPath_, 'blocklyFieldHover');
  }
};

/**
 * Handle a mouse out event on a dropdown field.
 * @param {!Event} e Mouse out event.
 * @private
 */
Blockly.FieldDropdown.prototype.onMouseOut_ = function(e) {
  if (this.sourceBlock_.isInFlyout) return;
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture && gesture.isDragging()) return;
  if (this.box_) {
    Blockly.utils.dom.removeClass(this.box_, 'blocklyFieldHover');
  }
  else if (this.sourceBlock_.svgPath_) {
    Blockly.utils.dom.removeClass(this.sourceBlock_.svgPath_, 'blocklyFieldHover');
  }
};

/**
 * Whether or not to show a box around the dropdown menu.
 * @return {boolean} True if we should show a box (rect) around the dropdown menu. Otherwise false.
 * @private
 */
Blockly.FieldDropdown.prototype.shouldShowRect_ = function() {
  return !this.sourceBlock_.isShadow();
};

/**
 * Create a dropdown menu under the text.
 * @private
 */
Blockly.FieldDropdown.prototype.showEditor_ = function() {
  var options = this.getOptions();
  if (options.length == 0) return;

  this.dropDownOpen_ = true;
  // If there is an existing drop-down someone else owns, hide it immediately and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();

  var thisField = this;

  var selected = false;
  function callback(e) {
    if (selected) return;
    var menu = this;
    var menuItem = e.target;
    if (menuItem) {
      thisField.onItemSelected(menu, menuItem);
      selected = true;
    }
    Blockly.DropDownDiv.hide();
    Blockly.Events.setGroup(false);
  }

  var menu = new goog.ui.Menu();
  menu.setRightToLeft(this.sourceBlock_.RTL);
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0]; // Human-readable text or image.
    var value = options[i][1];   // Language-neutral value.
    var separator = value === 'SEPARATOR';
    if (separator) {
      // pxtblockly: render separator
      var menuItem = new goog.ui.MenuSeparator();
      menuItem.setRightToLeft(this.sourceBlock_.RTL);
      menu.addChild(menuItem, true);
      menuItem.getElement().style.borderColor = this.sourceBlock_.getColourTertiary();
      continue;
    }
    if (typeof content == 'object') {
      // An image, not text.
      var image = new Image(content['width'], content['height']);
      image.src = content['src'];
      image.alt = content['alt'] || '';
      content = image;
    }
    var menuItem = new goog.ui.MenuItem(content);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setValue(value);
    menuItem.setCheckable(true);
    menu.addChild(menuItem, true);
    var checked = (value == this.value_);
    menuItem.setChecked(checked);
    if (checked) {
      this.selectedItem = menuItem;
    }
  }
  // Listen for mouse/keyboard events.
  goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);

  // Record windowSize and scrollOffset before adding menu.
  menu.render(contentDiv);
  var menuDom = menu.getElement();
  Blockly.utils.dom.addClass(menuDom, 'blocklyDropdownMenu');
  // Record menuSize after adding menu.
  var menuSize = Blockly.utils.uiMenu.getSize(menu);
  // Recalculate height for the total content, not only box height.
  menuSize.height = menuDom.scrollHeight;

  var primaryColour = (this.sourceBlock_.isShadow()) ?
    this.sourceBlock_.parentBlock_.getColour() : this.sourceBlock_.getColour();

  Blockly.DropDownDiv.setColour(primaryColour, this.sourceBlock_.getColourTertiary());

  var category = (this.sourceBlock_.isShadow()) ?
    this.sourceBlock_.parentBlock_.getCategory() : this.sourceBlock_.getCategory();
  Blockly.DropDownDiv.setCategory(category);

  Blockly.DropDownDiv.showPositionedByField(this, this.onHide.bind(this));

  menu.setAllowAutoFocus(true);
  menuDom.focus();

  // Update colour to look selected.
  if (!this.disableColourChange_) {
    if (this.sourceBlock_.isShadow()) {
      this.sourceBlock_.setShadowColour(this.sourceBlock_.getColourTertiary());
    } else if (this.box_) {
      this.box_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
    }
  }
};

/**
 * Callback for when the drop-down is hidden.
 */
Blockly.FieldDropdown.prototype.onHide = function() {
  this.dropDownOpen_ = false;
  // Update colour to look selected.
  if (!this.disableColourChange_ && this.sourceBlock_) {
    if (this.sourceBlock_.isShadow()) {
      this.sourceBlock_.clearShadowColour();
    } else if (this.box_) {
      this.box_.setAttribute('fill', this.sourceBlock_.getColour());
    }
  }
};

/**
 * Handle the selection of an item in the dropdown menu.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldDropdown.prototype.onItemSelected = function(menu, menuItem) {
  // pxtblockly: add extra check to make sure we don't double tap on any option
  if (!this.dropDownOpen_) return;
  var value = menuItem.getValue();
  if (this.sourceBlock_) {
    // Call any validation function, and allow it to override.
    value = this.callValidator(value);
  }
  if (value !== null) {
    this.setValue(value);

    // pxtblockly: Fire a UI event that an edit was complete
    if (this.sourceBlock_.workspace) {
      Blockly.Events.fire(new Blockly.Events.Ui(
          this.sourceBlock_, 'itemSelected', undefined, value));
    }
  }
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
Blockly.FieldDropdown.prototype.trimOptions_ = function() {
  this.prefixField = null;
  this.suffixField = null;
  var options = this.menuGenerator_;
  if (!Array.isArray(options)) {
    return;
  }
  var hasImages = false;

  // Localize label text and image alt text.
  for (var i = 0; i < options.length; i++) {
    var label = options[i][0];
    if (typeof label == 'string') {
      options[i][0] = Blockly.utils.replaceMessageReferences(label);
    } else {
      if (label.alt != null) {
        options[i][0].alt = Blockly.utils.replaceMessageReferences(label.alt);
      }
      hasImages = true;
    }
  }
  if (hasImages || options.length < 2) {
    return;  // Do nothing if too few items or at least one label is an image.
  }
  var strings = [];
  for (var i = 0; i < options.length; i++) {
    strings.push(options[i][0]);
  }
  var shortest = Blockly.utils.string.shortestStringLength(strings);
  var prefixLength = Blockly.utils.string.commonWordPrefix(strings, shortest);
  var suffixLength = Blockly.utils.string.commonWordSuffix(strings, shortest);
  if (!prefixLength && !suffixLength) {
    return;
  }
  if (shortest <= prefixLength + suffixLength) {
    // One or more strings will entirely vanish if we proceed.  Abort.
    return;
  }
  if (prefixLength) {
    this.prefixField = strings[0].substring(0, prefixLength - 1);
  }
  if (suffixLength) {
    this.suffixField = strings[0].substr(1 - suffixLength);
  }
  // Remove the prefix and suffix from the options.
  var newOptions = [];
  for (var i = 0; i < options.length; i++) {
    var text = options[i][0];
    var value = options[i][1];
    text = text.substring(prefixLength, text.length - suffixLength);
    newOptions[i] = [text, value];
  }
  this.menuGenerator_ = newOptions;
};

/**
 * @return {boolean} True if the option list is generated by a function. Otherwise false.
 */
Blockly.FieldDropdown.prototype.isOptionListDynamic = function() {
  return typeof this.menuGenerator_ == 'function';
};

/**
 * Return a list of the options for this dropdown.
 * @return {!Array.<!Array>} Array of option tuples:
 *     (human-readable text or image, language-neutral name).
 * @throws If generated options are incorrectly structured.
 */
Blockly.FieldDropdown.prototype.getOptions = function() {
  if (this.isOptionListDynamic()) {
    var generatedOptions = this.menuGenerator_.call(this);
    Blockly.FieldDropdown.validateOptions_(generatedOptions);
    return generatedOptions;
  }
  return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
};

/**
 * Ensure that the input value is a valid language-neutral option.
 * @param {string=} newValue The input value.
 * @return {?string} A valid language-neutral option, or null if invalid.
 * @protected
 */
Blockly.FieldDropdown.prototype.doClassValidation_ = function(newValue) {
  var isValueValid = false;
  var options = this.getOptions();
  for (var i = 0, option; option = options[i]; i++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (option[1] == newValue) {
      isValueValid = true;
      break;
    }
  }
  if (!isValueValid) {
    if (this.sourceBlock_) {
      console.warn('Cannot set the dropdown\'s value to an unavailable option.' +
        ' Block type: ' + this.sourceBlock_.type + ', Field name: ' + this.name +
        ', Value: ' + newValue);
    }
    // pxt-blockly: allow unavailable options in dropdown
    return newValue;
  }
  return newValue;
};

/**
 * Update the value of this dropdown field.
 * @param {string} newValue The new language-enutral value.
 * @protected
 */
Blockly.FieldDropdown.prototype.doValueUpdate_ = function(newValue) {
  Blockly.FieldDropdown.superClass_.doValueUpdate_.call(this, newValue);
  // Clear menu item for old value.
  if (this.selectedItem) {
    this.selectedItem.setChecked(false);
    this.selectedItem = null;
  }

  var options = this.getOptions();
  for (var i = 0, option; option = options[i]; i++) {
    if (option[1] == this.value_) {
      var content = option[0];
      if (typeof content == 'object') {
        this.imageJson_ = content;
        this.text_ = content.alt;
      } else {
        this.imageJson_ = null;
        this.text_ = content;
      }
    }
  }
};

/**
 * Updates the dropdown arrow to match the colour/style of the block.
 * @package
 */
Blockly.FieldDropdown.prototype.updateColour = function() {
  // Update arrow's colour.
  if (this.sourceBlock_ && this.arrow_) {
    if (this.sourceBlock_.isShadow()) {
      this.arrow_.style.fill = this.sourceBlock_.getColourShadow();
    } else {
      this.arrow_.style.fill = this.sourceBlock_.getColour();
    }
  }
};

/**
 * Sets the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.FieldDropdown.prototype.setText = function(text) {
  if (text === null || text === this.text_) {
    // No change if null.
    return;
  }
  this.text_ = text;
  this.updateTextNode_();

  if (this.textElement_) {
    this.textElement_.parentNode.appendChild(this.arrow_);
  }
  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
  }
};

/**
 * Position a drop-down arrow at the appropriate location at render-time.
 * @param {number} x X position the arrow is being rendered at, in px.
 * @return {number} Amount of space the arrow is taking up, in px.
 */
Blockly.FieldDropdown.prototype.positionArrow = function(x) {
  if (!this.arrow_) {
    return 0;
  }

  var addedWidth = 0;
  if (this.sourceBlock_.RTL) {
    this.arrowX_ = this.arrowSize_ - Blockly.BlockSvg.DROPDOWN_ARROW_PADDING;
    addedWidth = this.arrowSize_ + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING;
  } else {
    this.arrowX_ = x + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING / 2;
    addedWidth = this.arrowSize_ + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING;
  }
  if (this.box_) {
    // Bump positioning to the right for a box-type drop-down.
    this.arrowX_ += Blockly.BlockSvg.BOX_FIELD_PADDING;
  }
  this.arrow_.setAttribute('transform',
      'translate(' + this.arrowX_ + ',' + this.arrowY_ + ')'
  );
  return addedWidth;
};

/**
 * Close the dropdown menu if this input is being deleted.
 */
Blockly.FieldDropdown.prototype.dispose = function() {
  if (this.mouseOverWrapper_) {
    Blockly.unbindEvent_(this.mouseOverWrapper_);
    this.mouseOverWrapper_ = null;
  }
  if (this.mouseOutWrapper_) {
    Blockly.unbindEvent_(this.mouseOutWrapper_);
    this.mouseOutWrapper_ = null;
  }
  this.selectedItem = null;
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldDropdown.superClass_.dispose.call(this);
};

/**
 * Validates the data structure to be processed as an options list.
 * @param {?} options The proposed dropdown options.
 * @throws If proposed options are incorrectly structured.
 * @private
 */
Blockly.FieldDropdown.validateOptions_ = function(options) {
  if (!Array.isArray(options)) {
    throw TypeError('FieldDropdown options must be an array.');
  }
  var foundError = false;
  for (var i = 0; i < options.length; ++i) {
    var tuple = options[i];
    if (!Array.isArray(tuple)) {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option must be an ' +
          'array. Found: ', tuple);
    } else if (typeof tuple[1] != 'string') {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option id must be ' +
          'a string. Found ' + tuple[1] + ' in: ', tuple);
    } else if (tuple[0] && ((typeof tuple[0] != 'string') && // pxt-blockly allow undefined tuple
               (typeof tuple[0].src != 'string'))) {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option must have a ' +
          'string label or image description. Found' + tuple[0] + ' in: ',
          tuple);
    }
  }
  if (foundError) {
    throw TypeError('Found invalid FieldDropdown options.');
  }
};

Blockly.Field.register('field_dropdown', Blockly.FieldDropdown);