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
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable angle field.
 * @param {string|number=} opt_value The initial value of the field. Should cast
 *    to a number. Defaults to 0.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a number & returns a
 *    validated number, or null to abort the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldAngle = function(opt_value, opt_validator) {
  opt_value = this.doClassValidation_(opt_value);
  if (opt_value === null) {
    opt_value = 0;
  }
  Blockly.FieldAngle.superClass_.constructor.call(
      this, opt_value, opt_validator);
  this.addArgType('angle');
};
goog.inherits(Blockly.FieldAngle, Blockly.FieldTextInput);

/**
 * Construct a FieldAngle from a JSON arg object.
 * @param {!Object} options A JSON object with options (angle).
 * @return {!Blockly.FieldAngle} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldAngle.fromJson = function(options) {
  return new Blockly.FieldAngle(options['angle']);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 */
Blockly.FieldAngle.prototype.SERIALIZABLE = true;

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
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldAngle.prototype.initView = function() {
  Blockly.FieldAngle.superClass_.initView.call(this);
  // Add the degree symbol to the left of the number, even in RTL (issue #2380)
  this.symbol_ = Blockly.utils.dom.createSvgElement('tspan', {}, null);
  this.symbol_.appendChild(document.createTextNode('\u00B0'));
  this.textElement_.appendChild(this.symbol_);
};

/**
 * Updates the graph when the field rerenders.
 * @private
 */
Blockly.FieldAngle.prototype.render_ = function() {
  Blockly.FieldAngle.superClass_.render_.call(this);
  this.updateGraph_();
};

/**
 * Create and show the angle field's editor.
 * @private
 */
Blockly.FieldAngle.prototype.showEditor_ = function() {
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  var noFocus =
      Blockly.utils.userAgent.MOBILE ||
      Blockly.utils.userAgent.ANDROID ||
      Blockly.utils.userAgent.IPAD;
  Blockly.FieldAngle.superClass_.showEditor_.call(this, noFocus);
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var editor = this.dropdownCreate_();
  Blockly.DropDownDiv.getContentDiv().appendChild(editor);

  var border = this.sourceBlock_.getColourBorder();
  border = border.colourBorder || border.colourLight;
  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), border);

  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));

  this.updateGraph_();
};

/**
 * Create the angle dropdown editor.
 * @return {!Element} The newly created angle picker.
 * @private
 */
