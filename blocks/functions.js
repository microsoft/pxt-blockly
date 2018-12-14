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

Blockly.PXTBlockly.FunctionUtils = {};

/**
 * Function argument reporters cannot exist outside functions that define them
 * as arguments. Enforce this whenever an event is fired.
 * @param {!Blockly.Events.Abstract} event Change event.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.onReporterChange = function (event) {
  if (!this.workspace || this.workspace.isFlyout) {
    // Block is deleted or is in a flyout.
    return;
  }

  var thisWasCreated = event.type === Blockly.Events.BLOCK_CREATE && event.ids.indexOf(this.id) != -1;
  var thisWasDragged = event.type === Blockly.Events.END_DRAG && event.allNestedIds.indexOf(this.id) != -1;

  if (thisWasCreated || thisWasDragged) {
    var rootBlock = this.getRootBlock();
    var isTopBlock = Blockly.Functions.isFunctionArgumentReporter(rootBlock);

    if (isTopBlock || rootBlock.previousConnection != null) {
      // Reporter is by itself on the workspace, or it is slotted into a
      // stack of statements that is not attached to a function or event. Let
      // it exist until it is connected to a function or event handler.
      return;
    }

    // Ensure an argument with this name and type is defined on the root block.
    if (!Blockly.pxtBlocklyUtils.hasMatchingArgumentReporter(rootBlock, this)) {
      // No argument with this name is defined on the root block; delete this
      // reporter.
      Blockly.Events.setGroup(event.group);
      this.dispose();
      Blockly.Events.setGroup(false);
    }
  }
}

// Argument editor and reporter helpers

/**
 * Returns the TypeScript type associated with this reporter or editor.
 * @return {string} This argument's type, as would be emitted to TypeScript.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.getTypeName = function () {
  return this.typeName_;
}

/**
 * Create XML to represent the type name of an argument editor or reporter.
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.argumentMutationToDom = function () {
  var container = document.createElement('mutation');
  container.setAttribute('typename', this.typeName_);
  return container;
};

/**
 * Parse XML to restore the type name of an argument editor or reporter.
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.argumentDomToMutation = function (xmlElement) {
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
Blockly.PXTBlockly.FunctionUtils.createCustomArgumentBlock = function (blockType, typeName, ws) {
  var blockText =
    '<xml>' +
    '<block type="' + blockType + '">' +
    '<mutation typename="' + typeName + '"></mutation>' +
    '</block>' +
    '</xml>';
  var blockDom = Blockly.Xml.textToDom(blockText);
  return Blockly.Xml.domToBlock(blockDom.firstChild, ws);
}

/**
 * Creates an argument_reporter_custom block with the correct mutation for the
 * specified type name.
 * @param {string} typeName The TypeScript type of the argument.
 * @param {!Blockly.Workspace} ws The workspace to create the block in.
 * @return {!Blockly.block} The created block.
 */
Blockly.PXTBlockly.FunctionUtils.createCustomArgumentReporter = function (typeName, ws) {
  return Blockly.PXTBlockly.FunctionUtils.createCustomArgumentBlock('argument_reporter_custom', typeName, ws);
}

// Argument reporter blocks

Blockly.Blocks['argument_reporter_boolean'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.PROCEDURES_HUE,
      "extensions": ["output_boolean"]
    });
    this.typeName_ = 'boolean';
  },
  onchange: Blockly.PXTBlockly.FunctionUtils.onReporterChange,
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName
};

Blockly.Blocks['argument_reporter_number'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.PROCEDURES_HUE,
      "extensions": ["output_number"]
    });
    this.typeName_ = 'number';
  },
  onchange: Blockly.PXTBlockly.FunctionUtils.onReporterChange,
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName
};

Blockly.Blocks['argument_reporter_string'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.PROCEDURES_HUE,
      "extensions": ["output_string"]
    });
    this.typeName_ = 'string';
  },
  onchange: Blockly.PXTBlockly.FunctionUtils.onReporterChange,
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName
};

Blockly.Blocks['argument_reporter_custom'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.PROCEDURES_HUE,
      "inputsInline": true,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "output": null
    });
    this.typeName_ = 'any';
  },
  onchange: Blockly.PXTBlockly.FunctionUtils.onReporterChange,
  getTypeName: Blockly.PXTBlockly.FunctionUtils.getTypeName,
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.argumentMutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.argumentDomToMutation
};