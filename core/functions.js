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
 * @property {string} id The blockly ID of the param
 * @property {string} name the name of the param
 * @property {string} type the type of the param (string, number, boolean or a custom type)
 */

/**
 * @name Blockly.Functions
 * @namespace
 **/
goog.provide('Blockly.Functions');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');

/**
 * Constant to separate function names from variables and generated functions
 * when running generators.
 * @deprecated Use Blockly.PROCEDURE_CATEGORY_NAME
 */
Blockly.Functions.NAME_TYPE = Blockly.PROCEDURE_CATEGORY_NAME;

/**
 * Map of custom function argument types to the shadow block type to use for
 * function calls using this argument type. To be overriden by the consumer.
 */
Blockly.Functions.ArgumentShadowTypes = {};

/**
 * Construct the blocks required by the flyout for the functions category.
 * @param {!Blockly.Workspace} workspace The workspace containing functions.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Functions.flyoutCategory = function (workspace) {
  var xmlList = [];

  Blockly.Functions.addCreateButton_(workspace, xmlList);

  function populateFunctions(functionList, templateName) {
    for (var i = 0; i < functionList.length; i++) {
      var name = functionList[i].getName();
      var args = functionList[i].getArguments();
      // <block type="function_call" x="25" y="25">
      //   <mutation name="myFunc">
      //     <arg name="bool" type="boolean" id="..."></arg>
      //     <arg name="text" type="string" id="..."></arg>
      //     <arg name="num" type="number" id="..."></arg>
      //   </mutation>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', templateName);
      block.setAttribute('gap', 16);
      var mutation = goog.dom.createDom('mutation');
      mutation.setAttribute('name', name);
      block.appendChild(mutation);
      for (var j = 0; j < args.length; j++) {
        var arg = goog.dom.createDom('arg');
        arg.setAttribute('name', args[j].name);
        arg.setAttribute('type', args[j].type);
        arg.setAttribute('id', args[j].id);
        mutation.appendChild(arg);
      }
      xmlList.push(block);
    }
  }

  var existingFunctions = Blockly.Functions.getAllFunctionDefinitionBlocks(workspace);
  populateFunctions(existingFunctions, 'function_call');
  return xmlList;
};

/**
 * Create the "Make a Block..." button.
 * @param {!Blockly.Workspace} workspace The workspace contianing procedures.
 * @param {!Array.<!Element>} xmlList Array of XML block elements to add to.
 * @private
 */
Blockly.Functions.addCreateButton_ = function (workspace, xmlList) {
  var button = goog.dom.createDom('button');
  var msg = Blockly.Msg.FUNCTION_CREATE_NEW;
  var callbackKey = 'CREATE_FUNCTION';
  var callback = function () {
    Blockly.Functions.createFunctionCallback_(workspace);
  };
  button.setAttribute('text', msg);
  button.setAttribute('callbackKey', callbackKey);
  workspace.registerButtonCallback(callbackKey, callback);
  xmlList.push(button);
};

/**
 * Find all the callers of a named function.
 * @param {string} name Name of function.
 * @param {!Blockly.Workspace} workspace The workspace to find callers in.
 * @return {!Array.<!Blockly.Block>} Array of caller blocks.
 */
Blockly.Functions.getCallers = function (name, workspace) {
  var callers = [];
  var blocks = workspace.getAllBlocks();
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getName) {
      var funcName = blocks[i].getName();
      // Function name may be null if the block is only half-built.
      if (funcName && Blockly.Names.equals(funcName, name)) {
        callers.push(blocks[i]);
      }
    }
  }
  return callers;
};

/**
 * Find the definition block for the named function.
 * @param {string} name Name of function.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {Blockly.Block} The function definition block, or null if not found.
 */
Blockly.Functions.getDefinition = function (name, workspace) {
  // Assume that a function definition is a top block.
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type === Blockly.FUNCTION_DEFINITION_BLOCK_TYPE && blocks[i].getName) {
      var funcName = blocks[i].getName();
      // Function name may be null if the block is only half-built.
      if (funcName && Blockly.Names.equals(funcName, name)) {
        return blocks[i];
      }
    }
  }
  return null;
};

