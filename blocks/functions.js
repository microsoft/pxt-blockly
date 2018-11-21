/**
 * @license
 * PXT Blockly fork
 *
 * The MIT License (MIT)
 *
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @fileoverview Utility functions for handling functions (pxt-blockly's custom procedures).
 * @author Microsoft MakeCode
 */
'use strict';

/**
 * Type to represent a function parameter
 * @typedef {Object} FunctionParameter
 * @property {string} id The blockly ID of the param // TODO GUJEN is this really needed?
 * @property {string} name the name of the param
 * @property {string} type the type of the param (string, number, boolean or a custom type)
 */

Blockly.PXTBlockly.FunctionUtils = {};

/**
 * Create XML to represent the name and parameters of a function declaration,
 * definition or call block.
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.mutationToDom = function () {
  var container = document.createElement('mutation');
  container.setAttribute('name', this.name_);
  this.arguments_.forEach((arg) => {
    var argNode = document.createElement('arg');
    argNode.setAttribute('name', arg.name);
    argNode.setAttribute('id', arg.id);
    argNode.setAttribute('type', arg.type);
    container.appendChild(argNode);

    // TODO GUJEN Does LTR affect arg order here?
  });

  return container;
};

/**
 * Parse XML to restore the name and parameters of a function declaration,
 * definition or call block.
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.domToMutation = function (xmlElement) {
  var args = [];
  xmlElement.childNodes.forEach(c => {
    args.push({
      id: c.getAttribute('id'), // TODO GUJEN this crashed at some point, try to repro
      name: c.getAttribute('name'),
      type: c.getAttribute('type')
    });
  });

  this.arguments_ = args;
  this.name_ = xmlElement.getAttribute('name');
  this.updateDisplay_();
};

/**
 * Returns the name of the function, or the empty string if it has not yet been
 * set.
 * @return {string} Function name.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.getName = function () {
  return this.name_;
};

/**
 * Add or remove the statement block from this function definition.
 * @param {boolean} hasStatements True if a statement block is needed.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.setStatements_ = function (hasStatements) {
  if (this.hasStatements_ === hasStatements) {
    return;
  }
  if (hasStatements) {
    this.appendStatementInput('STACK')
  } else {
    this.removeInput('STACK', true);
  }
  this.hasStatements_ = hasStatements;
}

/**
 * Update the block's structure and appearance to match the internally stored
 * mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.updateDisplay_ = function () {
  var wasRendered = this.rendered;
  this.rendered = false;

  var connectionMap = this.disconnectOldBlocks_();
  this.removeAllInputs_();

  this.createAllInputs_(connectionMap);
  this.deleteShadows_(connectionMap); // TODO GUJEN is this needed?

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }
};

/**
 * Disconnect old blocks from all value inputs on this block, but hold onto them
 * in case they can be reattached later. Also save the shadow DOM if it exists.
 * The result is a map from argument ID to information that was associated with
 * that argument at the beginning of the mutation.
 * @return {!Object.<string, {shadow: Element, block: Blockly.Block}>} An object
 *     mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_ = function () {
  // Remove old stuff
  var connectionMap = {};
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.name !== 'STACK' && input.connection) {
      var target = input.connection.targetBlock();
      var saveInfo = {
        shadow: input.connection.getShadowDom(),
        block: target
      };
      connectionMap[input.name] = saveInfo;

      // Remove the shadow DOM, then disconnect the block. Otherwise a shadow
      // block will respawn instantly, and we'd have to remove it when we remove
      // the input.

      // TODO GUJEN is this needed?
      input.connection.setShadowDom(null);
      if (target) {
        input.connection.disconnect();
      }
    }
  }
  return connectionMap;
};

/**
 * Removes all inputs on the block, including dummy inputs, except the STACK
 * input. Assumes no input has shadow DOM set.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.removeAllInputs_ = function () {
  // Delete inputs directly instead of with block.removeInput to avoid splicing
  // out of the input list at every index.
  var stackInput = null;
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.name === 'STACK') {
      stackInput = input;
    } else {
      input.dispose();
    }
  }
  this.inputList = stackInput ? [stackInput] : [];
};

/**
 * Create all inputs specified by the mutation args, and populate them with
 * shadow blocks or reconnected old blocks as appropriate.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createAllInputs_ = function (connectionMap) {
  // Create the main label.
  var labelText = '';
  switch (this.type) {
    case Blockly.FUNCTION_CALL_BLOCK_TYPE:
      labelText = Blockly.Msg.PROCEDURES_CALLNORETURN_TITLE;
      break;
    case Blockly.FUNCTION_DEFINITION_BLOCK_TYPE:
    case Blockly.FUNCTION_DECLARATION_BLOCK_TYPE:
      labelText = Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE;
  }

  this.appendDummyInput()
    .appendField(labelText, 'function_title');

  // Create the function name (overridden by the block type).
  this.addFunctionLabel_(this.getName());

  // Create arguments.
  this.arguments_.forEach(arg => {
    // For custom types, the parameter type is appended to the UUID in the
    // input name. This is needed to retrieve the function signature from the
    // block inputs when the declaration block is modified.
    // TODO GUJEN ensure this works
    var inputName = arg.id;
    if (arg.type !== 'boolean' && arg.type !== 'string' && arg.type !== 'number') {
      inputName = arg.id + '_' + arg.type;
    }
    var input = this.appendValueInput(inputName);
    if (arg.type === 'boolean') {
      // input.setCheck('Boolean'); // TODO GUJEN uncomment this when we have the real reporters on definition blocks
      // TODO GUJEN add other checks for other param types?
    }
    this.populateArgument_(arg, connectionMap, input);
  });

  // Move the statement input (block mouth) back to the end.
  if (this.hasStatements_) {
    this.moveInputBefore('STACK', null);
  }
};

/**
 * Delete all shadow blocks in the given map.
 * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
 *     argument IDs to the blocks that were connected to those IDs at the
 *     beginning of the mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.deleteShadows_ = function (connectionMap) {
  // TODO GUJEN is this needed?
  // Get rid of all of the old shadow blocks if they aren't connected.
  if (connectionMap) {
    for (var id in connectionMap) {
      var saveInfo = connectionMap[id];
      if (saveInfo) {
        var block = saveInfo['block'];
        if (block && block.isShadow()) {
          block.dispose();
          connectionMap[id] = null;
          // At this point we know which shadow DOMs are about to be orphaned in
          // the VM. What do we do with that information?
        }
      }
    }
  }
};

/**
 * Add a label editor with the given text to a function_declaration
 * block. Editing the text in the label editor updates the text of the
 * corresponding label fields on function calls.
 * @param {string} text The label text.
 * @private
 */
