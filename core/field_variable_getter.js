/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Variable getter field.  Appears as a label but has a variable
 *     picker in the right-click menu.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FieldVariableGetter');

goog.require('Blockly.Field');

/**
 * Class for a variable getter field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @param {Array.<string>=} opt_variableTypes A list of the types of variables
 *     to include in the dropdown.
 * @param {string=} opt_defaultType The type of variable to create if this
 *     field's value is not explicitly set.  Defaults to ''.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldVariableGetter = function(varname, opt_validator, opt_variableTypes,
    opt_defaultType) {
  this.size_ = new goog.math.Size(Blockly.BlockSvg.FIELD_WIDTH,
      Blockly.BlockSvg.FIELD_HEIGHT);
  this.setValidator(opt_validator);
  this.defaultVariableName = (varname || '');

  this.setTypes_(opt_variableTypes, opt_defaultType);
  this.value_ = null;
};
goog.inherits(Blockly.FieldVariableGetter, Blockly.Field);

/**
 * Construct a FieldVariableGetter from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (variable,
 *                          variableTypes, and defaultType).
 * @returns {!Blockly.FieldVariableGetter} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldVariableGetter.fromJson = function(options) {
  var varname = Blockly.utils.replaceMessageReferences(options['variable']);
  var variableTypes = options['variableTypes'];
  var defaultType = options['defaultType'];
  return new Blockly.FieldVariableGetter(varname, null,
      variableTypes, defaultType);
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldVariableGetter.prototype.CURSOR = 'copy';

/**
 * Editable fields usually show some sort of UI for the user to change them.
 * This field should be serialized, but only edited programmatically.
 * @type {boolean}
 * @public
 */
Blockly.FieldVariableGetter.prototype.EDITABLE = false;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not.  This field should be serialized, but only edited programmatically.
 * @type {boolean}
 * @public
 */
Blockly.FieldVariableGetter.prototype.SERIALIZABLE = true;

/**
 * Install this field on a block.
 */
Blockly.FieldVariableGetter.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  Blockly.FieldVariableGetter.superClass_.init.call(this);

  // TODO (blockly #1010): Change from init/initModel to initView/initModel
  this.initModel();

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
 * Initialize the model for this field if it has not already been initialized.
 * If the value has not been set to a variable by the first render, we make up a
 * variable rather than let the value be invalid.
 * @package
*/
Blockly.FieldVariableGetter.prototype.initModel = function() {
  if (this.variable_) {
    return; // Initialization already happened.
  }
  this.workspace_ = this.sourceBlock_.workspace;
  var variable = Blockly.Variables.getOrCreateVariablePackage(
      this.workspace_, null, this.defaultVariableName, this.defaultType_);

  // Don't fire a change event for this setValue.  It would have null as the
  // old value, which is not valid.
  Blockly.Events.disable();
  try {
    this.setValue(variable.getId());
  } finally {
    Blockly.Events.enable();
  }
};

/**
 * Handle a mouse over event on a input field.
 * @param {!Event} e Mouse over event.
 * @private
 */
Blockly.FieldVariableGetter.prototype.onMouseOver_ = function(e) {
  if (this.sourceBlock_.isInFlyout) return;
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture && gesture.isDragging()) return;
  if (this.sourceBlock_.svgPath_) {
    Blockly.utils.addClass(this.sourceBlock_.svgPath_, 'blocklyFieldHover');
    this.sourceBlock_.svgPath_.style.strokeDasharray = '2';
  }
};

/**
 * Clear hover effect on the block
 * @param {!Event} e Clear hover effect
 */
Blockly.FieldVariableGetter.prototype.clearHover = function() {
  if (this.sourceBlock_.svgPath_) {
    Blockly.utils.removeClass(this.sourceBlock_.svgPath_, 'blocklyFieldHover');
    this.sourceBlock_.svgPath_.style.strokeDasharray = '';
  }
};

/**
 * Handle a mouse out event on a input field.
 * @param {!Event} e Mouse out event.
 * @private
 */
Blockly.FieldVariableGetter.prototype.onMouseOut_ = function(e) {
  if (this.sourceBlock_.isInFlyout) return;
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture && gesture.isDragging()) return;
  this.clearHover();
};

/**
 * Dispose of this field.
 * @public
 */
Blockly.FieldVariableGetter.dispose = function() {
  if (this.mouseOverWrapper_) {
    Blockly.unbindEvent_(this.mouseOverWrapper_);
    this.mouseOverWrapper_ = null;
  }
  if (this.mouseOutWrapper_) {
    Blockly.unbindEvent_(this.mouseOutWrapper_);
    this.mouseOutWrapper_ = null;
  }
  Blockly.FieldVariableGetter.superClass_.dispose.call(this);
  this.workspace_ = null;
  this.variableMap_ = null;
};

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldVariableGetter.prototype.setSourceBlock = function(block) {
  goog.asserts.assert(!block.isShadow(),
      'Variable fields are not allowed to exist on shadow blocks.');
  Blockly.FieldVariableGetter.superClass_.setSourceBlock.call(this, block);
};

