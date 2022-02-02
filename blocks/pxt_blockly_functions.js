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
 */
'use strict';
goog.provide('Blockly.PXTBlockly.FunctionUtils');

Blockly.PXTBlockly.FunctionUtils = {};

/**
 * Type to represent a function parameter
 * @typedef {Object} FunctionParameter
 * @property {string} id The blockly ID of the param
 * @property {string} name the name of the param
 * @property {string} type the type of the param (string, number, boolean or a custom type)
 */

/**
 * An object mapping function argument type names to an icon for the function editor dialog. The
 * icons must be a SemanticUI icon class name, such as "copy outline", "play", etc.
 */
Blockly.PXTBlockly.FunctionUtils.argumentIcons = {};

/**
 * An object mapping function argument type names to a default name to use in the function
 * signature.
 */
Blockly.PXTBlockly.FunctionUtils.argumentDefaultNames = {};

/**
 * Returns the SemanticUI icon to use as the type icon for the specified argument type.
 * @param {string} typeName The argument type
 * @return {string} The SemanticUI css className for the icon
 */
Blockly.PXTBlockly.FunctionUtils.getArgumentIcon = function(typeName) {
  var icon = Blockly.PXTBlockly.FunctionUtils.argumentIcons &&
      Blockly.PXTBlockly.FunctionUtils.argumentIcons[typeName];
  return icon || undefined;
};

/**
 * Returns the name to use as the default argument name for the given type.
 * @param {string} typeName The argument type
 * @return {string} The default argument name.
 */
Blockly.PXTBlockly.FunctionUtils.getArgumentDefaultName = function(typeName) {
  var name = Blockly.PXTBlockly.FunctionUtils.argumentDefaultNames &&
      Blockly.PXTBlockly.FunctionUtils.argumentDefaultNames[typeName];
  return name || Blockly.Msg.FUNCTIONS_DEFAULT_CUSTOM_ARG_NAME;
};