Blockly.PXTBlockly.FunctionUtils.addLabelEditor_ = function (text) {
  if (text) {
    this.appendDummyInput('function_name').appendField(new Blockly.FieldTextInput(text), 'NAME'); // TODO GUJEN mimick scratch blocks behavior of having solid background while not editing
  }
};

/**
 * Add a label field with the given text to a function call or definition
 * block.
 * @param {string} text The label text.
 * @private
 */
Blockly.PXTBlockly.FunctionUtils.addLabelField_ = function (text) {
  this.appendDummyInput('function_name').appendField(text, 'NAME');
};

/**
 * TODO GUJEN jsdoc
 */
Blockly.PXTBlockly.FunctionUtils.getShadowBlockInfoFromType_ = function (argumentType) {
  var shadowType = '';
  var fieldName = '';
  var fieldValue = '';
  switch (argumentType) {
    case 'boolean':
      shadowType = 'logic_boolean'; // TODO GUJEN verify this is ok
      fieldName = 'BOOL';
      fieldValue = 'TRUE';
      break;
    case 'number':
      shadowType = 'math_number'; // TODO GUJEN verify this is ok
      fieldName = 'NUM';
      fieldValue = '1';
      break;
    case 'string':
      shadowType = 'text'; // TODO GUJEN verify this is ok
      fieldName = 'TEXT';
      fieldValue = 'abc';
      break;
    default:
      // TODO GUJEN figure out how to come up with the right shadow block for custom types
      shadowType = 'text';
      fieldName = 'TEXT';
      fieldValue = 'abc';
  }
  return [shadowType, fieldName, fieldValue];
}

