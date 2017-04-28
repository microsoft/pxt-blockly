/**
 * @license
 * Copyright (c) Microsoft Corporation
 * Use of this source code is governed by the MIT License.
 * see the license.txt file for details
 */

/**
 * @fileoverview Music blocks for Blockly.
 */
'use strict';

goog.provide('Blockly.Blocks.music');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');

Blockly.Blocks['note_picker'] = {
  /**
   * Block for notes picker.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_note",
          "name": "NOTE",
          "note": "262",
          "colour": Blockly.Colours.textField
        }
      ],
      "output": "Number",
      "colour": Blockly.Colours.music.primary,
      "colourSecondary": Blockly.Colours.music.secondary,
      "colourTertiary": Blockly.Colours.music.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "helpUrl": Blockly.Msg.NOTE_PICKER_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    // Note block is trivial.  Use tooltip of parent block if it exists.
    this.setTooltip(function() {
      var parent = thisBlock.getParent();
      return (parent && parent.getInputsInline() && parent.tooltip) ||
          Blockly.Msg.NOTE_PICKER_TOOLTIP;
    });
  }
};