/**
 * Find all user-created function definitions in a workspace.
 * @param {!Blockly.Workspace} root Root workspace.
 * @return {!Array.<Blockly.Block>} An array of function definition blocks.
 */
Blockly.Functions.getAllFunctionDefinitionBlocks = function (root) {
  // Assume that a function definition is a top block.
  var blocks = root.getTopBlocks(false);
  var allFunctions = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type === Blockly.FUNCTION_DEFINITION_BLOCK_TYPE) {
      allFunctions.push(blocks[i]);
    }
  }
  return allFunctions;
};

/**
 * Determines whether the specified type is custom or a built-in literal.
 * @param {string} argumentType The argument type to check,
 * @return {boolean} Whether the argument type is a custom type. A return value
 *  of false means the argument is a built-in literal.
 */
Blockly.Functions.isCustomType = function (argumentType) {
  return !(argumentType === 'boolean' ||
    argumentType === 'string' ||
    argumentType === 'number');
}

/**
 * Create a mutation for a brand new function.
 * @return {Element} The mutation for a new function.
 * @package
 */
Blockly.Functions.newFunctionMutation = function () {
  // <block type="function_definition">
  //   <mutation name="myFunc"></mutation>
  // </block>
  var mutationText =
    '<xml>' +
    '<mutation name="' + Blockly.Msg.FUNCTIONS_DEFAULT_FUNCTION_NAME + '"></mutation>' +
    '</xml>';
  var mutation = Blockly.Xml.textToDom(mutationText).firstChild;
  mutation.removeAttribute('xmlns');
  return mutation;
};

/**
 * Returns a unique parameter name based on the given name (using a numbered
 * suffix).
 * @param {string} name Initial name.
 * @param {string[]} paramNames Existing parameter names.
 * @return {string} The unique parameter name. If the name was already unique,
 *  the original name is returned.
 */
Blockly.Functions.findUniqueParamName = function (name, paramNames) {
  while (!Blockly.Functions.isUniqueParamName(name, paramNames)) {
    // Collision with another parameter name.
    var r = name.match(/^(.*?)(\d+)$/);
    if (!r) {
      name += '2';
    } else {
      name = r[1] + (parseInt(r[2], 10) + 1);
    }
  }
  return name;
}

/**
 * Determines whether the given parameter name is unique among the given
 * parameter names.
 * @param {string} name Initial name.
 * @param {string[]} params Existing parameter names.
 * @return {boolean} Whether the name is unique.
 */
Blockly.Functions.isUniqueParamName = function (name, paramNames) {
  if (!paramNames) return true;
  return paramNames.indexOf(name) === -1;
}

/**
 * Callback to create a new function.
 * @param {!Blockly.Workspace} workspace The workspace to create the new function on.
 * @private
 */
Blockly.Functions.createFunctionCallback_ = function (workspace) {
  Blockly.Functions.externalFunctionCallback(
    Blockly.Functions.newFunctionMutation(),
    Blockly.Functions.createFunctionCallbackFactory_(workspace)
  );
};

/**
 * Callback factory for adding a new custom function from a mutation.
 * @param {!Blockly.Workspace} workspace The workspace to create the new function on.
 * @return {function(?Element)} callback for creating the new custom function.
 * @private
 */
Blockly.Functions.createFunctionCallbackFactory_ = function (workspace) {
  return function (mutation) {
    if (mutation) {
      var blockText =
        '<xml>' +
        '<block type="' + Blockly.FUNCTION_DEFINITION_BLOCK_TYPE + '">' +
        Blockly.Xml.domToText(mutation) +
        '</block>' +
        '</xml>';
      var blockDom = Blockly.Xml.textToDom(blockText);
      Blockly.Events.setGroup(true);
      var block = Blockly.Xml.domToBlock(blockDom.firstChild, workspace);
      var scale = workspace.scale; // To convert from pixel units to workspace units
      // Position the block so that it is at the top left of the visible workspace,
      // padded from the edge by 30 units. Position in the top right if RTL.
      var posX = -workspace.scrollX;
      if (workspace.RTL) {
        posX += workspace.getMetrics().contentWidth - 30;
      } else {
        posX += 30;
      }
      block.moveBy(posX / scale, (-workspace.scrollY + 30) / scale);
      block.scheduleSnapAndBump();
      Blockly.Events.setGroup(false);
    }
  };
};

