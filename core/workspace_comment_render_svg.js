/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Methods for rendering a workspace comment as SVG
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceCommentSvg.render');

goog.require('Blockly.WorkspaceCommentSvg');


/**
 * Size of the resize icon.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.RESIZE_SIZE = 12;

/**
 * Radius of the border around the comment.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.BORDER_RADIUS = 0;

/**
 * Width of the border around the comment.
 */
Blockly.WorkspaceCommentSvg.BORDER_WIDTH = 1;

/**
 * Offset from the foreignobject edge to the textarea edge.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET = 2;

/**
 * Offset from the top to make room for a top bar.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.TOP_OFFSET = 30;

/**
 * Padding of the delete icon.
 * @type {number}
 * @const
 */
Blockly.WorkspaceCommentSvg.DELETE_ICON_PADDING = 16;

/**
 * Length of an uneditable text field in characters.
 * @type {number}
 * @const
 */
Blockly.WorkspaceCommentSvg.UNEDITABLE_TEXT_LENGTH = 35;

/**
 * Line gap.
 * @type {number}
 * @const
 */
Blockly.WorkspaceCommentSvg.UNEDITABLE_LINE_GAP = 30;

/**
 * Returns a bounding box describing the dimensions of this comment.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getHeightWidth = function() {
  return { width: this.getWidth(), height: this.getHeight() };
};

/**
 * Renders the workspace comment.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.render = function() {
  if (this.rendered_) {
    return;
  }

  var size = this.getHeightWidth();

  // Add text area
  // TODO: Does this need to happen every time?  Or are we orphaning foreign
  // elements in the code?
  if (!this.isEditable() || goog.userAgent.IE) {
    this.createUneditableText_()
    this.svgGroup_.appendChild(this.uneditableTextGroup_);
  } else {
    this.createEditor_();
    this.svgGroup_.appendChild(this.foreignObject_);
  }

  this.svgHandleTarget_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyCommentHandleTarget',
        'fill': 'transparent',
        'x': 0,
        'y': 0
      });
  this.svgGroup_.appendChild(this.svgHandleTarget_);
  this.svgRectTarget_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyCommentTarget',
        'x': 0,
        'y': 0,
        'rx': Blockly.WorkspaceCommentSvg.BORDER_RADIUS,
        'ry': Blockly.WorkspaceCommentSvg.BORDER_RADIUS
      });
  this.svgGroup_.appendChild(this.svgRectTarget_);

  // Add the delete icon
  if (this.isDeletable()) {
    // Add the delete icon
    this.addDeleteDom_(this.svgGroup_);
  }

  // Set the content
  if (this.textarea_) {
    this.textarea_.value = this.content_;
  } else {
    // Split up the text content into multiple lines
    for (var i = 0; i < this.content_.length; i += Blockly.WorkspaceCommentSvg.UNEDITABLE_TEXT_LENGTH) {
        var line = this.content_.substring(i, i + Blockly.WorkspaceCommentSvg.UNEDITABLE_TEXT_LENGTH);
        this.pushUneditableTextLine_(line);
    }
  }

  // Add the resize icon
  if (this.isEditable() && !goog.userAgent.IE) {
    this.addResizeDom_();
    this.setSize_(size.width, size.height);
  } else {
    var width = Blockly.WorkspaceCommentSvg.UNEDITABLE_TEXT_LENGTH * 8;
    width += 25;
    var height = this.uneditableTextLineY - 10;
    this.setSize_(width, height);
  }

  this.rendered_ = true;

  if (this.resizeGroup_) {
    Blockly.bindEventWithChecks_(
        this.resizeGroup_, 'mousedown', this, this.resizeMouseDown_);
  }

  if (this.isDeletable()) {
    Blockly.bindEventWithChecks_(
        this.deleteGroup_, 'mousedown', this, this.deleteMouseDown_);
    Blockly.bindEventWithChecks_(
        this.deleteGroup_, 'mouseout', this, this.deleteMouseOut_);
    Blockly.bindEventWithChecks_(
        this.deleteGroup_, 'mouseup', this, this.deleteMouseUp_);
  }
};

/**
 * Create the text area for the comment.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
    <foreignObject class="blocklyCommentForeignObject" x="0" y="10" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <textarea xmlns="http://www.w3.org/1999/xhtml"
            class="blocklyCommentTextarea"
            style="height: 164px; width: 164px;"></textarea>
      </body>
    </foreignObject>
  */
  this.foreignObject_ = Blockly.utils.createSvgElement(
      'foreignObject',
      {
        'x': 0,
        'y': Blockly.WorkspaceCommentSvg.TOP_OFFSET,
        'class': 'blocklyCommentForeignObject'
      },
      null);
  var body = document.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var textarea = document.createElementNS(Blockly.HTML_NS, 'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.foreignObject_.appendChild(body);
  // Don't zoom with mousewheel.
  Blockly.bindEventWithChecks_(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEventWithChecks_(textarea, 'change', this, function(
      /* eslint-disable no-unused-vars */ e
      /* eslint-enable no-unused-vars */) {
    this.setContent(textarea.value);
  });
  return this.foreignObject_;
};

/**
 * Add the resize icon to the DOM
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.addResizeDom_ = function() {
  this.resizeGroup_ = Blockly.utils.createSvgElement(
      'g',
      {
        'class': this.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'
      },
      this.svgGroup_);
  var resizeSize = Blockly.WorkspaceCommentSvg.RESIZE_SIZE;
  Blockly.utils.createSvgElement(
      'polygon',
      {'points': '0,x x,x x,0'.replace(/x/g, resizeSize.toString())},
      this.resizeGroup_);
  Blockly.utils.createSvgElement(
      'line',
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize / 3
      }, this.resizeGroup_);
  Blockly.utils.createSvgElement(
      'line',
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize * 2 / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize * 2 / 3
      }, this.resizeGroup_);
};

/**
 * Add the delete icon to the DOM
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.addDeleteDom_ = function() {
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
 * Draw the minimize icon
 * @private
 */
Blockly.WorkspaceCommentSvg.drawDeleteIcon = function(svgGroup) {
  var iconColor = '#fff';
  var deleteIconGroup = Blockly.utils.createSvgElement('g',
      {
        'transform': 'scale (1.5) translate(-6, 1)'
      },
      svgGroup);
  // Lid
  var topX = 1;
  var topY = 2;
  var binWidth = 12;
  var binHeight = 12;
  Blockly.utils.createSvgElement(
      'rect',
      {
        'x': topX + (binWidth/2) - 2, 'y': topY,
        'width': '4', 'height': '2',
        'stroke': iconColor,
        'stroke-width': '1',
        'fill': 'transparent'
      },
      deleteIconGroup);
  // Top line.
  var topLineY = topY + 2;
  Blockly.utils.createSvgElement(
      'line',
      {
        'x1': topX, 'y1': topLineY,
        'x2': topX + binWidth, 'y2': topLineY,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
  // Rect
  Blockly.utils.createSvgElement(
      'rect',
      {
        'x': topX + 1, 'y': topLineY,
        'width': topX + binWidth - 3, 'height': binHeight,
        'rx': '1', 'ry': '1',
        'stroke': iconColor,
        'stroke-width': '1',
        'fill': 'transparent'
      },
      deleteIconGroup);
  // ||| icon.
  var x = 5;
  var y1 = topLineY + 3;
  var y2 = topLineY + binHeight - 3;
  Blockly.utils.createSvgElement(
      'line',
      {
        'x1': x, 'y1': y1,
        'x2': x, 'y2': y2,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
  Blockly.utils.createSvgElement(
      'line',
      {
        'x1': x+2, 'y1': y1,
        'x2': x+2, 'y2': y2,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
  Blockly.utils.createSvgElement(
      'line',
      {
        'x1': x+4, 'y1': y1,
        'x2': x+4, 'y2': y2,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
};

/**
 * Handle a mouse-down on comment's resize corner.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseDown_ = function(e) {
  //this.promote_();
  this.unbindDragEvents_();
  if (Blockly.utils.isRightButton(e)) {
    // No right-click.
    e.stopPropagation();
    return;
  }
  // Left-click (or middle click)
  this.workspace.startDrag(e, new goog.math.Coordinate(
    this.workspace.RTL ? -this.width_ : this.width_, this.height_));

  this.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mouseup', this, this.resizeMouseUp_);
  this.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mousemove', this, this.resizeMouseMove_);
  Blockly.hideChaff();
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Handle a mouse-down on comment's delete icon.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseDown_ = function(e) {
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
Blockly.WorkspaceCommentSvg.prototype.deleteMouseOut_ = function(/*e*/) {
  // restore highlight on the delete icon
  Blockly.utils.removeClass(
      /** @type {!Element} */ (this.deleteIconBorder_), 'blocklyDeleteIconHighlighted');
};

/**
 * Handle a mouse-up on comment's delete icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseUp_ = function(e) {
  // Delete this comment
  this.dispose(true, true);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.unbindDragEvents_ = function() {
  if (this.onMouseUpWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }
  if (this.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }
};

/*
 * Handle a mouse-up event while dragging a comment's border or resize handle.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseUp_ = function(/*e*/) {
  Blockly.Touch.clearTouchIdentifier();
  this.unbindDragEvents_();
};

/**
 * Resize this comment to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseMove_ = function(e) {
  this.autoLayout_ = false;
  var newXY = this.workspace.moveDrag(e);
  this.setSize_(this.RTL ? -newXY.x : newXY.x, newXY.y);
};

/**
 * Callback function triggered when the comment has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeComment_ = function() {
  var size = this.getHeightWidth();
  var topOffset = Blockly.WorkspaceCommentSvg.TOP_OFFSET;
  var textOffset = Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET * 2;

  var backdrop = this.foreignObject_ || this.uneditableBackground_;

  if (backdrop) {
    backdrop.setAttribute('width',
        size.width);
    backdrop.setAttribute('height',
        size.height - topOffset);
    if (this.RTL) {
      backdrop.setAttribute('x',
          -size.width);
    }
    if (this.textarea_) {
      this.textarea_.style.width =
          (size.width - textOffset) + 'px';
      this.textarea_.style.height =
          (size.height - textOffset - topOffset) + 'px';
    }
  }
};

/**
 * Set size
 * @param {number} width width of the container
 * @param {number} height height of the container
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.setSize_ = function(width, height) {
  // Minimum size of a comment.
  width = Math.max(width, 45);
  height = Math.max(height, 20 + Blockly.WorkspaceCommentSvg.TOP_OFFSET);
  this.width_ = width;
  this.height_ = height;
  this.svgRect_.setAttribute('width', width);
  this.svgRect_.setAttribute('height', height);
  this.svgRectTarget_.setAttribute('width', width);
  this.svgRectTarget_.setAttribute('height', height);
  this.svgHandleTarget_.setAttribute('width', width);
  this.svgHandleTarget_.setAttribute('height', Blockly.WorkspaceCommentSvg.TOP_OFFSET);
  if (this.RTL) {
    this.svgRect_.setAttribute('transform', 'scale(-1 1)');
    this.svgRectTarget_.setAttribute('transform', 'scale(-1 1)');
  }

  var resizeSize = Blockly.WorkspaceCommentSvg.RESIZE_SIZE;
  if (this.resizeGroup_) {
    if (this.RTL) {
      // Mirror the resize group.
      this.resizeGroup_.setAttribute('transform', 'translate(' +
        (-width + resizeSize) + ',' + (height - resizeSize) + ') scale(-1 1)');
    } else {
      this.resizeGroup_.setAttribute('transform', 'translate(' +
        (width - resizeSize) + ',' +
        (height - resizeSize) + ')');
    }
  }

  if (this.isDeletable()) {
    if (this.RTL) {
      this.deleteGroup_.setAttribute('transform', 'translate(' +
      (-width + Blockly.WorkspaceCommentSvg.DELETE_ICON_PADDING) + ',' + (0) + ') scale(-1 1)');
    }
    else {
      this.deleteGroup_.setAttribute('transform', 'translate(' +
      (width - Blockly.WorkspaceCommentSvg.DELETE_ICON_PADDING) + ',' +
      (0) + ')');
    }
  }

  // Allow the contents to resize.
  this.resizeComment_();
};

/**
 * Dispose of any rendered comment components.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.disposeInternal_ = function() {
  this.textarea_ = null;
  this.foreignObject_ = null;
  this.svgRectTarget_ = null;
  this.svgHandleTarget_ = null;
};

/**
 * Set the focus on the text area.
 * @public
 */
Blockly.WorkspaceCommentSvg.prototype.setFocus = function() {
  this.focused_ = true;
  this.svgRectTarget_.style.fill = "none";
  this.svgHandleTarget_.style.fill = "transparent";
  if (this.textarea_) {
    var textarea = this.textarea_;
    setTimeout(function() {
      textarea.focus();
    }, 0);
  }
  this.addFocus();
};

/**
 * Remove focus from the text area.
 * @public
 */
Blockly.WorkspaceCommentSvg.prototype.blurFocus = function() {
  this.focused_ = false;
  this.svgRectTarget_.style.fill = "transparent";
  this.svgHandleTarget_.style.fill = "none";
  if (this.textarea_) {
    var textarea = this.textarea_;
    setTimeout(function() {
      textarea.blur();
    }, 0);
  }
  this.removeFocus();
};

/**
 * Create the text element for an uneditable comment.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createUneditableText_ = function() {
  this.uneditableTextGroup_ = Blockly.utils.createSvgElement(
      'g',
      {
        'class': 'blocklyUneditableComment'
      },
      this.svgGroup_);
  this.uneditableBackground_ = Blockly.utils.createSvgElement(
    'rect',
    {
      'class': 'blocklyUneditableMinimalBody',
      'y': Blockly.WorkspaceCommentSvg.TOP_OFFSET.toString()
    },
    this.svgGroup_);
  this.uneditableTextGroup_.appendChild(this.uneditableBackground_);
  this.uneditableTextLineY = Blockly.WorkspaceCommentSvg.TOP_OFFSET * 2;
};

/**
 * Push a line of text onto the uneditable text node.
 * @param {!string} line text to push the uneditable text node.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.pushUneditableTextLine_ = function(line) {
  var uneditableTextNode = Blockly.utils.createSvgElement(
      'text',
      {
        'x': 15,
        'y': this.uneditableTextLineY
      },
      this.uneditableTextGroup_);
  var textNode = document.createTextNode(line);
  uneditableTextNode.appendChild(textNode);
  this.uneditableTextLineY+= Blockly.WorkspaceCommentSvg.UNEDITABLE_LINE_GAP;
};