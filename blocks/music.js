//TODO: lincense
/**
 * @fileoverview Music blocks for Blockly.
 */
'use strict';

goog.provide('Blockly.Blocks.music');
goog.require('Blockly.Blocks');

Blockly.Blocks.music.HUE = 120;
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
      // TODO "helpUrl": Blockly.Msg.NOTE_PICKER_HELPURL
      // TODO "tooltip:"
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    // NOTE block is trivial.  Use tooltip of parent block if it exists.
    this.setTooltip(function() {
      var parent = thisBlock.getParent();
      return (parent && parent.getInputsInline() && parent.tooltip) ||
          Blockly.Msg.NOTE_PICKER_TOOLTIP;
    });
  }
};

Blockly.Blocks['note_pickerTS'] = {
  /**
   * Block for notes picker.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_noteTS",
          "name": "NOTE",
          "note": "262",
          "colour": Blockly.Blocks.music.HUE
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.music.HUE,
      // TODO "helpUrl": Blockly.Msg.NOTE_PICKER_HELPURL
      // TODO "tooltip:"
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    // NOTE block is trivial.  Use tooltip of parent block if it exists.
    this.setTooltip(function() {
      var parent = thisBlock.getParent();
      return (parent && parent.getInputsInline() && parent.tooltip) ||
          Blockly.Msg.NOTE_PICKER_TOOLTIP;
    });
  }
};
