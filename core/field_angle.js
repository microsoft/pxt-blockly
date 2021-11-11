/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Angle input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldAngle');

goog.require('Blockly.browserEvents');
goog.require('Blockly.Css');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.WidgetDiv');


/**
 * Class for an editable angle field.
 * @param {string|number=} opt_value The initial value of the field. Should cast
 *    to a number. Defaults to 0.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a number & returns a
 *    validated number, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/angle#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldAngle = function(opt_value, opt_validator, opt_config) {

  /**
   * Should the angle increase as the angle picker is moved clockwise (true)
   * or counterclockwise (false)
   * @see Blockly.FieldAngle.CLOCKWISE
   * @type {boolean}
   * @private
   */
  this.clockwise_ = Blockly.FieldAngle.CLOCKWISE;

  /**
   * The offset of zero degrees (and all other angles).
   * @see Blockly.FieldAngle.OFFSET
   * @type {number}
   * @private
   */
  this.offset_ = Blockly.FieldAngle.OFFSET;

  /**
   * The maximum angle to allow before wrapping.
   * @see Blockly.FieldAngle.WRAP
   * @type {number}
   * @private
   */
  this.wrap_ = Blockly.FieldAngle.WRAP;

  /**
   * The amount to round angles to when using a mouse or keyboard nav input.
   * @see Blockly.FieldAngle.ROUND
   * @type {number}
   * @private
   */
  this.round_ = Blockly.FieldAngle.ROUND;

  Blockly.FieldAngle.superClass_.constructor.call(
      this, opt_value, opt_validator, opt_config);

  /**
   * The angle picker's SVG element.
   * @type {?SVGElement}
   * @private
   */
  this.editor_ = null;

  /**
   * The angle picker's gauge path depending on the value.
   * @type {?SVGElement}
   */
  this.gauge_ = null;

  /**
   * The angle picker's line drawn representing the value's angle.
   * @type {?SVGElement}
   */
  this.line_ = null;

  /**
   * Wrapper click event data.
   * @type {?Blockly.browserEvents.Data}
   * @private
   */
  this.clickWrapper_ = null;

  /**
   * Surface click event data.
   * @type {?Blockly.browserEvents.Data}
   * @private
   */
  this.clickSurfaceWrapper_ = null;

  /**
   * Surface mouse move event data.
   * @type {?Blockly.browserEvents.Data}
   * @private
   */
  this.moveSurfaceWrapper_ = null;

  this.addArgType('angle');
};
Blockly.utils.object.inherits(Blockly.FieldAngle, Blockly.FieldTextInput);


/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
Blockly.FieldAngle.prototype.DEFAULT_VALUE = 0;

/**
 * Construct a FieldAngle from a JSON arg object.
 * @param {!Object} options A JSON object with options (angle).
 * @return {!Blockly.FieldAngle} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldAngle.fromJson = function(options) {
  return new Blockly.FieldAngle(options['angle'], undefined, options);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
Blockly.FieldAngle.prototype.SERIALIZABLE = true;

/**
 * The default amount to round angles to when using a mouse or keyboard nav
 * input. Must be a positive integer to support keyboard navigation.
 * @const {number}
 */
Blockly.FieldAngle.ROUND = 15;

/**
 * Half the width of protractor image.
 * @const {number}
 */
Blockly.FieldAngle.HALF = 120 / 2;

/**
 * Default property describing which direction makes an angle field's value
 * increase. Angle increases clockwise (true) or counterclockwise (false).
 * @const {boolean}
 */
Blockly.FieldAngle.CLOCKWISE = true;

/**
 * The default offset of 0 degrees (and all angles). Always offsets in the
 * counterclockwise direction, regardless of the field's clockwise property.
 * Usually either 0 (0 = right) or 90 (0 = up).
 * @const {number}
 */
Blockly.FieldAngle.OFFSET = 90;

/**
 * The default maximum angle to allow before wrapping.
 * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
 * @const {number}
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
 * @const {number}
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
 * Configure the field based on the given map of options.
 * @param {!Object} config A map of options to configure the field based on.
 * @protected
 * @override
 */
Blockly.FieldAngle.prototype.configure_ = function(config) {
  Blockly.FieldAngle.superClass_.configure_.call(this, config);

  switch (config['mode']) {
    case 'compass':
      this.clockwise_ = true;
      this.offset_ = 90;
      break;
    case 'protractor':
      // This is the default mode, so we could do nothing. But just to
      // future-proof, we'll set it anyway.
      this.clockwise_ = false;
      this.offset_ = 0;
      break;
  }

  // Allow individual settings to override the mode setting.
  var clockwise = config['clockwise'];
  if (typeof clockwise == 'boolean') {
    this.clockwise_ = clockwise;
  }

  // If these are passed as null then we should leave them on the default.
  var offset = config['offset'];
  if (offset != null) {
    offset = Number(offset);
    if (!isNaN(offset)) {
      this.offset_ = offset;
    }
  }
  var wrap = config['wrap'];
  if (wrap != null) {
    wrap = Number(wrap);
    if (!isNaN(wrap)) {
      this.wrap_ = wrap;
    }
  }
  var round = config['round'];
  if (round != null) {
    round = Number(round);
    if (!isNaN(round)) {
      this.round_ = round;
    }
  }
};

