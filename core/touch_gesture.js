/**
 * @license
 * PXT Blockly
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * https://github.com/Microsoft/pxt-blockly
 *
 * See LICENSE file for details.
 */

/**
 * @fileoverview The class extends Blockly.Gesture to support pinch to zoom
 * for both pointer and touch events.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.TouchGesture');

goog.require('Blockly.Gesture');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/*
 * Note: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 */

/**
 * Class for one gesture.
 * @param {!Event} e The event that kicked off this gesture.
 * @param {!Blockly.WorkspaceSvg} creatorWorkspace The workspace that created
 *     this gesture and has a reference to it.
 * @constructor
 */
Blockly.TouchGesture = function(e, creatorWorkspace) {
  Blockly.TouchGesture.superClass_.constructor.call(this, e,
    creatorWorkspace);

  /**
   * Boolean for whether or not this gesture is a multi-touch gesture.
   * @type {boolean}
   * @private
   */
  this.isMultiTouch_ = false;

  /**
   * A map of cached points used for tracking multi-touch gestures.
   * @type {boolean}
   * @private
   */
  this.cachedPoints = {};

  /**
   * A scale value tracking the previous gesture scale.
   * @type {number}
   * @private
   */
  this.previousGestureScale_ = 0;
};
goog.inherits(Blockly.TouchGesture, Blockly.Gesture);

/**
 * Start a gesture: update the workspace to indicate that a gesture is in
 * progress and bind mousemove and mouseup handlers.
 * @param {!Event} e A mouse down, touch start or pointer down event.
 * @package
 */
Blockly.TouchGesture.prototype.doStart = function(e) {
  Blockly.TouchGesture.superClass_.doStart.call(this, e);
  if (Blockly.Touch.isTouchEvent(e)) {
    this.handleTouchStart(e);
  }
};

/**
 * Bind gesture events
 * @package
 */
Blockly.TouchGesture.prototype.bindStartEvents = function() {
  this.onStartWrapper_ = Blockly.bindEventWithChecks_(
    document, 'mousedown', null, this.handleStart.bind(this), /*opt_noCaptureIdentifier*/ true);
  this.onMoveWrapper_ = Blockly.bindEventWithChecks_(
    document, 'mousemove', null, this.handleMove.bind(this), /*opt_noCaptureIdentifier*/ true);
  this.onUpWrapper_ = Blockly.bindEventWithChecks_(
    document, 'mouseup', null, this.handleUp.bind(this), /*opt_noCaptureIdentifier*/ true);
};

/**
 * Handle a mouse down, touch move, or pointer move event.
 * @param {!Event} e A mouse move, touch move, or pointer move event.
 * @package
 */
Blockly.TouchGesture.prototype.handleStart = function(e) {
  if (Blockly.Touch.isTouchEvent(e) && !this.isDragging()) {
    this.handleTouchStart(e);

    if (this.isMultiTouch()) {
      Blockly.longStop_();
    }
  }
};

/**
 * Handle a mouse move, touch move, or pointer move event.
 * @param {!Event} e A mouse move, touch move, or pointer move event.
 * @package
 */
Blockly.TouchGesture.prototype.handleMove = function(e) {
  if (Blockly.Touch.isTouchEvent(e) && !this.isDragging()) {
    this.handleTouchMove(e);
  }
  if (!this.isMultiTouch() && Blockly.Touch.shouldHandleEvent(e)) {
    Blockly.TouchGesture.superClass_.handleMove.call(this, e);
  }
};

/**
 * Handle a mouse up, touch end, or pointer up event.
 * @param {!Event} e A mouse up, touch end, or pointer up event.
 * @package
 */
Blockly.TouchGesture.prototype.handleUp = function(e) {
  if (Blockly.Touch.isTouchEvent(e) && !this.isDragging()) {
    this.handleTouchEnd(e);
  }
  if (!this.isMultiTouch() || this.isDragging()) {
    if (!Blockly.Touch.shouldHandleEvent(e)) {
      return;
    }
    Blockly.TouchGesture.superClass_.handleUp.call(this, e);
  } else {
    e.preventDefault();
    e.stopPropagation();

    this.dispose();
  }
};

/**
 * Whether this gesture is part of a mulit-touch gesture.
 * @return {boolean} whether this gesture was a click on a workspace.
 * @package
 */
