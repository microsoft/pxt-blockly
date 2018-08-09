/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Object representing a code comment.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Comment');

goog.require('Blockly.Bubble');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Icon');
goog.require('goog.userAgent');


/**
 * Class for a comment.
 * @param {!Blockly.Block} block The block associated with this comment.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Comment = function(block) {
  Blockly.Comment.superClass_.constructor.call(this, block);
  this.createIcon();
};
goog.inherits(Blockly.Comment, Blockly.Icon);

/**
 * Comment text (if bubble is not visible).
 * @private
 */
Blockly.Comment.prototype.text_ = '';

/**
 * Width of bubble.
 * @private
 */
Blockly.Comment.prototype.width_ = 160;

/**
 * Height of bubble.
 * @private
 */
Blockly.Comment.prototype.height_ = 120;

/**
 * Draw the comment icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Comment.prototype.drawIcon_ = function(group) {
  Blockly.utils.createSvgElement('path',
      {
        'class': 'blocklyIconShape',
        'd': 'm 2,2 0,9.2211 3.0026599,0 1.6008929,1.5989 1.8138195,-1.5989 6.6046683,0 0,-9.2211 -13.0220406,0 z',
        'style': 'fill: #fff;'
      },
      group);
  Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyIconSymbol',
        'x': '4',
        'y': '8',
        'height': '1',
        'width': '6',
        'style': 'fill: #575E75;'
      },
      group);
  Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyIconSymbol',
        'x': '4',
        'y': '6',
        'height': '1',
        'width': '6',
        'style': 'fill: #575E75;'
      },
      group);
  Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyIconSymbol',
        'x': '4',
        'y': '4',
        'height': '1',
        'width': '8',
        'style': 'fill: #575E75;'
      },
      group);
};

/**
 * Create the editor for the comment's bubble.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.Comment.prototype.createEditor_ = function() {
  // Create core elements for the block.
  /**
   * @type {SVGElement}
   * @private
   */
  this.svgGroup_ = Blockly.utils.createSvgElement(
      'g', {'class': 'blocklyCommentBubble'}, null);
  this.svgGroup_.translate_ = '';

  this.createTextEditor_();
  this.svgGroup_.appendChild(this.foreignObject_);

  // Add the delete icon
  this.addDeleteDom_();
  Blockly.bindEventWithChecks_(
      this.deleteGroup_, 'mousedown', this, this.deleteMouseDown_);
  Blockly.bindEventWithChecks_(
      this.deleteGroup_, 'mouseout', this, this.deleteMouseOut_);
  Blockly.bindEventWithChecks_(
      this.deleteGroup_, 'mouseup', this, this.deleteMouseUp_);

  // Add the minimize icon
  this.addMinimizeDom_();
  Blockly.bindEventWithChecks_(
      this.minimizeGroup_, 'mousedown', this, this.minimizeMouseUp_);

  return this.svgGroup_;
};

/**
 * Create the textarea editor for the comment's bubble.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.Comment.prototype.createTextEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
    <foreignObject x="8" y="8" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <textarea xmlns="http://www.w3.org/1999/xhtml"
            class="blocklyCommentTextarea"
            style="height: 164px; width: 164px;"></textarea>
      </body>
    </foreignObject>
  */
  this.foreignObject_ = Blockly.utils.createSvgElement('foreignObject',
      {
        'x': Blockly.WorkspaceCommentSvg.BORDER_WIDTH,
        'y': Blockly.WorkspaceCommentSvg.BORDER_WIDTH + Blockly.WorkspaceCommentSvg.TOP_OFFSET,
        // pxtblockly: Firefox does not respect the stacking context for foreign objects; see https://bugzilla.mozilla.org/show_bug.cgi?id=984312
        'transform': 'translate(0, 0)'
      },
      null);
  var body = document.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var textarea = document.createElementNS(Blockly.HTML_NS, 'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.block_.RTL ? 'RTL' : 'LTR');
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.foreignObject_.appendChild(body);
  Blockly.bindEventWithChecks_(textarea, 'mouseup', this, this.textareaFocus_, true, true);
  Blockly.bindEventWithChecks_(textarea, 'blur', this, this.textareaBlur_);
  // Don't zoom with mousewheel.
  Blockly.bindEventWithChecks_(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEventWithChecks_(textarea, 'change', this, function(_e) {
    if (this.text_ != textarea.value) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.block_, 'comment', null, this.text_, textarea.value));
      this.text_ = textarea.value;
    }
  });
  setTimeout(function() {
    textarea.focus();
  }, 0);
  this.addFocus();
  return this.foreignObject_;
};