/**
 * Build a DOM node representing a shadow block of the given type.
 * @param {string} argumentType The type of the argument.
 * @return {!Element} The DOM node representing the new shadow block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.buildShadowDom_ = function (argumentType) {
  // TODO GUJEN ensure this works for all types
  var shadowDom = goog.dom.createDom('shadow');
  var [shadowType, fieldName, fieldValue] = Blockly.PXTBlockly.FunctionUtils.getShadowBlockInfoFromType_(argumentType);
  shadowDom.setAttribute('type', shadowType);
  var fieldDom = goog.dom.createDom('field', null, fieldValue);
  fieldDom.setAttribute('name', fieldName);
  shadowDom.appendChild(fieldDom);
  return shadowDom;
};

/**
 * Create a new shadow block and attach it to the given input.
 * @param {!Blockly.Input} input The value input to attach a block to.
 * @param {string} argumentType The type of the argument.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.attachShadow_ = function (input, argumentType) {
  // TODO GUJEN ensure this works for all types
  var [blockType, fieldName, fieldValue] = Blockly.PXTBlockly.FunctionUtils.getShadowBlockInfoFromType_(argumentType);
  Blockly.Events.disable();
  var newBlock = null;
  try {
    newBlock = this.workspace.newBlock(blockType);
    newBlock.setFieldValue(fieldValue, fieldName);
    newBlock.setShadow(true);
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  }
  finally {
    Blockly.Events.enable();
  }

  newBlock && newBlock.outputConnection.connect(input.connection);
};

/**
 * Create a new argument reporter block.
 * @param {string} argumentType The type of the argument.
 * @param {string} displayName The name of the argument as provided by the
 *     user, which becomes the text of the label on the argument reporter block.
 * @return {!Blockly.BlockSvg} The newly created argument reporter block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createArgumentReporter_ = function (argumentType, displayName) {
  // TODO GUJEN finish this, and use correct reporter block for draggable args
  var blockType = '';
  switch (argumentType) {
    case 'boolean':
      blockType = 'text'; // TODO GUJEN
      break;
    case 'number':
      blockType = 'text'; // TODO GUJEN
      break;
    case 'string':
      blockType = 'text'; // TODO GUJEN
      break;
    default:
      // TODO GUJEN figure out how to have draggable custom types
      blockType = 'text';
  }
  Blockly.Events.disable();
  try {
    var newBlock = this.workspace.newBlock(blockType);
    newBlock.setShadow(true);
    newBlock.setFieldValue(displayName, 'TEXT');
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  } finally {
    Blockly.Events.enable();
  }
  return newBlock;
};

/**
 * Populate the argument by attaching the correct child block or shadow to the
 * given input.
 * @param {FunctionParameter} arg The description of the argument.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param {!Blockly.Input} input The newly created input to populate.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.populateArgumentOnCaller_ = function (arg, connectionMap, input) {
  // TODO GUJEN ensure this works for all types
  var oldBlock = null;
  var oldShadow = null;
  if (connectionMap && (arg.id in connectionMap)) {
    var saveInfo = connectionMap[arg.id];
    oldBlock = saveInfo['block'];
    oldShadow = saveInfo['shadow'];
  }

  if (connectionMap && oldBlock) {
    // Reattach the old block and shadow DOM.
    connectionMap[input.name] = null;
    oldBlock.outputConnection.connect(input.connection);
    var shadowDom = oldShadow || this.buildShadowDom_(arg.type);
    console.log("setting shadow dom: " + shadowDom);
    input.connection.setShadowDom(shadowDom);
  } else {
    this.attachShadow_(input, arg.type);
  }
};

/**
 * Populate the argument by attaching the correct argument reporter to the given
 * input.
 * @param {FunctionParameter} arg The description of the argument.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param {!Blockly.Input} input The newly created input to populate.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDefinition_ = function (arg, connectionMap, input) {
  // TODO GUJEN complete this
  // TODO GUJEN ensure this works when modifying with existing arguments
  var oldBlock = null;
  if (connectionMap && (arg.id in connectionMap)) {
    var saveInfo = connectionMap[arg.id];
    oldBlock = saveInfo['block'];
  }

  var oldTypeMatches = Blockly.PXTBlockly.FunctionUtils.checkOldTypeMatches_(oldBlock, arg.type);
  var displayName = arg.name;

  // Decide which block to attach.
  if (connectionMap && oldBlock && oldTypeMatches) {
    // Update the text if needed. The old argument reporter is the same type,
    // and on the same input, but the argument's display name may have changed.
    var argumentReporter = oldBlock;
    argumentReporter.setFieldValue(displayName, 'VALUE');
    connectionMap[input.name] = null;
  } else {
    var argumentReporter = this.createArgumentReporter_(arg.type, displayName);
  }

  // Attach the block.
  input.connection.connect(argumentReporter.outputConnection);
};

/**
* Populate the argument by attaching the correct argument editor to the given
* input.
* @param {FunctionParameter} arg The description of the argument.
* @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
*     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
* @param {!Blockly.Input} input The newly created input to populate.
* @private
* @this Blockly.Block
*/
Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDeclaration_ = function (arg, connectionMap, input) {
  // TODO GUJEN complete this
  var oldBlock = null;
  if (connectionMap && (arg.id in connectionMap)) {
    var saveInfo = connectionMap[arg.id];
    oldBlock = saveInfo['block'];
  }

  // TODO GUJEN fix this
  // TODO: This always returns false, because it checks for argument reporter
  // blocks instead of argument editor blocks. Create a new version for argument
  // editors.
  var oldTypeMatches = Blockly.PXTBlockly.FunctionUtils.checkOldTypeMatches_(oldBlock, arg.type);

  // Decide which block to attach.
  if (oldBlock && oldTypeMatches) {
    var argumentEditor = oldBlock;
    oldBlock.setFieldValue(arg.name, 'TEXT');
    connectionMap[input.name] = null;
  } else {
    var argumentEditor = this.createArgumentEditor_(arg.type, arg.name);
  }

  // Attach the block.
  input.connection.connect(argumentEditor.outputConnection);
};

