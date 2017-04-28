/**
 * @license
 * PXT Blockly
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * https://github.com/Microsoft/pxt-blockly
 * 
 * See LICENSE file for details.
 */

'use strict';

goog.provide('Blockly.PXTToolbox');

goog.require('Blockly.PXTUtils');
goog.require('Blockly.Toolbox');

namespace pxtblocky {

    export class PXTToolbox extends Blockly.Toolbox {

        constructor(workspace: Blockly.Workspace) {
            super(workspace);
        }

        /**
         * Recursively add colours to this toolbox.
         * @param {Blockly.Toolbox.TreeNode} opt_tree Starting point of tree.
         *     Defaults to the root node.
         * @private
         */
        addColour_(opt_tree: Blockly.Toolbox.TreeNode): void {
            let pxtOptions = (this.workspace_.options as PXTOptions);
            let tree = opt_tree || this.tree_;
            var children = tree.getChildren();
            for (var i = 0, child; child = children[i]; i++) {
                var element = child.getRowElement();
                if (element) {
                    // Support for inverted and coloured toolboxes
                    let toolboxOptions = pxtOptions.toolboxOptions;
                    if (toolboxOptions.inverted) {
                        if (this.hasColours_) {
                            element.style.color = '#fff';
                            element.style.background = (child.hexColour || '#ddd');
                            var invertedMultiplier = toolboxOptions.invertedMultiplier;
                            if (!child.disabled) {
                                // Hovering over toolbox category fades.
                                Blockly.bindEvent_(child.getRowElement(), 'mouseenter', child,
                                    function(e) {
                                    if (!this.isSelected()) {
                                        this.getRowElement().style.background = (Blockly as any).PXTUtils.fadeColour(this.hexColour || '#ddd', invertedMultiplier, false);
                                    }
                                    });
                                Blockly.bindEvent_(child.getRowElement(), 'mouseleave', child,
                                    function(e) {
                                    if (!this.isSelected()) {
                                        this.getRowElement().style.background = (this.hexColour || '#ddd');
                                    }
                                    });
                            }
                        }
                    } else {
                        if (toolboxOptions.border) {
                            // Only show if the toolbox type is not noborder
                            if (this.hasColours_) {
                                var border = '8px solid ' + (child.hexColour || '#ddd');
                            } else {
                                var border = 'none';
                            }
                            if (this.workspace_.RTL) {
                                element.style.borderRight = border;
                            } else {
                                element.style.borderLeft = border;
                            }
                        }
                        // support for a coloured toolbox
                        if (toolboxOptions.colour && this.hasColours_) {
                            element.style.color = (child.hexColour || '#000');
                        }
                        if (toolboxOptions.colourIcons && this.hasColours_) {
                            // find the icon child
                            let iconElements = element.querySelectorAll('.blocklyTreeIcon');
                            iconElements.forEach((iconElement) => {
                                iconElement.style.color = (child.hexColour || '#000');
                            })
                        } else if (toolboxOptions.invertedIcons && this.hasColours_) {
                            // find the icon child
                            let iconElements = element.querySelectorAll('.blocklyTreeIcon');
                            iconElements.forEach((iconElement) => {
                                iconElement.style.backgroundColor = (child.hexColour || '#000');
                                iconElement.style.borderRadius = '100px';
                                iconElement.style.color = '#fff';
                            })
                        }
                    }
                    // if disabled, show disabled opacity
                    if (child.disabled) {
                        element.style.opacity = pxtOptions.disabledOpacity;
                    }
                }
                this.addColour_(child);
            }
        }
    }
}

(Blockly as any).Toolbox = pxtblocky.PXTToolbox;