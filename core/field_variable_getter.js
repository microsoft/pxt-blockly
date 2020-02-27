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
goog.require('Blockly.utils.object');

/**
 * Class for a variable getter field.
 * @param {?string} varName The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @param {Array.<string>=} opt_variableTypes A list of the types of variables
 *     to include in the dropdown.
 * @param {string=} opt_defaultType The type of variable to create if this
 *     field's value is not explicitly set.  Defaults to ''.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/variable#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 * 
 */
Blockly.FieldVariableGetter = function(varName, opt_validator, opt_variableTypes,
    opt_defaultType, opt_config) {
  // The FieldDropdown constructor expects the field's initial value to be
  // the first entry in the menu generator, which it may or may not be.
  // Just do the relevant parts of the constructor.
   /**
    * The initial variable name passed to this field's constructor, or an
    * empty string if a name wasn't provided. Used to create the initial
    * variable.
    * @type {string}
    */
   this.defaultVariableName = varName || '';
 
   /**
    * The size of the area rendered by the field.
    * @type {Blockly.utils.Size}
    * @protected
    * @override
    */
   this.size_ = new Blockly.utils.Size(0, 0);
 
   opt_config && this.configure_(opt_config);
   opt_validator && this.setValidator(opt_validator);
 
   if (!opt_config) {  // Only do one kind of configuration or the other.
     this.setTypes_(opt_variableTypes, opt_defaultType);
   }
};
Blockly.utils.object.inherits(Blockly.FieldVariableGetter, Blockly.Field);

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
 * The workspace that this variable field belongs to.
 * @type {?Blockly.Workspace}
 * @private
 */
Blockly.FieldVariableGetter.prototype.workspace_ = null;

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
Blockly.FieldVariableGetter.prototype.initView = function() {
  this.createTextElement_();
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
  var variable = Blockly.Variables.getOrCreateVariablePackage(
      this.sourceBlock_.workspace, null,
      this.defaultVariableName, this.defaultType_);

  // Don't call setValue because we don't want to cause a rerender.
  this.doValueUpdate_(variable.getId());
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
  var svgPath = this.sourceBlock_.pathObject.svgPath;
  if (svgPath) {
    Blockly.utils.dom.addClass(svgPath, 'blocklyFieldHover');
    svgPath.style.strokeDasharray = '2';
  }
};

/**
 * Clear hover effect on the block
 * @param {!Event} e Clear hover effect
 */
Blockly.FieldVariableGetter.prototype.clearHover = function() {
  var svgPath = this.sourceBlock_.pathObject.svgPath;
  if (svgPath) {
    Blockly.utils.dom.removeClass(svgPath, 'blocklyFieldHover');
    svgPath.style.strokeDasharray = '';
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
 * Initialize this field based on the given XML.
 * @param {!Element} fieldElement The element containing information about the
 *    variable field's state.
 */
Blockly.FieldVariableGetter.prototype.fromXml = function(fieldElement) {
  var id = fieldElement.getAttribute('id');
  var variableName = fieldElement.textContent;
  // 'variabletype' should be lowercase, but until July 2019 it was sometimes
  // recorded as 'variableType'.  Thus we need to check for both.
  var variableType = fieldElement.getAttribute('variabletype') ||
      fieldElement.getAttribute('variableType') || '';

  // pxt-blockly: variable ID and variable name are both unique, only use name
  var variable = Blockly.Variables.getOrCreateVariablePackage(
      this.sourceBlock_.workspace, null, variableName, variableType);

  // This should never happen :)
  if (variableType != null && variableType !== variable.type) {
    throw Error('Serialized variable type with id \'' +
      variable.getId() + '\' had type ' + variable.type + ', and ' +
      'does not match variable field that references it: ' +
      Blockly.Xml.domToText(fieldElement) + '.');
  }

  this.setValue(variable.getId());
};

/**
 * Serialize this field to XML.
 * @param {!Element} fieldElement The element to populate with info about the
 *    field's state.
 * @return {!Element} The element containing info about the field's state.
 */
Blockly.FieldVariableGetter.prototype.toXml = function(fieldElement) {
  // Make sure the variable is initialized.
  this.initModel();

  fieldElement.id = this.variable_.getId();
  fieldElement.textContent = this.variable_.name;
  if (this.variable_.type) {
    fieldElement.setAttribute('variabletype', this.variable_.type);
  }
  return fieldElement;
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

/**
 * Update the value of this variable field, as well as its variable and text.
 *
 * The variable ID should be valid at this point, but if a variable field
 * validator returns a bad ID, this could break.
 * @param {*} newId The value to be saved.
 * @protected
 */
Blockly.FieldVariableGetter.prototype.doValueUpdate_ = function(newId) {
  this.variable_ = Blockly.Variables.getVariable(
      this.sourceBlock_.workspace, /** @type {string} */ (newId));
  Blockly.FieldVariableGetter.superClass_.doValueUpdate_.call(this, newId);
};

/**
 * Ensure that the id belongs to a valid variable of an allowed type.
 * @param {*=} opt_newValue The id of the new variable to set.
 * @return {?string} The validated id, or null if invalid.
 * @protected
 */
Blockly.FieldVariableGetter.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null) {
    return null;
  }
  var newId = /** @type {string} */ (opt_newValue);
  var variable = Blockly.Variables.getVariable(
      this.sourceBlock_.workspace, newId);
  if (!variable) {
    console.warn('Variable id doesn\'t point to a real variable! ' +
        'ID was ' + newId);
    return null;
  }
  // Type Checks.
  var type = variable.type;
  if (!this.typeIsAllowed_(type)) {
    console.warn('Variable type doesn\'t match this field!  Type was ' + type);
    return null;
  }
  return newId;
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
    this.sourceBlock_.pathObject.svgPath.style.cursor = this.CURSOR;
  }
};

/**
 * Overrides referencesVariables(), indicating this field refers to a variable.
 * @return {boolean} True.
 * @package
 * @override
 */
Blockly.FieldVariableGetter.prototype.referencesVariables = function() {
  return true;
};

Blockly.fieldRegistry.register('field_variable_getter', Blockly.FieldVariableGetter);