/**
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldAngle.prototype.initView = function() {
  Blockly.FieldAngle.superClass_.initView.call(this);
  // Add the degree symbol to the left of the number, even in RTL (issue #2380)
  this.symbol_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.TSPAN, {}, null);
  this.symbol_.appendChild(document.createTextNode('\u00B0'));
  this.textElement_.appendChild(this.symbol_);
};

/**
 * Updates the graph when the field rerenders.
 * @protected
 * @override
 */
Blockly.FieldAngle.prototype.render_ = function() {
  Blockly.FieldAngle.superClass_.render_.call(this);
  this.updateGraph_();
};

/**
 * Create and show the angle field's editor.
 * @param {Event=} opt_e Optional mouse event that triggered the field to open,
 *     or undefined if triggered programmatically.
 * @protected
 */
Blockly.FieldAngle.prototype.showEditor_ = function(opt_e) {
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  var noFocus =
      Blockly.utils.userAgent.MOBILE ||
      Blockly.utils.userAgent.ANDROID ||
      Blockly.utils.userAgent.IPAD;
  Blockly.FieldAngle.superClass_.showEditor_.call(this, opt_e, noFocus);

  this.dropdownCreate_();
  Blockly.DropDownDiv.getContentDiv().appendChild(this.editor_);

  Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary,
      this.sourceBlock_.style.colourTertiary);

  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));

  this.updateGraph_();
};

/**
 * Create the angle dropdown editor.
 * @private
 */
