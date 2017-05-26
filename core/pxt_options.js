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
            _this.toolboxOptions = {};
            var toolboxOptions = options['toolboxOptions'];
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
            _this.toolboxOptions.border = toolboxOptions["border"];
            _this.toolboxOptions.colour = toolboxOptions["colour"];
            _this.toolboxOptions.inverted = toolboxOptions["inverted"];
            _this.toolboxOptions.invertedMultiplier = toolboxOptions["invertedMultiplier"];
            _this.toolboxOptions.disabledOpacity = toolboxOptions["disabledOpacity"];
            return _this;
        }
        return PXTOptions;
    }(Blockly.Options));
    pxtblocky.PXTOptions = PXTOptions;
})(pxtblocky || (pxtblocky = {}));
Blockly.Options = pxtblocky.PXTOptions;
