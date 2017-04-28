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
goog.require('Blockly.DropDownDiv');

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
         * Fixed width of the drop-down, in px. Icon buttons will flow inside this width.
         * @type {number}
         * @const
         */
        public static DROPDOWN_WIDTH = 168;

        private savedPrimary_: number|string = null;

        private arrowX_: number;
        private arrowY_: number;
        private arrowIcon_: Element;

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
         * Called when the field is placed on a block.
         * @param {Block} block The owning block.
         */
        init(block: Blockly.Block) {
            // Render the arrow icon
            // Fixed sizes in px. Saved for creating the flip transform of the menu renders above the button.
            var arrowSize = 12;
            /** @type {Number} */
            this.arrowX_ = 18;
            /** @type {Number} */
            this.arrowY_ = 10;
            if (block && block.RTL) {
                // In RTL, the icon position is flipped and rendered from the right (offset by width)
                this.arrowX_ = -this.arrowX_ - arrowSize;
            }
            /** @type {Element} */
            this.arrowIcon_ = (Blockly.utils as any).createSvgElement('image', {
                'height': arrowSize + 'px',
                'width': arrowSize + 'px',
                'transform': 'translate(' + this.arrowX_ + ',' + this.arrowY_ + ')'
            });
            this.arrowIcon_.setAttributeNS('http://www.w3.org/1999/xlink',
                'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'dropdown-arrow.svg');
            if (block) block.getSvgRoot().appendChild(this.arrowIcon_);
            super.init.call(this, block);
        };

        /**
         * Callback for when a button is clicked inside the drop-down.
         * Should be bound to the FieldIconMenu.
         * @param {Event} e DOM event for the click/touch
         * @private
         */
        private buttonClick_(e: Event) {
            let value = (e.target as any).getAttribute('data-value');
            this.setValue(value);
            Blockly.DropDownDiv.hide();
        };

        public showEditor_() {
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
            const options = this.getOptions();


            for (var i = 0; i < options.length; i++) {
                var icon = options[i][0]; // Human-readable text or image.
                var value = options[i][1];   // Language-neutral value.
                // Icons with the type property placeholder take up space but don't have any functionality
                // Use for special-case layouts
                if (icon.type == 'placeholder') {
                    var placeholder = document.createElement('span');
                    placeholder.setAttribute('class', 'blocklyDropDownPlaceholder');
                    placeholder.style.width = icon.width + 'px';
                    placeholder.style.height = icon.height + 'px';
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
                Blockly.bindEvent_(button, 'mousedown', button, function(e) {
                this.setAttribute('class', 'blocklyDropDownButton blocklyDropDownButtonHover');
                e.preventDefault();
                });
                Blockly.bindEvent_(button, 'mouseover', button, function() {
                this.setAttribute('class', 'blocklyDropDownButton blocklyDropDownButtonHover');
                contentDiv.setAttribute('aria-activedescendant', this.id);
                });
                Blockly.bindEvent_(button, 'mouseout', button, function() {
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
            }
            contentDiv.style.width = FieldGridPicker.DROPDOWN_WIDTH + 'px';

            Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), this.sourceBlock_.getColourTertiary());
            //Blockly.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());

            // Update source block colour to look selected
            this.savedPrimary_ = this.sourceBlock_.getColour();
            this.sourceBlock_.setColour(this.sourceBlock_.getColourSecondary(),
                this.sourceBlock_.getColourSecondary(), this.sourceBlock_.getColourTertiary());

            var scale = this.sourceBlock_.workspace.scale;
            // Offset for icon-type horizontal blocks.
            var secondaryYOffset = (
                -(Blockly.BlockSvg.MIN_BLOCK_Y * scale) - (Blockly.BlockSvg.FIELD_Y_OFFSET * scale)
            );
            var renderedPrimary = Blockly.DropDownDiv.showPositionedByBlock(
                this, this.sourceBlock_, this.onHide_.bind(this), secondaryYOffset);
            if (!renderedPrimary) {
                // Adjust for rotation
                var arrowX = this.arrowX_ + Blockly.DropDownDiv.ARROW_SIZE / 1.5 + 1;
                var arrowY = this.arrowY_ + Blockly.DropDownDiv.ARROW_SIZE / 1.5;
                // Flip the arrow on the button
                this.arrowIcon_.setAttribute('transform',
                'translate(' + arrowX + ',' + arrowY + ') rotate(180)');
            }
        }

        /**
         * Callback for when the drop-down is hidden.
         */
        private onHide_() {
            // Reset the button colour and clear accessibility properties
            // Only attempt to do this reset if sourceBlock_ is not disposed.
            // It could become disposed before an onHide_, for example,
            // when a block is dragged from the flyout.
            if (this.sourceBlock_) {
                this.sourceBlock_.setColour(this.savedPrimary_,
                this.sourceBlock_.getColourSecondary(), this.sourceBlock_.getColourTertiary());
            }
            Blockly.DropDownDiv.content_.removeAttribute('role');
            Blockly.DropDownDiv.content_.removeAttribute('aria-haspopup');
            Blockly.DropDownDiv.content_.removeAttribute('aria-activedescendant');
            // Unflip the arrow if appropriate
            this.arrowIcon_.setAttribute('transform', 'translate(' + this.arrowX_ + ',' + this.arrowY_ + ')');
        };
        /**
         * Create a dropdown menu under the text.
         * @private
         */
        /*
        public showEditor_() {
            Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, null);

            this.disposeTooltips();

            const options = this.getOptions();
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
        } */

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