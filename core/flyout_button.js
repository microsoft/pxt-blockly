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
Blockly.FlyoutButton.HELP_IMAGE_URI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiICAgdmVyc2lvbj0iMS4xIiAgIGlkPSJyZXBlYXQiICAgeD0iMHB4IiAgIHk9IjBweCIgICB2aWV3Qm94PSIwIDAgMjQgMjQiICAgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjQgMjQ7IiAgIHhtbDpzcGFjZT0icHJlc2VydmUiICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45MSByMTM3MjUiICAgc29kaXBvZGk6ZG9jbmFtZT0icXVlc3Rpb24uc3ZnIj48bWV0YWRhdGEgICAgIGlkPSJtZXRhZGF0YTE1Ij48cmRmOlJERj48Y2M6V29yayAgICAgICAgIHJkZjphYm91dD0iIj48ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD48ZGM6dHlwZSAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz48ZGM6dGl0bGU+cmVwZWF0PC9kYzp0aXRsZT48L2NjOldvcms+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnMgICAgIGlkPSJkZWZzMTMiIC8+PHNvZGlwb2RpOm5hbWVkdmlldyAgICAgcGFnZWNvbG9yPSIjZmY0ODIxIiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiICAgICBib3JkZXJvcGFjaXR5PSIxIiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIgICAgIGdyaWR0b2xlcmFuY2U9IjEwIiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxNjgwIiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iOTY5IiAgICAgaWQ9Im5hbWVkdmlldzExIiAgICAgc2hvd2dyaWQ9ImZhbHNlIiAgICAgaW5rc2NhcGU6em9vbT0iOS44MzMzMzM1IiAgICAgaW5rc2NhcGU6Y3g9IjEyLjc0MTU5NyIgICAgIGlua3NjYXBlOmN5PSIxMS42NTkxODYiICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMCIgICAgIGlua3NjYXBlOndpbmRvdy15PSIwIiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMCIgICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InJlcGVhdCIgLz48c3R5bGUgICAgIHR5cGU9InRleHQvY3NzIiAgICAgaWQ9InN0eWxlMyI+LnN0MHtmaWxsOiNDRjhCMTc7fS5zdDF7ZmlsbDojRkZGRkZGO308L3N0eWxlPjx0aXRsZSAgICAgaWQ9InRpdGxlNSI+cmVwZWF0PC90aXRsZT48Y2lyY2xlICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6I2ZmZmZmZjtzdHJva2Utd2lkdGg6MjtzdHJva2UtbGluZWNhcDpzcXVhcmU7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MSIgICAgIGlkPSJwYXRoNDEzNiIgICAgIGN4PSIxMiIgICAgIGN5PSIxMiIgICAgIHI9IjEwLjUwMzE5MSIgLz48dGV4dCAgICAgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zaXplOjE5LjM5MDc5Mjg1cHg7bGluZS1oZWlnaHQ6MTI1JTtmb250LWZhbWlseTpzYW5zLXNlcmlmO2xldHRlci1zcGFjaW5nOjBweDt3b3JkLXNwYWNpbmc6MHB4O2ZpbGw6IzU5NWU3NDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MXB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1vcGFjaXR5OjEiICAgICB4PSI3LjY0OTM4MDIiICAgICB5PSIxOC43OTM0MDYiICAgICBpZD0idGV4dDQxMzciICAgICBzb2RpcG9kaTpsaW5lc3BhY2luZz0iMTI1JSI+PHRzcGFuICAgICAgIHNvZGlwb2RpOnJvbGU9ImxpbmUiICAgICAgIGlkPSJ0c3BhbjQxMzkiICAgICAgIHg9IjcuNjQ5MzgwMiIgICAgICAgeT0iMTguNzkzNDA2IiAgICAgICBzdHlsZT0iZm9udC1zdHlsZTpub3JtYWw7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpib2xkO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1mYW1pbHk6J1NlZ29lIFVJJzstaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOidTZWdvZSBVSSBCb2xkJztmaWxsOiM1OTVlNzQ7ZmlsbC1vcGFjaXR5OjEiPj88L3RzcGFuPjwvdGV4dD48L3N2Zz4=';

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
