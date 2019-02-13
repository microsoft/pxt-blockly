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
 * @fileoverview String field.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */

'use strict';

/**
 * @name Blockly.PXTUtils
 * @namespace
 **/
goog.provide('Blockly.PXTUtils');

// goog ui components used by PXT field editors:
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.positioning.ClientPosition');
goog.require('goog.ui.Tooltip');
goog.require('goog.ui.CustomButton');

/**
 * Fade hex colour.
 * Words may not be split.  Any space after a word is included in the length.
 * @param {string} hex Hex colour
 * @param {number} luminosity Luminosity
 * @param {number} lighten Lighten weight
 * @return {number} rgb colour.
 */
Blockly.PXTUtils.fadeColour = function(hex, luminosity, lighten) {
  // #ABC => ABC
  hex = hex.replace(/[^0-9a-f]/gi, '');

  // ABC => AABBCC
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // tweak
  var rgb = "#";
  for (var i = 0; i < 3; i++) {
    var c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, lighten ?
        c + (c * luminosity) : c - (c * luminosity)), 255));
    var cStr = c.toString(16);
    rgb += ("00" + cStr).substr(cStr.length);
  }

  return rgb;
};
