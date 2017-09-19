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
goog.provide('Blockly.FieldString');

goog.require('Blockly.FieldTextInput');
goog.require('goog.math');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');

namespace pxtblocky {
    export class FieldString extends Blockly.FieldTextInput {

        private quoteSize_: number;
        private quoteLeftX_: number;
        private quoteRightX_: number;
        private quoteY_: number;

        private quoteLeft_: SVGImageElement;
        private quoteRight_: SVGImageElement;

        static quotePadding = 0;

        /**
         * Class for an editable text field.
         * @param {string} text The initial content of the field.
         * @param {Function=} opt_validator An optional function that is called
         *     to validate any constraints on what the user entered.  Takes the new
         *     text as an argument and returns either the accepted text, a replacement
         *     text, or null to abort the change.
         * @param {RegExp=} opt_restrictor An optional regular expression to restrict
         *     typed text to. Text that doesn't match the restrictor will never show
         *     in the text field.
         * @extends {Blockly.Field}
         * @constructor
         */
        constructor(text: any, opt_validator?: () => void, opt_restrictor?: () => void) {
            super(text, opt_validator, opt_restrictor);
        }

        init() {
            Blockly.FieldTextInput.superClass_.init.call(this);

            // Add quotes around the string
            // Positioned on render, after text size is calculated.
            this.quoteSize_ = 12;
            this.quoteLeftX_ = 0;
            this.quoteRightX_ = 0;
            this.quoteY_ = 8;
            this.quoteLeft_ = Blockly.utils.createSvgElement('image', {
                'height': this.quoteSize_ + 'px',
                'width': this.quoteSize_ + 'px'
            }) as SVGImageElement;
            this.quoteRight_ = Blockly.utils.createSvgElement('image', {
                'height': this.quoteSize_ + 'px',
                'width': this.quoteSize_ + 'px'
            }) as SVGImageElement;
            this.quoteLeft_.setAttributeNS('http://www.w3.org/1999/xlink',
                'xlink:href', (Blockly as any).mainWorkspace.options.pathToMedia + 'quote0.svg');
            this.quoteRight_.setAttributeNS('http://www.w3.org/1999/xlink',
                'xlink:href', (Blockly as any).mainWorkspace.options.pathToMedia + 'quote1.svg');

            // Force a reset of the text to add the arrow.
            var text = this.text_;
            this.text_ = null;
            this.setText(text);
        }

        setText(text: string) {
            if (text === null || text === this.text_) {
                // No change if null.
                return;
            }
            this.text_ = text;
            if (this.textElement_) {
                this.textElement_.parentNode.appendChild(this.quoteLeft_);
            }
            this.updateTextNode_();
            if (this.textElement_) {
                this.textElement_.parentNode.appendChild(this.quoteRight_);
            }
            if (this.sourceBlock_ && this.sourceBlock_.rendered) {
                this.sourceBlock_.render();
                this.sourceBlock_.bumpNeighbours_();
            }
        }

        // Position Left
        positionLeft(x: number) {
            if (!this.quoteLeft_) {
              return 0;
            }
            this.quoteLeftX_ = 0;
            var addedWidth = this.quoteSize_;
            this.quoteLeft_.setAttribute('transform',
                'translate(' + this.quoteLeftX_ + ',' + this.quoteY_ + ')'
            );
            return addedWidth;
        }

        // Position Right
        positionArrow(x: number) {
            if (!this.quoteRight_) {
              return 0;
            }
            this.quoteRightX_ = x + FieldString.quotePadding / 2;
            var addedWidth = this.quoteSize_ + FieldString.quotePadding;
            if (this.box_) {
              // Bump positioning to the right for a box-type drop-down.
              this.quoteRightX_ += (Blockly as any).BlockSvg.BOX_FIELD_PADDING;
            }
            this.quoteRight_.setAttribute('transform',
              'translate(' + this.quoteRightX_ + ',' + this.quoteY_ + ')'
            );
            return addedWidth;
          };
    }
}

(Blockly as any).FieldString = pxtblocky.FieldString;