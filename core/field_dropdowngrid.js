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
goog.provide('Blockly.FieldDropdownGrid');
goog.require('Blockly.FieldDropdown');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.positioning.ClientPosition');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Tooltip');
var PxtFields;
(function (PxtFields) {
    var FieldDropdownGrid = (function (_super) {
        __extends(FieldDropdownGrid, _super);
        function FieldDropdownGrid(optionsValues, col, width, useTooltips) {
            if (col === void 0) { col = 2; }
            if (width === void 0) { width = 800; }
            if (useTooltips === void 0) { useTooltips = true; }
            var _this = _super.call(this, optionsValues) || this;
            _this.tooltips_ = [];
            _this.columns_ = col;
            _this.menuWidth_ = width;
            _this.useTooltips_ = useTooltips;
            return _this;
        }
        FieldDropdownGrid.prototype.showEditor_ = function () {
            Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, null);
            var thisField = this;
            this.disposeTooltips();
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
            var options = this.getOptions_();
            for (var i = 0; i < options.length; i++) {
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
                var columnItem = new goog.ui.Control();
                columnItem.addChild(menuItem, true);
                menu.addChild(columnItem, true);
                menuItem.setChecked(value == this.value_);
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
            // Record windowSize and scrollOffset before adding menu.
            var windowSize = goog.dom.getViewportSize();
            var scrollOffset = goog.style.getViewportPageOffset(document);
            var xy = this.getAbsoluteXY_();
            var borderBBox = this.getScaledBBox_();
            var div = Blockly.WidgetDiv.DIV;
            menu.render(div);
            var menuDom = menu.getElement();
            menuDom.style.width = this.menuWidth_ + 'px';
            Blockly.utils.addClass(menuDom, 'blocklyDropdownGridMenu');
            // Record menuSize after adding menu.
            var menuSize = goog.style.getSize(menuDom);
            var menuItemsDom = menuDom.getElementsByClassName('goog-menuitem');
            // Recalculate height for the total content, not only box height.
            menuSize.height = menuDom.scrollHeight;
            menuSize.width = this.menuWidth_;
            // Position the menu.
            // Flip menu vertically if off the bottom.
            if (xy.y + menuSize.height + borderBBox.height >=
                windowSize.height + scrollOffset.y) {
                xy.y -= menuSize.height + 2;
            }
            else {
                xy.y += borderBBox.height;
            }
            if (this.sourceBlock_.RTL) {
                xy.x += borderBBox.width;
                xy.x += Blockly.FieldDropdown.CHECKMARK_OVERHANG;
                // Don't go offscreen left.
                if (xy.x < scrollOffset.x + menuSize.width) {
                    xy.x = scrollOffset.x + menuSize.width;
                }
            }
            else {
                xy.x -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;
                // Don't go offscreen right.
                if (xy.x > windowSize.width + scrollOffset.x - menuSize.width) {
                    xy.x = windowSize.width + scrollOffset.x - menuSize.width;
                }
            }
            Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset, this.sourceBlock_.RTL);
            var columns = this.columns_;
            if (this.useTooltips_) {
                var _loop_1 = function (i) {
                    var elem = menuItemsDom[i];
                    Blockly.utils.addClass(elem.parentElement, 'blocklyGridColumn');
                    Blockly.utils.addClass(elem.parentElement, 'col-' + columns);
                    if (this_1.useTooltips_) {
                        var tooltip_1 = new goog.ui.Tooltip(elem, options[i][0].alt || options[i][0]);
                        var onShowOld_1 = tooltip_1.onShow;
                        tooltip_1.onShow = function () {
                            onShowOld_1.call(tooltip_1);
                            var newPos = new goog.positioning.ClientPosition(tooltip_1.cursorPosition.x + FieldDropdownGrid.TOOLTIP_X_OFFSET, tooltip_1.cursorPosition.y + FieldDropdownGrid.TOOLTIP_Y_OFFSET);
                            tooltip_1.setPosition(newPos);
                        };
                        tooltip_1.setShowDelayMs(0);
                        tooltip_1.className = 'goog-tooltip blocklyDropdownGridMenuItemTooltip';
                        elem.addEventListener('mousemove', function (e) {
                            var newPos = new goog.positioning.ClientPosition(e.clientX + FieldDropdownGrid.TOOLTIP_X_OFFSET, e.clientY + FieldDropdownGrid.TOOLTIP_Y_OFFSET);
                            tooltip_1.setPosition(newPos);
                        });
                        this_1.tooltips_.push(tooltip_1);
                    }
                };
                var this_1 = this;
                for (var i = 0; i < menuItemsDom.length; ++i) {
                    _loop_1(i);
                }
            }
            menu.setAllowAutoFocus(true);
            menuDom.focus();
        };
        FieldDropdownGrid.prototype.disposeTooltips = function () {
            if (this.tooltips_ && this.tooltips_.length) {
                this.tooltips_.forEach(function (t) { return t.dispose(); });
                this.tooltips_ = [];
            }
        };
        /**
         * Handle the selection of an item in the dropdown menu.
         * @param {!goog.ui.Menu} menu The Menu component clicked.
         * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
         */
        FieldDropdownGrid.prototype.onItemSelected = function (menu, menuItem) {
            var value = menuItem.getChildAt(0).getValue();
            if (this.sourceBlock_) {
                // Call any validation function, and allow it to override.
                value = this.callValidator(value);
            }
            if (value !== null) {
                this.setValue(value);
            }
        };
        return FieldDropdownGrid;
    }(Blockly.FieldDropdown));
    FieldDropdownGrid.TOOLTIP_X_OFFSET = 15;
    FieldDropdownGrid.TOOLTIP_Y_OFFSET = -10;
    PxtFields.FieldDropdownGrid = FieldDropdownGrid;
})(PxtFields || (PxtFields = {}));
Blockly.FieldDropdownGrid = PxtFields.FieldDropdownGrid;
