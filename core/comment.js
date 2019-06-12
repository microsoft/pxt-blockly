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
Blockly.Comment.prototype.height_ = 80;

/**
 * Draw the comment icon.
 * PXT Blockly: draw comment icon shape
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
 * PXT Blockly: keep creatEditor_ and createTextEditor_
 * functions separate, to leave space for top icons
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

  // Add the delete and minimize icon
  this.createTopBarIcons_();

  Blockly.bindEventWithChecks_(
      this.deleteIcon_, 'mousedown', this, this.deleteMouseDown_);
  Blockly.bindEventWithChecks_(
      this.deleteIcon_, 'mouseup', this, this.deleteMouseUp_);
  Blockly.bindEventWithChecks_(
      this.minimizeArrow_, 'mousedown', this, this.minimizeMouseUp_);

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
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH + Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT},
      null); // PXT Blockly: add space for top bar height
  var body = document.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var textarea = document.createElementNS(Blockly.HTML_NS, 'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.block_.RTL ? 'RTL' : 'LTR');
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.foreignObject_.appendChild(body);
  Blockly.bindEventWithChecks_(textarea, 'mouseup', this, this.textareaFocus_);
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
  return this.foreignObject_;
};

/**
 * PXT Blockly: Create the minimize toggle and delete icons that in the comment top bar.
 * @private
 */
Blockly.Comment.prototype.createTopBarIcons_ = function() {
  var topBarMiddleY = (Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT / 2) +
      Blockly.WorkspaceCommentSvg.BORDER_WIDTH;

  // Minimize Toggle Icon in Comment Top Bar
  var xInset = Blockly.WorkspaceCommentSvg.TOP_BAR_ICON_INSET;
  this.minimizeArrow_ = Blockly.utils.createSvgElement('image',
      {
        'x': xInset,
        'y': topBarMiddleY - Blockly.WorkspaceCommentSvg.MINIMIZE_ICON_SIZE / 2,
        'width': Blockly.WorkspaceCommentSvg.MINIMIZE_ICON_SIZE,
        'height': Blockly.WorkspaceCommentSvg.MINIMIZE_ICON_SIZE
      }, this.svgGroup_);
  this.minimizeArrow_.setAttributeNS('http://www.w3.org/1999/xlink',
    'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'comment-arrow-down.svg');

  // Delete Icon in Comment Top Bar
  this.deleteIcon_ = Blockly.utils.createSvgElement(
    'g',
    {
      'class': 'blocklyCommentDeleteIcon'
    },
    this.svgGroup_);
  Blockly.utils.createSvgElement('rect',
      {
        'x': '-12.5', 'y': '1',
        'width': '27.5', 'height': '27.5',
        'fill': 'transparent',
        'class': 'blocklyDeleteIconShape'
      },
      this.deleteIcon_);
  Blockly.WorkspaceCommentSvg.drawDeleteIcon(this.deleteIcon_)
};

/**
 * PXT Blockly: Handle a mouse-down on comment's delete icon.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Comment.prototype.deleteMouseDown_ = function(e) {
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * PXT Blockly: Handle a mouse-up on comment's delete icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.deleteMouseUp_ = function(e) {
  // Delete this comment
  this.block_.setCommentText(null);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
  // pxt-blockly: clear touch identifier set by mousedown
  Blockly.Touch.clearTouchIdentifier();
};

/**
 * PXT Blockly: Handle a mouse-up on comment's minimize icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.minimizeMouseUp_ = function(e) {
  // Minimize this comment
  this.block_.comment.setVisible(false);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
  // pxt-blockly: clear touch identifier set by mousedown
  Blockly.Touch.clearTouchIdentifier();
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
    var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
    var topBarHeight = Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT
    this.foreignObject_.setAttribute('width', size.width - doubleBorderWidth);
    this.foreignObject_.setAttribute('height', size.height - doubleBorderWidth - topBarHeight); // PXT Blockly: add space for top bar height
    this.textarea_.style.width = (size.width - doubleBorderWidth - 4) + 'px';
    this.textarea_.style.height = (size.height - doubleBorderWidth - topBarHeight - 4) + 'px'; // PXT Blockly: add space for top bar height

    // PXT Blockly: handle minimize and delete icons
    if (this.RTL) {
      this.minimizeArrow_.setAttribute('x', size.width -
          (Blockly.WorkspaceCommentSvg.MINIMIZE_ICON_SIZE) -
          Blockly.WorkspaceCommentSvg.TOP_BAR_ICON_INSET);
      this.minimizeArrow_.setAttribute('transform', 'translate(' + -size.width + ', 1)');
      this.deleteIcon_.setAttribute('transform', 'translate(' +
          (-size.width + Blockly.WorkspaceCommentSvg.DELETE_ICON_SIZE +
          Blockly.WorkspaceCommentSvg.TOP_BAR_ICON_INSET) + ',' + (0) + ') scale(-1 1)');
    } else {
      this.deleteIcon_.setAttribute('transform', 'translate(' +
          (size.width - Blockly.WorkspaceCommentSvg.DELETE_ICON_SIZE -
          Blockly.WorkspaceCommentSvg.TOP_BAR_ICON_INSET) + ',' +
          (0) + ')');
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
 * Bring the comment to the top of the stack when clicked on.
 * @param {!Event} _e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.textareaFocus_ = function(_e) {
  // Ideally this would be hooked to the focus event for the comment.
  // This is tied to mousedown, however doing so in Firefox swallows the cursor
  // for unknown reasons.
  // See https://github.com/LLK/scratch-blocks/issues/1631 for more history.
  if (this.bubble_.promote_()) {
    // Since the act of moving this node within the DOM causes a loss of focus,
    // we need to reapply the focus.
    this.textarea_.focus();
  }
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