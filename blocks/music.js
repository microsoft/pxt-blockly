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

Blockly.Blocks.music.HUE = 150;
// TODO: This should be the same as Blockly.Msg.COLOUR_HUE.
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
          "colour": Blockly.Blocks.music.HUE
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.music.HUE,
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

