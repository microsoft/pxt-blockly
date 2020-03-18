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

goog.require('Blockly.Component');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.object');


/**
 * Class representing an item in a menu.
 *
 * @constructor
 * @extends {Blockly.Component}
 */
Blockly.MenuSeparator = function() {
  Blockly.Component.call(this);
};
Blockly.utils.object.inherits(Blockly.MenuSeparator, Blockly.Component);


/**
 * Creates the menuitem's DOM.
 * @override
 */
Blockly.MenuSeparator.prototype.createDom = function() {
  var element = document.createElement('div');
  element.id = this.getId();
  this.setElementInternal(element);

  // Set class and style
  element.className = 'goog-menuseparator ' +
  (this.isRightToLeft() ? 'goog-menuseparator-rtl ' : '');

  // Initialize ARIA role and state.
  Blockly.utils.aria.setRole(element, Blockly.utils.aria.Role.SEPARATOR);
  Blockly.utils.aria.setState(element, Blockly.utils.aria.State.DISABLED, true);
};


/**
 * Returns true if the menu item is enabled, false otherwise.
 * @return {boolean} Whether the menu item is enabled.
 * @package
 */
Blockly.MenuSeparator.prototype.isEnabled = function() {
  return false;
};