/**
 * Add the delete icon to the DOM
 * @private
 */
Blockly.Comment.prototype.addDeleteDom_ = function() {
  this.deleteGroup_ = Blockly.utils.createSvgElement(
      'g',
      {
        'class': 'blocklyCommentDeleteIcon'
      },
      this.svgGroup_);
  this.deleteIconBorder_ = Blockly.utils.createSvgElement('rect',
      {
        'x': '-12.5', 'y': '1',
        'width': '27.5', 'height': '27.5',
        'fill': 'transparent',
        'class': 'blocklyDeleteIconShape'
      },
      this.deleteGroup_);
  Blockly.WorkspaceCommentSvg.drawDeleteIcon(this.deleteGroup_)
};

/**
 * Handle a mouse-down on comment's delete icon.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Comment.prototype.deleteMouseDown_ = function(e) {
  // highlight the delete icon
  Blockly.utils.addClass(
      /** @type {!Element} */ (this.deleteIconBorder_), 'blocklyDeleteIconHighlighted');
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Handle a mouse-out on comment's delete icon.
 * @param {!Event} e Mouse out event.
 * @private
 */
Blockly.Comment.prototype.deleteMouseOut_ = function(/*e*/) {
  // restore highlight on the delete icon
  Blockly.utils.removeClass(
      /** @type {!Element} */ (this.deleteIconBorder_), 'blocklyDeleteIconHighlighted');
};

/**
 * Handle a mouse-up on comment's delete icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.deleteMouseUp_ = function(e) {
  // Delete this comment
  this.block_.setCommentText(null);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Add the minimize icon to the DOM
 * @private
 */
Blockly.Comment.prototype.addMinimizeDom_ = function() {
  this.minimizeGroup_ = Blockly.utils.createSvgElement(
      'g',
      {
        'class': 'blocklyCommentMinimizeIcon'
      },
      this.svgGroup_);
  Blockly.utils.createSvgElement('rect',
      {
        'x': '2', 'y': '2',
        'width': '27.5', 'height': '27.5',
        'class': 'blocklyIconShape',
        'style': 'fill: transparent; stroke-width: 0px;'
      },
      this.minimizeGroup_);
  Blockly.utils.createSvgElement(
      'path',
      {
        'd': 'm 15,17 c -2.0186301,-1.7939 -4.0372859,-3.5877 -6.0559675,-5.3815 4.0751576,0.011 8.1503148,0.023 12.2254728,0.034 -2.056269,1.7828 -4.112771,3.5653 -6.1695053,5.3475 z',
        'style': 'fill: #fff'
      },
      this.minimizeGroup_);
};

/**
 * Handle a mouse-up on comment's minimize icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.minimizeMouseUp_ = function(e) {
  // Minimize this comment
  this.block_.comment.setVisible(false);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Add or remove editability of the comment.
 * @override
 */
