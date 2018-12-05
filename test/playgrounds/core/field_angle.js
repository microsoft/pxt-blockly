/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Angle input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldAngle');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextInput');
goog.require('goog.math');
goog.require('goog.userAgent');


/**
 * Class for an editable angle field.
 * @param {(string|number)=} opt_value The initial content of the field. The
 *     value should cast to a number, and if it does not, '0' will be used.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldAngle = function(opt_value, opt_validator) {
  // Add degree symbol: '360°' (LTR) or '°360' (RTL)
  this.symbol_ = Blockly.utils.createSvgElement('tspan', {}, null);
  this.symbol_.appendChild(document.createTextNode('\u00B0'));

  opt_value = (opt_value && !isNaN(opt_value)) ? String(opt_value) : '0';
  Blockly.FieldAngle.superClass_.constructor.call(
      this, opt_value, opt_validator);
  this.addArgType('angle');
};
goog.inherits(Blockly.FieldAngle, Blockly.FieldTextInput);

/**
 * Construct a FieldAngle from a JSON arg object.
 * @param {!Object} options A JSON object with options (angle).
 * @returns {!Blockly.FieldAngle} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldAngle.fromJson = function(options) {
  return new Blockly.FieldAngle(options['angle']);
};

/**
 * Round angles to the nearest 15 degrees when using mouse.
 * Set to 0 to disable rounding.
 */
Blockly.FieldAngle.ROUND = 15;

/**
 * Half the width of protractor image.
 */
Blockly.FieldAngle.HALF = 120 / 2;

/* The following two settings work together to set the behaviour of the angle
 * picker.  While many combinations are possible, two modes are typical:
 * Math mode.
 *   0 deg is right, 90 is up.  This is the style used by protractors.
 *   Blockly.FieldAngle.CLOCKWISE = false;
 *   Blockly.FieldAngle.OFFSET = 0;
 * Compass mode.
 *   0 deg is up, 90 is right.  This is the style used by maps.
 *   Blockly.FieldAngle.CLOCKWISE = true;
 *   Blockly.FieldAngle.OFFSET = 90;
 */

/**
 * Angle increases clockwise (true) or counterclockwise (false).
 */
Blockly.FieldAngle.CLOCKWISE = true;

/**
 * Offset the location of 0 degrees (and all angles) by a constant.
 * Usually either 0 (0 = right) or 90 (0 = up).
 */
Blockly.FieldAngle.OFFSET = 90;

/**
 * Maximum allowed angle before wrapping.
 * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
 */
Blockly.FieldAngle.WRAP = 180;

/**
 * Radius of drag handle
 */
Blockly.FieldAngle.HANDLE_RADIUS = 10;

/**
 * Width of drag handle arrow
 */
Blockly.FieldAngle.ARROW_WIDTH = Blockly.FieldAngle.HANDLE_RADIUS;

/**
 * Radius of protractor circle.  Slightly smaller than protractor size since
 * otherwise SVG crops off half the border at the edges.
 */
Blockly.FieldAngle.RADIUS = Blockly.FieldAngle.HALF - Blockly.FieldAngle.HANDLE_RADIUS - 1;

/**
 * Radius of central dot circle.
 */
Blockly.FieldAngle.CENTER_RADIUS = 2;

/**
 * Path to the arrow svg icon.
 */