/**
 * Create XML to represent the name and parameters of a function declaration,
 * definition or call block.
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.mutationToDom = function() {
  this.ensureIds_();
  var container = Blockly.utils.xml.createElement('mutation');
  container.setAttribute('name', this.name_);
  container.setAttribute('functionid', this.functionId_);
  this.arguments_.forEach(function(arg) {
    var argNode = Blockly.utils.xml.createElement('arg');
    argNode.setAttribute('name', arg.name);
    argNode.setAttribute('id', arg.id);
    argNode.setAttribute('type', arg.type);
    container.appendChild(argNode);
  });

  return container;
};

/**
 * Parse XML to restore the name and parameters of a function declaration,
 * definition or call block.
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.domToMutation = function(xmlElement) {
  var args = [];
  for (var i = 0; i < xmlElement.childNodes.length; ++i) {
    // During domToWorkspace, it's possible that the element has some whitespace text child nodes.
    // Ignore those.
    var c = xmlElement.childNodes[i];
    if (c.nodeName.toLowerCase() == 'arg') {
      args.push({
        id: c.getAttribute('id'),
        name: c.getAttribute('name'),
        type: c.getAttribute('type')
      });
    }
  };

  this.arguments_ = args;
  this.name_ = xmlElement.getAttribute('name');

  var functionId_ = xmlElement.getAttribute('functionid');
  var idsInUse = Blockly.Functions.idsInUse(this.workspace);
  if (idsInUse.indexOf(functionId_) < 0) this.functionId_ = functionId_;
  this.ensureIds_();

  var hw = this.getHeightWidth ? this.getHeightWidth() : null;
  if (this.type !== Blockly.FUNCTION_DEFINITION_BLOCK_TYPE || (hw && !hw.height && !hw.width)) {
    this.updateDisplay_();
  } else if (!this.getFieldValue('function_name') && this.name_) {
    // pxt-blockly handle old function case where name was stored in text_
    this.setFieldValue(this.name_, 'function_name');
  }
};

/**
 * Generates functionId_ and argument IDs if they don't exist on the definition, and update caller
 * IDs so they match the IDs on the definition.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.ensureIds_ = function() {
  switch (this.type) {
    case Blockly.FUNCTION_DEFINITION_BLOCK_TYPE:
      if (!this.functionId_ || this.functionId_ == 'null') {
        this.functionId_ = Blockly.utils.genUid();
      }
      for (var i = 0; i < this.arguments_.length; ++i) {
        if (!this.arguments_[i].id) {
          this.arguments_[i].id = Blockly.utils.genUid();
        }
      }
      break;
    case Blockly.FUNCTION_CALL_OUTPUT_BLOCK_TYPE:
    case Blockly.FUNCTION_CALL_BLOCK_TYPE:
      var def = Blockly.Functions.getDefinition(this.name_, this.workspace);
      if (def) {
        this.functionId_ = def.getFunctionId();
        var defArgs = def.getArguments();
        for (var i = 0; i < this.arguments_.length; ++i) {
          for (var j = 0; j < defArgs.length; ++j) {
            if (defArgs[j].name == this.arguments_[i].name) {
              this.arguments_[i].id = defArgs[j].id;
              break;
            }
          }
        }
      }
      break;
  }
};

/**
 * Returns the name of the function, or the empty string if it has not yet been
 * set.
 * @return {string} Function name.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.getName = function() {
  return this.name_;
};

/**
 * Returns the function ID of this function, or the empty string if it has not
 * yet been set. This is different from the block ID and is the same across all
 * function calls, definition and declaration for a given function.
 * @return {string} Function ID.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.getFunctionId = function() {
  return this.functionId_;
};

/**
 * Returns the list of arguments for this function.
 * @return {FunctionParameter[]} The arguments of this function.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.getArguments = function() {
  return this.arguments_;
};

/**
 * Add or remove the statement block from this function definition.
 * @param {boolean} hasStatements True if a statement block is needed.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.setStatements_ = function(hasStatements) {
  if (this.hasStatements_ === hasStatements) {
    return;
  }
  if (hasStatements) {
    this.appendStatementInput('STACK');
  } else {
    this.removeInput('STACK', true);
  }
  this.hasStatements_ = hasStatements;
};

/**
 * Update the block's structure and appearance to match the internally stored
 * mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.updateDisplay_ = function() {
  var wasRendered = this.rendered;
  this.rendered = false;

  var connectionMap = this.disconnectOldBlocks_();
  this.removeValueInputs_();

  this.createAllInputs_(connectionMap);
  this.deleteShadows_(connectionMap);

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker() && this.initSvg) {
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
Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_ = function() {
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
      input.connection.setShadowDom(null, true);
      if (input.connection.targetConnection) {
        input.connection.disconnect();
      }
    }
  }
  return connectionMap;
};

/**
 * Removes all value inputs on the block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.removeValueInputs_ = function() {
  // Delete inputs directly instead of with block.removeInput to avoid splicing
  // out of the input list at every index.
  var newInputList = [];
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.type == Blockly.INPUT_VALUE) {
      input.dispose();
    } else {
      newInputList.push(input);
    }
  }
  this.inputList = newInputList;
};

/**
 * Create all inputs specified by the mutation args, and populate them with
 * shadow blocks or reconnected old blocks as appropriate.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createAllInputs_ = function(connectionMap) {
  var hasTitle = false;
  var hasName = false;
  var hasCollapseIcon = false;
  this.inputList.forEach(function(i) {
    if (i.name == 'function_title') {
      hasTitle = true;
    } else if (i.name == 'function_name') {
      hasName = true;
    } else if (i.name == 'function_collapse') {
      hasCollapseIcon = true;
    }
  });

  // Create the main label if it doesn't exist.
  if (!hasTitle) {
    var labelText = '';
    switch (this.type) {
      case Blockly.FUNCTION_CALL_OUTPUT_BLOCK_TYPE:
      case Blockly.FUNCTION_CALL_BLOCK_TYPE:
        labelText = Blockly.Msg.FUNCTIONS_CALL_TITLE;
        break;
      case Blockly.FUNCTION_DEFINITION_BLOCK_TYPE:
      case Blockly.FUNCTION_DECLARATION_BLOCK_TYPE:
        labelText = Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE;
    }
    this.appendDummyInput('function_title').appendField(labelText, 'function_title');
  }

  // Create or update the function name (overridden by the block type).
  if (hasName) {
    this.updateFunctionLabel_(this.getName());
  } else {
    this.addFunctionLabel_(this.getName());
  }

  // Create arguments.
  var self = this;
  this.arguments_.forEach(function(arg) {
    // For custom types, the parameter type is appended to the UUID in the
    // input name. This is needed to retrieve the function signature from the
    // block inputs when the declaration block is modified.
    var input = self.appendValueInput(arg.id);
    if (Blockly.Functions.isCustomType(arg.type)) {
      input.setCheck(arg.type);
    } else {
      input.setCheck(arg.type.charAt(0).toUpperCase() + arg.type.slice(1));
    }
    if (!self.isInsertionMarker()) {
      self.populateArgument_(arg, connectionMap, input);
    }
  });

  // If collapse button present, move after arguments
  if (hasCollapseIcon) {
    this.moveInputBefore('function_collapse', null);
  }

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
Blockly.PXTBlockly.FunctionUtils.deleteShadows_ = function(connectionMap) {
  // Get rid of all of the old shadow blocks if they aren't connected.
  if (connectionMap) {
    for (var id in connectionMap) {
      var saveInfo = connectionMap[id];
      if (saveInfo) {
        var block = saveInfo['block'];
        if (block && block.isShadow()) {
          block.dispose();
          delete connectionMap[id];
        }
      }
    }
  }
};

/**
 * Updates the text of the text input for the function's name.
 * @param {string} text The new text to set.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.updateLabelEditor_ = function(text) {
  Blockly.Events.disable();
  this.getField('function_name').setValue(text);
  Blockly.Events.enable();
}

Blockly.PXTBlockly.FunctionUtils.updateLabelField_ = function(text) {
  this.getField('function_name').setValue(text);
}

/**
 * Add a label editor with the given text to a function_declaration
 * block. Editing the text in the label editor updates the text of the
 * corresponding label fields on function calls.
 * @param {string} text The label text.
 * @private
 */
