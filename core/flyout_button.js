/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Class for a button in the flyout.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FlyoutButton');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a button in the flyout.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
 *     button.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
 * @param {!Element} xml The XML specifying the label/button.
 * @param {boolean} isLabel Whether this button should be styled as a label.
 * @constructor
 */
Blockly.FlyoutButton = function(workspace, targetWorkspace, xml, isLabel) {
  // Labels behave the same as buttons, but are styled differently.

  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.targetWorkspace_ = targetWorkspace;

  /**
   * @type {string}
   * @private
   */
  this.text_ = xml.getAttribute('text');

  /**
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.position_ = new goog.math.Coordinate(0, 0);

  /**
   * Whether this button should be styled as a label.
   * @type {boolean}
   * @private
   */
  this.isLabel_ = isLabel;

  /**
   * If specified, add a help icon to the right of the label.
   * @type {?string}
   * @private
   */
  this.helpButtonIcon_ = xml.getAttribute('web-help-button') || null;

  /**
   * Function to call when this button is clicked.
   * @type {function(!Blockly.FlyoutButton)}
   * @private
   */
  this.callback_ = null;

  var callbackKey = xml.getAttribute('callbackkey');
  if (this.isLabel_ && !this.helpButtonIcon_ && callbackKey) {
    console.warn('Labels should not have callbacks. Label text: ' + this.text_);
  } else if (!this.isLabel_ &&
      !(callbackKey && targetWorkspace.getButtonCallback(callbackKey))) {
    console.warn('Buttons should have callbacks. Button text: ' + this.text_);
  } else {
    this.callback_ = targetWorkspace.getButtonCallback(callbackKey);
  }

  /**
   * If specified, a CSS class to add to this button.
   * @type {?string}
   * @private
   */
  this.cssClass_ = xml.getAttribute('web-class') || null;

  /**
   * If specified, an icon to add to this button.
   * @type {?string}
   * @private
   */
  this.icon_ = xml.getAttribute('web-icon') || null;
  this.iconClass_ = xml.getAttribute('web-icon-class') || null;
  this.iconColor_ = xml.getAttribute('web-icon-color') || null;

  /**
   * If specified, a line to add underneath this button.
   * @type {?string}
   * @private
   */
  this.line_ = xml.getAttribute('web-line') || null;
  this.lineWidth_ = xml.getAttribute('web-line-width') || null;
};

/**
 * The margin around the text in the button.
 */
Blockly.FlyoutButton.MARGIN = 40;

/**
 * The width of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.width = 0;

/**
 * The height of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.height = 40; // Can't be computed like the width

/**
 * Opaque data that can be passed to Blockly.unbindEvent_.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.FlyoutButton.prototype.onMouseUpWrapper_ = null;

/**
 * Opaque data that can be passed to Blockly.unbindEvent_.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.FlyoutButton.HELP_IMAGE_URI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHZpZXdCb3g9IjAgMCAyNiAyNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTMiIGN5PSIxMyIgcj0iMTMiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNy45NTIgOS4xODQwMkMxNy45NTIgMTAuMjU2IDE3LjgxNiAxMS4wNzIgMTcuNTQ0IDExLjYzMkMxNy4yODggMTIuMTkyIDE2Ljc1MiAxMi43OTIgMTUuOTM2IDEzLjQzMkMxNS4xMiAxNC4wNzIgMTQuNTc2IDE0LjU4NCAxNC4zMDQgMTQuOTY4QzE0LjA0OCAxNS4zMzYgMTMuOTIgMTUuNzM2IDEzLjkyIDE2LjE2OFYxNi45NkgxMS44MDhDMTEuNDI0IDE2LjQ2NCAxMS4yMzIgMTUuODQgMTEuMjMyIDE1LjA4OEMxMS4yMzIgMTQuNjg4IDExLjM4NCAxNC4yODggMTEuNjg4IDEzLjg4OEMxMS45OTIgMTMuNDg4IDEyLjUzNiAxMi45NjggMTMuMzIgMTIuMzI4QzE0LjEwNCAxMS42NzIgMTQuNjI0IDExLjE2OCAxNC44OCAxMC44MTZDMTUuMTM2IDEwLjQ0OCAxNS4yNjQgOS45NjgwMiAxNS4yNjQgOS4zNzYwMkMxNS4yNjQgOC4yMDgwMiAxNC40MTYgNy42MjQwMiAxMi43MiA3LjYyNDAyQzExLjc2IDcuNjI0MDIgMTAuNzUyIDcuNzM2MDIgOS42OTYgNy45NjAwMkw5LjE0NCA4LjA4MDAyTDkgNi4wODgwMkMxMC40ODggNS41NjAwMiAxMS44NCA1LjI5NjAyIDEzLjA1NiA1LjI5NjAyQzE0LjczNiA1LjI5NjAyIDE1Ljk2OCA1LjYwODAyIDE2Ljc1MiA2LjIzMjAyQzE3LjU1MiA2Ljg0MDAyIDE3Ljk1MiA3LjgyNDAyIDE3Ljk1MiA5LjE4NDAyWk0xMS40IDIyVjE4LjY0SDE0LjE4NFYyMkgxMS40WiIgZmlsbD0iIzU5NUU3NCIvPgo8L3N2Zz4K';

/**
 * Create the button elements.
 * @return {!Element} The button's SVG group.
 */
