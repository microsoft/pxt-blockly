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

goog.provide('Blockly.FieldGridPicker');

goog.require('Blockly.FieldDropdown');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.positioning.ClientPosition');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Tooltip');

namespace pxtblocky {
    export interface FieldGridPickerToolTipConfig {
        enabled: boolean;
        yOffset?: number;
        xOffset?: number;
    }

    export interface FieldGridPickerParams {
        columns?: string;
        width?: string;
        itemColour?: string;
        tooltips?: string;
        tooltipsXOffset?: string;
        tooltipsYOffset?: string;
    }

    export class FieldGridPicker extends Blockly.FieldDropdown {
        // Width in pixels
        private width_: number;

        // Columns in grid
        private columns_: number;

        private backgroundColour_: string;
        private itemColour_: string;

        private tooltipConfig_: FieldGridPickerToolTipConfig;

        private tooltips_: goog.ui.Tooltip[] = [];

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
        constructor(menuGenerator: string[][], backgroundColour: string = '#000', params: FieldGridPickerParams) {
            super(menuGenerator);
            
            this.columns_ = parseInt(params.columns) || 4;
            this.width_ = parseInt(params.width) || 400;
            this.backgroundColour_ = backgroundColour;
            this.itemColour_ = params.itemColour || '#fff';
            let tooltipCfg: FieldGridPickerToolTipConfig = {
                enabled: params.tooltips == 'true' || true,
                xOffset: parseInt(params.tooltipsXOffset) || 15,
                yOffset: parseInt(params.tooltipsYOffset) || -10
            }

            this.tooltipConfig_ = tooltipCfg;
        }

        /**
         * Create a dropdown menu under the text.
         * @private
         */
        public showEditor_() {
            Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, null);

            this.disposeTooltips();

            const options = this.getOptions_();
            const container = new goog.ui.Control();


            for (let i = 0; i < options.length / this.columns_; i++) {
                let row = this.createRow(i, options);
                container.addChild(row, true);
            }


            // Record windowSize and scrollOffset before adding menu.
            const windowSize = goog.dom.getViewportSize();
            const scrollOffset = goog.style.getViewportPageOffset(document);
            const xy = this.getAbsoluteXY_();
            const borderBBox = this.getScaledBBox_();
            const div = Blockly.WidgetDiv.DIV;

            container.render(div);

            const containerDom = container.getElement() as HTMLElement;

            // Resize the grid picker if width > screen width
            if (this.width_ > windowSize.width) {
                this.width_ = windowSize.width;
            }

            containerDom.style.width = this.width_ + 'px';
            containerDom.style.backgroundColor = this.backgroundColour_;
            containerDom.className = 'blocklyGridPickerMenu';


            // Add the tooltips
            const menuItemsDom = containerDom.getElementsByClassName('goog-menuitem');

            for (let i = 0; i < menuItemsDom.length; ++i) {
                const elem = menuItemsDom[i] as HTMLElement;
                elem.style.borderColor = this.backgroundColour_;
                elem.style.backgroundColor = this.itemColour_;

                elem.parentElement.className = 'blocklyGridPickerRow';
                
                if (this.tooltipConfig_.enabled) {
                    const tooltip = new goog.ui.Tooltip(elem, options[i][0].alt || options[i][0]);
                    const onShowOld = tooltip.onShow;
                    tooltip.onShow = () => {
                        onShowOld.call(tooltip);
                        const newPos = new goog.positioning.ClientPosition(tooltip.cursorPosition.x + this.tooltipConfig_.xOffset,
                            tooltip.cursorPosition.y + this.tooltipConfig_.yOffset);
                        tooltip.setPosition(newPos);
                    };
                    tooltip.setShowDelayMs(0);
                    tooltip.className = 'goog-tooltip blocklyGridPickerTooltip';
                    elem.addEventListener('mousemove', (e: MouseEvent) => {
                        const newPos = new goog.positioning.ClientPosition(e.clientX + this.tooltipConfig_.xOffset,
                            e.clientY + this.tooltipConfig_.yOffset);
                        tooltip.setPosition(newPos);
                    });
                    this.tooltips_.push(tooltip);
                }
            }
            

            // Record menuSize after adding menu.
            const containerSize = goog.style.getSize(containerDom);

            // Recalculate height for the total content, not only box height.
            containerSize.height = containerDom.scrollHeight;
            containerSize.width = this.width_;

            // Position the menu.
            // Flip menu vertically if off the bottom.
            if (xy.y + containerSize.height + borderBBox.height >=
                windowSize.height + scrollOffset.y) {
                xy.y -= containerSize.height + 2;
            } else {
                xy.y += borderBBox.height;
            }

            if (this.sourceBlock_.RTL) {
                xy.x += borderBBox.width;
                xy.x += Blockly.FieldDropdown.CHECKMARK_OVERHANG;

                // Don't go offscreen left.
                if (xy.x < scrollOffset.x + containerSize.width) {
                    xy.x = scrollOffset.x + containerSize.width;
                }
            } else {
                xy.x -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;

                // Don't go offscreen right.
                if (xy.x > windowSize.width + scrollOffset.x - containerSize.width) {
                    xy.x = windowSize.width + scrollOffset.x - containerSize.width;
                }
            }

            Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset,
                this.sourceBlock_.RTL);

            (<any>containerDom).focus();
        }

        private createRow(row: number, options: (Object | string[])[]): goog.ui.Menu {
            const columns = this.columns_;

            const thisField = this;
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

            for (let i = (columns * row); i < Math.min((columns * row)+columns, options.length); i++) {
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
                menuItem.setChecked(value == this.value_);
                menu.addChild(menuItem, true);
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

            return menu;
        }

        /**
         * Disposes the tooltip DOM elements.
         * @private
         */
        private disposeTooltips() {
            if (this.tooltips_ && this.tooltips_.length) {
                this.tooltips_.forEach((t) => t.dispose());
                this.tooltips_ = [];
            }
        }
    }
}

(Blockly as any).FieldGridPicker = pxtblocky.FieldGridPicker;