/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview PXT renderer.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.pxt.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.utils.object');
goog.require('Blockly.pxt.ConstantProvider');
goog.require('Blockly.pxt.PathObject');
goog.require('Blockly.pxt.Drawer');
goog.require('Blockly.pxt.RenderInfo');
goog.require('Blockly.zelos.Renderer');


/**
 * The pxt renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {Blockly.zelos.Renderer}
 */
Blockly.pxt.Renderer = function(name) {
  Blockly.zelos.Renderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(Blockly.pxt.Renderer,
    Blockly.zelos.Renderer);

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.Theme.BlockStyle} style The style object to use for
 *     colouring.
 * @return {!Blockly.pxt.PathObject} The renderer path object.
 * @package
 * @override
 */
Blockly.pxt.Renderer.prototype.makePathObject = function(root, style) {
  return new Blockly.pxt.PathObject(root, style,
      /** @type {!Blockly.pxt.ConstantProvider} */ (this.getConstants()));
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.pxt.RenderInfo} The render info object.
 * @protected
 * @override
 */
Blockly.pxt.Renderer.prototype.makeRenderInfo_ = function(block) {
  return new Blockly.pxt.RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Blockly.pxt.Drawer} The drawer.
 * @protected
 * @override
 */
Blockly.pxt.Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Blockly.pxt.Drawer(block,
      /** @type {!Blockly.pxt.RenderInfo} */ (info));
};

/**
 * Create a new instance of the renderer's constant provider.
 * @return {!Blockly.pxt.ConstantProvider} The constant provider.
 * @protected
 * @override
 */
Blockly.pxt.Renderer.prototype.makeConstants_ = function() {
  return new Blockly.pxt.ConstantProvider();
};

Blockly.blockRendering.register('pxt', Blockly.pxt.Renderer);
