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
 * @fileoverview Number slider input field.
 */
/// <reference path="../localtypings/blockly.d.ts" />
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
goog.provide('Blockly.FieldSlider');
goog.require('Blockly.FieldNumber');
goog.require('goog.math');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.Slider');
var pxtblocky;
(function (pxtblocky) {
    //  Class for a slider number input field.
    var FieldSlider = (function (_super) {
        __extends(FieldSlider, _super);
        /**
         * Class for an editable number field.
         * @param {number|string} value The initial content of the field.
         * @param {number|string|undefined} opt_min Minimum value.
         * @param {number|string|undefined} opt_max Maximum value.
         * @param {number|string|undefined} opt_precision Precision for value.
         * @param {number|string|undefined} opt_labelText Label text
         * @param {Function=} opt_validator An optional function that is called
         *     to validate any constraints on what the user entered.  Takes the new
         *     text as an argument and returns either the accepted text, a replacement
         *     text, or null to abort the change.
         * @extends {Blockly.FieldNumber}
         * @constructor
         */
        function FieldSlider(value_, opt_min, opt_max, opt_precision, opt_step, opt_labelText, opt_validator) {
            var _this = _super.call(this, String(value_), opt_validator) || this;
            _this.min_ = parseFloat(opt_min);
            _this.max_ = parseFloat(opt_max);
            _this.step_ = parseFloat(opt_step);
            _this.labelText_ = opt_labelText;
            _this.precision_ = parseFloat(opt_precision);
            return _this;
        }
        FieldSlider.prototype.setMinMax = function (min, max, step) {
            this.min_ = parseFloat(min);
            this.max_ = parseFloat(max);
            this.step_ = parseFloat(step) || undefined;
        };
        FieldSlider.prototype.setLabel = function (labelText) {
            if (labelText != undefined)
                this.labelText_ = labelText;
        };
        FieldSlider.prototype.setColor = function (color) {
            if (color != undefined)
                this.sliderColor_ = color;
        };
        FieldSlider.prototype.init = function () {
            Blockly.FieldTextInput.superClass_.init.call(this);
            this.setValue(this.getValue());
        };
        /**
         * Show the inline free-text editor on top of the text.
         * @private
         */
        FieldSlider.prototype.showEditor_ = function () {
            FieldSlider.superClass_.showEditor_.call(this, false);
            if (this.max_ == Infinity || this.min_ == -Infinity) {
                return;
            }
            this.showSlider_();
            this.setValue(this.getValue());
        };
        /**
         * Show the slider.
         * @private
         */
        FieldSlider.prototype.showSlider_ = function () {
            // If there is an existing drop-down someone else owns, hide it immediately
            // and clear it.
            Blockly.DropDownDiv.hideWithoutAnimation();
            Blockly.DropDownDiv.clearContent();
            var contentDiv = Blockly.DropDownDiv.getContentDiv();
            // Accessibility properties
            contentDiv.setAttribute('role', 'menu');
            contentDiv.setAttribute('aria-haspopup', 'true');
            this.addSlider_(contentDiv);
            // Set colour and size of drop-down
            Blockly.DropDownDiv.setColour('#ffffff', '#dddddd');
            Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);
            //contentDiv.style.width = FieldSlider.SLIDER_WIDTH + 'px';
            if (this.slider_)
                this.slider_.setVisible(true);
        };
        ;
        FieldSlider.prototype.addSlider_ = function (contentDiv) {
            if (this.labelText_) {
                var elements = this.createLabelDom_(this.labelText_);
                contentDiv.appendChild(elements[0]);
                this.readout_ = elements[1];
            }
            this.slider_ = new goog.ui.Slider();
            this.slider_.setMoveToPointEnabled(false);
            this.slider_.setMinimum(this.min_);
            this.slider_.setMaximum(this.max_);
            if (this.step_)
                this.slider_.setUnitIncrement(this.step_);
            this.slider_.setRightToLeft(this.sourceBlock_.RTL);
            var value = parseFloat(this.getValue());
            value = isNaN(value) ? 0 : value;
            this.slider_.setValue(value);
            this.slider_.render(contentDiv);
            // Configure event handler.
            var thisField = this;
            FieldSlider.changeEventKey_ = goog.events.listen(this.slider_, goog.ui.Component.EventType.CHANGE, function (event) {
                var val = event.target.getValue() || 0;
                if (thisField.sourceBlock_) {
                    // Call any validation function, and allow it to override.
                    val = thisField.callValidator(val);
                }
                if (val !== null) {
                    thisField.setValue(val);
                    var htmlInput = Blockly.FieldTextInput.htmlInput_;
                    htmlInput.value = val;
                    htmlInput.focus();
                }
            });
            FieldSlider.focusEventKey_ = goog.events.listen(this.slider_.getElement(), goog.ui.Component.EventType.FOCUS, function (event) {
                // Switch focus to the HTML input field
                var htmlInput = Blockly.FieldTextInput.htmlInput_;
                htmlInput.focus();
            });
        };
        FieldSlider.prototype.createLabelDom_ = function (labelText) {
            var labelContainer = document.createElement('div');
            labelContainer.setAttribute('class', 'blocklyFieldSliderLabel');
            var readout = document.createElement('span');
            readout.setAttribute('class', 'blocklyFieldSliderReadout');
            var label = document.createElement('span');
            label.setAttribute('class', 'blocklyFieldSliderLabelText');
            label.innerHTML = labelText;
            labelContainer.appendChild(label);
            labelContainer.appendChild(readout);
            return [labelContainer, readout];
        };
        FieldSlider.prototype.setValue = function (value) {
            _super.prototype.setValue.call(this, value);
            this.updateSliderHandles_();
            this.updateDom_();
        };
        FieldSlider.prototype.updateDom_ = function () {
            if (this.slider_ && this.readout_) {
                // Update the slider background
                this.setBackground_(this.slider_.getElement());
                this.setReadout_(this.readout_, this.getValue());
            }
        };
        ;
        FieldSlider.prototype.setBackground_ = function (slider) {
            if (this.sliderColor_)
                goog.style.setStyle(slider, 'background', this.sliderColor_);
            else if (this.sourceBlock_.isShadow() && this.sourceBlock_.parentBlock_)
                goog.style.setStyle(slider, 'background', this.sourceBlock_.parentBlock_.getColourTertiary());
        };
        FieldSlider.prototype.setReadout_ = function (readout, value) {
            readout.innerHTML = value;
        };
        FieldSlider.prototype.updateSliderHandles_ = function () {
            if (this.slider_) {
                this.slider_.setValue(parseFloat(this.getValue()));
            }
        };
        FieldSlider.prototype.onHtmlInputChange_ = function (e) {
            _super.prototype.onHtmlInputChange_.call(this, e);
            if (this.slider_) {
                this.slider_.setValue(parseFloat(this.getValue()));
            }
        };
        /**
         * Close the slider if this input is being deleted.
         */
        FieldSlider.prototype.dispose = function () {
            if (FieldSlider.changeEventKey_) {
                goog.events.unlistenByKey(FieldSlider.changeEventKey_);
            }
            if (FieldSlider.focusEventKey_) {
                goog.events.unlistenByKey(FieldSlider.focusEventKey_);
            }
            Blockly.Events.setGroup(false);
            _super.prototype.dispose.call(this);
        };
        return FieldSlider;
    }(Blockly.FieldNumber));
    FieldSlider.SLIDER_WIDTH = 168;
    pxtblocky.FieldSlider = FieldSlider;
})(pxtblocky || (pxtblocky = {}));
Blockly.FieldSlider = pxtblocky.FieldSlider;