/**
* Check whether the type of the old block corresponds to the given argument
* type.
* @param {Blockly.BlockSvg} oldBlock The old block to check.
* @param {string} type The argument type. One of 'n', 'n', or 's'.
* @return {boolean} True if the type matches, false otherwise.
*/
Blockly.PXTBlockly.FunctionUtils.checkOldTypeMatches_ = function (oldBlock, type) {
  // TODO GUJEN fix this; might have to check the old mutation to decide whether arg type is still correct
  if (!oldBlock) {
    return false;
  }
  if ((type == 'n' || type == 's') &&
    oldBlock.type == 'argument_reporter_string_number') {
    return true;
  }
  if (type == 'b' && oldBlock.type == 'argument_reporter_boolean') {
    return true;
  }
  return false;
};

/**
 * Create an argument editor.
 * An argument editor is a shadow block with a single text field, which is used
 * to set the display name of the argument.
 * @param {string} argumentType One of 'b' (boolean), 's' (string) or
 *     'n' (number).
 * @param {string} displayName The display name of this argument, which is the
 *     text of the field on the shadow block.
 * @return {!Blockly.BlockSvg} The newly created argument editor block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createArgumentEditor_ = function (argumentType, displayName) {
  // TODO GUJEN complete this
  Blockly.Events.disable();
  var newBlock;
  try {
    switch (argumentType) {
      case 'boolean':
        newBlock = this.workspace.newBlock('argument_editor_boolean');
        break;
      case 'string':
        newBlock = this.workspace.newBlock('argument_editor_string');
        break;
      case 'number':
        newBlock = this.workspace.newBlock('argument_editor_number');
        break;
      default:
        // TODO GUJEN figure out how to handle custom types
        newBlock = this.workspace.newBlock('argument_editor_string');
    }
    newBlock.setFieldValue(displayName, 'TEXT');
    newBlock.setShadow(true);
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  } finally {
    Blockly.Events.enable();
  }
  return newBlock;
};

/**
 * Update the mutation information on the declaration block based on the
 * existing inputs and their text.
 */