Blockly.PXTBlockly.FunctionUtils.addLabelEditor_ = function(text) {
  var nameField;
  if (this.type === Blockly.FUNCTION_DEFINITION_BLOCK_TYPE) {
    var nameField = new Blockly.FieldTextInput(text || '', Blockly.Functions.rename);
  } else {
    var nameField = new Blockly.FieldTextInput(text || '');
  }
  nameField.setSpellcheck(false);
  nameField.setAutoCapitalize(false);
  this.appendDummyInput('function_name').appendField(nameField, 'function_name')
};

/**
 * Add a label field with the given text to a function call or definition
 * block.
 * @param {string} text The label text.
 * @private
 */
Blockly.PXTBlockly.FunctionUtils.addLabelField_ = function(text) {
  this.appendDummyInput('function_name').appendField(new Blockly.FieldLabel(text, 'functionNameText'), 'function_name');
};

/**
 * Returns the block type, the field name and the field value of the shadow
 * block to use for the given argument type.
 * @param {string} argumentType The type of the argument.
 * @param {Blockly.Workspace} ws The workspace of the function call block.
 * @return {!Array<string>} An array of block type, field name and field value.
 */
Blockly.PXTBlockly.FunctionUtils.getShadowBlockInfoFromType_ = function(argumentType, ws) {
  var shadowType = '';
  var fieldName = '';
  var fieldValue = '';
  switch (argumentType) {
    case 'boolean':
      shadowType = 'logic_boolean';
      fieldName = 'BOOL';
      fieldValue = 'TRUE';
      break;
    case 'number':
      shadowType = 'math_number';
      fieldName = 'NUM';
      fieldValue = '1';
      break;
    case 'string':
      shadowType = 'text';
      fieldName = 'TEXT';
      fieldValue = 'abc';
      break;
    case 'Array':
      shadowType = 'variables_get';
      fieldName = "VAR";
      fieldValue = Blockly.Variables.getOrCreateVariablePackage(ws, null, "list", '').getId();
      break;
    default:
      // This is probably a custom type. Use a variable as the shadow.
      shadowType = 'variables_get';
      fieldName = 'VAR';
      fieldValue = Blockly.Variables.getOrCreateVariablePackage(ws, null,
          Blockly.PXTBlockly.FunctionUtils.getArgumentDefaultName(argumentType), '').getId();
  }
  return [shadowType, fieldName, fieldValue];
};

