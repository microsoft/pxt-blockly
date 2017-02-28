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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
goog.provide('Blockly.PXTOptions');
goog.require('Blockly.Options');
var pxtblocky;
(function (pxtblocky) {
    var PXTOptions = (function (_super) {
        __extends(PXTOptions, _super);
        /**
         * Parse the user-specified options, using reasonable defaults where behaviour
         * is unspecified.
         * @param {!Object} options Dictionary of options.  Specification:
         *   https://developers.google.com/blockly/guides/get-started/web#configuration
         * @constructor
         */
        function PXTOptions(options) {
            var _this = _super.call(this, options) || this;
            var toolboxType = options['toolboxType'];
            if (toolboxType == 'coloured') {
                _this.colouredToolbox = true;
            }
            if (toolboxType == 'inverted') {
                _this.invertedToolbox = true;
                var invertedMultiplier = options['toolboxInvertedMultipler'];
                if (invertedMultiplier == undefined)
                    invertedMultiplier = 0.3;
                _this.invertedMultiplier = invertedMultiplier;
            }
            return _this;
        }
        return PXTOptions;
    }(Blockly.Options));
    pxtblocky.PXTOptions = PXTOptions;
})(pxtblocky || (pxtblocky = {}));
Blockly.Options = pxtblocky.PXTOptions;
