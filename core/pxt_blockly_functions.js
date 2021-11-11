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
goog.require('Blockly.pxtBlocklyUtils');
goog.require('Blockly.Workspace');

/**
 * Constant to separate function names from variables and generated functions
 * when running generators.
 * @deprecated Use Blockly.PROCEDURE_CATEGORY_NAME
 */
Blockly.Functions.NAME_TYPE = Blockly.PROCEDURE_CATEGORY_NAME;

/**
  * Construct the blocks required by the flyout for the functions category.
  * @param {!Blockly.Workspace} workspace The workspace containing functions.
  * @return {!Array.<!Element>} Array of XML block elements.
  */
Blockly.Functions.flyoutCategory = function(workspace) {
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
      var block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', templateName);
      block.setAttribute('gap', 16);
      var mutation = Blockly.utils.xml.createElement('mutation');
      mutation.setAttribute('name', name);
      block.appendChild(mutation);
      for (var j = 0; j < args.length; j++) {
        var arg = Blockly.utils.xml.createElement('arg');
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
Blockly.Functions.addCreateButton_ = function(workspace, xmlList) {
  var button = document.createElement('button');
  var msg = Blockly.Msg.FUNCTION_CREATE_NEW;
  var callbackKey = 'CREATE_FUNCTION';
  var callback = function() {
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
Blockly.Functions.getCallers = function(name, workspace) {
  var callers = [];
  var blocks = workspace.getAllBlocks();
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    // TODO: Ideally this should only check for function calls, but changing the if condition
    // causes a bug in mutateCallersAndDefinition() where arg reporters are deleted from the
    // function definition. The reason it works right now from what I've gathered is that the
    // function definition gets included twice in mutateCallersAndDefinition(): once from this call
    // (because it does not filter on function calls, so it also incldues the function definition),
    // and once from mutateCallersAndDefinition() that hardcodes adding the definition to the array
    // of blocks to mutate. So, the definition gets processed twice: the 1st time, the arg
    // reporters get deleted from the definition; but the second time, the mutationToDom() fixes
    // the deleted arg reporters and returns early (because the mutation hasn't changed between the
    // first pass and the 2nd pass). Uncommenting the below if() makes it so the definition is only
    // processed once, so the arg reporters are deleted and never fixed by the 2nd pass.
    if (blocks[i].type == Blockly.FUNCTION_CALL_BLOCK_TYPE || blocks[i].type === Blockly.FUNCTION_CALL_OUTPUT_BLOCK_TYPE) {
      if (blocks[i].getName) {
        var funcName = blocks[i].getName();
        if (funcName == name) {
          callers.push(blocks[i]);
        }
      }
    }
  }
  return callers;
};

/**
 * Find the definition block for the named function.
 * @param {string} name Name of function.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {!Blockly.Block} The function definition block, or null if not found.
 */
Blockly.Functions.getDefinition = function(name, workspace) {
  // Assume that a function definition is a top block.
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type == Blockly.FUNCTION_DEFINITION_BLOCK_TYPE && blocks[i].getName) {
      var funcName = blocks[i].getName();
      if (funcName == name) {
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
Blockly.Functions.getAllFunctionDefinitionBlocks = function(root) {
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
Blockly.Functions.isCustomType = function(argumentType) {
  return !(argumentType == 'boolean' ||
    argumentType == 'string' ||
    argumentType == 'number');
};


/**
 * Create a mutation for a brand new function.
 * @param {!Blockly.Workspace} destWs The main workspace where the user keeps their code.
 * @return {Element} The mutation for a new function.
 * @package
 */
Blockly.Functions.newFunctionMutation = function(destWs) {
  // Ensure the default function name is unique.
  var defaultName = Blockly.Functions.findLegalName(Blockly.Msg.FUNCTIONS_DEFAULT_FUNCTION_NAME, destWs);

  // <block type="function_definition">
  //   <mutation name="myFunc" functionid="..."></mutation>
  // </block>
  var mutationText =
    '<xml>' +
    '<mutation name="' + defaultName + '" functionid="' + Blockly.utils.genUid() + '"></mutation>' +
    '</xml>';
  var mutation = Blockly.Xml.textToDom(mutationText).firstChild;
  mutation.removeAttribute('xmlns');
  return mutation;
};

/**
 * Appends a number to the given name, or increments the number if one is already present.
 * @param {string} name The name for which to add or increment the suffix.
 * @return {string} The resulting name.
 */
Blockly.Functions.incrementNameSuffix = function(name) {
  var r = name.match(/^(.*?)(\d+)$/);
  if (!r) {
    name += '2';
  } else {
    name = r[1] + (parseInt(r[2], 10) + 1);
  }
  return name;
}

/**
 * Returns a unique parameter name based on the given name (using a numbered
 * suffix).
 * @param {string} name Initial name.
 * @param {string[]} paramNames Existing parameter names.
 * @return {string} The unique parameter name. If the name was already unique,
 *  the original name is returned.
 */
Blockly.Functions.findUniqueParamName = function(name, paramNames) {
  while (!Blockly.Functions.isUniqueParamName(name, paramNames)) {
    // Collision with another parameter name.
    name = Blockly.Functions.incrementNameSuffix(name);
  }
  return name;
};

/**
 * Determines whether the given parameter name is unique among the given
 * parameter names.
 * @param {string} name Initial name.
 * @param {string[]} paramNames Existing parameter names.
 * @return {boolean} Whether the name is unique.
 */
Blockly.Functions.isUniqueParamName = function(name, paramNames) {
  if (!paramNames) return true;
  return paramNames.indexOf(name) == -1;
};

/**
 * Callback to create a new function.
 * @param {!Blockly.Workspace} workspace The workspace to create the new function on.
 * @private
 */
Blockly.Functions.createFunctionCallback_ = function(workspace) {
  Blockly.hideChaff();
  if (Blockly.selected) {
    Blockly.selected.unselect();
  }
  Blockly.Functions.editFunctionExternalHandler(
      Blockly.Functions.newFunctionMutation(workspace),
      Blockly.Functions.createFunctionCallbackFactory_(workspace)
  );
};

/**
 * Callback factory for adding a new custom function from a mutation.
 * @param {!Blockly.Workspace} workspace The workspace to create the new function on.
 * @return {function(?Element)} callback for creating the new custom function.
 * @private
 */
Blockly.Functions.createFunctionCallbackFactory_ = function(workspace) {
  return function(mutation) {
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
      block.updateDisplay_();

      if (workspace.getMetrics) {
        var metrics = workspace.getMetrics();
        var blockDimensions = block.getHeightWidth();
        block.moveBy(
          metrics.viewLeft + (metrics.viewWidth / 2) - (blockDimensions.width / 2),
          metrics.viewTop + (metrics.viewHeight / 2) - (blockDimensions.height / 2)
        );
        block.scheduleSnapAndBump();
      }

      workspace.centerOnBlock(block.id);
      Blockly.Events.setGroup(false);
    }
  };
};

/**
 * Callback for editing custom functions.
 * @param {!Blockly.Block} block The block that was right-clicked.
 * @private
 */
Blockly.Functions.editFunctionCallback_ = function(block) {
  // Edit can come from either the function definition or a function call.
  // Normalize by setting the block to the definition block for the function.
  if (block.type == Blockly.FUNCTION_CALL_BLOCK_TYPE || block.type == Blockly.FUNCTION_CALL_OUTPUT_BLOCK_TYPE) {
    // This is a call block, find the definition block corresponding to the
    // name. Make sure to search the correct workspace, call block can be in flyout.
    var workspaceToSearch = block.workspace.isFlyout ?
        block.workspace.targetWorkspace : block.workspace;
    block = Blockly.Functions.getDefinition(block.getName(), workspaceToSearch);
  }
  // "block" now refers to the function definition block, it is safe to proceed.
  Blockly.hideChaff();
  if (Blockly.selected) {
    Blockly.selected.unselect();
  }
  Blockly.Functions.editFunctionExternalHandler(
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
Blockly.Functions.editFunctionCallbackFactory_ = function(block) {
  return function(mutation) {
    if (mutation) {
      Blockly.Functions.mutateCallersAndDefinition(block.getName(), block.workspace, mutation);
      block.updateDisplay_();
    }
  };
};

/**
 * Callback to create a new function custom command block.
 * @param {Element=} mutation The function mutator
 * @param {Function=} callback The function callback.
 * @public
 */
Blockly.Functions.editFunctionExternalHandler = function(mutation, callback) {
  console.warn('External function editor must be overriden: Blockly.Functions.editFunctionExternalHandler', mutation, callback);
};

/**
 * Make a context menu option for editing a custom function.
 * This appears in the context menu for function definitions and function
 * calls.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.Functions.makeEditOption = function(block) {
  var editOption = {
    enabled: !block.inDebugWorkspace(),
    text: Blockly.Msg.FUNCTIONS_EDIT_OPTION,
    callback: function() {
      Blockly.Functions.editFunctionCallback_(block);
    }
  };
  return editOption;
};

/**
 * Make a context menu option for creating a function call block.
 * This appears in the context menu for function definitions.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.Functions.makeCreateCallOption = function(block) {
  var functionName = block.getField("function_name").getText();

  var mutation = goog.dom.createDom('mutation');
  mutation.setAttribute('name', functionName);
  var callBlock = goog.dom.createDom('block', null, mutation);
  callBlock.setAttribute('type', 'function_call');

  var option = {
    enabled: block.workspace.remainingCapacity() > 0 && !block.inDebugWorkspace(),
    text: Blockly.Msg.FUNCTIONS_CREATE_CALL_OPTION.replace("%1", functionName),
    callback: Blockly.ContextMenu.callbackFactory(block, callBlock),
  };
  return option;
}

Blockly.Functions.makeGoToDefinitionOption = function(block) {
  var gtdOption = {
    enabled: !block.inDebugWorkspace(),
    text: Blockly.Msg.FUNCTIONS_GO_TO_DEFINITION_OPTION,
    callback: function() {
      var functionName = block.getField("function_name").getText();
      var definition = Blockly.Functions.getDefinition(functionName, block.workspace);
      if (definition) block.workspace.centerOnBlock(definition.id);
    }
  };
  return gtdOption;
}

/**
 * Converts an argument reporter block's output type to its equivalent
 * TypeScript type. For literal types, this means the output type in all lower
 * case. For custom reporters, this the output type is taken as is.
 * @param {string} reporterOutputType The reporter's output type.
 * @return {string} The TypeScript type of the argument.
 * @package
 */
Blockly.Functions.getReporterArgumentType = function(reporterOutputType) {
  switch (reporterOutputType) {
    case 'Boolean':
    case 'Number':
    case 'String':
      return reporterOutputType.toLowerCase();
    default:
      return reporterOutputType;
  }
};

/**
 * Returns a dictionary of all variable, old functions and new functions names currently in use.
 * @param {!Blockly.Workspace} ws The workspace to search.
 * @param {!Blockly.Block} exceptBlock Optional block to disambiguate.
 * @param {!string} exceptFuncId Optional function ID to ignore.
 * @return {!Object.<string,boolean>} The dictionary <name, true> of names in use.
 */
Blockly.Functions.namesInUse = function(ws, exceptBlock, exceptFuncId) {
  var usedNames = {};
  ws.getAllVariables().forEach(function(v) {
    usedNames[v.name] = true;
  });
  ws.getAllBlocks().forEach(function(b) {
    if (b == exceptBlock || (!!exceptFuncId && b.getFunctionId && b.getFunctionId() == exceptFuncId)) {
      return;
    }

    if (b.type == Blockly.FUNCTION_DEFINITION_BLOCK_TYPE) {
      usedNames[b.getName()] = true;
    } else if (b.type == 'procedures_defreturn' || b.type == 'procedures_defnoreturn') {
      usedNames[b.getProcedureDef()[0]] = true;
    }
  });
  return usedNames;
}

/**
 * Returns a list of all current function IDs.
 * @param {!Blockly.Workspace} ws The workspace to search.
 * @return {!Array.<string>} The list of IDs in use.
 */
Blockly.Functions.idsInUse = function(ws) {
  var ids = [];
  ws.getAllBlocks().forEach(function(b) {
    if (b.type == Blockly.FUNCTION_DEFINITION_BLOCK_TYPE) {
      ids.push(b.getFunctionId());
    }
  });
  return ids;
}

/**
 * Returns a name that is unique among existing functions and variables.
 * @param {string} name Proposed function name.
 * @param {!Blockly.Workspace} ws The workspace to search.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Functions.findLegalName = function(name, ws, block) {
  if (block && block.isInFlyout) {
    // Flyouts can have multiple procedures called 'do something'.
    return name;
  }

  var usedNames = Blockly.Functions.namesInUse(ws, block);

  while (usedNames[name]) {
    name = Blockly.Functions.incrementNameSuffix(name);
  }

  return name;
}

/**
 * Rename a Function. Called by the editable field on a function definition.
 * @param {string} name The proposed new name.
 * @return {string} The accepted name.
 * @this {Blockly.Field}
 */
Blockly.Functions.rename = function(name) {
  // Strip leading and trailing whitespace. Beyond this, all names are legal.
  name = name.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
  var legalName = Blockly.Functions.findLegalName(name, this.sourceBlock_.workspace, this.sourceBlock_);
  var oldName = this.getValue();

  if (!name) return oldName;
  else if (!legalName) return name;

  // For newly crecated functions (value not set yet), use legal name and save on block
  if (!oldName) {
    this.sourceBlock_.name_ = legalName;
    return legalName;
  }

  if (oldName != name && oldName != legalName) {
    // Temporarily change the function name to the new name so we can generate the new mutation,
    // but reset to the old name afterwards so that mutateCallersAndDefinition() can find the
    // function by its old name.
    var functionDef = this.sourceBlock_;
    functionDef.name_ = legalName;
    var newMutation = functionDef.mutationToDom();
    functionDef.name_ = oldName;
    Blockly.Functions.mutateCallersAndDefinition(oldName, functionDef.workspace, newMutation);
  }
  return legalName;
};

/**
 * Validate the given function mutation to ensure that:
 *  1) the function name is globally unique in the specified workspace
 *  2) the parameter names are unique among themselves
 *  3) the argument names are not the same as the function name
 * @param {!Element} mutation The proposed function mutation.
 * @param {!Blockly.Workspace} destinationWs The workspace to check for name uniqueness.
 * @return {boolean} Whether the function passes name validation or not.
 * @package
 */
Blockly.Functions.validateFunctionExternal = function(mutation, destinationWs) {
  // Check for empty function name.
  var funcName = mutation.getAttribute('name');

  if (!funcName) {
    Blockly.alert(Blockly.Msg.FUNCTION_WARNING_EMPTY_NAME);
    return false;
  }

  // Check for duplicate arg names and empty arg names.
  var seen = {};
  for (var i = 0; i < mutation.childNodes.length; ++i) {
    var arg = mutation.childNodes[i];
    var argName = arg.getAttribute('name');
    if (!argName) {
      Blockly.alert(Blockly.Msg.FUNCTION_WARNING_EMPTY_NAME);
      return false;
    }
    if (seen[argName]) {
      Blockly.alert(Blockly.Msg.FUNCTION_WARNING_DUPLICATE_ARG);
      return false;
    }
    seen[argName] = true;
  }

  // Check for function name also being an argument name.
  if (seen[funcName]) {
    Blockly.alert(Blockly.Msg.FUNCTION_WARNING_ARG_NAME_IS_FUNCTION_NAME);
    return false;
  }

  // Check if function name is in use by a variable or another function.
  var funcId = mutation.getAttribute('functionid');
  var usedNames = Blockly.Functions.namesInUse(destinationWs, null, funcId);

  if (usedNames[funcName]) {
    Blockly.alert(Blockly.Msg.VARIABLE_ALREADY_EXISTS.replace('%1', funcName));
    return false;
  }

  // Looks good.
  return true;
};

/**
 * Creates a map of argument name -> argument ID based on the specified
 * function mutation. If specified, can also create the inverse map:
 * argument ID -> argument name.
 * @param {!Element} mutation The function mutation to parse.
 * @param {boolean} inverse Whether to make the inverse map, ID -> name.
 * @return {!Object} A map of name -> ID, or ID -> name if inverse was true.
 * @package
 */
Blockly.Functions.getArgMap = function(mutation, inverse) {
  var map = {};
  for (var i = 0; i < mutation.childNodes.length; ++i) {
    var arg = mutation.childNodes[i];
    var key = inverse ? arg.getAttribute('id') : arg.getAttribute('name');
    var val = inverse ? arg.getAttribute('name') : arg.getAttribute('id');
    map[key] = val;
  }
  return map;
};

/**
 * Find and edit all callers and the definition of a function using a new
 * mutation.
 * @param {string} name Name of function.
 * @param {!Blockly.Workspace} ws The workspace to find callers in.
 * @param {!Element} mutation New mutation for the callers.
 * @package
 */
Blockly.Functions.mutateCallersAndDefinition = function(name, ws, mutation) {
  var definitionBlock = Blockly.Functions.getDefinition(name, ws);
  if (definitionBlock) {
    var callers = Blockly.Functions.getCallers(name, definitionBlock.workspace);
    callers.push(definitionBlock);
    Blockly.Events.setGroup(true);
    callers.forEach(function(caller) {
      var oldMutationDom = caller.mutationToDom();
      var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
      caller.domToMutation(mutation);
      var newMutationDom = caller.mutationToDom();
      var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);

      if (oldMutation != newMutation) {
        // Fire a mutation event to force the block to update.
        Blockly.Events.fire(new Blockly.Events.BlockChange(caller, 'mutation', null, oldMutation, newMutation));

        // For the definition, we also need to update all arguments that are
        // used inside the function.
        if (caller.id == definitionBlock.id) {
          // First, build a map of oldArgName -> argId from the old mutation,
          // and a map of argId -> newArgName from the new mutation.
          var oldArgNamesToIds = Blockly.Functions.getArgMap(oldMutationDom);
          var idsToNewArgNames = Blockly.Functions.getArgMap(newMutationDom, true);

          // Then, go through all descendants of the function definition and
          // look for argument reporters to update.
          definitionBlock.getDescendants().forEach(function(d) {
            if (!Blockly.pxtBlocklyUtils.isFunctionArgumentReporter(d)) {
              return;
            }

            // Find the argument ID corresponding to this old argument name.
            var argName = d.getFieldValue('VALUE');
            var argId = oldArgNamesToIds[argName];

            if (!idsToNewArgNames[argId]) {
              // That arg ID no longer exists on the new mutation, delete this
              // arg reporter.
              d.dispose();
            } else if (idsToNewArgNames[argId] !== argName) {
              // That arg ID still exists, but the name was changed, so update
              // this reporter's display text.
              d.setFieldValue(idsToNewArgNames[argId], 'VALUE');
            }
          });
        } else {
          // For the callers, we need to bump blocks that were connected to any
          // argument that has since been deleted.
          setTimeout(function() {
            caller.bumpNeighbours();
          }, Blockly.BUMP_DELAY);
        }
      }
    });
    Blockly.Events.setGroup(false);
  } else {
    console.warn('Attempted to change function ' + name + ', but no definition block was found on the workspace');
  }
};

/**
 * Create a flyout, creates the DOM elements for the flyout, and initializes the flyout.
 * @param {!Blockly.Workspace} workspace The target and parent workspace for this flyout. The workspace's options will
 *     be used to create the flyout's inner workspace.
 * @param {!Element} siblingNode The flyout is added after this reference node.
 * @return {!Blockly.Flyout} The newly created flyout.
 */
Blockly.Functions.createFlyout = function (workspace, siblingNode) {
  let flyoutWorkspaceOptions = new Blockly.Options(
    /** @type {!Blockly.BlocklyOptions} */
    ({
      'scrollbars': true,
      'disabledPatternId': workspace.options.disabledPatternId,
      'parentWorkspace': workspace,
      'rtl': workspace.RTL,
      'oneBasedIndex': workspace.options.oneBasedIndex,
      'horizontalLayout': workspace.horizontalLayout,
      'toolboxPosition': workspace.options.toolboxPosition,
      'zoomOptions': workspace.options.zoomOptions,
      'renderer': workspace.options.renderer,
      'rendererOverrides': workspace.options.rendererOverrides,
      // pxt-blockly: pass the newFunctions option
      'newFunctions': workspace.options.newFunctions,
      'move': {
        'scrollbars': true,
      }
    }));
  let newFlyout;
  if (flyoutWorkspaceOptions.horizontalLayout) {
    newFlyout = new Blockly.HorizontalFlyout(flyoutWorkspaceOptions);
  } else {
    newFlyout = new Blockly.VerticalFlyout(flyoutWorkspaceOptions);
  }
  let newSvg = newFlyout.createDom('svg');
  goog.dom.insertSiblingAfter(newSvg, siblingNode);
  newFlyout.init(workspace);

  return newFlyout;
};