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
 * @fileoverview Dropdown input field that arranges elements in a grid instead of a vertical list.
 */
/// <reference path="../localtypings/blockly.d.ts" />
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
goog.provide('Blockly.FieldIconDropdown');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.DropDownDiv');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.positioning.ClientPosition');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Tooltip');
var pxtblocky;
(function (pxtblocky) {
    var FieldIconDropdown = (function (_super) {
        __extends(FieldIconDropdown, _super);
        /**
         * Class for an editable dropdown field that arranges elements in a grid.
         * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
         *     for a dropdown list, or a function which generates these options.
         * @param {Number} columns
         *     in the dropdown menu.
         * @extends {Blockly.FieldDropdown}
         * @constructor
         */
        function FieldIconDropdown(menuGenerator, params) {
            var _this = _super.call(this, menuGenerator) || this;
            _this.savedPrimary_ = null;
            if (params) {
                _this.columns_ = parseInt(params['columns']);
                _this.width_ = parseInt(params['width']);
                _this.itemWidth_ = parseInt(params['itemWidth']);
                _this.itemHeight_ = parseInt(params['itemHeight']);
                if (!_this.itemHeight_)
                    _this.itemHeight_ = _this.itemWidth_;
            }
            _this.addArgType('icondropdown');
            return _this;
        }
        /**
         * Called when the field is placed on a block.
         * @param {Block} block The owning block.
         */
        FieldIconDropdown.prototype.init = function () {
            // Render the arrow icon
            // Fixed sizes in px. Saved for creating the flip transform of the menu renders above the button.
            var arrowSize = 12;
            /** @type {Number} */
            this.arrowX_ = 18;
            /** @type {Number} */
            this.arrowY_ = 10;
            /** @type {Element} */
            this.arrowIcon_ = Blockly.utils.createSvgElement('image', {
                'height': arrowSize + 'px',
                'width': arrowSize + 'px',
                'transform': 'translate(' + this.arrowX_ + ',' + this.arrowY_ + ')'
            });
            this.arrowIcon_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'dropdown-arrow.svg');
            _super.prototype.init.call(this);
        };
        ;
        /**
         * Callback for when a button is clicked inside the drop-down.
         * Should be bound to the FieldIconMenu.
         * @param {Event} e DOM event for the click/touch
         * @private
         */
        FieldIconDropdown.prototype.buttonClick_ = function (e) {
            var value = e.target.getAttribute('data-value');
            this.setValue(value);
            Blockly.DropDownDiv.hide();
        };
        ;
        /**
         * Create a dropdown menu under the text.
         * @private
         */
        FieldIconDropdown.prototype.showEditor_ = function () {
            // If there is an existing drop-down we own, this is a request to hide the drop-down.
            if (Blockly.DropDownDiv.hideIfOwner(this)) {
                return;
            }
            // If there is an existing drop-down someone else owns, hide it immediately and clear it.
            Blockly.DropDownDiv.hideWithoutAnimation();
            Blockly.DropDownDiv.clearContent();
            // Populate the drop-down with the icons for this field.
            var contentDiv = Blockly.DropDownDiv.getContentDiv();
            // Accessibility properties
            contentDiv.setAttribute('role', 'menu');
            contentDiv.setAttribute('aria-haspopup', 'true');
            var options = this.getOptions();
            var itemWidth = 0;
            for (var i = 0; i < options.length; i++) {
                var icon = options[i][0]; // Human-readable text or image.
                var value = options[i][1]; // Language-neutral value.
                // Icons with the type property placeholder take up space but don't have any functionality
                // Use for special-case layouts
                if (icon.type == 'placeholder') {
                    var placeholder = document.createElement('span');
                    placeholder.setAttribute('class', 'blocklyDropDownPlaceholder');
                    placeholder.style.width = (this.itemWidth_ ? this.itemWidth_ : icon.width) + 'px';
                    placeholder.style.height = (this.itemHeight_ ? this.itemHeight_ : icon.height) + 'px';
                    contentDiv.appendChild(placeholder);
                    continue;
                }
                var button = document.createElement('button');
                button.setAttribute('id', ':' + i); // For aria-activedescendant
                button.setAttribute('role', 'menuitem');
                button.setAttribute('class', 'blocklyDropDownButton');
                button.title = icon.alt;
                button.style.width = icon.width + 'px';
                button.style.height = icon.height + 'px';
                var backgroundColor = this.sourceBlock_.getColour();
                if (icon.value == this.getValue()) {
                    // This icon is selected, show it in a different colour
                    backgroundColor = this.sourceBlock_.getColourTertiary();
                    button.setAttribute('aria-selected', 'true');
                }
                button.style.backgroundColor = backgroundColor;
                button.style.borderColor = this.sourceBlock_.getColourTertiary();
                Blockly.bindEvent_(button, 'click', this, this.buttonClick_);
                Blockly.bindEvent_(button, 'mouseup', this, this.buttonClick_);
                // These are applied manually instead of using the :hover pseudoclass
                // because Android has a bad long press "helper" menu and green highlight
                // that we must prevent with ontouchstart preventDefault
                Blockly.bindEvent_(button, 'mousedown', button, function (e) {
                    this.setAttribute('class', 'blocklyDropDownButton blocklyDropDownButtonHover');
                    e.preventDefault();
                });
                Blockly.bindEvent_(button, 'mouseover', button, function () {
                    this.setAttribute('class', 'blocklyDropDownButton blocklyDropDownButtonHover');
                    contentDiv.setAttribute('aria-activedescendant', this.id);
                });
                Blockly.bindEvent_(button, 'mouseout', button, function () {
                    this.setAttribute('class', 'blocklyDropDownButton');
                    contentDiv.removeAttribute('aria-activedescendant');
                });
                var buttonImg = document.createElement('img');
                buttonImg.src = icon.src;
                //buttonImg.alt = icon.alt;
                // Upon click/touch, we will be able to get the clicked element as e.target
                // Store a data attribute on all possible click targets so we can match it to the icon.
                button.setAttribute('data-value', icon.value);
                buttonImg.setAttribute('data-value', icon.value);
                button.appendChild(buttonImg);
                contentDiv.appendChild(button);
                if (!itemWidth)
                    itemWidth = icon.width;
                if (!itemWidth)
                    itemWidth = buttonImg.width;
            }
            if (this.width_) {
                contentDiv.style.width = this.width_ + "px";
            }
            else if (itemWidth && this.columns_) {
                contentDiv.style.width = ((itemWidth + 8) * this.columns_) + "px";
            }
            else {
                contentDiv.style.width = pxtblocky.FieldGridPicker.DROPDOWN_WIDTH + 'px';
            }
            Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), this.sourceBlock_.getColourTertiary());
            //Blockly.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());
            // Update source block colour to look selected
            this.savedPrimary_ = this.sourceBlock_.getColour();
            this.sourceBlock_.setColour(this.sourceBlock_.getColourSecondary(), this.sourceBlock_.getColourSecondary(), this.sourceBlock_.getColourTertiary());
            var scale = this.sourceBlock_.workspace.scale;
            // Offset for icon-type horizontal blocks.
            var secondaryYOffset = (-(Blockly.BlockSvg.MIN_BLOCK_Y * scale) - (Blockly.BlockSvg.FIELD_Y_OFFSET * scale));
            var renderedPrimary = Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_, this.onHide_.bind(this), secondaryYOffset);
            if (!renderedPrimary) {
                // Adjust for rotation
                var arrowX = this.arrowX_ + Blockly.DropDownDiv.ARROW_SIZE / 1.5 + 1;
                var arrowY = this.arrowY_ + Blockly.DropDownDiv.ARROW_SIZE / 1.5;
                // Flip the arrow on the button
                this.arrowIcon_.setAttribute('transform', 'translate(' + arrowX + ',' + arrowY + ') rotate(180)');
            }
        };
        /**
         * Callback for when the drop-down is hidden.
         */
        FieldIconDropdown.prototype.onHide_ = function () {
            // Reset the button colour and clear accessibility properties
            // Only attempt to do this reset if sourceBlock_ is not disposed.
            // It could become disposed before an onHide_, for example,
            // when a block is dragged from the flyout.
            if (this.sourceBlock_) {
                this.sourceBlock_.setColour(this.savedPrimary_, this.sourceBlock_.getColourSecondary(), this.sourceBlock_.getColourTertiary());
            }
            Blockly.DropDownDiv.content_.removeAttribute('role');
            Blockly.DropDownDiv.content_.removeAttribute('aria-haspopup');
            Blockly.DropDownDiv.content_.removeAttribute('aria-activedescendant');
            // Unflip the arrow if appropriate
            this.arrowIcon_.setAttribute('transform', 'translate(' + this.arrowX_ + ',' + this.arrowY_ + ')');
        };
        ;
        return FieldIconDropdown;
    }(Blockly.FieldDropdown));
    /**
     * Fixed width of the drop-down, in px. Icon buttons will flow inside this width.
     * @type {number}
     * @const
     */
    FieldIconDropdown.DROPDOWN_WIDTH = 168;
    pxtblocky.FieldIconDropdown = FieldIconDropdown;
})(pxtblocky || (pxtblocky = {}));
Blockly.FieldIconDropdown = pxtblocky.FieldIconDropdown;
