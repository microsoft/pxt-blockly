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
goog.provide('Blockly.FieldGridPicker');
goog.require('Blockly.FieldDropdown');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.positioning.ClientPosition');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Tooltip');
var pxtblocky;
(function (pxtblocky) {
    var FieldGridPicker = (function (_super) {
        __extends(FieldGridPicker, _super);
        /**
         * Class for an editable dropdown field that arranges elements in a grid.
         * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
         *     for a dropdown list, or a function which generates these options.
         * @param {number} backgroundColour The background colour of the grid menu
         * @param {number} col The number of columns in the grid menu
         * @param {number} width The width of the dropdown menu, in pixels
         * @param {number} itemColour The background colour of each menu item
         * @param {boolean} useTooltips Whether to add tooltips over the elements
         *     in the dropdown menu.
         * @extends {Blockly.FieldDropdown}
         * @constructor
         */
        function FieldGridPicker(menuGenerator, backgroundColour, params) {
            if (backgroundColour === void 0) { backgroundColour = '#000'; }
            var _this = _super.call(this, menuGenerator) || this;
            _this.tooltips_ = [];
            _this.columns_ = parseInt(params.columns) || 4;
            _this.width_ = parseInt(params.width) || 400;
            _this.backgroundColour_ = backgroundColour;
            _this.itemColour_ = params.itemColour || '#fff';
            var tooltipCfg = {
                enabled: params.tooltips == 'true' || false,
                xOffset: parseInt(params.tooltipsXOffset) || 15,
                yOffset: parseInt(params.tooltipsYOffset) || -10
            };
            _this.tooltipConfig_ = tooltipCfg;
            return _this;
        }
        /**
         * Create a dropdown menu under the text.
         * @private
         */
        FieldGridPicker.prototype.showEditor_ = function () {
            var _this = this;
            Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, null);
            this.disposeTooltips();
            var options = this.getOptions_();
            var container = new goog.ui.Control();
            for (var i = 0; i < options.length / this.columns_; i++) {
                var row = this.createRow(i, options);
                container.addChild(row, true);
            }
            // Record windowSize and scrollOffset before adding menu.
            var windowSize = goog.dom.getViewportSize();
            var scrollOffset = goog.style.getViewportPageOffset(document);
            var xy = this.getAbsoluteXY_();
            var borderBBox = this.getScaledBBox_();
            var div = Blockly.WidgetDiv.DIV;
            container.render(div);
            var containerDom = container.getElement();
            containerDom.style.width = this.width_ + 'px';
            containerDom.style.backgroundColor = this.backgroundColour_;
            containerDom.className = 'blocklyGridPickerMenu';
            // Add the tooltips
            var menuItemsDom = containerDom.getElementsByClassName('goog-menuitem');
            var _loop_1 = function (i) {
                var elem = menuItemsDom[i];
                elem.style.borderColor = this_1.backgroundColour_;
                elem.style.backgroundColor = this_1.itemColour_;
                elem.parentElement.className = 'blocklyGridPickerRow';
                if (this_1.tooltipConfig_.enabled) {
                    var tooltip_1 = new goog.ui.Tooltip(elem, options[i][0].alt || options[i][0]);
                    var onShowOld_1 = tooltip_1.onShow;
                    tooltip_1.onShow = function () {
                        onShowOld_1.call(tooltip_1);
                        var newPos = new goog.positioning.ClientPosition(tooltip_1.cursorPosition.x + _this.tooltipConfig_.xOffset, tooltip_1.cursorPosition.y + _this.tooltipConfig_.yOffset);
                        tooltip_1.setPosition(newPos);
                    };
                    tooltip_1.setShowDelayMs(0);
                    tooltip_1.className = 'goog-tooltip blocklyGridPickerTooltip';
                    elem.addEventListener('mousemove', function (e) {
                        var newPos = new goog.positioning.ClientPosition(e.clientX + _this.tooltipConfig_.xOffset, e.clientY + _this.tooltipConfig_.yOffset);
                        tooltip_1.setPosition(newPos);
                    });
                    this_1.tooltips_.push(tooltip_1);
                }
            };
            var this_1 = this;
            for (var i = 0; i < menuItemsDom.length; ++i) {
                _loop_1(i);
            }
            // Record menuSize after adding menu.
            var containerSize = goog.style.getSize(containerDom);
            // Recalculate height for the total content, not only box height.
            containerSize.height = containerDom.scrollHeight;
            containerSize.width = this.width_;
            // Position the menu.
            // Flip menu vertically if off the bottom.
            if (xy.y + containerSize.height + borderBBox.height >=
                windowSize.height + scrollOffset.y) {
                xy.y -= containerSize.height + 2;
            }
            else {
                xy.y += borderBBox.height;
            }
            if (this.sourceBlock_.RTL) {
                xy.x += borderBBox.width;
                xy.x += Blockly.FieldDropdown.CHECKMARK_OVERHANG;
                // Don't go offscreen left.
                if (xy.x < scrollOffset.x + containerSize.width) {
                    xy.x = scrollOffset.x + containerSize.width;
                }
            }
            else {
                xy.x -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;
                // Don't go offscreen right.
                if (xy.x > windowSize.width + scrollOffset.x - containerSize.width) {
                    xy.x = windowSize.width + scrollOffset.x - containerSize.width;
                }
            }
            Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset, this.sourceBlock_.RTL);
            containerDom.focus();
        };
        FieldGridPicker.prototype.createRow = function (row, options) {
            var columns = this.columns_;
            var thisField = this;
            function callback(e) {
                var menu = this;
                var menuItem = e.target;
                if (menuItem) {
                    thisField.onItemSelected(menu, menuItem);
                }
                Blockly.WidgetDiv.hideIfOwner(thisField);
                Blockly.Events.setGroup(false);
                thisField.disposeTooltips();
            }
            var menu = new goog.ui.Menu();
            menu.setRightToLeft(this.sourceBlock_.RTL);
            for (var i = (columns * row); i < Math.min((columns * row) + columns, options.length); i++) {
                var content = options[i][0]; // Human-readable text or image.
                var value = options[i][1]; // Language-neutral value.
                if (typeof content == 'object') {
                    // An image, not text.
                    var image = new Image(content['width'], content['height']);
                    image.src = content['src'];
                    image.alt = content['alt'] || '';
                    content = image;
                }
                var menuItem = new goog.ui.MenuItem(content);
                menuItem.setRightToLeft(this.sourceBlock_.RTL);
                menuItem.setValue(value);
                menuItem.setCheckable(true);
                menuItem.setChecked(value == this.value_);
                menu.addChild(menuItem, true);
            }
            // Listen for mouse/keyboard events.
            goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);
            // Listen for touch events (why doesn't Closure handle this already?).
            function callbackTouchStart(e) {
                var control = this.getOwnerControl(/** @type {Node} */ (e.target));
                // Highlight the menu item.
                control.handleMouseDown(e);
            }
            function callbackTouchEnd(e) {
                var control = this.getOwnerControl(/** @type {Node} */ (e.target));
                // Activate the menu item.
                control.performActionInternal(e);
            }
            menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHSTART, callbackTouchStart);
            menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHEND, callbackTouchEnd);
            return menu;
        };
        /**
         * Disposes the tooltip DOM elements.
         * @private
         */
        FieldGridPicker.prototype.disposeTooltips = function () {
            if (this.tooltips_ && this.tooltips_.length) {
                this.tooltips_.forEach(function (t) { return t.dispose(); });
                this.tooltips_ = [];
            }
        };
        return FieldGridPicker;
    }(Blockly.FieldDropdown));
    pxtblocky.FieldGridPicker = FieldGridPicker;
})(pxtblocky || (pxtblocky = {}));
Blockly.FieldGridPicker = pxtblocky.FieldGridPicker;