/**
 * Build a DOM node representing a shadow block of the given type.
 * @param {string} argumentType The type of the argument.
 * @return {!Element} The DOM node representing the new shadow block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.buildShadowDom_ = function(argumentType) {
  var shadowDom = Blockly.utils.xml.createElement('shadow');
  var shadowInfo = Blockly.PXTBlockly.FunctionUtils.getShadowBlockInfoFromType_(
      argumentType, this.workspace);
  var shadowType = shadowInfo[0];
  var fieldName = shadowInfo[1];
  var fieldValue = shadowInfo[2];
  var isVarGet = shadowType === "variables_get";
  shadowDom.setAttribute('type', shadowType);
  var fieldDom = goog.dom.createDom('field', null, fieldValue);
  if (isVarGet) {
    fieldDom.setAttribute("id", fieldValue);
    var varModel = this.workspace.getVariableById(fieldValue);
    fieldDom.textContent = varModel ? varModel.name : "";
  }
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
Blockly.PXTBlockly.FunctionUtils.attachShadow_ = function(input, argumentType) {
  var shadowInfo = Blockly.PXTBlockly.FunctionUtils.getShadowBlockInfoFromType_(
      argumentType, this.workspace);
  var shadowType = shadowInfo[0];
  var fieldName = shadowInfo[1];
  var fieldValue = shadowInfo[2];
  Blockly.Events.disable();
  var newBlock = null;
  try {
    newBlock = this.workspace.newBlock(shadowType);
    newBlock.setFieldValue(fieldValue, fieldName);
    newBlock.setShadow(true);
    if (!this.isInsertionMarker() && newBlock.initSvg) {
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
 * @param {FunctionParameter} arg The argument we are building this reporter
 *  for.
 * @return {!Blockly.BlockSvg} The newly created argument reporter block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createArgumentReporter_ = function(arg) {
  var blockType = '';
  switch (arg.type) {
    case 'boolean':
      blockType = 'argument_reporter_boolean';
      break;
    case 'number':
      blockType = 'argument_reporter_number';
      break;
    case 'string':
      blockType = 'argument_reporter_string';
      break;
    case 'Array':
      blockType = 'argument_reporter_array'
      break;
    default:
      blockType = 'argument_reporter_custom';
  }
  Blockly.Events.disable();
  try {
    var newBlock;
    if (blockType == 'argument_reporter_custom') {
      newBlock = Blockly.PXTBlockly.FunctionUtils.createCustomArgumentReporter(
          arg.type, this.workspace);
    } else {
      newBlock = this.workspace.newBlock(blockType);
    }
    newBlock.setShadow(true);
    newBlock.setFieldValue(arg.name, 'VALUE');
    if (!this.isInsertionMarker() && newBlock.initSvg) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  } finally {
    Blockly.Events.enable();
  }
  return newBlock;
};


/**
 * Create the icon for collapsing the function block
 * @return {!Blockly.BlockSvg} The newly created argument reporter block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createCollapseIcon_ = function() {
  var self = this;
  if (self.workspace && self.workspace.getRenderer) {
    var image = self.workspace.getRenderer().getConstants().COLLAPSE_IMAGE_DATAURI;
    if (image) {
      self.appendDummyInput('function_collapse')
        .appendField(new Blockly.FieldImage(image, 24, 24, "", function() {
          self.setCollapsed(true)
        }, false))
    }
  }
}

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
Blockly.PXTBlockly.FunctionUtils.populateArgumentOnCaller_ = function(arg, connectionMap, input) {
  var oldBlock = null;
  var oldShadow = null;
  if (connectionMap && (arg.id in connectionMap)) {
    var saveInfo = connectionMap[arg.id];
    oldBlock = saveInfo['block'];
    oldShadow = saveInfo['shadow'];
  }

  if (connectionMap && oldBlock && oldBlock.outputConnection.canConnectWithReason(input.connection) === Blockly.Connection.CAN_CONNECT) {
    // Reattach the old block and shadow DOM.
    connectionMap[input.name] = null;
    oldBlock.outputConnection.connect(input.connection);
    if (oldBlock.isShadow()) {
      input.connection.setShadowDom(Blockly.Xml.blockToDom(oldBlock));
    } else {
      var shadowDom = oldShadow || this.buildShadowDom_(arg.type);
      input.connection.setShadowDom(shadowDom);
    }
  } else {
    this.attachShadow_(input, arg.type);
    if (oldBlock && oldBlock.isShadow_) oldBlock.setShadow(false);
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
Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDefinition_ = function(
    arg, connectionMap, input) {
  var oldBlock = null;
  if (connectionMap && (arg.id in connectionMap)) {
    var saveInfo = connectionMap[arg.id];
    oldBlock = saveInfo['block'];
  }

  // Decide which block to attach.
  if (connectionMap && oldBlock) {
    // Update the text if needed. The old argument reporter is the same type,
    // and on the same input, but the argument's display name may have changed.
    var argumentReporter = oldBlock;
    argumentReporter.setFieldValue(arg.name, 'VALUE');
    connectionMap[input.name] = null;
  } else {
    var argumentReporter = this.createArgumentReporter_(arg);
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
Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDeclaration_ = function(
    arg, connectionMap, input) {
  var argumentEditor = this.createArgumentEditor_(arg.type, arg.name);
  // Attach the block.
  input.connection.connect(argumentEditor.outputConnection);
};

/**
 * Create an argument editor.
 * An argument editor is a shadow block with a single text field, which is used
 * to set the display name of the argument.
 * @param {string} argumentType The type of this argument.
 * @param {string} displayName The display name of this argument, which is the
 *     text of the field on the shadow block.
 * @return {!Blockly.BlockSvg} The newly created argument editor block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createArgumentEditor_ = function(argumentType, displayName) {
  Blockly.Events.disable();
  var newBlock;

  try {
    var blockType = '';
    switch (argumentType) {
      case 'boolean':
        blockType = 'argument_editor_boolean';
        break;
      case 'number':
        blockType = 'argument_editor_number';
        break;
      case 'string':
        blockType = 'argument_editor_string';
        break;
      case 'Array':
        blockType = 'argument_editor_array';
        break;
      default:
        blockType = 'argument_editor_custom';
    }
    if (blockType == 'argument_editor_custom') {
      newBlock = Blockly.PXTBlockly.FunctionUtils.createCustomArgumentEditor(
          argumentType, this.workspace);
    } else {
      newBlock = this.workspace.newBlock(blockType);
    }
    newBlock.setFieldValue(displayName, 'TEXT');
    newBlock.setShadow(true);
    if (!this.isInsertionMarker() && newBlock.initSvg) {
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
Blockly.PXTBlockly.FunctionUtils.updateDeclarationMutation_ = function() {
  this.arguments_ = [];

  // Start iterating at 1 to skip the function label
  for (var i = 1; i < this.inputList.length; i++) {
    var input = this.inputList[i];
    switch (input.type) {
      case Blockly.NEXT_STATEMENT:
        // Nothing to save
        break;
      case Blockly.DUMMY_INPUT:
        // This is the function name text input. Previously stored in the text
        // attribute (now deprecated), so we check both text and value
        this.name_ = input.fieldRow[0].getValue() || input.fieldRow[0].getText();
        break;
      case Blockly.INPUT_VALUE:
        // Inspect the argument editor to add the argument to our mutation.
        var target = input.connection.targetBlock();
        this.arguments_.push({
          id: input.name,
          name: target.getFieldValue('TEXT'),
          type: target.getTypeName()
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
Blockly.PXTBlockly.FunctionUtils.focusLastEditor_ = function() {
  if (this.inputList.length > 0) {
    var newInput = this.inputList[this.inputList.length - 2];
    if (newInput.type == Blockly.DUMMY_INPUT) {
      this.workspace.centerOnBlock(this.id);
      newInput.fieldRow[0].showEditor_();
    } else if (newInput.type == Blockly.INPUT_VALUE) {
      // Inspect the argument editor.
      var target = newInput.connection.targetBlock();
      target.workspace.centerOnBlock(target.id);
      target.getField('TEXT').showEditor_();
    }
  }
};

/**
 * Common logic to add an argument to the function declaration.
 * @param {string} typeName The type of the param, as would be emitted to
 *  Typescript.
 * @param {string} defaultName the default name of the parameter.
 * @private
 */
