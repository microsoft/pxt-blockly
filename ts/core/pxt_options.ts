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

goog.provide('Blockly.PXTOptions');

goog.require('Blockly.Options');

namespace pxtblocky {

    export interface ExtendedOptions extends Blockly.Options {
        toolboxType: string;
    }

    export interface ToolboxOptions {
        colour?: boolean;
        colourIcons?: boolean;
        invertedIcons?: boolean;
        border?: boolean;
        inverted?: boolean;
        invertedMultiplier?: number;
    }

    export class PXTOptions extends Blockly.Options {

        public toolboxOptions: ToolboxOptions;

        public disabledOpacity: number;

        /**
         * Parse the user-specified options, using reasonable defaults where behaviour
         * is unspecified.
         * @param {!Object} options Dictionary of options.  Specification:
         *   https://developers.google.com/blockly/guides/get-started/web#configuration
         * @constructor
         */
        constructor(options: ExtendedOptions) {
            super(options);

            this.toolboxOptions = {};
            let toolboxOptions = options['toolboxOptions'];
            if (toolboxOptions["border"] == undefined) {
                toolboxOptions["border"] = true;
            }
            if (toolboxOptions["colour"] == undefined) {
                toolboxOptions["colour"] = false;
            }
            if (toolboxOptions["colourIcons"] == undefined) {
                toolboxOptions["colourIcons"] = false;
            }
            if (toolboxOptions["invertedIcons"] == undefined) {
                toolboxOptions["invertedIcons"] = false;
            }
            if (toolboxOptions["inverted"] == undefined) {
                toolboxOptions["inverted"] = false;
            }
            if (toolboxOptions["invertedMultiplier"] == undefined) {
                toolboxOptions["invertedMultiplier"] = 0.3;
            }
            this.toolboxOptions.border = toolboxOptions["border"];
            this.toolboxOptions.colour = toolboxOptions["colour"];
            this.toolboxOptions.colourIcons = toolboxOptions["colourIcons"];
            this.toolboxOptions.invertedIcons = toolboxOptions["invertedIcons"];
            this.toolboxOptions.inverted = toolboxOptions["inverted"];
            this.toolboxOptions.invertedMultiplier = toolboxOptions["invertedMultiplier"];

            let disabledOpacity = options['disabledOpacityModifier'];
            if (disabledOpacity == undefined) {
                disabledOpacity = 0.4;
            }
            this.disabledOpacity = disabledOpacity
        }

    }
}

(Blockly as any).Options = pxtblocky.PXTOptions;