/**
 * Callback for editing custom functions.
 * @param {!Blockly.Block} block The block that was right-clicked.
 * @private
 */
Blockly.Functions.editFunctionCallback_ = function (block) {
  // Edit can come from either the function definition or a function call.
  // Normalize by setting the block to the definition block for the function.
  if (block.type == Blockly.Functions_CALL_BLOCK_TYPE) {
    // This is a call block, find the definition block corresponding to the
    // name. Make sure to search the correct workspace, call block can be in flyout.
    var workspaceToSearch = block.workspace.isFlyout ? block.workspace.targetWorkspace : block.workspace;
    block = Blockly.Functions.getDefinition(block.getName(), workspaceToSearch);
  }
  // "block" now refers to the function definition block, it is safe to proceed.
  Blockly.Functions.externalFunctionCallback(
    block.mutationToDom(),
    Blockly.Functions.editFunctionCallbackFactory_(block)
  );
};

/**
 * Callback factory for editing an existing custom function.
 * @param {!Blockly.Block} block The function prototype block being edited.
 * @return {function(?Element)} Callback for editing the custom function.
 * @private
 */
Blockly.Functions.editFunctionCallbackFactory_ = function (block) {
  return function (mutation) {
    if (mutation) {
      Blockly.Functions.mutateCallersAndDefinition(block.getName(), block.workspace, mutation);
    }
  };
};

/**
 * Callback to create a new function custom command block.
 * @public
 */
Blockly.Functions.externalFunctionCallback = function (/** mutator, callback */) {
  console.warn('External function editor must be overriden: Blockly.Functions.externalFunctionCallback');
};

/**
 * Make a context menu option for editing a custom function.
 * This appears in the context menu for function definitions and function
 * calls.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.Functions.makeEditOption = function (block) {
  var editOption = {
    enabled: true,
    text: Blockly.Msg.FUNCTIONS_EDIT_OPTION,
    callback: function () {
      Blockly.Functions.editFunctionCallback_(block);
    }
  };
  return editOption;
};

/**
 * Find and edit all callers and the definition of a function using a new
 * mutation.
 * @param {string} name Name of function.
 * @param {!Blockly.Workspace} ws The workspace to find callers in.
 * @param {!Element} mutation New mutation for the callers.
 * @package
 */
Blockly.Functions.mutateCallersAndDefinition = function (name, ws, mutation) {
  var definitionBlock = Blockly.Functions.getDefinition(name, ws);
  if (definitionBlock) {
    var callers = Blockly.Functions.getCallers(name, definitionBlock.workspace);
    callers.push(definitionBlock);
    Blockly.Events.setGroup(true);
    callers.forEach(caller => {
      var oldMutationDom = caller.mutationToDom();
      var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
      caller.domToMutation(mutation);
      var newMutationDom = caller.mutationToDom();
      var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
      if (oldMutation != newMutation) {
        Blockly.Events.fire(new Blockly.Events.BlockChange(
          caller, 'mutation', null, oldMutation, newMutation));
      }
      // Bump any blocks that were connected to deleted arguments on callers.
      setTimeout(function () {
        caller.bumpNeighbours_();
      }, Blockly.BUMP_DELAY);
    });
    Blockly.Events.setGroup(false);
  } else {
    console.warn('Attempted to change function ' + name + ', but no definition block was found on the workspace');
  }
};

/**
 * Whether a block is a function argument reporter.
 * @param {!Blockly.BlockSvg} block The block that should be used to make this
 *     decision.
 * @return {boolean} True if the block is a function argument reporter.
 */
Blockly.Functions.isShadowArgumentReporter = function (block) {
  return block.type === 'argument_reporter_boolean' ||
    block.type === 'argument_reporter_number' ||
    block.type === 'argument_reporter_string' ||
    block.type === 'argument_reporter_custom';
};