Blockly.PXTBlockly.FunctionUtils.addParam_ = function(typeName, defaultName) {
  Blockly.WidgetDiv.hide(true);
  var argName = Blockly.Functions.findUniqueParamName(defaultName,
      this.arguments_.map(function(a) { return a.name; }));
  this.arguments_.push({
    id: Blockly.utils.genUid(),
    name: argName,
    type: typeName
  });
  this.updateDisplay_();
  this.focusLastEditor_();
};

/**
 * Externally-visible function to add a boolean argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addBooleanExternal = function() {
  this.addParam_('boolean', Blockly.Msg.FUNCTIONS_DEFAULT_BOOLEAN_ARG_NAME);
};

/**
 * Externally-visible function to add a string argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addStringExternal = function() {
  this.addParam_('string', Blockly.Msg.FUNCTIONS_DEFAULT_STRING_ARG_NAME);
};

/**
 * Externally-visible function to add a number argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addNumberExternal = function() {
  this.addParam_('number', Blockly.Msg.FUNCTIONS_DEFAULT_NUMBER_ARG_NAME);
};

/**
 * Externally-visible function to add an array argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addArrayExternal = function() {
  this.addParam_('Array', Blockly.Msg.FUNCTIONS_DEFAULT_ARRAY_ARG_NAME);
}

/**
 * Externally-visible function to add a custom argument to the function
 * declaration.
 * @param {string} typeName The custom type of the param, as would be emitted
 *  to Typescript.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addCustomExternal = function(typeName) {
  this.addParam_(typeName, Blockly.PXTBlockly.FunctionUtils.getArgumentDefaultName(typeName));
};

/**
 * Callback to remove a field, only for the declaration block.
 * @param {Blockly.Field} field The field being removed.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.removeFieldCallback = function(field) {
  var inputNameToRemove = null;
  for (var n = 0; n < this.inputList.length; n++) {
    if (inputNameToRemove) {
      break;
    }
    var input = this.inputList[n];
    if (input.connection) {
      var target = input.connection.targetBlock();
      if (!target) {
        continue;
      }
      if (target.getField(field.name) === field) {
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
    this.updateFunctionSignature();
    this.updateDisplay_();
  }
};

/**
 * Callback to pass removeField up to the declaration block from arguments.
 * @param {Blockly.Field} field The field being removed.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_ = function(field) {
  if (this.parentBlock_ && this.parentBlock_.removeFieldCallback) {
    this.parentBlock_.removeFieldCallback(field);
  }
};

/**
 * Function calls cannot exist without the corresponding function definition.
 * Enforce this link whenever an event is fired.
 * @param {!Blockly.Events.Abstract} event Change event.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.onCallerChange = function(event) {
  if (!this.workspace || this.workspace.isFlyout) {
    // Block is deleted or is in a flyout.
    return;
  }
  if (event.type == Blockly.Events.BLOCK_CREATE && event.ids.indexOf(this.id) != -1) {
    // Check whether there is a matching function definition for this caller.
    var name = this.getName();
    var def = Blockly.Functions.getDefinition(name, this.workspace);
    if (def) {
      // The function definition exists, ensure the signatures match.
      var defArgs = def.getArguments().slice();
      var thisArgs = this.arguments_.slice();
      if (JSON.stringify(thisArgs) !== JSON.stringify(defArgs)) {
        // The function signature has changed since this block was copied,
        // update it.
        Blockly.Functions.mutateCallersAndDefinition(
            def.getName(), this.workspace, def.mutationToDom());
      }
      // Propagate the functionId of the definition to the caller
      this.functionId_ = def.functionId_;
    } else {
      // There is no function definition for this function, create an empty one
      // that matches the signature of the caller.
      Blockly.Events.setGroup(event.group);
      var xml = Blockly.utils.xml.createElement('xml');
      var block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', Blockly.FUNCTION_DEFINITION_BLOCK_TYPE);
      var xy = this.getRelativeToSurfaceXY();
      var x = xy.x + Blockly.SNAP_RADIUS * (this.RTL ? -1 : 1);
      var y = xy.y + Blockly.SNAP_RADIUS * 2;
      block.setAttribute('x', x);
      block.setAttribute('y', y);
      var mutation = this.mutationToDom();
      block.appendChild(mutation);
      xml.appendChild(block);
      Blockly.Xml.domToWorkspace(xml, this.workspace);
      Blockly.Events.setGroup(false);
    }
  } else if (event.type == Blockly.Events.BLOCK_DELETE) {
    // If the deleted block was the function definition for this caller, delete
    // this caller.
    var name = this.getName();
    var def = Blockly.Functions.getDefinition(name, this.workspace);
    if (!def) {
      Blockly.Events.setGroup(event.group);
      this.dispose(true, false);
      Blockly.Events.setGroup(false);
    }
  }
};

Blockly.Blocks['function_declaration'] = {
  /**
   * The preview block in the function editor dialog.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "style": {
        "hat": "cap"
      }
    });

    /* Data known about the function. */
    this.name_ = ""; // The name of the function.
    this.arguments_ = []; // The arguments of this function.
    this.functionId_ = ""; // An ID, independent from the block ID, to track a function across its call, definition and declaration blocks.

    this.createAllInputs_();
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    this.setStatements_(true);
    this.setDeletable(false);
    this.setMovable(false);
    this.contextMenu = false;
    this.setInputsInline(true);
    this.statementConnection_ = null;
  },
  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  getFunctionId: Blockly.PXTBlockly.FunctionUtils.getFunctionId,
  getArguments: Blockly.PXTBlockly.FunctionUtils.getArguments,
  removeValueInputs_: Blockly.PXTBlockly.FunctionUtils.removeValueInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,
  ensureIds_: Blockly.PXTBlockly.FunctionUtils.ensureIds_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDeclaration_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelEditor_,
  updateFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.updateLabelEditor_,

  // Only exists on function_declaration.
  createArgumentEditor_: Blockly.PXTBlockly.FunctionUtils.createArgumentEditor_,
  focusLastEditor_: Blockly.PXTBlockly.FunctionUtils.focusLastEditor_,
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeFieldCallback,
  addParam_: Blockly.PXTBlockly.FunctionUtils.addParam_,
  addBooleanExternal: Blockly.PXTBlockly.FunctionUtils.addBooleanExternal,
  addStringExternal: Blockly.PXTBlockly.FunctionUtils.addStringExternal,
  addNumberExternal: Blockly.PXTBlockly.FunctionUtils.addNumberExternal,
  addArrayExternal: Blockly.PXTBlockly.FunctionUtils.addArrayExternal,
  addCustomExternal: Blockly.PXTBlockly.FunctionUtils.addCustomExternal,
  updateFunctionSignature: Blockly.PXTBlockly.FunctionUtils.updateDeclarationMutation_
};