Blockly.Comment.prototype.updateEditable = function() {
  if (this.isVisible()) {
    // Toggling visibility will force a rerendering.
    this.setVisible(false);
    this.setVisible(true);
  }
  // Allow the icon to update.
  Blockly.Icon.prototype.updateEditable.call(this);
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.Comment.prototype.resizeBubble_ = function() {
  if (this.isVisible()) {
    var size = this.bubble_.getBubbleSize();
    var doubleBorderWidth = 2 * Blockly.WorkspaceCommentSvg.BORDER_WIDTH;
    var topOffset = Blockly.WorkspaceCommentSvg.TOP_OFFSET;
    this.foreignObject_.setAttribute('width', size.width - doubleBorderWidth);
    this.foreignObject_.setAttribute('height', size.height - doubleBorderWidth - topOffset);
    this.textarea_.style.width = (size.width - doubleBorderWidth - 4) + 'px';
    this.textarea_.style.height = (size.height - doubleBorderWidth - topOffset - 4) + 'px';

    if (this.deleteGroup_) {
      if (this.block_.RTL) {
        this.deleteGroup_.setAttribute('transform', 'translate(' +
          (Blockly.WorkspaceCommentSvg.DELETE_ICON_PADDING +
          Blockly.WorkspaceCommentSvg.BORDER_WIDTH) + ',' +
          Blockly.WorkspaceCommentSvg.BORDER_WIDTH + ') scale(-1 1)');
      } else {
        this.deleteGroup_.setAttribute('transform', 'translate(' +
          (size.width - Blockly.WorkspaceCommentSvg.DELETE_ICON_PADDING -
          Blockly.WorkspaceCommentSvg.BORDER_WIDTH) + ',' +
          Blockly.WorkspaceCommentSvg.BORDER_WIDTH + ')');
      }
    }
  }
};

/**
 * Show or hide the comment bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Comment.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  Blockly.Events.fire(
      new Blockly.Events.Ui(this.block_, 'commentOpen', !visible, visible));
  if ((!this.block_.isEditable() && !this.textarea_) || goog.userAgent.IE) {
    // Steal the code from warnings to make an uneditable text bubble.
    // MSIE does not support foreignobject; textareas are impossible.
    // http://msdn.microsoft.com/en-us/library/hh834675%28v=vs.85%29.aspx
    // Always treat comments in IE as uneditable.
    Blockly.Warning.prototype.setVisible.call(this, visible);
    return;
  }
  // Save the bubble stats before the visibility switch.
  var text = this.getText();
  var size = this.getBubbleSize();
  if (visible) {
    // Create the bubble.
    this.bubble_ = new Blockly.Bubble(
        /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
        this.createEditor_(), this.block_.svgPath_,
        this.iconXY_, this.width_, this.height_);
    // Expose this comment's block's ID on its top-level SVG group.
    this.bubble_.setSvgId(this.block_.id);
    this.bubble_.registerResizeEvent(this.resizeBubble_.bind(this));
    this.updateColour();
  } else {
    // Dispose of the bubble.
    this.bubble_.dispose();
    this.bubble_ = null;
    this.textarea_ = null;
    this.foreignObject_ = null;
  }
  // Restore the bubble stats after the visibility switch.
  this.setText(text);
  this.setBubbleSize(size.width, size.height);
};

/**
 * Focus this comment.  Highlight it visually.
 */
Blockly.Comment.prototype.addFocus = function() {
  Blockly.utils.addClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklyFocused');
};

/**
 * Unfocus this comment.  Remove its highlighting.
 */
Blockly.Comment.prototype.removeFocus = function() {
  Blockly.utils.removeClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklyFocused');
};

/**
 * Bring the comment to the top of the stack when clicked on.
 * @param {!Event} _e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.textareaFocus_ = function(_e) {
  // Ideally this would be hooked to the focus event for the comment.
  // However doing so in Firefox swallows the cursor for unknown reasons.
  // So this is hooked to mouseup instead.  No big deal.
  if (this.bubble_.promote_()) {
    // Since the act of moving this node within the DOM causes a loss of focus,
    // we need to reapply the focus.
    this.textarea_.focus();
  }
  this.addFocus();
};

/**
 * Remove the focused attribute when the text area goes out of focus.
 * @param {!Event} e blur event.
 * @private
 */
Blockly.Comment.prototype.textareaBlur_ = function(
    /* eslint-disable no-unused-vars */ e /* eslint-enable no-unused-vars */) {
  this.removeFocus();
};

/**
 * Get the dimensions of this comment's bubble.
 * @return {!Object} Object with width and height properties.
 */
Blockly.Comment.prototype.getBubbleSize = function() {
  if (this.isVisible()) {
    return this.bubble_.getBubbleSize();
  } else {
    return {width: this.width_, height: this.height_};
  }
};

/**
 * Size this comment's bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Comment.prototype.setBubbleSize = function(width, height) {
  if (this.textarea_) {
    this.bubble_.setBubbleSize(width, height);
  } else {
    this.width_ = width;
    this.height_ = height;
  }
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 */
Blockly.Comment.prototype.getText = function() {
  return this.textarea_ ? this.textarea_.value : this.text_;
};

/**
 * Set this comment's text.
 * @param {string} text Comment text.
 */
Blockly.Comment.prototype.setText = function(text) {
  if (this.text_ != text) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.block_, 'comment', null, this.text_, text));
    this.text_ = text;
  }
  if (this.textarea_) {
    this.textarea_.value = text;
  }
};

/**
 * Dispose of this comment.
 */
Blockly.Comment.prototype.dispose = function() {
  if (Blockly.Events.isEnabled()) {
    this.setText('');  // Fire event to delete comment.
  }
  this.block_.comment = null;
  Blockly.Icon.prototype.dispose.call(this);
};