Blockly.FieldAngle.ARROW_SVG_DATAURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjhweCIKICAgaGVpZ2h0PSIxMHB4IgogICB2aWV3Qm94PSIwIDAgOCAxMCIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45MSByMTM3MjUiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImFycm93LnN2ZyI+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMTYiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBvYmplY3R0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTE3OSIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI3MTAiCiAgICAgaWQ9Im5hbWVkdmlldzE0IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIyMy42IgogICAgIGlua3NjYXBlOmN4PSI0IgogICAgIGlua3NjYXBlOmN5PSI1IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ic3ZnMiIgLz4KICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjIgKDM5MDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICA8dGl0bGUKICAgICBpZD0idGl0bGU0Ij5hcnJvdzwvdGl0bGU+CiAgPGRlc2MKICAgICBpZD0iZGVzYzYiPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogIDxkZWZzCiAgICAgaWQ9ImRlZnM4IiAvPgogIDxnCiAgICAgaWQ9IlBhZ2UtMSIKICAgICBzdHJva2U9Im5vbmUiCiAgICAgc3Ryb2tlLXdpZHRoPSIxIgogICAgIGZpbGw9Im5vbmUiCiAgICAgZmlsbC1ydWxlPSJldmVub2RkIgogICAgIHRyYW5zZm9ybT0icm90YXRlKDkwLCA0LCA1KSIKICAgICBzdHlsZT0iZmlsbDojMDAwMDAwIj4KICAgIDxnCiAgICAgICBpZD0iYXJyb3ciCiAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNC4wMDAwMDAsIC0zLjAwMDAwMCkiCiAgICAgICBmaWxsPSIjNEM5N0ZGIgogICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMCI+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Ik04LjAxODkxMDgzLDYuNjgyMjMwNTUgTDMuNTA5OTE2MDEsNy40MzM3Mjk2OSBDMy4yNDY3OTEzMSw3LjQ3NzU4MzggMy4wMTg5MTA4Myw3LjczOTQyMTUxIDMuMDE4OTEwODMsOC4wMTU1NjM4OCBDMy4wMTg5MTA4Myw4LjI4MzYzMDI5IDMuMjM4NzQxMzQsOC41NTIyMDIzIDMuNTA5OTE2MDEsOC41OTczOTgwOCBMOC4wMTg5MTA4Myw5LjM0ODg5NzIyIEw4LjAxODkxMDgzLDExLjAxODUzMzcgQzguMDE4OTEwODMsMTEuNTYyNTI3NiA4LjM4MzI2Njg2LDExLjc1MjAwMzIgOC44MzI3MjI3OSwxMS40MjY4ODQ3IEwxMi42NDEwMTc2LDguNjcyMTE1ODcgQzEzLjA5ODE2MzgsOC4zNDE0MzQ1NSAxMy4wOTU3MjIzLDcuODE0NzA1MTggMTIuNjUyNzQxMSw3LjQ4MzIwODA2IEw4LjgyMDk5OTM2LDQuNjE1NzkyNTMgQzguMzc1NTc2NjQsNC4yODI0NjgzOCA4LjAxODkxMDgzLDQuNDYxOTQ5NDggOC4wMTg5MTA4Myw1LjAxMjU5NDAyIEw4LjAxODkxMDgzLDYuNjgyMjMwNTUgWiIKICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOC4wMDE2NzMsIDguMDE3MjM3KSByb3RhdGUoLTkwLjAwMDAwMCkgdHJhbnNsYXRlKC04LjAwMTY3MywgLTguMDE3MjM3KSAiCiAgICAgICAgIGlkPSJwYXRoMTIiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDAiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K';

/**
 * Clean up this FieldAngle, as well as the inherited FieldTextInput.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldAngle.prototype.dispose = function() {
  var thisField = this;
  return function() {
    Blockly.FieldAngle.superClass_.dispose.call(thisField)();
    thisField.gauge_ = null;
    if (thisField.mouseDownWrapper_) {
      Blockly.unbindEvent_(thisField.mouseDownWrapper_);
    }
    if (thisField.mouseUpWrapper_) {
      Blockly.unbindEvent_(thisField.mouseUpWrapper_);
    }
    if (thisField.mouseMoveWrapper_) {
      Blockly.unbindEvent_(thisField.mouseMoveWrapper_);
    }
  };
};

/**
 * Show the inline free-text editor on top of the text.
 * @param {!Event} e A mouse down or touch start event.
 * @private
 */
