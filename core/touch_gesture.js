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
 * @fileoverview The class representing an in-progress touch gesture, usually a drag
 * or a tap.
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
// TODO: Consider touchcancel/pointercancel.

/**
 * Class for one gesture.
 * @param {!Event} e The event that kicked off this gesture.
 * @param {!Blockly.WorkspaceSvg} creatorWorkspace The workspace that created
 *     this gesture and has a reference to it.
 * @constructor
 */
Blockly.TouchGesture = function (e, creatorWorkspace) {
  Blockly.TouchGesture.superClass_.constructor.call(this, e,
    creatorWorkspace);

};
goog.inherits(Blockly.TouchGesture, Blockly.Gesture);


/**
 * Sever all links from this object.
 * @package
 */
Blockly.TouchGesture.prototype.dispose = function () {
  Blockly.TouchGesture.superClass_.dispose.call(this);

};


Blockly.TouchGesture.prototype.getTwoTouchPointData_ = function(e) {
  var points = false, touches = e.touches;
  if(touches.length === 2){
    points = {
      x1: touches[0].pageX,
      y1: touches[0].pageY,
      x2: touches[1].pageX,
      y2: touches[1].pageY
    }
    points.centerX = (points.x1 + points.x2) / 2;
    points.centerY = (points.y1 + points.y2) / 2;
    return points;
  }
  return points;
}