/**
 * Get the variable's ID.
 * @return {string} Current variable's ID.
 */
Blockly.FieldVariableGetter.prototype.getValue = function() {
  return this.variable_ ? this.variable_.getId() : null;
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.FieldVariableGetter.prototype.getText = function() {
  return this.variable_ ? this.variable_.name : '';
};

/**
 * Get the variable model for the variable associated with this field.
 * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
 * after the variable has been deleted).
 * @return {?Blockly.VariableModel} the selected variable, or null if none was
 *     selected.
 * @package
 */
Blockly.FieldVariableGetter.prototype.getVariable = function() {
  return this.variable_;
};

Blockly.FieldVariableGetter.prototype.setValue = function(id) {
  var workspace = this.sourceBlock_.workspace;
  var variable = Blockly.Variables.getVariable(workspace, id);

  if (!variable) {
    throw new Error('Variable id doesn\'t point to a real variable!  ID was ' +
        id);
  }
  // Type checks!
  var type = variable.type;
  if (!this.typeIsAllowed_(type)) {
    throw new Error('Variable type doesn\'t match this field!  Type was ' +
        type);
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    var oldValue = this.variable_ ? this.variable_.getId() : null;
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name, oldValue, id));
  }
  this.variable_ = variable;
  this.value_ = id;
  this.setText(variable.name);
};

/**
 * Check whether the given variable type is allowed on this field.
 * @param {string} type The type to check.
 * @return {boolean} True if the type is in the list of allowed types.
 * @private
 */
Blockly.FieldVariableGetter.prototype.typeIsAllowed_ = function(type) {
  var typeList = this.getVariableTypes_();
  if (!typeList) {
    return true; // If it's null, all types are valid.
  }
  for (var i = 0; i < typeList.length; i++) {
    if (type == typeList[i]) {
      return true;
    }
  }
  return false;
};

/**
 * Return a list of variable types to include in the dropdown.
 * @return {!Array.<string>} Array of variable types.
 * @throws {Error} if variableTypes is an empty array.
 * @private
 */
Blockly.FieldVariableGetter.prototype.getVariableTypes_ = function() {
  // TODO (#1513): Try to avoid calling this every time the field is edited.
  var variableTypes = this.variableTypes;
  if (variableTypes === null) {
    // If variableTypes is null, return all variable types.
    if (this.sourceBlock_) {
      var workspace = this.sourceBlock_.workspace;
      return workspace.getVariableTypes();
    }
  }
  variableTypes = variableTypes || [''];
  if (variableTypes.length == 0) {
    // Throw an error if variableTypes is an empty list.
    var name = this.getText();
    throw new Error('\'variableTypes\' of field variable ' +
      name + ' was an empty list');
  }
  return variableTypes;
};

/**
 * Parse the optional arguments representing the allowed variable types and the
 * default variable type.
 * @param {Array.<string>=} opt_variableTypes A list of the types of variables
 *     to include in the dropdown.  If null or undefined, variables of all types
 *     will be displayed in the dropdown.
 * @param {string=} opt_defaultType The type of the variable to create if this
 *     field's value is not explicitly set.  Defaults to ''.
 * @private
 */
Blockly.FieldVariableGetter.prototype.setTypes_ = function(opt_variableTypes,
    opt_defaultType) {
  // If you expected that the default type would be the same as the only entry
  // in the variable types array, tell the Blockly team by commenting on #1499.
  var defaultType = opt_defaultType || '';
  // Set the allowable variable types.  Null means all types on the workspace.
  if (opt_variableTypes == null || opt_variableTypes == undefined) {
    var variableTypes = null;
  } else if (Array.isArray(opt_variableTypes)) {
    var variableTypes = opt_variableTypes;
    // Make sure the default type is valid.
    var isInArray = false;
    for (var i = 0; i < variableTypes.length; i++) {
      if (variableTypes[i] == defaultType) {
        isInArray = true;
      }
    }
    if (!isInArray) {
      throw new Error('Invalid default type \'' + defaultType + '\' in ' +
          'the definition of a FieldVariable');
    }
  } else {
    throw new Error('\'variableTypes\' was not an array in the definition of ' +
        'a FieldVariable');
  }
  // Only update the field once all checks pass.
  this.defaultType_ =  defaultType;
  this.variableTypes = variableTypes;
};

/**
 * This field is editable, but only through the right-click menu.
 * @private
 */
Blockly.FieldVariableGetter.prototype.showEditor_ = function() {
  // nop.
};

/**
 * Add or remove the UI indicating if this field is editable or not.
 * This field is editable, but only through the right-click menu.
 * Suppress default editable behaviour.
 */
Blockly.FieldVariableGetter.prototype.updateEditable = function() {
  if (!this.sourceBlock_.isInFlyout && this.sourceBlock_.isEditable()) {
    this.fieldGroup_.style.cursor = this.CURSOR;
  }
};

Blockly.Field.register('field_variable_getter', Blockly.FieldVariableGetter);