Blockly.FieldAngle.prototype.showEditor_ = function(e) {
  var noFocus =
      goog.userAgent.MOBILE || goog.userAgent.ANDROID || goog.userAgent.IPAD;
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  Blockly.FieldAngle.superClass_.showEditor_.call(this, e, noFocus);
  // If there is an existing drop-down someone else owns, hide it immediately and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  var div = Blockly.DropDownDiv.getContentDiv();
  // Build the SVG DOM.
  var svg = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': (Blockly.FieldAngle.HALF * 2) + 'px',
    'width': (Blockly.FieldAngle.HALF * 2) + 'px'
  }, div);
  Blockly.utils.createSvgElement('circle', {
    'cx': Blockly.FieldAngle.HALF, 'cy': Blockly.FieldAngle.HALF,
    'r': Blockly.FieldAngle.RADIUS,
    'class': 'blocklyAngleCircle'
  }, svg);
  this.gauge_ = Blockly.utils.createSvgElement('path',
      {'class': 'blocklyAngleGauge'}, svg);
  // The moving line, x2 and y2 are set in updateGraph_
  this.line_ = Blockly.utils.createSvgElement('line',{
    'x1': Blockly.FieldAngle.HALF,
    'y1': Blockly.FieldAngle.HALF,
    'class': 'blocklyAngleLine'
  }, svg);
  // The fixed vertical line at the offset
  var offsetRadians = Math.PI * Blockly.FieldAngle.OFFSET / 180;
  Blockly.utils.createSvgElement('line', {
    'x1': Blockly.FieldAngle.HALF,
    'y1': Blockly.FieldAngle.HALF,
    'x2': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS * Math.cos(offsetRadians),
    'y2': Blockly.FieldAngle.HALF - Blockly.FieldAngle.RADIUS * Math.sin(offsetRadians),
    'class': 'blocklyAngleLine'
  }, svg);
  // Draw markers around the edge.
  for (var angle = 0; angle < 360; angle += 15) {
    Blockly.utils.createSvgElement('line', {
      'x1': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS - 13,
      'y1': Blockly.FieldAngle.HALF,
      'x2': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS - 7,
      'y2': Blockly.FieldAngle.HALF,
      'class': 'blocklyAngleMarks',
      'transform': 'rotate(' + angle + ',' +
          Blockly.FieldAngle.HALF + ',' + Blockly.FieldAngle.HALF + ')'
    }, svg);
  }
  // Center point
  Blockly.utils.createSvgElement('circle', {
    'cx': Blockly.FieldAngle.HALF, 'cy': Blockly.FieldAngle.HALF,
    'r': Blockly.FieldAngle.CENTER_RADIUS,
    'class': 'blocklyAngleCenterPoint'
  }, svg);
  // Handle group: a circle and the arrow image
  this.handle_ = Blockly.utils.createSvgElement('g', {}, svg);
  Blockly.utils.createSvgElement('circle', {
    'cx': 0,
    'cy': 0,
    'r': Blockly.FieldAngle.HANDLE_RADIUS,
    'class': 'blocklyAngleDragHandle'
  }, this.handle_);
  this.arrowSvg_ = Blockly.utils.createSvgElement('image', {
    'width': Blockly.FieldAngle.ARROW_WIDTH,
    'height': Blockly.FieldAngle.ARROW_WIDTH,
    'x': -Blockly.FieldAngle.ARROW_WIDTH / 2,
    'y': -Blockly.FieldAngle.ARROW_WIDTH / 2
  }, this.handle_);
  this.arrowSvg_.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href', Blockly.FieldAngle.ARROW_SVG_DATAURI
  );

  Blockly.DropDownDiv.setColour(this.sourceBlock_.parentBlock_.getColour(),
      this.sourceBlock_.getColourTertiary());
  Blockly.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

  this.mouseDownWrapper_ =
      Blockly.bindEvent_(this.handle_, 'mousedown', this, this.onMouseDown);

  this.updateGraph_();
};
/**
 * Set the angle to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldAngle.prototype.onMouseDown = function() {
  this.mouseMoveWrapper_ = Blockly.bindEvent_(document.body, 'mousemove', this, this.onMouseMove);
  this.mouseUpWrapper_ = Blockly.bindEvent_(document.body, 'mouseup', this, this.onMouseUp);
};

/**
 * Set the angle to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldAngle.prototype.onMouseUp = function() {
  Blockly.unbindEvent_(this.mouseMoveWrapper_);
  Blockly.unbindEvent_(this.mouseUpWrapper_);
};

/**
 * Set the angle to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldAngle.prototype.onMouseMove = function(e) {
  e.preventDefault();
  var bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
  var dx = e.clientX - bBox.left - Blockly.FieldAngle.HALF;
  var dy = e.clientY - bBox.top - Blockly.FieldAngle.HALF;
  var angle = Math.atan(-dy / dx);
  if (isNaN(angle)) {
    // This shouldn't happen, but let's not let this error propagate further.
    return;
  }
  angle = goog.math.toDegrees(angle);
  // 0: East, 90: North, 180: West, 270: South.
  if (dx < 0) {
    angle += 180;
  } else if (dy > 0) {
    angle += 360;
  }
  if (Blockly.FieldAngle.CLOCKWISE) {
    angle = Blockly.FieldAngle.OFFSET + 360 - angle;
  } else {
    angle -= Blockly.FieldAngle.OFFSET;
  }
  if (Blockly.FieldAngle.ROUND) {
    angle = Math.round(angle / Blockly.FieldAngle.ROUND) *
        Blockly.FieldAngle.ROUND;
  }
  angle = this.callValidator(angle);
  Blockly.FieldTextInput.htmlInput_.value = angle;
  this.setValue(angle);
  this.validate_();
  this.resizeEditor_();
};

/**
 * Insert a degree symbol.
 * @param {?string} text New text.
 */