Blockly.FieldAngle.prototype.dropdownCreate_ = function() {
  var svg = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.SVG, {
        'xmlns': Blockly.utils.dom.SVG_NS,
        'xmlns:html': Blockly.utils.dom.HTML_NS,
        'xmlns:xlink': Blockly.utils.dom.XLINK_NS,
        'version': '1.1',
        'height': (Blockly.FieldAngle.HALF * 2) + 'px',
        'width': (Blockly.FieldAngle.HALF * 2) + 'px',
        'style': 'touch-action: none'
      }, null);
  var circle = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CIRCLE, {
        'cx': Blockly.FieldAngle.HALF,
        'cy': Blockly.FieldAngle.HALF,
        'r': Blockly.FieldAngle.RADIUS,
        'class': 'blocklyAngleCircle'
      }, svg);
  this.gauge_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.PATH, {
        'class': 'blocklyAngleGauge'
      }, svg);
  this.line_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE, {
        'x1': Blockly.FieldAngle.HALF,
        'y1': Blockly.FieldAngle.HALF,
        'class': 'blocklyAngleLine'
      }, svg);
  // Draw markers around the edge.
  for (var angle = 0; angle < 360; angle += 15) {
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.LINE, {
          'x1': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS,
          'y1': Blockly.FieldAngle.HALF,
          'x2': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS -
              (angle % 45 == 0 ? 10 : 5),
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

  // The angle picker is different from other fields in that it updates on
  // mousemove even if it's not in the middle of a drag.  In future we may
  // change this behaviour.
  this.clickWrapper_ =
      Blockly.browserEvents.conditionalBind(svg, 'click', this, this.hide_);
  // On touch devices, the picker's value is only updated with a drag. Add
  // a click handler on the drag surface to update the value if the surface
  // is clicked.
  this.clickSurfaceWrapper_ = Blockly.browserEvents.conditionalBind(
      circle, 'click', this, this.onMouseMove_, true, true);
  this.moveSurfaceWrapper_ = Blockly.browserEvents.conditionalBind(
      circle, 'mousemove', this, this.onMouseMove_, true, true);
  this.editor_ = svg;
};
/**
 * Disposes of events and DOM-references belonging to the angle editor.
 * @private
 */
Blockly.FieldAngle.prototype.dropdownDispose_ = function() {
  if (this.clickWrapper_) {
    Blockly.browserEvents.unbind(this.clickWrapper_);
    this.clickWrapper_ = null;
  }
  if (this.clickSurfaceWrapper_) {
    Blockly.browserEvents.unbind(this.clickSurfaceWrapper_);
    this.clickSurfaceWrapper_ = null;
  }
  if (this.moveSurfaceWrapper_) {
    Blockly.browserEvents.unbind(this.moveSurfaceWrapper_);
    this.moveSurfaceWrapper_ = null;
  }
  this.gauge_ = null;
  this.line_ = null;
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
 * @protected
 */
Blockly.FieldAngle.prototype.onMouseMove_ = function(e) {
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
  if (this.clockwise_) {
    angle = this.offset_ + 360 - angle;
  } else {
    angle = 360 - (this.offset_ - angle);
  }

  this.displayMouseOrKeyboardValue_(angle);
};

/**
 * Handles and displays values that are input via mouse or arrow key input.
 * These values need to be rounded and wrapped before being displayed so
 * that the text input's value is appropriate.
 * @param {number} angle New angle.
 * @private
 */
Blockly.FieldAngle.prototype.displayMouseOrKeyboardValue_ = function(angle) {
  if (this.round_) {
    angle = Math.round(angle / this.round_) * this.round_;
  }
  angle = this.wrapValue_(angle);
  if (angle != this.value_) {
    this.setEditorValue_(angle);
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
  var angleDegrees = Number(this.getText()) + this.offset_;
  angleDegrees %= 360;
  var angleRadians = Blockly.utils.math.toRadians(angleDegrees);
  var path = ['M ', Blockly.FieldAngle.HALF, ',', Blockly.FieldAngle.HALF];
  var x2 = Blockly.FieldAngle.HALF;
  var y2 = Blockly.FieldAngle.HALF;
  if (!isNaN(angleRadians)) {
    var clockwiseFlag = Number(this.clockwise_);
    var angle1 = Blockly.utils.math.toRadians(this.offset_);
    var x1 = Math.cos(angle1) * Blockly.FieldAngle.RADIUS;
    var y1 = Math.sin(angle1) * -Blockly.FieldAngle.RADIUS;
    if (clockwiseFlag) {
      angleRadians = 2 * angle1 - angleRadians;
    }
    x2 += Math.cos(angleRadians) * Blockly.FieldAngle.RADIUS;
    y2 -= Math.sin(angleRadians) * Blockly.FieldAngle.RADIUS;
    // Don't ask how the flag calculations work.  They just do.
    var largeFlag = Math.abs(Math.floor((angleRadians - angle1) / Math.PI) % 2);
    if (clockwiseFlag) {
      largeFlag = 1 - largeFlag;
    }
    path.push(' l ', x1, ',', y1,
        ' A ', Blockly.FieldAngle.RADIUS, ',', Blockly.FieldAngle.RADIUS,
        ' 0 ', largeFlag, ' ', clockwiseFlag, ' ', x2, ',', y2, ' z');
  }
  this.gauge_.setAttribute('d', path.join(''));
  this.line_.setAttribute('x2', x2);
  this.line_.setAttribute('y2', y2);
  this.handle_.setAttribute('transform', 'translate(' + x2 + ',' + y2 +')');
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @protected
 * @override
 */
Blockly.FieldAngle.prototype.onHtmlInputKeyDown_ = function(e) {
  Blockly.FieldAngle.superClass_.onHtmlInputKeyDown_.call(this, e);

  var multiplier;
  if (e.keyCode === Blockly.utils.KeyCodes.LEFT) {
    // decrement (increment in RTL)
    multiplier = this.sourceBlock_.RTL ? 1 : -1;
  } else if (e.keyCode === Blockly.utils.KeyCodes.RIGHT) {
    // increment (decrement in RTL)
    multiplier = this.sourceBlock_.RTL ? -1 : 1;
  } else if (e.keyCode === Blockly.utils.KeyCodes.DOWN) {
    // decrement
    multiplier = -1;
  } else if (e.keyCode === Blockly.utils.KeyCodes.UP) {
    // increment
    multiplier = 1;
  }
  if (multiplier) {
    var value = /** @type {number} */ (this.getValue());
    this.displayMouseOrKeyboardValue_(
        value + (multiplier * this.round_));
    e.preventDefault();
    e.stopPropagation();
  }
};

/**
 * Ensure that the input value is a valid angle.
 * @param {*=} opt_newValue The input value.
 * @return {?number} A valid angle, or null if invalid.
 * @protected
 * @override
 */
Blockly.FieldAngle.prototype.doClassValidation_ = function(opt_newValue) {
  var value = Number(opt_newValue);
  if (isNaN(value) || !isFinite(value)) {
    return null;
  }
  return this.wrapValue_(value);
};

/**
 * Wraps the value so that it is in the range (-360 + wrap, wrap).
 * @param {number} value The value to wrap.
 * @return {number} The wrapped value.
 * @private
 */
Blockly.FieldAngle.prototype.wrapValue_ = function(value) {
  value %= 360;
  if (value < 0) {
    value += 360;
  }
  if (value > this.wrap_) {
    value -= 360;
  }
  return value;
};

/**
 * CSS for angle field.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyAngleCenterPoint {',
    'stroke: #fff;',
    'stroke-width: 1;',
    'fill: #fff;',
  '}',

  '.blocklyAngleDragHandle {',
    'stroke: #fff;',
    'stroke-width: 5;',
    'stroke-opacity: 0.25;',
    'fill: #fff;',
    'cursor: pointer;',
  '}',


  '.blocklyAngleMarks {',
    'stroke: #fff;',
    'stroke-width: 1;',
    'stroke-opacity: 0.5;',
  '}',

  '.blocklyAngleGauge {',
    'fill: #fff;',
    'fill-opacity: 0.20;',
  '}',

  '.blocklyAngleLine {',
    'stroke: #fff;',
    'stroke-width: 1;',
    'stroke-linecap: round;',
    'pointer-events: none;',
  '}',
  /* eslint-enable indent */
]);

Blockly.fieldRegistry.register('field_angle', Blockly.FieldAngle);