Blockly.Blocks['function_definition'] = {
  /**
   * Block for defining a function with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "style": {
        "hat": "cap"
      }
    });

    /* Data known about the function. */
    this.name_ = ""; // The name of the function.
    this.arguments_ = []; // The arguments of this function.
    this.functionId_ = ""; // An ID, independent from the block ID, to track a function across its call, definition and declaration blocks.

    this.createAllInputs_();
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setStatements_(true);
    this.createCollapseIcon_();
    this.setInputsInline(true);
    this.statementConnection_ = null;
  },

  customContextMenu: function(menuOptions) {
    if (this.inDebugWorkspace()) return;
    menuOptions.push(Blockly.Functions.makeEditOption(this));
    menuOptions.push(Blockly.Functions.makeCreateCallOption(this));
  },

  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  getFunctionId: Blockly.PXTBlockly.FunctionUtils.getFunctionId,
  getArguments: Blockly.PXTBlockly.FunctionUtils.getArguments,
  removeValueInputs_: Blockly.PXTBlockly.FunctionUtils.removeValueInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,
  ensureIds_: Blockly.PXTBlockly.FunctionUtils.ensureIds_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDefinition_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelEditor_,
  updateFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.updateLabelEditor_,

  // Only exists on function_definition.
  createArgumentReporter_: Blockly.PXTBlockly.FunctionUtils.createArgumentReporter_,
  createCollapseIcon_: Blockly.PXTBlockly.FunctionUtils.createCollapseIcon_
};

