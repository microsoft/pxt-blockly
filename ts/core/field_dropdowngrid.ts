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

goog.provide('Blockly.FieldDropdownGrid');

goog.require('Blockly.FieldDropdown');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.positioning.ClientPosition');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Tooltip');

namespace PxtFields {
    export class FieldDropdownGrid extends Blockly.FieldDropdown {
        static TOOLTIP_X_OFFSET = 15;
        static TOOLTIP_Y_OFFSET = -10;

        // Width in pixels
        private menuWidth_: number;

        private columns_: number;

        private useTooltips_: boolean;
        
        private tooltips_: goog.ui.Tooltip[] = [];

        constructor(optionsValues: string[][], col: number = 2, width: number = 800, useTooltips: boolean = true) {
            super(optionsValues);
            this.columns_ = col;
            this.menuWidth_ = width;
            this.useTooltips_ = useTooltips;
        }

        public showEditor_() {
            Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, null);
            const thisField = this;

            this.disposeTooltips();

            function callback(e) {
                const menu = this;
                const menuItem = e.target;

                if (menuItem) {
                    thisField.onItemSelected(menu, menuItem);
                }

                Blockly.WidgetDiv.hideIfOwner(thisField);
                Blockly.Events.setGroup(false);
                thisField.disposeTooltips();
            }

            const menu = new goog.ui.Menu();
            menu.setRightToLeft(this.sourceBlock_.RTL);
            const options = this.getOptions_();

            for (let i = 0; i < options.length; i++) {
                let content = options[i][0]; // Human-readable text or image.
                const value = options[i][1]; // Language-neutral value.

                if (typeof content == 'object') {
                    // An image, not text.
                    const image = new Image(content['width'], content['height']);
                    image.src = content['src'];
                    image.alt = content['alt'] || '';
                    content = image;
                }

                const menuItem = new goog.ui.MenuItem(content);
                menuItem.setRightToLeft(this.sourceBlock_.RTL);
                menuItem.setValue(value);
                menuItem.setCheckable(true);
                const columnItem = new goog.ui.Control();
                columnItem.addChild(menuItem, true);
                menu.addChild(columnItem, true);
                menuItem.setChecked(value == this.value_);
            }

            // Listen for mouse/keyboard events.
            goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);

            // Listen for touch events (why doesn't Closure handle this already?).
            function callbackTouchStart(e) {
                const control = this.getOwnerControl(/** @type {Node} */(e.target));
                // Highlight the menu item.
                control.handleMouseDown(e);
            }

            function callbackTouchEnd(e) {
                const control = this.getOwnerControl(/** @type {Node} */(e.target));
                // Activate the menu item.
                control.performActionInternal(e);
            }

            menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHSTART,
                callbackTouchStart);
            menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHEND,
                callbackTouchEnd);

            // Record windowSize and scrollOffset before adding menu.
            const windowSize = goog.dom.getViewportSize();
            const scrollOffset = goog.style.getViewportPageOffset(document);
            const xy = this.getAbsoluteXY_();
            const borderBBox = this.getScaledBBox_();
            const div = Blockly.WidgetDiv.DIV;
            menu.render(div);
            const menuDom = menu.getElement() as HTMLElement;
            menuDom.style.width = this.menuWidth_ + 'px';
            Blockly.utils.addClass(menuDom, 'blocklyDropdownGridMenu');

            // Record menuSize after adding menu.
            const menuSize = goog.style.getSize(menuDom);
            const menuItemsDom = menuDom.getElementsByClassName('goog-menuitem');

            // Recalculate height for the total content, not only box height.
            menuSize.height = menuDom.scrollHeight;
            menuSize.width = this.menuWidth_;

            // Position the menu.
            // Flip menu vertically if off the bottom.
            if (xy.y + menuSize.height + borderBBox.height >=
                windowSize.height + scrollOffset.y) {
                xy.y -= menuSize.height + 2;
            } else {
                xy.y += borderBBox.height;
            }

            if (this.sourceBlock_.RTL) {
                xy.x += borderBBox.width;
                xy.x += Blockly.FieldDropdown.CHECKMARK_OVERHANG;

                // Don't go offscreen left.
                if (xy.x < scrollOffset.x + menuSize.width) {
                    xy.x = scrollOffset.x + menuSize.width;
                }
            } else {
                xy.x -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;

                // Don't go offscreen right.
                if (xy.x > windowSize.width + scrollOffset.x - menuSize.width) {
                    xy.x = windowSize.width + scrollOffset.x - menuSize.width;
                }
            }
            Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset,
                this.sourceBlock_.RTL);

            const columns = this.columns_;
            if (this.useTooltips_) {
                for (let i = 0; i < menuItemsDom.length; ++i) {
                    const elem = menuItemsDom[i];
                    Blockly.utils.addClass(elem.parentElement, 'blocklyGridColumn');
                    Blockly.utils.addClass(elem.parentElement, 'col-' + columns);
                    if (this.useTooltips_) {
                        const tooltip = new goog.ui.Tooltip(elem, options[i][0].alt || options[i][0]);
                        const onShowOld = tooltip.onShow;
                        tooltip.onShow = () => {
                            onShowOld.call(tooltip);
                            const newPos = new goog.positioning.ClientPosition(tooltip.cursorPosition.x + FieldDropdownGrid.TOOLTIP_X_OFFSET,
                                tooltip.cursorPosition.y + FieldDropdownGrid.TOOLTIP_Y_OFFSET);
                            tooltip.setPosition(newPos);
                        };
                        tooltip.setShowDelayMs(0);
                        tooltip.className = 'goog-tooltip blocklyDropdownGridMenuItemTooltip';
                        elem.addEventListener('mousemove', (e: MouseEvent) => {
                            const newPos = new goog.positioning.ClientPosition(e.clientX + FieldDropdownGrid.TOOLTIP_X_OFFSET,
                                e.clientY + FieldDropdownGrid.TOOLTIP_Y_OFFSET);
                            tooltip.setPosition(newPos);
                        });
                        this.tooltips_.push(tooltip);
                    }
                }
            }

            menu.setAllowAutoFocus(true);
            (<any>menuDom).focus();
        }

        private disposeTooltips() {
            if (this.tooltips_ && this.tooltips_.length) {
                this.tooltips_.forEach((t) => t.dispose());
                this.tooltips_ = [];
            }
        }

        /**
         * Handle the selection of an item in the dropdown menu.
         * @param {!goog.ui.Menu} menu The Menu component clicked.
         * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
         */
        onItemSelected(menu: goog.ui.Menu, menuItem: goog.ui.Control) {
            var value = (menuItem.getChildAt(0) as goog.ui.MenuItem).getValue();
            if (this.sourceBlock_) {
                // Call any validation function, and allow it to override.
                value = this.callValidator(value);
            }
            if (value !== null) {
                this.setValue(value);
            }
        }
    }
}

(Blockly as any).FieldDropdownGrid = PxtFields.FieldDropdownGrid;