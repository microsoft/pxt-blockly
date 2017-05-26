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
        toolboxOptions: ToolboxOptions;
    }

    export interface ToolboxOptions {
        colour?: boolean;
        border?: boolean;
        inverted?: boolean;
        invertedMultiplier?: number;
        disabledOpacity?: number;
    }

    export class PXTOptions extends Blockly.Options {

        public toolboxOptions: ToolboxOptions;

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
            if (toolboxOptions["inverted"] == undefined) {
                toolboxOptions["inverted"] = false;
            }
            if (toolboxOptions["invertedMultiplier"] == undefined) {
                toolboxOptions["invertedMultiplier"] = 0.3;
            }
            if (toolboxOptions["disabledOpacity"] == undefined) {
                toolboxOptions["disabledOpacity"] = 0.4;
            }
            this.toolboxOptions.border = toolboxOptions["border"];
            this.toolboxOptions.colour = toolboxOptions["colour"];
            this.toolboxOptions.inverted = toolboxOptions["inverted"];
            this.toolboxOptions.invertedMultiplier = toolboxOptions["invertedMultiplier"];
            this.toolboxOptions.disabledOpacity = toolboxOptions["disabledOpacity"];
        }

    }
}

(Blockly as any).Options = pxtblocky.PXTOptions;