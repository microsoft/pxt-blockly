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
 * @fileoverview An object that provides constants for rendering blocks in PXT
 * mode.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.pxt.ConstantProvider');

goog.require('Blockly.Colours');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.svgPaths');
goog.require('Blockly.zelos.ConstantProvider');


/**
 * An object that provides constants for rendering blocks in PXT mode.
 * @constructor
 * @package
 * @extends {Blockly.zelos.ConstantProvider}
 */
Blockly.pxt.ConstantProvider = function() {
  Blockly.pxt.ConstantProvider.superClass_.constructor.call(this);

  /**
   * @override
   */
  this.FIELD_TEXT_FONTFAMILY =
      '"Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace';

  /**
   * @override
   */
  this.FIELD_TEXT_FONTWEIGHT = '600';

  /**
   * @type {number}
   */
  this.ICON_SEPARATOR_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * The ID of the highlighted glow filter, or the empty string if no filter is
   * set.
   * @type {string}
   * @package
   */
  this.highlightedGlowFilterId = '';

  /**
   * The <filter> element to use for a highlighted glow, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.highlightedGlowFilter_ = null;

  /**
   * The ID of the warning glow filter, or the empty string if no filter is
   * set.
   * @type {string}
   * @package
   */
  this.warningGlowFilterId = '';

  /**
   * The <filter> element to use for a warning glow, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.warningGlowFilter_ = null;

};
Blockly.utils.object.inherits(Blockly.pxt.ConstantProvider,
    Blockly.zelos.ConstantProvider);

/**
 * @override
 */
Blockly.pxt.ConstantProvider.prototype.createDom = function(svg) {
  Blockly.pxt.ConstantProvider.superClass_.createDom.call(this, svg);
  var defs = Blockly.utils.dom.createSvgElement('defs', {}, svg);

  // Filter for highlighting
  var highlightGlowFilter = Blockly.utils.dom.createSvgElement('filter',
      {
        'id': 'blocklyHighlightGlowFilter' + this.randomIdentifier_,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement('feGaussianBlur',
      {
        'in': 'SourceGraphic',
        'stdDeviation': Blockly.Colours.highlightGlowSize
      },
      highlightGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var highlightComponentTransfer = Blockly.utils.dom.createSvgElement('feComponentTransfer', {'result': 'outBlur'}, highlightGlowFilter);
  Blockly.utils.dom.createSvgElement('feFuncA',
      {
        'type': 'table', 'tableValues': '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
      },
      highlightComponentTransfer);
  // Color the highlight
  Blockly.utils.dom.createSvgElement('feFlood',
      {'flood-color': Blockly.Colours.highlightGlow,
        'flood-opacity': Blockly.Colours.highlightGlowOpacity, 'result': 'outColor'}, highlightGlowFilter);
  Blockly.utils.dom.createSvgElement('feComposite',
      {'in': 'outColor', 'in2': 'outBlur',
        'operator': 'in', 'result': 'outGlow'}, highlightGlowFilter);
  this.highlightedGlowFilterId = highlightGlowFilter.id;
  this.highlightedGlowFilter_ = highlightGlowFilter;

  // Filter for error / warning marker
  var warningGlowFilter = Blockly.utils.dom.createSvgElement('filter',
      {
        'id': 'blocklyHighlightWarningFilter' + this.randomIdentifier_,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement('feGaussianBlur',
      {
        'in': 'SourceGraphic',
        'stdDeviation': Blockly.Colours.warningGlowSize
      },
      warningGlowFilter);
  this.warningGlowFilterId = warningGlowFilter.id;
  this.warningGlowFilter_ = warningGlowFilter;

  // Add dropdown image definitions
  var arrowSize = this.FIELD_DROPDOWN_SVG_ARROW_SIZE;
  var dropdownArrowImage = Blockly.utils.dom.createSvgElement('image',
      {
        'id': 'blocklyDropdownArrowSvg',
        'height': arrowSize + 'px',
        'width': arrowSize + 'px'
      }, defs);
  dropdownArrowImage.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', this.FIELD_DROPDOWN_SVG_ARROW_DATAURI);
};
