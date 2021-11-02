/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Inject Blockly's CSS synchronously.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.Css
 * @namespace
 */
goog.provide('Blockly.Css');

goog.require('Blockly.Colours');

/**
 * Has CSS already been injected?
 * @type {boolean}
 * @private
 */
Blockly.Css.injected_ = false;

/**
 * Add some CSS to the blob that will be injected later.  Allows optional
 * components such as fields and the toolbox to store separate CSS.
 * The provided array of CSS will be destroyed by this function.
 * @param {!Array<string>} cssArray Array of CSS strings.
 */
Blockly.Css.register = function(cssArray) {
  if (Blockly.Css.injected_) {
    throw Error('CSS already injected');
  }
  // Concatenate cssArray onto Blockly.Css.CONTENT.
  Array.prototype.push.apply(Blockly.Css.CONTENT, cssArray);
  cssArray.length = 0;  // Garbage collect provided CSS content.
};

/**
 * Inject the CSS into the DOM.  This is preferable over using a regular CSS
 * file since:
 * a) It loads synchronously and doesn't force a redraw later.
 * b) It speeds up loading by not blocking on a separate HTTP transfer.
 * c) The CSS content may be made dynamic depending on init options.
 * @param {boolean} hasCss If false, don't inject CSS
 *     (providing CSS becomes the document's responsibility).
 * @param {string} pathToMedia Path from page to the Blockly media directory.
 */
Blockly.Css.inject = function(hasCss, pathToMedia) {
  // Only inject the CSS once.
  if (Blockly.Css.injected_) {
    return;
  }
  Blockly.Css.injected_ = true;
  var text = Blockly.Css.CONTENT.join('\n');
  Blockly.Css.CONTENT.length = 0;  // Garbage collect CSS content.
  if (!hasCss) {
    return;
  }
  // Strip off any trailing slash (either Unix or Windows).
  var mediaPath = pathToMedia.replace(/[\\/]$/, '');
  text = text.replace(/<<<PATH>>>/g, mediaPath);
  // pxt-blockly: Scratch rendering. Dynamically replace colours in
  // the CSS text, in case they have been set at run-time injection.
  for (var colourProperty in Blockly.Colours) {
    if (Blockly.Colours.hasOwnProperty(colourProperty)) {
      // Replace all
      text = text.replace(
        new RegExp('\\$colour\\_' + colourProperty, 'g'),
        Blockly.Colours[colourProperty]
      );
    }
  }

  // Inject CSS tag at start of head.
  var cssNode = document.createElement('style');
  cssNode.id = 'blockly-common-style';
  var cssTextNode = document.createTextNode(text);
  cssNode.appendChild(cssTextNode);
  document.head.insertBefore(cssNode, document.head.firstChild);
};

/**
 * Array making up the CSS content for Blockly.
 */