Blockly.Blocks['function_call'] = {
  /**
   * Block for calling a function with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "extensions": ["function_contextmenu_edit"]
    });
    /* Data known about the function. */
    this.name_ = ""; // The name of the function.
    this.arguments_ = []; // The arguments of this function.
    this.functionId_ = ""; // An ID, independent from the block ID, to track a function across its call, definition and declaration blocks.

    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
    this.setTooltip(Blockly.Msg.FUNCTION_CALL_TOOLTIP);
    this.setInputsInline(true);
  },
  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  getFunctionId: Blockly.PXTBlockly.FunctionUtils.getFunctionId,
  getArguments: Blockly.PXTBlockly.FunctionUtils.getArguments,
  removeValueInputs_: Blockly.PXTBlockly.FunctionUtils.removeValueInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,
  ensureIds_: Blockly.PXTBlockly.FunctionUtils.ensureIds_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnCaller_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelField_,
  updateFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.updateLabelField_,

  // Only exists on function_call and function_call_output.
  attachShadow_: Blockly.PXTBlockly.FunctionUtils.attachShadow_,
  buildShadowDom_: Blockly.PXTBlockly.FunctionUtils.buildShadowDom_,
  onchange: Blockly.PXTBlockly.FunctionUtils.onCallerChange
};

Blockly.Blocks['function_call_output'] = {
  /**
   * Block for calling a function with a return value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "extensions": ["function_contextmenu_edit"]
    });
    /* Data known about the function. */
    this.name_ = ""; // The name of the function.
    this.arguments_ = []; // The arguments of this function.
    this.functionId_ = ""; // An ID, independent from the block ID, to track a function across its call, definition and declaration blocks.

    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setOutput(true, null);
    this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
    this.setTooltip(Blockly.Msg.FUNCTION_CALL_TOOLTIP);
    this.setInputsInline(true);
  },
  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  getFunctionId: Blockly.PXTBlockly.FunctionUtils.getFunctionId,
  getArguments: Blockly.PXTBlockly.FunctionUtils.getArguments,
  removeValueInputs_: Blockly.PXTBlockly.FunctionUtils.removeValueInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,
  ensureIds_: Blockly.PXTBlockly.FunctionUtils.ensureIds_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnCaller_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelField_,
  updateFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.updateLabelField_,

  // Only exists on function_call and function_call_output.
  attachShadow_: Blockly.PXTBlockly.FunctionUtils.attachShadow_,
  buildShadowDom_: Blockly.PXTBlockly.FunctionUtils.buildShadowDom_,
  onchange: Blockly.PXTBlockly.FunctionUtils.onCallerChange
};

