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

        private step_: number;
        private labelText_: string;
        private sliderColor_: string;

        private slider_: goog.ui.Slider;

        private readout_: any;

        private static changeEventKey_: any;
        private static focusEventKey_: any;

        public static SLIDER_WIDTH = 168;

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
        constructor(value_: any, opt_min?: string, opt_max?: string, opt_precision?: string, opt_step?: string, opt_labelText?: string, opt_validator?: () => void) {
            super(String(value_), opt_validator);
            this.min_ = parseFloat(opt_min);
            this.max_ = parseFloat(opt_max);
            this.step_ = parseFloat(opt_step);
            this.labelText_ = opt_labelText;
            this.precision_ = parseFloat(opt_precision);
        }

        setMinMax(min: string, max: string, step: string) {
            this.min_ = parseFloat(min);
            this.max_ = parseFloat(max);
            this.step_ = parseFloat(step) || undefined;
        }

        setLabel(labelText: string) {
            if (labelText != undefined) this.labelText_ = labelText;
        }

        setColor(color: string) {
            if (color != undefined) this.sliderColor_ = color;
        }

        init() {
            Blockly.FieldTextInput.superClass_.init.call(this);
            this.setValue(this.getValue());
        }

        /**
         * Show the inline free-text editor on top of the text.
         * @private
         */
        showEditor_() {
            FieldSlider.superClass_.showEditor_.call(this, false);
            if (this.max_ == Infinity || this.min_ == -Infinity) {
                return;
            }

            this.showSlider_();

            this.setValue(this.getValue());
        }

        /**
         * Show the slider.
         * @private
         */
        private showSlider_() {
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

            if (this.slider_) this.slider_.setVisible(true)
        };

        private addSlider_(contentDiv: HTMLElement) {
            if (this.labelText_) {
                let elements = this.createLabelDom_(this.labelText_);
                contentDiv.appendChild(elements[0]);
                this.readout_ = elements[1];
            }
            this.slider_ = new goog.ui.Slider();
            this.slider_.setMoveToPointEnabled(false);
            this.slider_.setMinimum(this.min_);
            this.slider_.setMaximum(this.max_);
            if (this.step_) this.slider_.setUnitIncrement(this.step_);
            this.slider_.setRightToLeft(this.sourceBlock_.RTL);

            var value = parseFloat(this.getValue());
            value = isNaN(value) ? 0 : value;
            this.slider_.setValue(value);

            this.slider_.render(contentDiv);

            // Configure event handler.
            var thisField = this;
            FieldSlider.changeEventKey_ = goog.events.listen(this.slider_ as any,
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
                        htmlInput.focus();
                    }
                });

            FieldSlider.focusEventKey_ = goog.events.listen(this.slider_.getElement() as any,
                goog.ui.Component.EventType.FOCUS,
                (event: any) => {
                    // Switch focus to the HTML input field
                    let htmlInput = Blockly.FieldTextInput.htmlInput_;
                    htmlInput.focus();
                })
        }

        private createLabelDom_(labelText: string) {
            let labelContainer = document.createElement('div');
            labelContainer.setAttribute('class', 'blocklyFieldSliderLabel');
            let readout = document.createElement('span');
            readout.setAttribute('class', 'blocklyFieldSliderReadout');
            let label = document.createElement('span');
            label.setAttribute('class', 'blocklyFieldSliderLabelText');
            label.innerHTML = labelText;
            labelContainer.appendChild(label);
            labelContainer.appendChild(readout);
            return [labelContainer, readout];
        }

        setValue(value: string) {
            super.setValue(value);
            this.updateSliderHandles_();
            this.updateDom_();
        }
        
        updateDom_() {
            if (this.slider_ && this.readout_) {
                // Update the slider background
                this.setBackground_(this.slider_.getElement());
                this.setReadout_(this.readout_, this.getValue());
            }
        };

        setBackground_(slider: Element) {
            if (this.sliderColor_)
                goog.style.setStyle(slider, 'background', this.sliderColor_);
            else if (this.sourceBlock_.isShadow() && this.sourceBlock_.parentBlock_)
                goog.style.setStyle(slider, 'background', this.sourceBlock_.parentBlock_.getColourTertiary());
        }

        setReadout_(readout: Element, value: string) {
            readout.innerHTML = value;
        }

        updateSliderHandles_() {
            if (this.slider_) {
                this.slider_.setValue(parseFloat(this.getValue()));
            }
        }

        onHtmlInputChange_(e: any) {
            super.onHtmlInputChange_.call(this, e);
            if (this.slider_) {
                this.slider_.setValue(parseFloat(this.getValue()))
            }
        }

        /**
         * Close the slider if this input is being deleted.
         */
        public dispose() {
            if (FieldSlider.changeEventKey_) {
                goog.events.unlistenByKey(FieldSlider.changeEventKey_);
            }
            if (FieldSlider.focusEventKey_) {
                goog.events.unlistenByKey(FieldSlider.focusEventKey_);
            }
            Blockly.Events.setGroup(false);
            super.dispose();
        }
    }
}

(Blockly as any).FieldSlider = pxtblocky.FieldSlider;