/**
 * @license
 * PXT Blockly
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * https://github.com/Microsoft/pxt-blockly
 *
 * See LICENSE file for details.
 */
/**
 * @fileoverview Utility methods for PXT Blockly but not Blockly.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

/**
 * @name Blockly.pxtBlocklyUtils
 * @namespace
 **/
goog.provide('Blockly.pxtBlocklyUtils');


/**
 * Measure some text using a canvas in-memory.
 * Does not exist in Blockly, but needed in scratch-blocks
 * @param {string} fontSize E.g., '10pt'
 * @param {string} fontFamily E.g., 'Arial'
 * @param {string} fontWeight E.g., '600'
 * @param {string} text The actual text to measure
 * @return {number} Width of the text in px.
 * @package
 */
Blockly.pxtBlocklyUtils.measureText = function(fontSize, fontFamily,
    fontWeight, text) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
  return context.measureText(text).width;
};

/**
 * Whether a block is both a shadow block and an argument reporter.  These
 * blocks have special behaviour in scratch-blocks: they're duplicated when
 * dragged, and they are rendered slightly differently from normal shadow
 * blocks.
 * @param {!Blockly.BlockSvg} block The block that should be used to make this
 *     decision.
 * @return {boolean} True if the block should be duplicated on drag.
 * @package
 */
Blockly.pxtBlocklyUtils.isShadowArgumentReporter = function(block) {
  return (block.type == 'variables_get_reporter');
};

