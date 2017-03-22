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
goog.provide('Blockly.FieldSlider');

goog.require('Blockly.FieldNumber');
goog.require('goog.math');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');

goog.require('goog.ui.Slider');

namespace pxtblocky {
    //  Class for a slider number input field.
    export class FieldSlider extends Blockly.FieldNumber {

        //  Minimum value 
        private min_: number;
        //  Maximum value 
        private max_: number;
        //  Precision for value 
        private precision_: number;

        private slider_: goog.ui.Slider;

        private changeEventKey_: any;

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
        constructor(value_: any, opt_min?: string, opt_max?: string, opt_precision?: string, opt_validator?: () => void) {
            let value = String(value_);
            super(value, opt_validator);
            this.setConstraints(opt_min, opt_max, opt_precision);
        }

        /**
         * Show the inline free-text editor on top of the text.
         * @private
         */
        showEditor_() {
            FieldSlider.superClass_.showEditor_.call(this, true);
            if (this.max_ == Infinity || this.min_ == -Infinity) {
                return;
            }

            var slider = new goog.ui.Slider();
            /** @type {!HTMLInputElement} */
            this.slider_ = slider;
            slider.setMoveToPointEnabled(true)
            slider.setMinimum(this.min_);
            slider.setMaximum(this.max_);
            slider.setRightToLeft(this.sourceBlock_.RTL);

            // Position the palette to line up with the field.
            // Record windowSize and scrollOffset before adding the palette.
            var windowSize = goog.dom.getViewportSize();
            var scrollOffset = goog.style.getViewportPageOffset(document);
            var xy = this.getAbsoluteXY_();
            var borderBBox = this.getScaledBBox_();
            var div = Blockly.WidgetDiv.DIV;

            slider.render(div);

            var value = parseFloat(this.getValue());
            value = isNaN(value) ? 0 : value;
            slider.setValue(value);

            // Configure event handler.
            var thisField = this;
            this.changeEventKey_ = goog.events.listen(slider as any,
                goog.ui.Component.EventType.CHANGE,
                function (event) {
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
        }

        onHtmlInputChange_(e: any) {
            super.onHtmlInputChange_.call(this);
            if (this.slider_) {
                this.slider_.setValue(parseFloat(this.getValue()))
            }
        }

        /**
         * Close the slider if this input is being deleted.
         */
        public dispose() {
            Blockly.WidgetDiv.hideIfOwner(this);
            super.dispose();
        }
    }
}

(Blockly as any).FieldSlider = pxtblocky.FieldSlider;