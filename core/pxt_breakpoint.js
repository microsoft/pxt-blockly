// Object representing a Breakpoint inside a block.

'use strict';

goog.provide('Blockly.Breakpoint');

goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Icon');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.userAgent');

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
Blockly.utils.object.inherits(Blockly.Breakpoint, Blockly.Icon);

/**
 * Does this icon get hidden when the block is collapsed.
 */
Blockly.Breakpoint.prototype.collapseHidden = false;

/**
 * Create the icon on the block.
 */
Blockly.Breakpoint.prototype.createIcon = function() {
  if (this.iconGroup_) {
    // Icon already exists.
    return;
  }
  /* Here's the markup that will be generated:
  <g class="blocklyBreakpointIconGroup">
    ...
  </g>
  */
  this.iconGroup_ = Blockly.utils.dom.createSvgElement('g',
      {'class': 'blocklyBreakpointIconGroup'}, null);
  if (this.block_.isInFlyout) {
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.iconGroup_), 'blocklyBreakpointIconGroupReadonly');
  }
  this.drawIcon_(this.iconGroup_);

  this.block_.getSvgRoot().appendChild(this.iconGroup_);
  Blockly.bindEventWithChecks_(
      this.iconGroup_, 'mouseup', this, this.iconClick_);
  this.updateEditable();
};

/**
 * Draw the breakpoint icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Breakpoint.prototype.drawIcon_ = function(group) {
  var fill = this.block_.isBreakpointSet() ? '#f00' : "#ccc";
  // Red/Grey filled circle, for Set/Unset breakpoint respectively.
  this.bigDot = Blockly.utils.dom.createSvgElement('circle',
  {
    'class': 'blocklyBreakpointSymbol',
    'fill': fill,
    'stroke': 'white',
    'stroke-width': 2,
    'cx': 7,
    'cy': 11.5,
    'r': 8,
  },
  group);

  // Dismissed stop sign.
  // this.bigDot = Blockly.utils.dom.createSvgElement('polygon',
  // {
  //   'class': 'blocklyBreakpointSymbol',
  //   'points': '10,7 20,7 25,12 25,22 20,27 10,27 5,22 5,12',
  //   'fill': fill,
  //   'stroke': 'white',
  //   'stroke-width': 2,
  //   'transform': 'scale(0.7)',
  // },
  // group);

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
 * @param {!Blockly.utils.Coordinate} xy Absolute location in workspace coordinates.
 */
Blockly.Breakpoint.prototype.setIconLocation = function(xy) {
  this.iconXY_ = xy;
};

/**
 * Don't do anything, since breakpoint icon doesn't have a bubble.
 */
Blockly.Breakpoint.prototype.updateColour = function () {
};
Blockly.Breakpoint.prototype.applyColour = function () {
};