Blockly.FlyoutButton.prototype.createDom = function() {
  var cssClass = this.isLabel_ ? 'blocklyFlyoutLabel' : 'blocklyFlyoutButton';
  if (this.cssClass_) {
    cssClass += ' ' + this.cssClass_;
  }

  this.svgGroup_ = Blockly.utils.createSvgElement('g', {'class': cssClass},
      this.workspace_.getCanvas());

  if (!this.isLabel_) {
    // Shadow rectangle (light source does not mirror in RTL).
    var shadow = Blockly.utils.createSvgElement('rect',
        {
          'class': 'blocklyFlyoutButtonShadow',
          'rx': 4, 'ry': 4, 'x': 1, 'y': 1
        },
        this.svgGroup_);
  }
  // Background rectangle.
  var rect = Blockly.utils.createSvgElement('rect',
      {
        'class': this.isLabel_ ?
            'blocklyFlyoutLabelBackground' : 'blocklyFlyoutButtonBackground',
        'rx': 4, 'ry': 4
      },
      this.svgGroup_);

  var svgText = Blockly.utils.createSvgElement('text',
      {
        'class': this.isLabel_ ? 'blocklyFlyoutLabelText' : 'blocklyText',
        'x': 0,
        'y': 0,
        'text-anchor': 'middle'
      },
      this.svgGroup_);
  svgText.textContent = this.text_;

  this.width = Blockly.Field.getCachedWidth(svgText);

  // pxtblockly: support for icons in toolbox labels
  if (this.icon_ || this.iconClass_) {
    var svgIcon = Blockly.utils.createSvgElement('text',
        {'class': this.iconClass_ ? 'blocklyFlyoutLabelIcon ' + this.iconClass_ : 'blocklyFlyoutLabelIcon',
          'x': 0, 'y': 0, 'text-anchor': 'start'},
        this.svgGroup_);
    if (this.icon_) svgIcon.textContent = this.icon_;
    if (this.iconColor_) svgIcon.setAttribute('style', 'fill: ' + this.iconColor_);

    svgIcon.setAttribute('dominant-baseline', 'central');
    svgIcon.setAttribute('dy', goog.userAgent.EDGE_OR_IE ?
      Blockly.Field.IE_TEXT_OFFSET : '0');
    svgIcon.setAttribute('x', this.targetWorkspace_.RTL ? this.width + Blockly.FlyoutButton.MARGIN : 0);
    svgIcon.setAttribute('y', this.height / 2);

    this.width += Blockly.Field.getCachedWidth(svgIcon) + Blockly.FlyoutButton.MARGIN;
  }

  if (this.helpButtonIcon_) {
    var helpButtonWidth = 25;
    var helpButtonMarginX = 15;
    var helpButtonMarginY = 10;
    var helpButtonX = this.workspace_.RTL ?
      - this.width + Blockly.FlyoutButton.MARGIN + helpButtonMarginX :
      this.width + helpButtonMarginX;
    this.helpButtonImage_ = Blockly.utils.createSvgElement(
        'image',
        {
          'class': 'blocklyFlyoutButton',
          'height': helpButtonWidth + 'px',
          'width': helpButtonWidth + 'px',
          'x': helpButtonX + 'px',
          'y': helpButtonMarginY + 'px'
        },
        this.svgGroup_);
    this.helpButtonImage_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.FlyoutButton.HELP_IMAGE_URI);
  }

  if (this.line_) {
    var svgLine = Blockly.utils.createSvgElement('line',
        {'class': 'blocklyFlyoutLine', 'stroke-dasharray': this.line_,
          'text-anchor': 'middle'},
        this.svgGroup_);
    svgLine.setAttribute('x1', 0);
    svgLine.setAttribute('x2', this.lineWidth_ != null ? this.lineWidth_ : this.width);
    svgLine.setAttribute('y1', this.height);
    svgLine.setAttribute('y2', this.height);
  }

  if (!this.isLabel_) {
    this.width += 2 * Blockly.FlyoutButton.MARGIN;
    shadow.setAttribute('width', this.width);
    shadow.setAttribute('height', this.height);
  }
  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);

  svgText.setAttribute('text-anchor', 'middle');
  svgText.setAttribute('dominant-baseline', 'central');
  svgText.setAttribute('dy', goog.userAgent.EDGE_OR_IE ?
    Blockly.Field.IE_TEXT_OFFSET : '0');
  svgText.setAttribute('x', this.width / 2);
  svgText.setAttribute('y', this.height / 2);

  var buttonHitTarget = this.helpButtonIcon_ && this.callback_ ?
      this.helpButtonImage_ : this.svgGroup_;
  this.mouseUpWrapper_ = Blockly.bindEventWithChecks_(buttonHitTarget, 'mouseup',
      this, this.onMouseUp_);
  return this.svgGroup_;
};