// Argument editor and reporter helpers

/**
 * Returns the TypeScript type associated with this reporter or editor.
 * @return {string} This argument's type, as would be emitted to TypeScript.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.getTypeName = function() {
  return this.typeName_;
};

/**
 * Create XML to represent the type name of an argument editor or reporter.
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.argumentMutationToDom = function() {
  var container = Blockly.utils.xml.createElement('mutation');
  container.setAttribute('typename', this.typeName_);
  return container;
};

/**
 * Parse XML to restore the type name of an argument editor or reporter.
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.argumentDomToMutation = function(xmlElement) {
  this.typeName_ = xmlElement.getAttribute('typename');
  this.setOutput(true, this.typeName_);
};

/**
 * Creates a custom argument reporter or editor with the correct mutation for
 * the specified type name.
 * @param {string} blockType The block type, argument_editor_custom or
 *  argument_reporter_custom.
 * @param {string} typeName The TypeScript type of the argument.
 * @param {!Blockly.Workspace} ws The workspace to create the block in.
 * @return {!Blockly.block} The created block.
 */
Blockly.PXTBlockly.FunctionUtils.createCustomArgumentBlock = function(blockType, typeName, ws) {
  var blockText =
    '<xml>' +
    '<block type="' + blockType + '">' +
    '<mutation typename="' + typeName + '"></mutation>' +
    '</block>' +
    '</xml>';
  var blockDom = Blockly.Xml.textToDom(blockText);
  return Blockly.Xml.domToBlock(blockDom.firstChild, ws);
};

/**
 * Creates an argument_editor_custom block with the correct mutation for the
 * specified type name.
 * @param {string} typeName The TypeScript type of the argument.
 * @param {!Blockly.Workspace} ws The workspace to create the block in.
 * @return {!Blockly.block} The created block.
 */
Blockly.PXTBlockly.FunctionUtils.createCustomArgumentEditor = function(typeName, ws) {
  return Blockly.PXTBlockly.FunctionUtils.createCustomArgumentBlock('argument_editor_custom', typeName, ws);
};

/**
 * Creates an argument_reporter_custom block with the correct mutation for the
 * specified type name.
 * @param {string} typeName The TypeScript type of the argument.
 * @param {!Blockly.Workspace} ws The workspace to create the block in.
 * @return {!Blockly.block} The created block.
 */
Blockly.PXTBlockly.FunctionUtils.createCustomArgumentReporter = function(typeName, ws) {
  return Blockly.PXTBlockly.FunctionUtils.createCustomArgumentBlock(
      'argument_reporter_custom', typeName, ws);
};

// Argument editor blocks

Blockly.Blocks['argument_editor_boolean'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_argument_editor",
          "name": "TEXT",
          "text": "bool"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_boolean"]
    });
    this.typeName_ = 'boolean';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName,
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_string'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_argument_editor",
          "name": "TEXT",
          "text": "text"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_string"]
    });
    this.typeName_ = 'string';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName,
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_number'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_argument_editor",
          "name": "TEXT",
          "text": "num"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_number"]
    });
    this.typeName_ = 'number';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName,
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_array'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_argument_editor",
          "name": "TEXT",
          "text": "list"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_array"]
    });
    this.typeName_ = 'Array';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName,
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_custom'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_argument_editor",
          "name": "TEXT",
          "text": "arg"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
    this.typeName_ = 'any';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName,
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_,
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.argumentMutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.argumentDomToMutation
};

// Argument reporter blocks

Blockly.Blocks['argument_reporter_boolean'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.REPORTERS_HUE,
      "extensions": ["output_boolean"]
    });
    this.typeName_ = 'boolean';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName
};

Blockly.Blocks['argument_reporter_number'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.REPORTERS_HUE,
      "extensions": ["output_number"]
    });
    this.typeName_ = 'number';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName
};

Blockly.Blocks['argument_reporter_string'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.REPORTERS_HUE,
      "extensions": ["output_string"]
    });
    this.typeName_ = 'string';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName
};

Blockly.Blocks['argument_reporter_array'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.REPORTERS_HUE,
      "extensions": ["output_array"]
    });
    this.typeName_ = 'Array';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName
};

Blockly.Blocks['argument_reporter_custom'] = {
  init: function() {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.REPORTERS_HUE,
      "inputsInline": true,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "output": null
    });
    this.typeName_ = '';
  },
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName,
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.argumentMutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.argumentDomToMutation
};
