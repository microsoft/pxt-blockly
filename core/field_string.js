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
goog.provide('Blockly.FieldString');
goog.require('Blockly.FieldTextInput');
goog.require('goog.math');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
var pxtblocky;
(function (pxtblocky) {
    var FieldString = (function (_super) {
        __extends(FieldString, _super);
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
        function FieldString(text, opt_validator, opt_restrictor) {
            return _super.call(this, text, opt_validator, opt_restrictor) || this;
        }
        FieldString.prototype.init = function () {
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
            });
            this.quoteRight_ = Blockly.utils.createSvgElement('image', {
                'height': this.quoteSize_ + 'px',
                'width': this.quoteSize_ + 'px'
            });
            this.quoteLeft_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'quote0.svg');
            this.quoteRight_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'quote1.svg');
            // Force a reset of the text to add the arrow.
            var text = this.text_;
            this.text_ = null;
            this.setText(text);
        };
        FieldString.prototype.setText = function (text) {
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
        };
        // Position Left
        FieldString.prototype.positionLeft = function (x) {
            if (!this.quoteLeft_) {
                return 0;
            }
            this.quoteLeftX_ = 0;
            var addedWidth = this.quoteSize_;
            this.quoteLeft_.setAttribute('transform', 'translate(' + this.quoteLeftX_ + ',' + this.quoteY_ + ')');
            return addedWidth;
        };
        // Position Right
        FieldString.prototype.positionArrow = function (x) {
            if (!this.quoteRight_) {
                return 0;
            }
            this.quoteRightX_ = x + FieldString.quotePadding / 2;
            var addedWidth = this.quoteSize_ + FieldString.quotePadding;
            if (this.box_) {
                // Bump positioning to the right for a box-type drop-down.
                this.quoteRightX_ += Blockly.BlockSvg.BOX_FIELD_PADDING;
            }
            this.quoteRight_.setAttribute('transform', 'translate(' + this.quoteRightX_ + ',' + this.quoteY_ + ')');
            return addedWidth;
        };
        ;
        return FieldString;
    }(Blockly.FieldTextInput));
    FieldString.quotePadding = 0;
    pxtblocky.FieldString = FieldString;
})(pxtblocky || (pxtblocky = {}));
Blockly.FieldString = pxtblocky.FieldString;
