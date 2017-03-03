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

    export class PXTOptions extends Blockly.Options {

        public colouredToolbox: boolean;
        public invertedToolbox: boolean;
        public invertedMultiplier: number;

        /**
         * Parse the user-specified options, using reasonable defaults where behaviour
         * is unspecified.
         * @param {!Object} options Dictionary of options.  Specification:
         *   https://developers.google.com/blockly/guides/get-started/web#configuration
         * @constructor
         */
        constructor(options: ExtendedOptions) {
            super(options);

            let toolboxType = options['toolboxType'];
            if (toolboxType == 'coloured') {
                this.colouredToolbox = true;
            }
            if (toolboxType == 'inverted') {
                this.invertedToolbox = true;
                let invertedMultiplier = options['toolboxInvertedMultipler'];
                if (invertedMultiplier == undefined)
                    invertedMultiplier = 0.3;
                this.invertedMultiplier = invertedMultiplier;
            }
        }

    }
}

(Blockly as any).Options = pxtblocky.PXTOptions;