Blockly.TouchGesture.prototype.isMultiTouch = function() {
  return this.isMultiTouch_;
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.TouchGesture.prototype.dispose = function() {
  Blockly.TouchGesture.superClass_.dispose.call(this);

  if (this.onStartWrapper_) {
    Blockly.unbindEvent_(this.onStartWrapper_);
  }
  if (this.onGestureChangeWrapper_) {
    Blockly.unbindEvent_(this.onGestureChangeWrapper_);
  }
  if (this.onGestureEndWrapper_) {
    Blockly.unbindEvent_(this.onGestureEndWrapper_);
  }
};

/**
 * Handle a touch start or pointer down event and keep track of current pointers.
 * @param {!Event} e A touch start, or pointer down event.
 * @package
 */
Blockly.TouchGesture.prototype.handleTouchStart = function(e) {
  var pointerId = Blockly.Touch.getTouchIdentifierFromEvent(e);
  // store the pointerId in the current list of pointers
  this.cachedPoints[pointerId] = this.getTouchPoint(e);
  var pointers = Object.keys(this.cachedPoints);
  // If two pointers are down, check for pinch gestures
  if (pointers.length == 2) {
    var points = {
      x1: this.cachedPoints[pointers[0]].x,
      x2: this.cachedPoints[pointers[1]].x,
      y1: this.cachedPoints[pointers[0]].y,
      y2: this.cachedPoints[pointers[1]].y
    };
    this.touchStartDistance_ = Math.sqrt(Math.pow((points.x2 - points.x1), 2) + Math.pow((points.y2 - points.y1), 2 ));
    e.preventDefault();
    this.isMultiTouch_ = true;
  }
};

/**
 * Handle a touch move or pointer move event and zoom in/out if two pointers are on the screen.
 * @param {!Event} e A touch move, or pointer move event.
 * @package
 */
Blockly.TouchGesture.prototype.handleTouchMove = function(e) {
  var pointerId = Blockly.Touch.getTouchIdentifierFromEvent(e);
  // Update the cache
  this.cachedPoints[pointerId] = this.getTouchPoint(e);

  var pointers = Object.keys(this.cachedPoints);
  // If two pointers are down, check for pinch gestures
  if (pointers.length == 2) {
    // Calculate the distance between the two pointers
    var points = {
      x1: this.cachedPoints[pointers[0]].x,
      x2: this.cachedPoints[pointers[1]].x,
      y1: this.cachedPoints[pointers[0]].y,
      y2: this.cachedPoints[pointers[1]].y
    };
    var moveDistance = Math.sqrt( Math.pow( (points.x2 - points.x1), 2 ) + Math.pow( (points.y2 - points.y1), 2 ));
    var startDistance = this.touchStartDistance_;
    var scale = this.touchScale_ = moveDistance / startDistance;
    
    if (this.previousGestureScale_ > 0 && this.previousGestureScale_ < Infinity) {
      var gestureScale = scale - this.previousGestureScale_;
      var delta = gestureScale > 0 ? gestureScale * 5 : gestureScale * 5;
      var workspace = this.startWorkspace_;
      var position = Blockly.utils.mouseToSvg(e, workspace.getParentSvg(), workspace.getInverseScreenCTM());
      workspace.zoom(position.x, position.y, delta);
    }
    this.previousGestureScale_ = scale;
    e.preventDefault();
    this.isMultiTouch_ = true;
  }
};

/**
 * Handle a touch end or pointer end event and end the gesture.
 * @param {!Event} e A touch end, or pointer end event.
 * @package
 */
Blockly.TouchGesture.prototype.handleTouchEnd = function(e) {
  var pointerId = Blockly.Touch.getTouchIdentifierFromEvent(e);
  if (this.cachedPoints[pointerId]) {
    delete this.cachedPoints[pointerId];
  }
  if (Object.keys(this.cachedPoints).length < 2) {
    this.cachedPoints = {};
    this.previousGestureScale_ = 0;
  }
};

/**
 * Helper function returning the current touch point coordinate.
 * @param {!Event} e A touch or pointer event.
 * @return {goog.math.Coordinate} the current touch point coordinate
 * @package
 */
Blockly.TouchGesture.prototype.getTouchPoint = function(e) {
  if (!this.startWorkspace_) {
    return null;
  }
  var metrics = this.startWorkspace_.getMetrics();
  return new goog.math.Coordinate(
    (e.pageX ? e.pageX : e.changedTouches[0].pageX) - metrics.absoluteLeft,
    (e.pageY ? e.pageY : e.changedTouches[0].pageY) - metrics.absoluteTop
  );
};