Blockly.FieldAngle.prototype.setText = function(text) {
  Blockly.FieldAngle.superClass_.setText.call(this, text);
  if (!this.textElement_) {
    // Not rendered yet.
    return;
  }
  this.updateGraph_();
  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};

/**
 * Redraw the graph with the current angle.
 * @private
 */
Blockly.FieldAngle.prototype.updateGraph_ = function() {
  if (!this.gauge_) {
    return;
  }
  var angleDegrees = Number(this.getText()) % 360 + Blockly.FieldAngle.OFFSET;
  var angleRadians = goog.math.toRadians(angleDegrees);
  var path = ['M ', Blockly.FieldAngle.HALF, ',', Blockly.FieldAngle.HALF];
  var x2 = Blockly.FieldAngle.HALF;
  var y2 = Blockly.FieldAngle.HALF;
  if (!isNaN(angleRadians)) {
    var angle1 = goog.math.toRadians(Blockly.FieldAngle.OFFSET);
    var x1 = Math.cos(angle1) * Blockly.FieldAngle.RADIUS;
    var y1 = Math.sin(angle1) * -Blockly.FieldAngle.RADIUS;
    if (Blockly.FieldAngle.CLOCKWISE) {
      angleRadians = 2 * angle1 - angleRadians;
    }
    x2 += Math.cos(angleRadians) * Blockly.FieldAngle.RADIUS;
    y2 -= Math.sin(angleRadians) * Blockly.FieldAngle.RADIUS;
    // Use large arc only if input value is greater than wrap
    var largeFlag = Math.abs(angleDegrees - Blockly.FieldAngle.OFFSET) > 180 ? 1 : 0;
    var sweepFlag = Number(Blockly.FieldAngle.CLOCKWISE);
    if (angleDegrees < Blockly.FieldAngle.OFFSET) {
      sweepFlag = 1 - sweepFlag; // Sweep opposite direction if less than the offset
    }
    path.push(' l ', x1, ',', y1,
        ' A ', Blockly.FieldAngle.RADIUS, ',', Blockly.FieldAngle.RADIUS,
        ' 0 ', largeFlag, ' ', sweepFlag, ' ', x2, ',', y2, ' z');

    // Image rotation needs to be set in degrees
    if (Blockly.FieldAngle.CLOCKWISE) {
      var imageRotation = angleDegrees + 2 * Blockly.FieldAngle.OFFSET;
    } else {
      var imageRotation = -angleDegrees;
    }
    this.arrowSvg_.setAttribute('transform', 'rotate(' + (imageRotation) + ')');
  }
  this.gauge_.setAttribute('d', path.join(''));
  this.line_.setAttribute('x2', x2);
  this.line_.setAttribute('y2', y2);
  this.handle_.setAttribute('transform', 'translate(' + x2 + ',' + y2 +')');
};

/**
 * Ensure that only an angle may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid angle, or null if invalid.
 */
Blockly.FieldAngle.prototype.classValidator = function(text) {
  if (text === null) {
    return null;
  }
  var n = parseFloat(text || 0);
  if (isNaN(n)) {
    return null;
  }
  n = n % 360;
  if (n < 0) {
    n += 360;
  }
  if (n > Blockly.FieldAngle.WRAP) {
    n -= 360;
  }
  return String(n);
};

Blockly.Field.register('field_angle', Blockly.FieldAngle);
