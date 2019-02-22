// Object representing a Breakpoint inside a block.

'use strict';

goog.provide('Blockly.Breakpoint');

goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Icon');
goog.require('goog.userAgent');

/**
 * Class for a breakpoint.
 * @param {!Blockly.Block} block The block associated with this breakpoint.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Breakpoint = function(block) {
  Blockly.Breakpoint.superClass_.constructor.call(this, block);
  this.createIcon();
  // The set_ property represents if the breakpoint for this block is set.
  this.set_ = block.isBreakpointSet() || false;
};

goog.inherits(Blockly.Breakpoint, Blockly.Icon);

/**
 * Does this icon get hidden when the block is collapsed.
 */
Blockly.Breakpoint.prototype.collapseHidden = false;

/**
 * Draw the breakpoint icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Breakpoint.prototype.drawIcon_ = function(group) {
  var fill = this.block_.isBreakpointSet() ? '#f00' : "#ccc";
  // Red/Grey filled circle, for Set/Unset breakpoint respectively.
  this.bigDot = Blockly.utils.createSvgElement('circle',
  {
    'class': 'blocklyBreakpointSymbol',
    'cx': '7',
    'cy': '11',
    'r': '5',
    'fill': fill,
  },
  group);
};


/**
 * Enable/Disable the breakpoint icon.
 * @private
 */
Blockly.Breakpoint.prototype.enableBreakpoint = function() {
  this.setVisible(this.block_.isBreakpointSet());
};

/**
 * Dispose of this breakpoint Icon.
 */
Blockly.Breakpoint.prototype.dispose = function() {
  this.block_.breakpoint = null;
  goog.dom.removeNode(this.iconGroup_);
  this.iconGroup_ = null;
  this.block_ = null;
};

/**
 * Toggle the breakpoint icon between set and unset.
 * @param {boolean} visible True if the breakpoint icon should be set.
 */
Blockly.Breakpoint.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
      // No change.
      return;
  }
  Blockly.Events.fire(
    new Blockly.Events.Ui(this.block_, 'breakpointSet', !visible, visible));
  if (visible) {
    this.bigDot.setAttribute('fill', '#f00');
  } else {
    this.bigDot.setAttribute('fill', '#ccc');
  }
  
  this.set_ = !this.set_;
  this.block_.setBreakpoint(visible);
  };

/**
 * Is this breakpoint set?
 * @return {boolean} True if the breakpoint is Set.
 */
Blockly.Breakpoint.prototype.isVisible = function() {
  return !!this.set_;
};

/**
 * Notification that the icon has moved.
 * @param {!goog.math.Coordinate} xy Absolute location in workspace coordinates.
 */
Blockly.Breakpoint.prototype.setIconLocation = function(xy) {
  this.iconXY_ = xy;
};
