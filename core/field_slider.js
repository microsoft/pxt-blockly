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
         * @param {Function=} opt_validator An optional function that is called
         *     to validate any constraints on what the user entered.  Takes the new
         *     text as an argument and returns either the accepted text, a replacement
         *     text, or null to abort the change.
         * @extends {Blockly.FieldNumber}
         * @constructor
         */
        function FieldSlider(value_, opt_min, opt_max, opt_precision, opt_validator) {
            var _this = _super.call(this, String(value_), opt_validator) || this;
            _this.min_ = parseFloat(opt_min);
            _this.max_ = parseFloat(opt_max);
            _this.precision_ = parseFloat(opt_precision);
            return _this;
        }
        FieldSlider.prototype.init = function () {
            Blockly.FieldTextInput.superClass_.init.call(this);
        };
        /**
         * Show the inline free-text editor on top of the text.
         * @private
         */
        FieldSlider.prototype.showEditor_ = function () {
            FieldSlider.superClass_.showEditor_.call(this, true);
            if (this.max_ == Infinity || this.min_ == -Infinity) {
                return;
            }
            this.showSlider_();
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
            Blockly.DropDownDiv.setColour(Blockly.Colours.numPadBackground, Blockly.Colours.numPadBorder);
            contentDiv.style.width = FieldSlider.SLIDER_WIDTH + 'px';
            this.position_();
        };
        ;
        FieldSlider.prototype.addSlider_ = function (contentDiv) {
            var slider = new goog.ui.Slider();
            /** @type {!HTMLInputElement} */
            this.slider_ = slider;
            slider.setMoveToPointEnabled(true);
            slider.setMinimum(this.min_);
            slider.setMaximum(this.max_);
            slider.setRightToLeft(this.sourceBlock_.RTL);
            slider.render(contentDiv);
            var value = parseFloat(this.getValue());
            value = isNaN(value) ? 0 : value;
            slider.setValue(value);
            // Configure event handler.
            var thisField = this;
            this.changeEventKey_ = goog.events.listen(slider, goog.ui.Component.EventType.CHANGE, function (event) {
                var val = event.target.getValue() || 0;
                if (thisField.sourceBlock_) {
                    // Call any validation function, and allow it to override.
                    val = thisField.callValidator(val);
                }
                if (val !== null) {
                    thisField.setValue(val);
                    var htmlInput = Blockly.FieldTextInput.htmlInput_;
                    htmlInput.value = val;
                }
            });
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
            Blockly.WidgetDiv.hideIfOwner(this);
            _super.prototype.dispose.call(this);
        };
        return FieldSlider;
    }(Blockly.FieldNumber));
    FieldSlider.SLIDER_WIDTH = 168;
    pxtblocky.FieldSlider = FieldSlider;
})(pxtblocky || (pxtblocky = {}));
Blockly.FieldSlider = pxtblocky.FieldSlider;