Blockly.FieldAngle.prototype.dropdownCreate_ = function() {
  var svg = Blockly.utils.dom.createSvgElement('svg', {
    'xmlns': Blockly.utils.dom.SVG_NS,
    'xmlns:html': Blockly.utils.dom.HTML_NS,
    'xmlns:xlink': Blockly.utils.dom.XLINK_NS,
    'version': '1.1',
    'height': (Blockly.FieldAngle.HALF * 2) + 'px',
    'width': (Blockly.FieldAngle.HALF * 2) + 'px'
  }, null);
  var circle = Blockly.utils.dom.createSvgElement('circle', {
    'cx': Blockly.FieldAngle.HALF,
    'cy': Blockly.FieldAngle.HALF,
    'r': Blockly.FieldAngle.RADIUS,
    'class': 'blocklyAngleCircle'
  }, svg);
  this.gauge_ = Blockly.utils.dom.createSvgElement('path', {
    'class': 'blocklyAngleGauge'
  }, svg);
  // The moving line, x2 and y2 are set in updateGraph_
  this.line_ = Blockly.utils.dom.createSvgElement('line',{
    'x1': Blockly.FieldAngle.HALF,
    'y1': Blockly.FieldAngle.HALF,
    'class': 'blocklyAngleLine'
  }, svg);
  // The fixed vertical line at the offset
  var offsetRadians = Math.PI * Blockly.FieldAngle.OFFSET / 180;
  Blockly.utils.dom.createSvgElement('line', {
    'x1': Blockly.FieldAngle.HALF,
    'y1': Blockly.FieldAngle.HALF,
    'x2': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS * Math.cos(offsetRadians),
    'y2': Blockly.FieldAngle.HALF - Blockly.FieldAngle.RADIUS * Math.sin(offsetRadians),
    'class': 'blocklyAngleLine'
  }, svg);
  // Draw markers around the edge.
  for (var angle = 0; angle < 360; angle += 15) {
    Blockly.utils.dom.createSvgElement('line', {
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
  Blockly.utils.dom.createSvgElement('circle', {
    'cx': Blockly.FieldAngle.HALF, 'cy': Blockly.FieldAngle.HALF,
    'r': Blockly.FieldAngle.CENTER_RADIUS,
    'class': 'blocklyAngleCenterPoint'
  }, svg);
  // Handle group: a circle and the arrow image
  this.handle_ = Blockly.utils.dom.createSvgElement('g', {}, svg);
  Blockly.utils.dom.createSvgElement('circle', {
    'cx': 0,
    'cy': 0,
    'r': Blockly.FieldAngle.HANDLE_RADIUS,
    'class': 'blocklyAngleDragHandle'
  }, this.handle_);
  this.arrowSvg_ = Blockly.utils.dom.createSvgElement('image', {
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

  // The angle picker is different from other fields in that it updates on
  // mousemove even if it's not in the middle of a drag.  In future we may
  // change this behaviour.  For now, using bindEvent_ instead of
  // bindEventWithChecks_ allows it to work without a mousedown/touchstart.
  this.clickWrapper_ =
      Blockly.bindEvent_(svg, 'click', this, this.hide_);
  this.moveWrapper1_ =
      Blockly.bindEvent_(circle, 'mousemove', this, this.onMouseMove);
  this.moveWrapper2_ =
      Blockly.bindEvent_(this.gauge_, 'mousemove', this, this.onMouseMove);

  return svg;
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
  // Calculate angle.
  var bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
  var dx = e.clientX - bBox.left - Blockly.FieldAngle.HALF;
  var dy = e.clientY - bBox.top - Blockly.FieldAngle.HALF;
  var angle = Math.atan(-dy / dx);
  if (isNaN(angle)) {
    // This shouldn't happen, but let's not let this error propagate further.
    return;
  }
  angle = Blockly.utils.math.toDegrees(angle);
  // 0: East, 90: North, 180: West, 270: South.
  if (dx < 0) {
    angle += 180;
  } else if (dy > 0) {
    angle += 360;
  }

  // Do offsetting.
  if (Blockly.FieldAngle.CLOCKWISE) {
    angle = Blockly.FieldAngle.OFFSET + 360 - angle;
  } else {
    angle = 360 - (Blockly.FieldAngle.OFFSET - angle);
  }
  if (angle > 360) {
    angle -= 360;
  }

  // Do rounding.
  if (Blockly.FieldAngle.ROUND) {
    angle = Math.round(angle / Blockly.FieldAngle.ROUND) *
        Blockly.FieldAngle.ROUND;
  }

  // Do wrapping.
  if (angle > Blockly.FieldAngle.WRAP) {
    angle -= 360;
  }

  // Update value.
  var angleString = String(angle);
  if (angleString != this.text_) {
    this.htmlInput_.value = angle;
    this.setValue(angle);
    // Always render the input angle.
    this.text_ = angleString;
    this.forceRerender();
  }
};

/**
 * Redraw the graph with the current angle.
 * @private
 */
Blockly.FieldAngle.prototype.updateGraph_ = function() {
  if (!this.gauge_) {
    return;
  }
  // Always display the input (i.e. getText) even if it is invalid.
  var angleDegrees = Number(this.getText()) + Blockly.FieldAngle.OFFSET;
  angleDegrees %= 360;
  var angleRadians = Blockly.utils.math.toRadians(angleDegrees);
  var path = ['M ', Blockly.FieldAngle.HALF, ',', Blockly.FieldAngle.HALF];
  var x2 = Blockly.FieldAngle.HALF;
  var y2 = Blockly.FieldAngle.HALF;
  if (!isNaN(angleRadians)) {
    var angle1 = Blockly.utils.math.toRadians(Blockly.FieldAngle.OFFSET);
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
 * Ensure that the input value is a valid angle.
 * @param {string|number=} newValue The input value.
 * @return {?number} A valid angle, or null if invalid.
 * @protected
 */
Blockly.FieldAngle.prototype.doClassValidation_ = function(newValue) {
  if (isNaN(newValue)) {
    return null;
  }
  var n = parseFloat(newValue || 0);
  n %= 360;
  if (n < 0) {
    n += 360;
  }
  if (n > Blockly.FieldAngle.WRAP) {
    n -= 360;
  }
  return n;
};

Blockly.Field.register('field_angle', Blockly.FieldAngle);