Blockly.PXTBlockly.FunctionUtils.updateDeclarationMutation_ = function () {
  // TODO GUJEN deal with invalid arg names, duplicate arg names, duplicate function names, etc
  this.arguments_ = [];
  // Start iterating at 1 to skip the function label
  for (var i = 1; i < this.inputList.length; i++) {
    var input = this.inputList[i];
    switch (input.type) {
      case Blockly.NEXT_STATEMENT:
        // Nothing to save
        break;
      case Blockly.DUMMY_INPUT:
        // This is the function name text input
        this.name_ = input.fieldRow[0].getValue();
        break;
      case Blockly.INPUT_VALUE:
        // Inspect the argument editor to add the argument to our mutation.
        var target = input.connection.targetBlock();
        var typeName = '';
        var argId = input.name;

        switch (target.type) {
          case 'argument_editor_boolean':
            typeName = 'boolean';
            break;
          case 'argument_editor_string':
            typeName = 'string';
            break;
          case 'argument_editor_number':
            typeName = 'number';
            break;
          case 'argument_editor_custom':
            // For custom types, the name of the input looks like UUID_TYPE,
            // where UUID is 20 characters. Parse the input name into the ID
            // and the type.
            // TODO GUJEN Figure out end-to-end design for custom types and adjust here
            argId = input.name.substr(0, 20);
            typeName = input.name.substr(21);
            break;
        }
        this.arguments_.push({
          id: argId,
          name: target.getFieldValue('TEXT'),
          type: typeName
        });
        break;
      default:
        console.warn('Unexpected input type on a function mutator root: ' + input.type);
    }
  }
};

/**
* Focus on the last argument editor editor on the declaration block.
* @private
*/
Blockly.PXTBlockly.FunctionUtils.focusLastEditor_ = function () {
  // TODO GUJEN fix this
  if (this.inputList.length > 0) {
    var newInput = this.inputList[this.inputList.length - 1];
    if (newInput.type == Blockly.DUMMY_INPUT) {
      newInput.fieldRow[0].showEditor_();
    } else if (newInput.type == Blockly.INPUT_VALUE) {
      // Inspect the argument editor.
      var target = newInput.connection.targetBlock();
      target.getField('TEXT').showEditor_();
    }
  }
};

/**
 * Common logic to add an argument to the function declaration.
 * @param {string} typeName The custom type of the param, as would be emitted
 *  to Typescript.
 * @param {string} defaultName the default name of the parameter.
 * @private
 */
Blockly.PXTBlockly.FunctionUtils.addParam_ = function (typeName, defaultName) {
  Blockly.WidgetDiv.hide(true);
  var argName = Blockly.Functions.findUniqueParamName(defaultName, this.arguments_.map(a => a.name));
  this.arguments_.push({
    id: Blockly.utils.genUid(),
    name: argName,
    type: typeName
  });
  this.updateDisplay_();
  this.focusLastEditor_();
}

