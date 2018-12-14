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
 * Converts an argument reporter block's output type to its equivalent
 * TypeScript type. For literal types, this means the output type in all lower
 * case. For custom reporters, this the output type is taken as is.
 * @param {string} reporterOutputType The reporter's output type.
 * @return {string} The TypeScript type of the argument.
 * @package
 */
Blockly.Functions.getReporterArgumentType = function (reporterOutputType) {
  switch (reporterOutputType) {
    case 'Boolean':
    case 'Number':
    case 'String':
      return reporterOutputType.toLowerCase();
    default:
      return reporterOutputType;
  }
}

/**
 * Whether a block is a function argument reporter.
 * @param {!Blockly.BlockSvg} block The block that should be used to make this
 *     decision.
 * @return {boolean} True if the block is a function argument reporter.
 */
Blockly.Functions.isFunctionArgumentReporter = function (block) {
  return block.type === 'argument_reporter_boolean' ||
    block.type === 'argument_reporter_number' ||
    block.type === 'argument_reporter_string' ||
    block.type === 'argument_reporter_custom';
};