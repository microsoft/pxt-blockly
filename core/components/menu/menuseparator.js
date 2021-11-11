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
 * @fileoverview Blockly menu separator similar to Closure's
 * goog.ui.MenuSeparator
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.MenuSeparator');

goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.object');


/**
 * Class representing an item in a menu.
 *
 * @constructor
 */
Blockly.MenuSeparator = function() {
  /**
   * The DOM element for the menu separator.
   * @type {?Element}
   * @private
   */
  this.element_ = null;

  /**
   * Whether the menu separator is rendered right-to-left.
   * @type {boolean}
   * @private
   */
  this.rightToLeft_ = false;

  /**
   * Colour of the menu separator
   * @type {boolean}
   * @private
   */
  this.colour_ = "#ddd";
};

/**
 * Dispose of this menu separator.
 */
 Blockly.MenuSeparator.prototype.dispose = function() {
  this.element_ = null;
};

/**
 * Gets the menu separator's element.
 * @return {?Element} The DOM element.
 * @package
 */
 Blockly.MenuSeparator.prototype.getElement = function() {
  return this.element_;
}

/**
 * Gets the unique ID for this menu separator.
 * @return {string} Unique component ID.
 * @package
 */
 Blockly.MenuSeparator.prototype.getId = function() {
  return this.element_.id;
};

/**
 * Set menu separator's rendering direction.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @package
 */
 Blockly.MenuSeparator.prototype.setRightToLeft = function(rtl) {
  this.rightToLeft_ = rtl;
};

/**
 * Set menu separator's colour
 * @param {boolean} colour Hex colour
 * @package
 */
 Blockly.MenuSeparator.prototype.setColour = function(colour) {
  this.colour_ = colour;
};

/**
 * Creates the menu separator's DOM.
 * @override
 */
Blockly.MenuSeparator.prototype.createDom = function() {
  var element = document.createElement('div');
  element.id = Blockly.utils.IdGenerator.getNextUniqueId();
  this.element_ = element;

  // Set class and style
  element.className = 'goog-menuseparator ' +
  (this.rightToLeft_ ? 'goog-menuseparator-rtl ' : '');
  element.style.borderColor = this.colour_;

  // Initialize ARIA role and state.
  Blockly.utils.aria.setRole(element, Blockly.utils.aria.Role.SEPARATOR);
  Blockly.utils.aria.setState(element, Blockly.utils.aria.State.DISABLED, true);

  return element;
};


/**
 * Returns true if the menu separator is enabled, false otherwise.
 * @return {boolean} Whether the menu separator is enabled.
 * @package
 */
Blockly.MenuSeparator.prototype.isEnabled = function() {
  return false;
};