Blockly.Css.CONTENT = [
  /* eslint-disable indent */
  '.blocklySvg {',
    'background-color: $colour_workspace;',
    'outline: none;',
    'overflow: hidden;',  /* IE overflows by default. */
    'position: absolute;',
    'display: block;',
    'touch-action: none;',
  '}',

  /* Necessary to position the drag surface */
  '.blocklyRelativeWrapper {',
    'position: relative;',
    'width: 100%;',
    'height: 100%;',
  '}',

  '.blocklyWidgetDiv {',
    'display: none;',
    'position: absolute;',
    'z-index: 99999;',  /* big value for bootstrap3 compatibility */
  '}',

  '.injectionDiv {',
    'height: 100%;',
    'position: relative;',
    'overflow: hidden;',  /* So blocks in drag surface disappear at edges */
    'touch-action: none;',
  '}',

  // TODO move to field
  '.blocklyWidgetDiv.fieldTextInput {',
    'overflow: hidden;',
    'border: 1px solid;',
    'box-sizing: border-box;',
    'transform-origin: 0 0;',
    '-ms-transform-origin: 0 0;',
    '-moz-transform-origin: 0 0;',
    '-webkit-transform-origin: 0 0;',
  '}',

  '.blocklyTextDropDownArrow {',
    'position: absolute;',
  '}',

  '.blocklyNonSelectable {',
    'user-select: none;',
    '-ms-user-select: none;',
    '-webkit-user-select: none;',
  '}',

  '.blocklyWsDragSurface {',
    'display: none;',
    'position: absolute;',
    'top: 0;',
    'left: 0;',
    'touch-action: none;',
    'cursor: move;',
  '}',
  /* Added as a separate rule with multiple classes to make it more specific
     than a bootstrap rule that selects svg:root. See issue #1275 for context.
  */
  '.blocklyWsDragSurface.blocklyOverflowVisible {',
    'overflow: visible;',
  '}',
  /* Added as a separate rule with multiple classes to make it more specific
     than a bootstrap rule that selects svg:root. See issue #1275 for context.
  */
  '.blocklyWsDragSurface.blocklyOverflowVisible {',
    'overflow: visible;',
  '}',

  '.blocklyBlockDragSurface {',
    'display: none;',
    'position: absolute;',
    'top: 0;',
    'left: 0;',
    'right: 0;',
    'bottom: 0;',
    'overflow: visible !important;',
    'z-index: 50;',  /* Display below toolbox, but above everything else. */
  '}',

  // pxt-blockly: Transition when centering block
  '.blocklyBlockCanvas.blocklyTransitioning {',
    'transition: all 0.5s ease-in-out;',
  '}',

  '.blocklyBlockCanvas.blocklyCanvasTransitioning,',
  '.blocklyBubbleCanvas.blocklyCanvasTransitioning {',
    'transition: transform .5s;',
  '}',

  '.blocklyTooltipDiv {',
    'background-color: #ffffc7;',
    'border: 1px solid #ddc;',
    'box-shadow: 4px 4px 20px 1px rgba(0,0,0,.15);',
    'color: #000;',
    'display: none;',
    'font: 9pt sans-serif;',
    'opacity: .9;',
    'padding: 2px;',
    'position: absolute;',
    'z-index: 100000;',  /* big value for bootstrap3 compatibility */
  '}',

  '.blocklyDropDownDiv {',
    'position: absolute;',
    'left: 0;',
    'top: 0;',
    'z-index: 1000;',
    'display: none;',
    'border: 1px solid;',
    'border-color: #dadce0;',
    'background-color: #fff;',
    'border-radius: 2px;',
    'box-shadow: 0px 0px 8px 1px ' + Blockly.Colours.dropDownShadow + ';',
    'padding: 4px;',
    'box-shadow: 0 0 3px 1px rgba(0,0,0,.3);',
  '}',

  '.blocklyDropDownDiv.blocklyFocused {',
    'box-shadow: 0 0 6px 1px rgba(0,0,0,.3);',
  '}',

  '.blocklyDropDownContent {',
    'max-height: 300px;',  // @todo: spec for maximum height.
    'overflow: auto;',
    'overflow-x: hidden;',
    'position: relative;',
  '}',

  '.blocklyDropDownArrow {',
    'position: absolute;',
    'left: 0;',
    'top: 0;',
    'width: 16px;',
    'height: 16px;',
    'z-index: -1;',
    'background-color: inherit;',
    'border-color: inherit;',
  '}',

  '.blocklyDropDownButton {',
    'display: inline-block;',
    'float: left;',
    'padding: 0;',
    'margin: 4px;',
    'border-radius: 4px;',
    'outline: none;',
    'border: 1px solid;',
    'transition: box-shadow .1s;',
    'cursor: pointer;',
  '}',

  '.blocklyDropDownButtonHover {',
    'box-shadow: 0px 0px 0px 4px ' + Blockly.Colours.fieldShadow + ';',
  '}',

  '.blocklyDropDownButton:active {',
    'box-shadow: 0px 0px 0px 6px ' + Blockly.Colours.fieldShadow + ';',
  '}',

  '.blocklyDropDownButton > img {',
    'width: 80%;',
    'height: 80%;',
    'margin-top: 5%',
  '}',

  '.blocklyDropDownPlaceholder {',
    'display: inline-block;',
    'float: left;',
    'padding: 0;',
    'margin: 4px;',
  '}',

  '.blocklyNumPadButton {',
    'display: inline-block;',
    'float: left;',
    'padding: 0;',
    'width: 48px;',
    'height: 48px;',
    'margin: 4px;',
    'border-radius: 4px;',
    'background: $colour_numPadBackground;',
    'color: $colour_numPadText;',
    'outline: none;',
    'border: 1px solid $colour_numPadBorder;',
    'cursor: pointer;',
    'font-weight: 600;',
    'font-family: "Helvetica Neue", "Segoe UI", Helvetica, sans-serif;',
    'font-size: 12pt;',
    '-webkit-tap-highlight-color: rgba(0,0,0,0);',
  '}',

  '.blocklyNumPadButton > img {',
    'margin-top: 10%;',
    'width: 80%;',
    'height: 80%;',
  '}',

  '.blocklyNumPadButton:active {',
    'background: $colour_numPadActiveBackground;',
    '-webkit-tap-highlight-color: rgba(0,0,0,0);',
  '}',

  '.blocklyArrowTop {',
    'border-top: 1px solid;',
    'border-left: 1px solid;',
    'border-top-left-radius: 4px;',
    'border-color: inherit;',
  '}',

  '.blocklyArrowBottom {',
    'border-bottom: 1px solid;',
    'border-right: 1px solid;',
    'border-bottom-right-radius: 4px;',
    'border-color: inherit;',
  '}',

  '.valueReportBox {',
    'min-width: 50px;',
    'max-width: 300px;',
    'max-height: 200px;',
    'overflow: auto;',
    'word-wrap: break-word;',
    'text-align: center;',
    'font-family: "Helvetica Neue", "Segoe UI", Helvetica, sans-serif;',
    'font-size: .8em;',
  '}',

  '.blocklyResizeSE {',
    'cursor: se-resize;',
    'fill: transparent;',
  '}',

  '.blocklyResizeSW {',
    'cursor: sw-resize;',
    'fill: transparent;',
  '}',

  '.blocklyResizeLine {',
    'stroke: #515A5A;',
    'stroke-width: 1;',
  '}',

  '.blocklyHighlightedConnectionPath {',
    'fill: none;',
    'stroke: #FFF200;',
    'stroke-width: 4px;',
  '}',

  '.blocklyPath {',
    'stroke-width: 1px;',
    'transition: stroke .4s;',
  '}',

  // pxtblockly: highlight reporter blocks on hover
  '.blocklyDraggable:not(.blocklySelected)>.blocklyPath.blocklyReporterHover {',
    'stroke-width: 2px;',
    'stroke: white;',
  '}',

  // pxtblockly: highlight fields on hover
  '.blocklyBlockBackground.blocklyFieldHover {',
    'stroke-width: 2px;',
    'stroke: white;',
  '}',

  '.blocklySelected>.blocklyPath {',
     //'stroke: #FFF200;',
     //'stroke-width: 1px;',
  '}',

  '.blocklyDraggable {',
    /* backup for browsers (e.g. IE11) that don't support grab */
    'cursor: url("<<<PATH>>>/handopen.cur"), auto;',
    'cursor: grab;',
    'cursor: -webkit-grab;',
    'touch-action: none;',
  '}',

  '.blocklyDragging {',
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
    'touch-action: none;',
  '}',
  /* Changes cursor on mouse down. Not effective in Firefox because of
    https://bugzilla.mozilla.org/show_bug.cgi?id=771241 */
  '.blocklyDraggable:active {',
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
  '}',
  /* Change the cursor on the whole drag surface in case the mouse gets
     ahead of block during a drag. This way the cursor is still a closed hand.
   */
  '.blocklyBlockDragSurface .blocklyDraggable {',
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
  '}',

  '.blocklyDragging.blocklyDraggingDelete {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyDragging>.blocklyPath,',
  '.blocklyDragging>.blocklyPathLight {',
    'fill-opacity: .8;',
    'stroke-opacity: .8;',
  '}',

  '.blocklyDragging>.blocklyPath {',
  '}',

  '.blocklyDisabled>.blocklyPath {',
    'fill-opacity: .8;',
    'stroke-opacity: .8;',
  '}',
  '.blocklyDisabled .blocklyEditableText .blocklyBlockBackground,',
  '.blocklyDisabled .blocklyNonEditableText .blocklyBlockBackground,',
  '.blocklyDisabled g[data-argument-type="dropdown"] .blocklyBlockBackground {',
    'fill-opacity: 0.1 !important;',
  '}',

  '.blocklyInsertionMarker>.blocklyPath {',
    'stroke: none;',
  '}',

  '.blocklyInsertionMarker>.blocklyIconGroup {',
    'display: none;',
  '}',

  '.blocklyInsertionMarker>.blocklyPath,',
  '.blocklyInsertionMarker>.blocklyPathLight,',
  '.blocklyInsertionMarker>.blocklyPathDark {',
    'fill-opacity: .2;',
    'stroke: none;',
  '}',

  '.blocklyReplaceable .blocklyPath {',
    'fill-opacity: 0.5;',
  '}',

  '.blocklyReplaceable .blocklyPathLight,',
  '.blocklyReplaceable .blocklyPathDark {',
    'display: none;',
  '}',

  '.blocklyText {',
    'cursor: default;',
    'fill: #fff;',
    'font-family: "Helvetica Neue", "Segoe UI", Helvetica, sans-serif;',
    'font-size: 12pt;',
    'font-weight: bold;',
  '}',

  '.blocklyTextTruncated {',
    'font-size: 11pt;',
  '}',

  '.blocklyMultilineText {',
    'font-family: monospace;',
  '}',

  '.blocklyNonEditableText>g>text {',
    'pointer-events: none;',
  '}',
  '.blocklyNonEditableText>text,',
  '.blocklyEditableText>text,',
  '.blocklyNonEditableText>g>text,',
  '.blocklyEditableText>g>text {',
    'fill: $colour_text;',
  '}',

  '.blocklyDropdownText {',
    'fill: #fff !important;',
  '}',

  '.blocklyFlyout {',
    'position: absolute;',
    'z-index: 20;',
  '}',

  '.blocklyText text {',
    'cursor: default;',
  '}',

  /*
    Don't allow users to select text.  It gets annoying when trying to
    drag a block and selected text moves instead.
  */
  '.blocklySvg text,',
  '.blocklyBlockDragSurface text {',
    'user-select: none;',
    '-ms-user-select: none;',
    '-webkit-user-select: none;',
    'cursor: inherit;',
  '}',

  '.blocklyHidden {',
    'display: none;',
  '}',

  '.blocklyFieldDropdown:not(.blocklyHidden) {',
    'display: block;',
  '}',

  '.blocklyIconGroup,',
  '.blocklyBreakpointIconGroup {',
    'cursor: default;',
  '}',

  '.blocklyIconGroup:not(:hover),',
  '.blocklyIconGroupReadonly {',
    'opacity: .6;',
  '}',

  '.blocklyBreakpointIconGroup:hover,',
  '.blocklyBreakpointIconGroupReadonly {',
    'fill-opacity: .6;',
  '}',

  '.blocklyIconShape {',
    'fill: #000;',
    'stroke-width: 1px;',
    'stroke: #fff;',
    'cursor: pointer;',
  '}',

  '.blocklyIconSymbol {',
    'fill: #fff;',
  '}',

  '.blocklyMinimalBody {',
    'margin: 0;',
    'padding: 0;',
    'background-color: #FAF6BD;',
  '}',

  // pxtblockly: workspace comment background in IE
  '.blocklyUneditableMinimalBody {',
    'fill: #FAF6BD;',
  '}',

  '.blocklyHtmlInput {',
    'border: none;',
    'font-family: "Helvetica Neue", "Segoe UI", Helvetica, sans-serif;',
    'font-size: 12pt;',
    'height: 100%;',
    'margin: 0;',
    'outline: none;',
    'box-sizing: border-box;',
    'width: 100%;',
    'text-align: center;',
    'color: $colour_text;',
    'font-weight: bold;',
  '}',

  /* Edge and IE introduce a close icon when the input value is longer than a
     certain length. This affects our sizing calculations of the text input.
     Hiding the close icon to avoid that. */
  '.blocklyHtmlInput::-ms-clear {',
    'display: none;',
  '}',

  '.blocklyMainBackground {',
    'stroke-width: 1;',
    'stroke: #c6c6c6;',  /* Equates to #ddd due to border being off-pixel. */
    'touch-action: none;',
  '}',

  '.blocklyMutatorBackground {',
    'fill: #fff;',
    'stroke: #ddd;',
    'stroke-width: 1;',
  '}',

  '.blocklyFlyoutBackground {',
    'fill: $colour_flyout;',
    'fill-opacity: .8;',
  '}',

  '.blocklyMainWorkspaceScrollbar {',
    'z-index: 20;',
  '}',

  '.blocklyFlyoutScrollbar {',
    'z-index: 30;',
  '}',

  '.blocklyScrollbarHorizontal,',
  '.blocklyScrollbarVertical {',
    'position: absolute;',
    'outline: none;',
    'touch-action: none;',
  '}',

  '.blocklyScrollbarBackground {',
    'opacity: 0;',
  '}',

  '.blocklyScrollbarHandle {',
    'fill: $colour_scrollbar;',
  '}',

  '.blocklyScrollbarBackground:hover+.blocklyScrollbarHandle,',
  '.blocklyScrollbarHandle:hover {',
    'fill: $colour_scrollbarHover;',
  '}',

  '.blocklyZoom>image {',
    'opacity: 1;',
  '}',

  /* Darken flyout scrollbars due to being on a grey background. */
  /* By contrast, workspace scrollbars are on a white background. */
  '.blocklyFlyout .blocklyScrollbarHandle {',
    'fill: #bbb;',
  '}',

  '.blocklyFlyout .blocklyScrollbarBackground:hover+.blocklyScrollbarHandle,',
  '.blocklyFlyout .blocklyScrollbarHandle:hover {',
    'fill: #aaa;',
  '}',

  '.blocklyInvalidInput {',
    'background: #faa;',
  '}',

  '.blocklyVerticalMarker {',
    'stroke-width: 3px;',
    'fill: rgba(255,255,255,.5);',
    'pointer-events: none;',
  '}',

  '.blocklyWidgetDiv .goog-option-selected .goog-menuitem-checkbox,',
  '.blocklyWidgetDiv .goog-option-selected .goog-menuitem-icon,',
  '.blocklyDropDownDiv .goog-option-selected .goog-menuitem-checkbox,',
  '.blocklyDropDownDiv .goog-option-selected .goog-menuitem-icon {',
    'background: url(<<<PATH>>>/sprites.png) no-repeat -48px -16px;',
  '}',

  /* Copied from: goog/css/menu.css */
  /*
   * Copyright 2009 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /**
   * Standard styling for menus created by goog.ui.MenuRenderer.
   *
   * @author attila@google.com (Attila Bodis)
   */

  '.blocklyWidgetDiv .goog-menu {',
    'background: #fff;',
    'border-color: transparent;',
    'border-style: solid;',
    'border-width: 1px;',
    'cursor: default;',
    'font: normal 13px "Helvetica Neue", Helvetica, sans-serif;',
    'margin: 0;',
    'outline: none;',
    'padding: 4px 0;',
    'position: absolute;',
    'overflow-y: auto;',
    'overflow-x: hidden;',
    'max-height: 100%;',
    'z-index: 20000;',  /* Arbitrary, but some apps depend on it... */
    'box-shadow: 0px 0px 3px 1px rgba(0,0,0,.3);',
  '}',

  '.blocklyDropDownDiv .goog-menu {',
    'cursor: default;',
    'font: normal 13px "Helvetica Neue", Helvetica, sans-serif;',
    'outline: none;',
    'z-index: 20000;',  /* Arbitrary, but some apps depend on it... */
    'box-shadow: 0px 0px 3px 1px rgba(0,0,0,.3);',
  '}',

  '.blocklyWidgetDiv .goog-menu.focused {',
    'box-shadow: 0px 0px 6px 1px rgba(0,0,0,.3);',
  '}',

  '.blocklyDropDownDiv .goog-menu {',
    'cursor: default;',
    'font: normal 13px "Helvetica Neue", Helvetica, sans-serif;',
    'outline: none;',
    'z-index: 20000;',  /* Arbitrary, but some apps depend on it... */
  '}',

  /* Copied from: goog/css/menuitem.css */
  /*
   * Copyright 2009 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /**
   * Standard styling for menus created by goog.ui.MenuItemRenderer.
   *
   * @author attila@google.com (Attila Bodis)
   */

  /**
   * State: resting.
   *
   * NOTE(mleibman,chrishenry):
   * The RTL support in Closure is provided via two mechanisms -- "rtl" CSS
   * classes and BiDi flipping done by the CSS compiler.  Closure supports RTL
   * with or without the use of the CSS compiler.  In order for them not to
   * conflict with each other, the "rtl" CSS classes need to have the #noflip
   * annotation.  The non-rtl counterparts should ideally have them as well,
   * but, since .goog-menuitem existed without .goog-menuitem-rtl for so long
   * before being added, there is a risk of people having templates where they
   * are not rendering the .goog-menuitem-rtl class when in RTL and instead
   * rely solely on the BiDi flipping by the CSS compiler.  That's why we're
   * not adding the #noflip to .goog-menuitem.
   */
  '.blocklyWidgetDiv .goog-menuitem,',
  '.blocklyDropDownDiv .goog-menuitem {',
    'color: #000;',
    'font: normal 13px "Helvetica Neue", Helvetica, sans-serif;',
    'list-style: none;',
    'margin: 0;',
    /* 7em on the right for shortcut. */
    'min-width: 7em;',
    'border: none;',
    'padding: 6px 15px;',
    'white-space: nowrap;',
    'cursor: pointer;',
  '}',

  /* If a menu doesn't have checkable items or items with icons,
   * remove padding.
   */
  '.blocklyWidgetDiv .goog-menu-nocheckbox .goog-menuitem,',
  '.blocklyWidgetDiv .goog-menu-noicon .goog-menuitem,',
  '.blocklyDropDownDiv .goog-menu-nocheckbox .goog-menuitem,',
  '.blocklyDropDownDiv .goog-menu-noicon .goog-menuitem {',
    'padding-left: 12px;',
  '}',

  '.blocklyWidgetDiv .goog-menuitem-content,',
  '.blocklyDropDownDiv .goog-menuitem-content {',
    'font-family: Arial, sans-serif;',
    'font-size: 13px;',
  '}',

  '.blocklyWidgetDiv .goog-menuitem-content {',
    'color: #000;',
  '}',

  '.blocklyDropDownDiv .goog-menuitem-content {',
    'color: #000;',
  '}',

  /* State: disabled. */
  '.blocklyWidgetDiv .goog-menuitem-disabled,',
  '.blocklyDropDownDiv .goog-menuitem-disabled {',
    'cursor: inherit;',
  '}',

  '.blocklyWidgetDiv .goog-menuitem-disabled .goog-menuitem-content,',
  '.blocklyDropDownDiv .goog-menuitem-disabled .goog-menuitem-content {',
    'color: #ccc !important;',
  '}',

  '.blocklyWidgetDiv .goog-menuitem-disabled .goog-menuitem-icon,',
  '.blocklyDropDownDiv .goog-menuitem-disabled .goog-menuitem-icon {',
    'opacity: .3;',
    'filter: alpha(opacity=30);',
  '}',

  /* State: hover. */
  '.blocklyWidgetDiv .goog-menuitem-highlight ,',
  '.blocklyDropDownDiv .goog-menuitem-highlight {',
    'background-color: rgba(0,0,0,.1);',
  '}',

  /* State: selected/checked. */
  '.blocklyWidgetDiv .goog-menuitem-checkbox,',
  '.blocklyWidgetDiv .goog-menuitem-icon,',
  '.blocklyDropDownDiv .goog-menuitem-checkbox,',
  '.blocklyDropDownDiv .goog-menuitem-icon {',
    'background-repeat: no-repeat;',
    'height: 16px;',
    'left: 6px;',
    'position: absolute;',
    'right: auto;',
    'vertical-align: middle;',
    'width: 16px;',
  '}',

  /* BiDi override for the selected/checked state. */
  /* #noflip */
  '.blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-checkbox,',
  '.blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-icon,',
  '.blocklyDropDownDiv .goog-menuitem-rtl .goog-menuitem-checkbox,',
  '.blocklyDropDownDiv .goog-menuitem-rtl .goog-menuitem-icon {',
     /* Flip left/right positioning. */
    'left: auto;',
    'right: 6px;',
  '}',

  '.blocklyWidgetDiv .goog-option-selected .goog-menuitem-checkbox,',
  '.blocklyWidgetDiv .goog-option-selected .goog-menuitem-icon,',
  '.blocklyDropDownDiv .goog-option-selected .goog-menuitem-checkbox,',
  '.blocklyDropDownDiv .goog-option-selected .goog-menuitem-icon {',
     /* Client apps may override the URL at which they serve the sprite. */
    'background: url(<<<PATH>>>/sprites.png) no-repeat -48px -16px !important;',
    'position: static;', /* Scroll with the menu. */
    'float: left;',
    'margin-left: -24px;',
  '}',

  '.blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-checkbox,',
  '.blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-icon,',
  '.blocklyDropDownDiv .goog-menuitem-rtl .goog-menuitem-checkbox,',
  '.blocklyDropDownDiv .goog-menuitem-rtl .goog-menuitem-icon {',
    'float: right;',
    'margin-right: -24px;',
  '}',

  '.blocklyWidgetDiv .goog-menuseparator, ',
  '.blocklyDropDownDiv .goog-menuseparator {',
    'border-top: 1px solid #ccc;',
    'margin: 4px 0;',
    'padding: 0;',
  '}',

  '.blocklyComputeCanvas {',
    'position: absolute;',
    'width: 0;',
    'height: 0;',
  '}',

  '.blocklyNoPointerEvents {',
    'pointer-events: none;',
  '}',

  '.blocklyContextMenu {',
    'border-radius: 4px;',
    'max-height: 100%;',
  '}',

  '.blocklyDropdownMenu {',
    'border-radius: 2px;',
    'padding: 0 !important;',
  '}',

  // TODO shakao move numpad
  '.blocklyDropDownNumPad {',
    'background-color: $colour_numPadBackground;',
  '}',

  '.blocklyWidgetDiv .blocklyDropdownMenu .goog-menuitem,', // pxt-blockly
  '.blocklyDropDownDiv .blocklyDropdownMenu .goog-menuitem,', // pxt-blockly
  '.blocklyDropdownMenu .blocklyMenuItem {',
    /* 28px on the left for icon or checkbox. */
    'padding-left: 28px;',
  '}',

  /* BiDi override for the resting state. */
  '.blocklyDropdownMenu .blocklyMenuItemRtl {',
     /* Flip left/right padding for BiDi. */
    'padding-left: 5px;',
    'padding-right: 28px;',
  '}',

  '.blocklyWidgetDiv .blocklyMenu {',
    'background: #fff;',
    'border: 1px solid transparent;',
    'box-shadow: 0 0 3px 1px rgba(0,0,0,.3);',
    'font: normal 13px Arial, sans-serif;',
    'margin: 0;',
    'outline: none;',
    'padding: 4px 0;',
    'position: absolute;',
    'overflow-y: auto;',
    'overflow-x: hidden;',
    'max-height: 100%;',
    'z-index: 20000;',  /* Arbitrary, but some apps depend on it... */
  '}',

  '.blocklyDropDownDiv .goog-menu {',
    'cursor: default;',
    'font: normal 13px "Helvetica Neue", Helvetica, sans-serif;',
    'outline: none;',
    'z-index: 20000;',  /* Arbitrary, but some apps depend on it... */
    'box-shadow: 0px 0px 3px 1px rgba(0,0,0,.3);',
  '}',

  '.blocklyWidgetDiv .goog-menu.focused,',
  '.blocklyWidgetDiv .blocklyMenu.blocklyFocused {',
    'box-shadow: 0 0 6px 1px rgba(0,0,0,.3);',
  '}',

  '.blocklyDropDownDiv .blocklyMenu {',
    'background: inherit;',  /* Compatibility with gapi, reset from goog-menu */
    'border: inherit;',  /* Compatibility with gapi, reset from goog-menu */
    'font: normal 13px "Helvetica Neue", Helvetica, sans-serif;',
    'outline: none;',
    'position: relative;',  /* Compatibility with gapi, reset from goog-menu */
    'z-index: 20000;',  /* Arbitrary, but some apps depend on it... */
  '}',

  /* State: resting. */
  '.blocklyMenuItem {',
    'border: none;',
    'color: #000;',
    'cursor: pointer;',
    'list-style: none;',
    'margin: 0;',
    /* 7em on the right for shortcut. */
    'min-width: 7em;',
    'padding: 6px 15px;',
    'white-space: nowrap;',
  '}',

  /* State: disabled. */
  '.blocklyMenuItemDisabled {',
    'color: #ccc;',
    'cursor: inherit;',
  '}',

  /* State: hover. */
  '.blocklyMenuItemHighlight {',
    'background-color: rgba(0,0,0,.1);',
  '}',

  /* State: selected/checked. */
  '.blocklyMenuItemCheckbox {',
    'height: 16px;',
    'position: absolute;',
    'width: 16px;',
  '}',


  '.blocklyMenuItemSelected .blocklyMenuItemCheckbox {',
    'background: url(<<<PATH>>>/sprites.png) no-repeat -48px -16px;',
    'float: left;',
    'margin-left: -24px;',
    'position: static;',  /* Scroll with the menu. */
  '}',

  '.blocklyMenuItemRtl .blocklyMenuItemCheckbox {',
    'float: right;',
    'margin-right: -24px;',
  '}',

  /* pxtblockly: Field slider. */
  '.blocklyDropDownDiv .goog-slider-horizontal {',
    'margin: 8px;',
    'height: 22px;',
    'width: 150px;',
    'position: relative;',
    'outline: none;',
    'border-radius: 11px;',
    'margin-bottom: 20px;',
    'background: #547AB2',
  '}',
  '.blocklyDropDownDiv .goog-slider-horizontal .goog-slider-thumb {',
     'width: 26px;',
     'height: 26px;',
     'top: -1px;',
     'position: absolute;',
     'background-color: white;',
     'border-radius: 100%;',
     '-webkit-box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.15);',
     '-moz-box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.15);',
     'box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.15);',
     'cursor: pointer',
  '}',
  '.blocklyFieldSliderLabel {',
    'font-family: "Helvetica Neue", "Segoe UI", Helvetica, sans-serif;',
    'font-size: 0.65rem;',
    'color: $colour_toolboxText;',
    'margin: 8px;',
  '}',
  '.blocklyFieldSliderLabelText {',
    'font-weight: bold;',
  '}',
  '.blocklyFieldSliderReadout {',
    'margin-left: 10px;',
  '}',

  // pxtblockly: Adding blocklyHighlighted CSS classes for outlining blocks
  '.blocklyHighlighted>.blocklyPath {',
    'stroke: #ff8b27;',
    'stroke-width: 5px;',
  '}',

  // pxt-blockly: Argument editor
  '.argumentEditorRemoveIcon {',
    'position: absolute;',
    'width: 24px;',
    'height: 24px;',
    'top: -40px;',
    'left: 50%;',
    'margin-left: -12px;',
    'cursor: pointer;',
  '}',

  '.functioneditor i.argumentEditorTypeIcon {',
    'position: absolute;',
    'width: 24px;',
    'height: 24px;',
    'top: 40px;',
    'left: 50%;',
    'margin-left: -12px;',
  '}',

  '.blocklyWidgetDiv.fieldTextInput.argumentEditorInput {',
    'overflow: visible;',
  '}',

  // pxt-blockly: Bold function names
  '.functionNameText {',
    'font-weight: bold;',
  '}',

  // Quote for string field
  '.field-text-quote {',
    'fill: #a31515 !important;',
  '}',

  /* eslint-enable indent */
];
