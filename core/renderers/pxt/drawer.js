/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview pxt renderer.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.pxt.Drawer');

goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.pxt.ConstantProvider');
goog.require('Blockly.zelos.Drawer');
goog.require('Blockly.utils.object');

/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.zelos.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.zelos.Drawer}
 */
Blockly.pxt.Drawer = function(block, info) {
  Blockly.pxt.Drawer.superClass_.constructor.call(this, block, info);
};
Blockly.utils.object.inherits(Blockly.pxt.Drawer,
    Blockly.zelos.Drawer);

/**
 * Draw collapsed statement input with ellipses
 * @param {!Blockly.blockRendering.Row} row The row that this input
 *     belongs to.
 * @protected
 */
Blockly.pxt.Drawer.prototype.drawCollapsedStack_ = function(row) {
  // Where to start drawing the notch, which is on the right side in LTR.
  var x = this.constants_.STATEMENT_INPUT_NOTCH_OFFSET
   + this.constants_.INSIDE_CORNERS.width;

  var innerTopLeftCorner =
      (this.constants_.STATEMENT_INPUT_PADDING_LEFT +
        this.constants_.INSIDE_CORNERS.width*2
      ) +
      Blockly.utils.svgPaths.lineOnAxis('h',
          -this.constants_.INSIDE_CORNERS.width) +
      this.constants_.INSIDE_CORNERS.pathTop;

  var innerHeight =
      row.height - (2 * this.constants_.INSIDE_CORNERS.height);

  var innerBottomLeftCorner =
    this.constants_.INSIDE_CORNERS.pathBottom +
    Blockly.utils.svgPaths.lineOnAxis('h',
        this.constants_.INSIDE_CORNERS.width);

  var ellipses = this.constants_.ELLIPSES;

  this.outlinePath_ += this.constants_.OUTSIDE_CORNERS.bottomRight + 
      Blockly.utils.svgPaths.lineOnAxis('H', x) +
      innerTopLeftCorner +
      Blockly.utils.svgPaths.lineOnAxis('v', innerHeight/2) +
      ellipses + 
      Blockly.utils.svgPaths.lineOnAxis('v', innerHeight/2) +
      innerBottomLeftCorner +
      Blockly.utils.svgPaths.lineOnAxis('H', row.xPos + row.width - this.constants_.OUTSIDE_CORNERS.rightHeight) +
      this.constants_.OUTSIDE_CORNERS.topRight;

};

/**
 * Add steps for the left side of the block, which may include an output
 * connection
 * @private
 */
Blockly.pxt.Drawer.prototype.drawLeft_ = function() {
  Blockly.pxt.Drawer.superClass_.drawLeft_.call(this);
  var hasCollapsedStack = this.info_.rows.find(function (el) {
    return el.isCollapsedStack;
  })

  // we lift the pen in drawing the collapsed stack ellipses, so manually
  // reconnect left side
  if (hasCollapsedStack) {
    var endY = this.info_.startY;
    if (Blockly.blockRendering.Types.isLeftRoundedCorner(this.info_.topRow.elements[0])) {
      endY += this.constants_.OUTSIDE_CORNERS.rightHeight;
    }

    this.outlinePath_ = this.outlinePath_.slice(0, -1);
    this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('V', endY);
  }
};

/**
 * Add steps to draw the left side of an output with a dynamic connection.
 * @protected
 */
Blockly.pxt.Drawer.prototype.drawLeftDynamicConnection_ = function() {
  Blockly.pxt.Drawer.superClass_.drawLeftDynamicConnection_.call(this);

  this.block_.pathObject.positionConnectionIndicator(
    this.block_.outputConnection.getOffsetInBlock().x,
    this.block_.outputConnection.getOffsetInBlock().y);
};