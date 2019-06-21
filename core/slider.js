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
 * @fileoverview The slider class used for field sliders
 * @author Chase Mortensen
 */
'use strict';

goog.provide('Blockly.Slider');

/**
 * Class for a slider.
 * @constructor
 */
Blockly.Slider = function() {
    this.createDom();
    this.mouseDownWrapper = Blockly.bindEvent_(this.element_, "mousedown", this, this.onMouseDown);
}

/**
 * The value held by the slider.
 * @type {number}
 * @private
 */
Blockly.Slider.prototype.value_ = 0;

/**
 * The minimum value set by the slider.
 * @type {number}
 * @private
 */
Blockly.Slider.prototype.min_ = 0;

/**
 * The maximum value set by the slider.
 * @type {number}
 * @private
 */
Blockly.Slider.prototype.max_ = 100;

/**
 * Slider step (The smallest difference of values obtained using the slider).
 * @type {number}
 * @private
 */
Blockly.Slider.prototype.step_ = 1;

/**
 * Begins the mouse dragging
 * @param {!Event} e Mouse move event.
 */
Blockly.Slider.prototype.onMouseDown = function(e) {
    this.updatePosition(e.clientX);
    this.mouseUpWrapper = Blockly.bindEvent_(window, "mouseup", this, this.onMouseUp);
    this.mouseMoveWrapper = Blockly.bindEvent_(window, "mousemove", this, this.onMouseMove);
}

/**
 * Set the slider value to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.Slider.prototype.onMouseMove = function(e) {
    this.updatePosition(e.clientX);
}

/**
 * Ends the mouse dragging
 * @param {!Event} e Mouse move event.
 */
Blockly.Slider.prototype.onMouseUp = function() {
    Blockly.unbindEvent_(this.mouseUpWrapper);
    Blockly.unbindEvent_(this.mouseMoveWrapper);
}

/**
 * Updates the position of slider based on the given coordinate
 * @param {!number} clientX The x coordinate of the mouse
 */
Blockly.Slider.prototype.updatePosition = function(clientX) {
    var rect = this.element_.getBoundingClientRect();
    var value = clientX - rect.left;
    var sliderWidth = (this.element_).clientWidth;
    var pxPerUnit = (this.max_ - this.min_) / sliderWidth;
    value = value * pxPerUnit;
    if (this.step_ > 1) {
        value = Math.round((value - this.min_) / this.step_) * this.step_ + this.min_;
    } else { // If a step is less than one, multiplying it by the number of notches may result in floating point math errors
        value = Math.round(((value - this.min_) / this.step_) / (Math.round(1000 / this.step_) / 1000)) + this.min_;
    }
    value = Math.min(Math.max(value, this.min_), this.max_);
    this.setValue(value);
    if (this.onChangeEvent) {
        this.onChangeEvent(value);
    }
}

/**
 * Sets whether or not the slider is visible
 * @param {boolean} visible Whether or not the slider is visible
 */
Blockly.Slider.prototype.setVisible = function (visible) {
    this.getElement().style.display = visible ? '' : 'none';
};

/**
 * Sets the minimum value obtained using the slider
 * @param {number} min The minimum value
 */
Blockly.Slider.prototype.setMinimum = function (min) {
    this.min_ = min;
};

/**
 * Sets the maximum value obtained using the slider
 * @param {number} max The maximum value
 */
Blockly.Slider.prototype.setMaximum = function (max) {
    this.max_ = max;
};

/**
 * Sets the step of the slider
 * @param {number} step The step value for the slider
 */
Blockly.Slider.prototype.setStep = function (step) {
    this.step_ = step;
};

/**
 * Sets the value of the slider
 * If the given value is greater than the max or less than the min, the slider 
 * will be shown as clamped to that side, but the value of the slider will remain unchanged
 * @param {!number} value The value for the slider
 */
Blockly.Slider.prototype.setValue = function (value) {
    this.value_ = value;
    value = Math.min(Math.max(value, this.min_), this.max_)
    var sliderWidth = this.element_.clientWidth;
    var pxPerUnit = sliderWidth / (this.max_ - this.min_);
    value = (value - this.min_) * pxPerUnit - (this.thumb_.clientWidth / 2);
    this.thumb_.style.left = value + "px";
};

/**
 * Gets the current value of the slider
 * If the given value is greater than the max or less than the min, the slider 
 * will be shown as clamped to that side, but the value of the slider will remain unchanged
 * @return {number} value The value for the slider
 */
Blockly.Slider.prototype.getValue = function () {
    return this.value_;
};

/**
 * Renders the slider to the given element
 * @param {!HTMLElement} the element the slider is to added to
 */
Blockly.Slider.prototype.render = function (parentElement) {
    if (!this.element_) {
        this.createDom();
    }
    parentElement.appendChild(this.element_);
};

/**
 * Create DOM elements for this slider.
 */
Blockly.Slider.prototype.createDom = function () {
    this.element_ = document.createElement('div');
    Blockly.utils.addClass(this.element_, 'slider');
    Blockly.utils.addClass(this.element_, 'slider-horizontal');
    this.thumb_ = document.createElement('div');
    Blockly.utils.addClass(this.thumb_, 'thumb');
    Blockly.utils.addClass(this.thumb_, 'slider-thumb');
    this.element_.appendChild(this.thumb_);
    if (this.onChangeEvent) {
        this.onChangeEvent(this.value_);
    }
};

/**
 * Gets the current element of the slider.
 * @return {HTMLElement}
 */
Blockly.Slider.prototype.getElement = function () {
    return this.element_;
};