/**
 * Correctly position the flyout button and make it visible.
 */
Blockly.FlyoutButton.prototype.show = function() {
  this.updateTransform_();
  this.svgGroup_.setAttribute('display', 'block');
};

/**
 * Update SVG attributes to match internal state.
 * @private
 */
Blockly.FlyoutButton.prototype.updateTransform_ = function() {
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.position_.x + ',' + this.position_.y + ')');
};

/**
 * Move the button to the given x, y coordinates.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 */
Blockly.FlyoutButton.prototype.moveTo = function(x, y) {
  this.position_.x = x;
  this.position_.y = y;
  this.updateTransform_();
};

/**
 * Location of the button.
 * @return {!goog.math.Coordinate} x, y coordinates.
 * @package
 */
Blockly.FlyoutButton.prototype.getPosition = function() {
  return this.position_;
};

/**
 * Get the button's target workspace.
 * @return {!Blockly.WorkspaceSvg} The target workspace of the flyout where this
 *     button resides.
 */
Blockly.FlyoutButton.prototype.getTargetWorkspace = function() {
  return this.targetWorkspace_;
};

/**
 * Get the text of this button.
 * @return {string} The text on the button.
 * @package
 */
Blockly.FlyoutButton.prototype.getText = function() {
  return this.text_;
};

/**
 * Get the position of this button.
 * @return {!goog.math.Coordinate} The button position.
 * @package
 */
Blockly.FlyoutButton.prototype.getPosition = function() {
  return this.position_;
};

/**
 * Dispose of this button.
 */
Blockly.FlyoutButton.prototype.dispose = function() {
  if (this.onMouseUpWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpWrapper_);
  }
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.workspace_ = null;
  this.targetWorkspace_ = null;
};

/**
 * Do something when the button is clicked.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.FlyoutButton.prototype.onMouseUp_ = function(e) {
  var gesture = this.targetWorkspace_.getGesture(e);
  if (gesture) {
    gesture.cancel();
  }

  // Call the callback registered to this button.
  if (this.callback_) {
    this.callback_(this);
  }
};
