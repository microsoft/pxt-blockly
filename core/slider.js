/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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
 * @fileoverview The slider class used for field sliders
 * @author Chase Mortensen
 */
'use strict';

goog.provide('Blockly.Slider');
    
Blockly.Slider = function() {

    // Set up default values
    this.step_ = 1;

    this.slider = this;
    this.createDom();
    this.setupEvents();
    
}

Blockly.Slider.prototype.setupEvents = function() {
    Blockly.bindEvent_(this.thumb_, "mousedown", this, function(ev) {
        if (this && this.slider) {
            this.slider.mouseDown_ = true;
            if (this.slider.onClickEvent) {
                this.slider.onClickEvent();
            }
        }
    })

    Blockly.bindEvent_(this.element_, "mousedown", this, function(ev) {
        if (this && this.slider) {
            this.slider.mouseDown_ = true;
            if (this.slider.onClickEvent) {
                this.slider.onClickEvent();
            }
            if (this.moveToPoint) {
                this.updatePosition(ev.clientX);
            }
        }
    })

    Blockly.bindEvent_(window, "mouseup", this, function (ev) {
        if (this && this.slider && this.slider.mouseDown_) {
            this.slider.mouseDown_ = false;
        }
    })

    Blockly.bindEvent_(window, "mousemove", this, function(ev) {
        if (this && this.slider && this.slider.mouseDown_) {
            this.updatePosition(ev.clientX);
        }
    })
}

Blockly.Slider.prototype.updatePosition = function(clientX) {
    const rect = (this.slider.element_).getBoundingClientRect();
    let value = clientX - rect.left;
    const sliderWidth = (this.slider.element_).clientWidth;
    const pxPerUnit = (this.slider.max_ - this.slider.min_) / sliderWidth;
    value = value * pxPerUnit;
    if (this.slider.step_ > 1) {
        value = Math.round((value - this.slider.min_) / this.slider.step_) * this.slider.step_ + this.slider.min_;
    } else { // If a step is less than one, multiplying it by the number of notches may result in floating point math errors
        value = Math.round(((value - this.slider.min_) / this.slider.step_) / (Math.round(1000 / this.slider.step_) / 1000)) + this.slider.min_;
    }
    value = Math.min(Math.max(value, this.slider.min_), this.slider.max_);
    this.slider.setValue(value);
    if (this.slider.onChangeEvent) {
        this.slider.onChangeEvent(value);
    }
}

Blockly.Slider.prototype.setVisible = function (visible) {
    this.getElement().style.display = visible ? '' : 'none';
};

Blockly.Slider.prototype.setMinimum = function (min) {
    this.min_ = min;
};

Blockly.Slider.prototype.setMaximum = function (max) {
    this.max_ = max;
};

Blockly.Slider.prototype.setStep = function (step) {
    this.step_ = step;
};

Blockly.Slider.prototype.setMoveToPointEnabled = function (enabled) {
    this.moveToPoint = enabled;
}

Blockly.Slider.prototype.setValue = function (value) {
    this.value_ = value;
    value = Math.min(Math.max(value, this.min_), this.max_)
    var sliderWidth = this.element_.clientWidth;
    var pxPerUnit = sliderWidth / (this.max_ - this.min_);
    value = (value - this.min_) * pxPerUnit - (this.thumb_.clientWidth / 2);
    this.thumb_.style.left = value + "px";
};

Blockly.Slider.prototype.getValue = function () {
    return this.value_;
};

Blockly.Slider.prototype.render = function (parentElement, opt_beforeNode) {
    if (!this.element_) {
        this.createDom();
    }
    parentElement.insertBefore(this.element_, opt_beforeNode || null);
};

Blockly.Slider.prototype.createDom = function () {
    this.element_ = document.createElement('div');
    this.element_.classList.add('slider');
    this.element_.classList.add('slider-horizontal');
    this.thumb_ = document.createElement('div');
    this.thumb_.classList.add('thumb');
    this.thumb_.classList.add('slider-thumb');
    this.element_.appendChild(this.thumb_);
    if (this.onChangeEvent) {
        this.onChangeEvent(this.value_);
    }
};
Blockly.Slider.prototype.getElement = function () {
    return this.element_;
};