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
goog.provide('Blockly.PXTUtils');
goog.require('Blockly.utils');
// goog ui components used by PXT field editors:
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.positioning.ClientPosition');
goog.require('goog.ui.Tooltip');
goog.require('goog.ui.CustomButton');
var pxtblocky;
(function (pxtblocky) {
    var PXTUtils = (function (_super) {
        __extends(PXTUtils, _super);
        function PXTUtils() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PXTUtils.fadeColour = function (hex, luminosity, lighten) {
            // #ABC => ABC
            hex = hex.replace(/[^0-9a-f]/gi, '');
            // ABC => AABBCC
            if (hex.length < 6)
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            // tweak
            var rgb = "#";
            for (var i = 0; i < 3; i++) {
                var c = parseInt(hex.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, lighten ? c + (c * luminosity) : c - (c * luminosity)), 255));
                var cStr = c.toString(16);
                rgb += ("00" + cStr).substr(cStr.length);
            }
            return rgb;
        };
        return PXTUtils;
    }(Blockly.utils));
    pxtblocky.PXTUtils = PXTUtils;
})(pxtblocky || (pxtblocky = {}));
Blockly.PXTUtils = pxtblocky.PXTUtils;
