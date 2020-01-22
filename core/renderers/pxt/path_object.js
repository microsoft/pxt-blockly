/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview An object that owns a block's rendering SVG elements.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.pxt.PathObject');

goog.require('Blockly.pxt.ConstantProvider');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.zelos.PathObject');


/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.Theme.BlockStyle} style The style object to use for
 *     colouring.
 * @param {!Blockly.pxt.ConstantProvider} constants The renderer's constants.
 * @constructor
 * @extends {Blockly.zelos.PathObject}
 * @package
 */
Blockly.pxt.PathObject = function(root, style, constants) {
  Blockly.pxt.PathObject.superClass_.constructor.call(this, root, style,
      constants);

  /**
   * The highlighted path of the block.
   * @type {SVGElement}
   * @private
   */
  this.svgPathHighlighted_ = null;

  /**
   * The highlighted warning path of the block.
   * @type {SVGElement}
   * @private
   */
  this.svgPathHighlightedWarning_ = null;

  Blockly.utils.dom.addClass(this.svgPath, 'blocklyBlockBackground'); // pxt-blockly
};
Blockly.utils.object.inherits(Blockly.pxt.PathObject,
    Blockly.zelos.PathObject);

/**
 * @override
 */
Blockly.pxt.PathObject.prototype.setPath = function(pathString) {
  Blockly.pxt.PathObject.superClass_.setPath.call(this, pathString);
  if (this.svgPathHighlighted_) {
    this.svgPathHighlighted_.setAttribute('d', pathString);
  }
  if (this.svgPathHighlightedWarning_) {
    this.svgPathHighlightedWarning_.setAttribute('d', pathString);
  }
};

/**
 * @override
 */
Blockly.pxt.PathObject.prototype.updateHighlighted = function(enable) {
  this.setClass_('blocklyHighlighted', enable);
  if (enable) {
    if (!this.svgPathHighlighted_) {
      this.svgPathHighlighted_ =
        /** @type {!SVGElement} */ (this.svgPath.cloneNode(true));
      this.svgPathHighlighted_.setAttribute('fill', 'none');
      this.svgPathHighlighted_.setAttribute('filter',
          'url(#' + this.constants_.highlightedGlowFilterId + ')');
      this.svgRoot.appendChild(this.svgPathHighlighted_);
    }
  } else {
    if (this.svgPathHighlighted_) {
      this.svgRoot.removeChild(this.svgPathHighlighted_);
      this.svgPathHighlighted_ = null;
    }
  }
};

/**
 * Set whether the block shows a highlight warning or not.  Block warning
 * highlighting is used to visually mark blocks that currently have a warning.
 * @param {boolean} enable True if highlighted.
 * @package
 */
Blockly.pxt.PathObject.prototype.updateHighlightedWarning = function(enable) {
  this.setClass_('blocklyHighlightedWarning', enable);
  if (enable) {
    if (!this.svgPathHighlightedWarning_) {
      this.svgPathHighlightedWarning_ =
        /** @type {!SVGElement} */ (this.svgPath.cloneNode(true));
      this.svgPathHighlightedWarning_.setAttribute('fill', 'none');
      this.svgPathHighlightedWarning_.setAttribute('filter',
          'url(#' + this.constants_.warningGlowFilterId + ')');
      this.svgRoot.appendChild(this.svgPathHighlightedWarning_);
    }
  } else {
    if (this.svgPathHighlightedWarning_) {
      this.svgRoot.removeChild(this.svgPathHighlightedWarning_);
      this.svgPathHighlightedWarning_ = null;
    }
  }
};