/**
 * Externally-visible function to add a boolean argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addBooleanExternal = function () {
  this.addParam_('boolean', Blockly.Msg.DEFAULT_BOOLEAN_ARG_NAME);
};

/**
 * Externally-visible function to add a string argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addStringExternal = function () {
  this.addParam_('string', Blockly.Msg.DEFAULT_STRING_ARG_NAME);
};

/**
 * Externally-visible function to add a number argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addNumberExternal = function () {
  this.addParam_('number', Blockly.Msg.DEFAULT_NUMBER_ARG_NAME);
};

/**
 * Externally-visible function to add a custom argument to the function
 * declaration.
 * @param {string} typeName The custom type of the param, as would be emitted
 *  to Typescript.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addCustomExternal = function (typeName) {
  this.addParam_(typeName, Blockly.Msg.DEFAULT_CUSTOM_ARG_NAME);
};

/**
 * Callback to remove a field, only for the declaration block.
 * @param {Blockly.Field} field The field being removed.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.removeFieldCallback = function (field) {
  // TODO GUJEN complete this
  // Do not delete if there is only one input
  if (this.inputList.length === 1) {
    // TODO GUJEN update check to account for the title, the name and the stack
    return;
  }
  var inputNameToRemove = null;
  for (var n = 0; n < this.inputList.length; n++) {
    var input = this.inputList[n];
    if (input.connection) {
      var target = input.connection.targetBlock();
      if (target.getField(field.name) == field) {
        inputNameToRemove = input.name;
      }
    } else {
      for (var j = 0; j < input.fieldRow.length; j++) {
        if (input.fieldRow[j] == field) {
          inputNameToRemove = input.name;
        }
      }
    }
  }
  if (inputNameToRemove) {
    Blockly.WidgetDiv.hide(true);
    this.removeInput(inputNameToRemove);
    this.onChangeFn();
    this.updateDisplay_();
  }
};

/**
 * Callback to pass removeField up to the declaration block from arguments.
 * @param {Blockly.Field} field The field being removed.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_ = function (field) {
  // TODO GUJEN complete this
  if (this.parentBlock_ && this.parentBlock_.removeFieldCallback) {
    this.parentBlock_.removeFieldCallback(field);
  }
};

Blockly.Blocks['function_declaration'] = {
  /**
   * The preview block in the function editor dialog.
   * @this Blockly.Block
   */
  init: function () {
    /* Data known about the function. */
    this.name_ = ""; // The name of the function
    this.arguments_ = []; // The argument objects

    this.createAllInputs_();
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  removeAllInputs_: Blockly.PXTBlockly.FunctionUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDeclaration_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelEditor_,

  // Only exists on function_declaration.
  createArgumentEditor_: Blockly.PXTBlockly.FunctionUtils.createArgumentEditor_,
  focusLastEditor_: Blockly.PXTBlockly.FunctionUtils.focusLastEditor_,
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeFieldCallback,
  addParam_: Blockly.PXTBlockly.FunctionUtils.addParam_,
  addBooleanExternal: Blockly.PXTBlockly.FunctionUtils.addBooleanExternal,
  addStringExternal: Blockly.PXTBlockly.FunctionUtils.addStringExternal,
  addNumberExternal: Blockly.PXTBlockly.FunctionUtils.addNumberExternal,
  addCustomExternal: Blockly.PXTBlockly.FunctionUtils.addCustomExternal,
  onChangeFn: Blockly.PXTBlockly.FunctionUtils.updateDeclarationMutation_
};

Blockly.Blocks['function_definition'] = {
  /**
   * Block for defining a function with no return value.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      "extensions": ["function_contextmenu_edit"]
    });

    /* Data known about the function. */
    this.name_ = ""; // The name of the function
    this.arguments_ = []; // The argument objects

    this.createAllInputs_();
    if ((this.workspace.options.comments ||
      (this.workspace.options.parentWorkspace &&
        this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT) {
      this.setCommentText(Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT);
    }
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  removeAllInputs_: Blockly.PXTBlockly.FunctionUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDefinition_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelField_,

  // Only exists on function_definition.
  createArgumentReporter_: Blockly.PXTBlockly.FunctionUtils.createArgumentReporter_
};

Blockly.Blocks['function_call'] = {
  /**
   * Block for calling a function with no return value.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      "extensions": ["function_contextmenu_edit"]
    });
    /* Data known about the function. */
    this.name_ = ""; // The name of the function
    this.arguments_ = []; // The argument objects

    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    // Tooltip is set in renameProcedure.
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL); // TODO GUJEN ensure tooltip is set
  },
  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  removeAllInputs_: Blockly.PXTBlockly.FunctionUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnCaller_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelField_,

  // Only exists on function_call.
  attachShadow_: Blockly.PXTBlockly.FunctionUtils.attachShadow_,
  buildShadowDom_: Blockly.PXTBlockly.FunctionUtils.buildShadowDom_
};

Blockly.Blocks['argument_editor_boolean'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "bool"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_boolean"]
    });
  },
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_string'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "text"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_string"]
    });
  },
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_number'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "num"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_number"]
    });
  },
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_custom'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "foo"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_string"]
    });
  },
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};