/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for rendering a workspace comment as SVG
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceCommentSvg.render');

goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Svg');

/**
 * Radius of the border around the comment.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.BORDER_WIDTH = 1;

/**
 * Size of the resize icon.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.RESIZE_SIZE = 12 * Blockly.WorkspaceCommentSvg.BORDER_WIDTH;

/**
 * Offset from the foreignobject edge to the textarea edge.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET = 12;

/**
 * The height of the comment top bar.
 * @package
 */
Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT = 32;

/**
 * The size of the minimize arrow icon in the comment top bar.
 * @private
 */
Blockly.WorkspaceCommentSvg.MINIMIZE_ICON_SIZE = 16;

/**
 * The size of the delete icon in the comment top bar.
 * @private
 */
Blockly.WorkspaceCommentSvg.DELETE_ICON_SIZE = 12;

/**
 * The inset for the top bar icons.
 * @private
 */
Blockly.WorkspaceCommentSvg.TOP_BAR_ICON_INSET = 6;

/**
 * Width that a minimized comment should have.
 * @private
 */
Blockly.WorkspaceCommentSvg.MINIMIZE_WIDTH = 200;

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
 *     properties in workspace units.
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
  if (!this.isEditable() || Blockly.utils.userAgent.IE) {
    this.createUneditableText_()
    this.svgGroup_.appendChild(this.uneditableTextGroup_);
  } else {
    this.commentEditor_ = this.createEditor_();
    this.svgGroup_.appendChild(this.commentEditor_);
  }

  var backdrop = this.commentEditor_ || this.uneditableTextGroup_;

  this.svgHandleTarget_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      // pxt-blockly: Custom comment rendering
      {
        'class': 'blocklyCommentHandleTarget',
        'fill': 'transparent',
        'rx': Blockly.WorkspaceCommentSvg.BORDER_WIDTH,
        'ry': Blockly.WorkspaceCommentSvg.BORDER_WIDTH,
        'height': Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT
      }, this.svgGroup_);
  this.svgGroup_.appendChild(this.svgHandleTarget_);
  this.svgRectTarget_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'class': 'blocklyDraggable blocklyCommentTarget',
        'x': 0,
        'y': 0,
        'rx': 4 * Blockly.WorkspaceCommentSvg.BORDER_WIDTH,
        'ry': 4 * Blockly.WorkspaceCommentSvg.BORDER_WIDTH
      }, this.svgGroup_);

  if (this.isEditable() && !Blockly.utils.userAgent.IE) {
    // Add the resize icon
    this.addResizeDom_();
    // pxt-blockly: Custom workspace comment delete rendering
    // if (this.isDeletable()) {
    //   // Add the delete icon
    //   this.addDeleteDom_();
    // }
  }

  this.createTopBarIcons_();
  this.createTopBarLabel_();

  // Show / hide relevant things based on minimized state
  if (this.isMinimized()) {
    this.minimizeArrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'comment-arrow-up.svg');
    backdrop.setAttribute('display', 'none');
    this.resizeGroup_.setAttribute('display', 'none');
  } else {
    this.minimizeArrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'comment-arrow-down.svg');
    this.topBarLabel_.setAttribute('display', 'none');
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

  if (this.isEditable() && !Blockly.utils.userAgent.IE) {
    this.setSize(size.width, size.height);
  } else {
    var width = Blockly.WorkspaceCommentSvg.UNEDITABLE_TEXT_LENGTH * 8;
    width += 25;
    var height = this.uneditableTextLineY - 10;
    this.setSize(width, height);
  }

  this.rendered_ = true;

  if (this.resizeGroup_) {
    Blockly.browserEvents.conditionalBind(
        this.resizeGroup_, 'mousedown', this, this.resizeMouseDown_);
    Blockly.bindEventWithChecks_(
        this.resizeGroup_, 'mouseup', this, this.resizeMouseUp_);
  }

  Blockly.bindEventWithChecks_(
      this.minimizeArrow_, 'mousedown', this, this.minimizeArrowMouseDown_);
  Blockly.bindEventWithChecks_(
      this.minimizeArrow_, 'mouseout', this, this.minimizeArrowMouseOut_);
  Blockly.bindEventWithChecks_(
      this.minimizeArrow_, 'mouseup', this, this.minimizeArrowMouseUp_);

  if (this.isDeletable()) {
    Blockly.browserEvents.conditionalBind(
        this.deleteGroup_, 'mousedown', this, this.deleteMouseDown_);
    Blockly.browserEvents.conditionalBind(
        this.deleteGroup_, 'mouseout', this, this.deleteMouseOut_);
    Blockly.browserEvents.conditionalBind(
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
  this.foreignObject_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FOREIGNOBJECT,
      {
        'x': Blockly.WorkspaceCommentSvg.BORDER_WIDTH,
        'y': Blockly.WorkspaceCommentSvg.BORDER_WIDTH + Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT,
        'class': 'blocklyCommentForeignObject'
      },
      null);
  var body = document.createElementNS(Blockly.utils.dom.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.utils.dom.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var textarea = document.createElementNS(Blockly.utils.dom.HTML_NS, 'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
  textarea.setAttribute('maxlength', Blockly.WorkspaceComment.COMMENT_TEXT_LIMIT); // pxt-blockly set max length
  textarea.readOnly = !this.isEditable();
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.textarea_.style.margin = (Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET) + 'px';
  this.foreignObject_.appendChild(body);
  // Don't zoom with mousewheel.
  Blockly.browserEvents.conditionalBind(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.browserEvents.conditionalBind(
      textarea, 'change', this,
      function(
          /* eslint-disable no-unused-vars */ e
          /* eslint-enable no-unused-vars */) {
        // pxt-blockly: Only update comment if value changed
        if (this.text_ != textarea.value) {
          this.setContent(textarea.value);
        }
      });

  // pxt-blockly: Label for minimized comment
  this.labelText_ = this.getLabelText();
  return this.foreignObject_;
};

/**
 * Add the resize icon to the DOM
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.addResizeDom_ = function() {
  this.resizeGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {
        'class': this.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'
      },
      this.svgGroup_);
  var resizeSize = Blockly.WorkspaceCommentSvg.RESIZE_SIZE;
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.POLYGON,
      // pxt-blockly add (0,0) for larger resize hit target
      {'points': '0,0 0,x x,x x,0'.replace(/x/g, resizeSize.toString())},
      this.resizeGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize / 3
      }, this.resizeGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize * 2 / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize * 2 / 3
      }, this.resizeGroup_);
};

/**
 * Create the comment top bar and its contents.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createCommentTopBar_ = function() {
  this.svgHandleTarget_ = Blockly.utils.dom.createSvgElement('rect',
      {
        'class': 'blocklyDraggable blocklyCommentHandleTarget',
        'fill': 'transparent',
        'rx': Blockly.WorkspaceCommentSvg.BORDER_WIDTH,
        'ry': Blockly.WorkspaceCommentSvg.BORDER_WIDTH,
        'height': Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT
      }, this.svgGroup_);

  this.createTopBarIcons_();
  this.createTopBarLabel_();
};

/**
 * Create the comment top bar label. This is the truncated comment text
 * that shows when comment is minimized.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createTopBarLabel_ = function() {
  this.topBarLabel_ = Blockly.utils.dom.createSvgElement('text',
      {
        'class': 'blocklyCommentText',
        'x': this.width_ / 2,
        'y': (Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT / 2) + Blockly.WorkspaceCommentSvg.BORDER_WIDTH,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle'
      }, this.svgGroup_);

  var labelTextNode = document.createTextNode(this.labelText_);
  this.topBarLabel_.appendChild(labelTextNode);
};

/**
 * Create the minimize toggle and delete icons that in the comment top bar.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createTopBarIcons_ = function() {
  var topBarMiddleY = (Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT / 2) +
      Blockly.WorkspaceCommentSvg.BORDER_WIDTH;

  // Minimize Toggle Icon in Comment Top Bar
  var xInset = Blockly.WorkspaceCommentSvg.TOP_BAR_ICON_INSET;
  this.minimizeArrow_ = Blockly.utils.dom.createSvgElement('image',
      {
        'x': xInset,
        'y': topBarMiddleY - Blockly.WorkspaceCommentSvg.MINIMIZE_ICON_SIZE / 2,
        'width': Blockly.WorkspaceCommentSvg.MINIMIZE_ICON_SIZE,
        'height': Blockly.WorkspaceCommentSvg.MINIMIZE_ICON_SIZE
      }, this.svgGroup_);

  // Delete Icon in Comment Top Bar
  if (this.isDeletable()) {
    this.addDeleteDom_();
  }
}

/**
 * Add the delete icon to the DOM
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.addDeleteDom_ = function() {
  this.deleteGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {
        'class': 'blocklyCommentDeleteIcon'
      },
      this.svgGroup_);
  this.deleteIconBorder_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
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
 * Draw the trash can icon
 * @private
 */
Blockly.WorkspaceCommentSvg.drawDeleteIcon = function(svgGroup) {
  var iconColor = '#fff';
  var deleteIconGroup = Blockly.utils.dom.createSvgElement('g',
      {
        'transform': 'scale (1.5) translate(-6, 1)'
      },
      svgGroup);
  // Lid
  var topX = 1;
  var topY = 2;
  var binWidth = 12;
  var binHeight = 12;
  Blockly.utils.dom.createSvgElement(
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
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        'x1': topX, 'y1': topLineY,
        'x2': topX + binWidth, 'y2': topLineY,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
  // Rect
  Blockly.utils.dom.createSvgElement(
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
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        'x1': x, 'y1': y1,
        'x2': x, 'y2': y2,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
  Blockly.utils.dom.createSvgElement(
      'line',
      {
        'x1': x+2, 'y1': y1,
        'x2': x+2, 'y2': y2,
        'stroke': iconColor,
        'stroke-width': '1',
        'stroke-linecap': 'round'
      },
      deleteIconGroup);
  Blockly.utils.dom.createSvgElement(
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
 * Handle a mouse-down on comment's minimize icon.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.minimizeArrowMouseDown_ = function(e) {
  // Set a property to indicate that this minimize arrow icon had a mouse down
  // event. This property will get reset if the mouse leaves the icon, or when
  // a mouse up event occurs on this icon.
  this.shouldToggleMinimize_ = true;
  e.stopPropagation();
};

/**
 * Handle a mouse-out on comment's minimize icon.
 * @param {!Event} _e Mouse out event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.minimizeArrowMouseOut_ = function(_e) {
  // If the mouse leaves the minimize arrow icon, make sure the
  // shouldToggleMinimize_ property gets reset.
  this.shouldToggleMinimize_ = false;
};

/**
 * Handle a mouse-up on comment's minimize icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.minimizeArrowMouseUp_ = function(e) {
  // First check if this is the icon that had a mouse down event on it and that
  // the mouse never left the icon.
  if (this.shouldToggleMinimize_) {
    this.shouldToggleMinimize = false;
    this.toggleMinimize_();
  }
  e.stopPropagation();
  // pxt-blockly: clear touch identifier set by mousedown
  Blockly.Touch.clearTouchIdentifier();
};

/**
 * Handle a mouse-down on comment's delete icon.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseDown_ = function(e) {
  // Set a property to indicate that this delete icon had a mouse down event.
  // This property will get reset if the mouse leaves the icon, or when
  // a mouse up event occurs on this icon.
  this.shouldDelete_ = true;
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Handle a mouse-out on comment's delete icon.
 * @param {!Event} _e Mouse out event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseOut_ = function(_e) {
  // If the mouse leaves the delete icon, reset the shouldDelete_ property.
  this.shouldDelete_ = false;
};

/**
 * Handle a mouse-up on comment's delete icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseUp_ = function(e) {
  // First check that this same icon had a mouse down event on it and that the
  // mouse never left the icon.
  if (this.shouldDelete_) {
    this.dispose();
  }
  e.stopPropagation();
  // pxt-blockly: clear touch identifier set by mousedown
  Blockly.Touch.clearTouchIdentifier();
};

/**
 * Handle a mouse-down on comment's resize corner.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseDown_ = function(e) {
  this.resizeStartSize_ = {width: this.width_, height: this.height_};
  this.unbindDragEvents_();
  this.workspace.setResizesEnabled(false);
  if (Blockly.utils.isRightButton(e)) {
    // No right-click.
    e.stopPropagation();
    return;
  }
  // Left-click (or middle click)
  this.workspace.startDrag(e, new Blockly.utils.Coordinate(
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
 * Set the appearance of the workspace comment to the minimized or full size
 * appearance. In the minimized state, the comment should only have the top bar
 * displayed, with the minimize icon swapped to the minimized state, and
 * truncated comment text is shown in the middle of the top bar. There should be
 * no resize handle when the workspace comment is in its minimized state.
 * @param {boolean} minimize Whether the comment should be minimized
 * @param {?string} labelText Optional label text for the comment top bar
 *    when it is minimized.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.setRenderedMinimizeState_ = function(minimize, labelText) {
  var backdrop = this.commentEditor_ || this.uneditableTextGroup_;
  if (minimize) {
    // Change minimize icon
    this.minimizeArrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'comment-arrow-up.svg');
    // Hide text area
    backdrop.setAttribute('display', 'none');
    // Hide resize handle if it exists
    if (this.resizeGroup_) {
      this.resizeGroup_.setAttribute('display', 'none');
    }
    if (labelText && this.labelText_ != labelText) {
      // Update label and display
      // TODO is there a better way to do this?
      this.topBarLabel_.textContent = labelText;
    }
    this.topBarLabel_.removeAttribute('display');
  } else {
    // Change minimize icon
    this.minimizeArrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'comment-arrow-down.svg');
    // Hide label
    this.topBarLabel_.setAttribute('display', 'none');
    // Show text area
    backdrop.removeAttribute('display');
    // Display resize handle if it exists
    if (this.resizeGroup_) {
      this.resizeGroup_.removeAttribute('display');
    }
  }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.unbindDragEvents_ = function() {
  if (this.onMouseUpWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }
  if (this.onMouseMoveWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }
};

/**
 * Handle a mouse-up event while dragging a comment's border or resize handle.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseUp_ = function(/* e */) {
  Blockly.Touch.clearTouchIdentifier();
  this.unbindDragEvents_();

  // pxt-blockly: Scratch comments
  var oldHW = this.resizeStartSize_;
  this.resizeStartSize_ = null;
  if (this.width_ == oldHW.width && this.height_ == oldHW.height) {
    return;
  }
  // Fire a change event for the new width/height after
  // resize mouse up
  Blockly.Events.fire(new Blockly.Events.CommentChange(
      this, {width: oldHW.width , height: oldHW.height},
      {width: this.width_, height: this.height_}));

  this.workspace.setResizesEnabled(true);
};

/**
 * Resize this comment to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseMove_ = function(e) {
  this.autoLayout_ = false;
  var newXY = this.workspace.moveDrag(e);
  // pxt-blockly: Scratch comments
  // The call to setSize below emits a CommentChange event,
  // but we don't want multiple CommentChange events to be
  // emitted while the user is still in the process of resizing
  // the comment, so disable events here. The event is emitted in
  // resizeMouseUp_.
  var disabled = false;
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.disable();
    disabled = true;
  }
  this.setSize(this.RTL ? -newXY.x : newXY.x, newXY.y);
  if (disabled) {
    Blockly.Events.enable();
  }
};

/**
 * Callback function triggered when the comment has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeComment_ = function() {
  var doubleBorderWidth = 2 * Blockly.WorkspaceCommentSvg.BORDER_WIDTH;
  var topOffset = Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT;
  var textOffset = Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET * 2;
  var backdrop = this.commentEditor_ || this.uneditableBackground_;

  backdrop.setAttribute('width', this.width_ - doubleBorderWidth);
  backdrop.setAttribute('height', this.height_ - doubleBorderWidth - topOffset);
  if (this.RTL) {
    backdrop.setAttribute('x', -this.width_);
  }
  if (this.textarea_) {
    this.textarea_.style.width = (this.width_ - textOffset) + 'px';
    this.textarea_.style.height = (this.height_ - doubleBorderWidth
      - textOffset - topOffset) + 'px';
  }
};

/**
 * Set size
 * @param {number} width width of the container
 * @param {number} height height of the container
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setSize = function(width, height) {
  var oldWidth = this.width_;
  var oldHeight = this.height_;

  var doubleBorderWidth = 2 * Blockly.WorkspaceCommentSvg.BORDER_WIDTH;

  if (this.isMinimized_) {
    width = Blockly.WorkspaceCommentSvg.MINIMIZE_WIDTH;
    height = Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT;
  } else {
    // Minimum size of a 'full size' (not minimized) comment.
    width = Math.max(width, doubleBorderWidth + 50);
    height = Math.max(height, doubleBorderWidth + 20 + Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT);

    // Note we are only updating this.width_ or this.height_ here
    // and not in the case above, because when we're minimizing a comment,
    // we want to keep track of the width/height of the maximized comment
    this.width_ = width;
    this.height_ = height;
    Blockly.Events.fire(new Blockly.Events.CommentChange(this,
        {width: oldWidth, height: oldHeight},
        {width: this.width_, height: this.height_}));
  }
  this.svgRect_.setAttribute('width', width);
  this.svgRect_.setAttribute('height', height);
  this.svgRectTarget_.setAttribute('width', width);
  this.svgRectTarget_.setAttribute('height', height);
  this.svgHandleTarget_.setAttribute('width', width);
  this.svgHandleTarget_.setAttribute('height', Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT);
  if (this.RTL) {
    this.minimizeArrow_.setAttribute('x', width -
        (Blockly.WorkspaceCommentSvg.MINIMIZE_ICON_SIZE) -
        Blockly.WorkspaceCommentSvg.TOP_BAR_ICON_INSET);
    this.svgRect_.setAttribute('transform', 'scale(-1 1)');
    this.svgHandleTarget_.setAttribute('transform', 'scale(-1 1)');
    this.svgHandleTarget_.setAttribute('transform', 'translate(' + -width + ', 1)');
    this.minimizeArrow_.setAttribute('transform', 'translate(' + -width + ', 1)');
    if (this.isDeletable()) {
      this.deleteGroup_.setAttribute('transform', 'translate(' +
      (-width + Blockly.WorkspaceCommentSvg.DELETE_ICON_SIZE +
        Blockly.WorkspaceCommentSvg.TOP_BAR_ICON_INSET) + ',' + (0) + ') scale(-1 1)');
    }
  } else if (this.isDeletable()) {
    this.deleteGroup_.setAttribute('transform', 'translate(' +
      (width - Blockly.WorkspaceCommentSvg.DELETE_ICON_SIZE -
       Blockly.WorkspaceCommentSvg.TOP_BAR_ICON_INSET) + ',' +
      (0) + ')');
  }

  var resizeSize = Blockly.WorkspaceCommentSvg.RESIZE_SIZE;
  if (this.resizeGroup_) {
    if (this.RTL) {
      // Mirror the resize group.
      this.resizeGroup_.setAttribute('transform', 'translate(' +
        (-width + resizeSize) + ',' + (height - resizeSize) + ') scale(-1 1)');
    } else {
      this.resizeGroup_.setAttribute('transform', 'translate(' +
        (width - doubleBorderWidth - resizeSize) + ',' +
        (height -  doubleBorderWidth - resizeSize) + ')');
    }
  }

  if (this.isMinimized_) {
    this.topBarLabel_.setAttribute('x', width / 2);
    this.topBarLabel_.setAttribute('y', height / 2);
  }

  // Allow the contents to resize.
  this.resizeComment_();
};

/**
 * Toggle the minimization state of this comment.
 * @private
 */
Blockly.WorkspaceComment.prototype.toggleMinimize_ = function() {
  this.setMinimized(!this.isMinimized_);
};

/**
 * Set the minimized state for this comment. If the comment is rendered,
 * change the appearance of the comment accordingly.
 * @param {boolean} minimize Whether the comment should be minimized
 * @package
 */
Blockly.WorkspaceComment.prototype.setMinimized = function(minimize) {
  if (this.isMinimized_ == minimize) {
    return;
  }
  Blockly.Events.fire(new Blockly.Events.CommentChange(this,
      {minimized: this.isMinimized_}, {minimized: minimize}));
  this.isMinimized_ = minimize;
  if (minimize) {
    if (this.rendered_) {
      this.setRenderedMinimizeState_(true, this.getLabelText());
    }
    this.setSize(Blockly.WorkspaceCommentSvg.MINIMIZE_WIDTH,
        Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT);
  } else {
    if (this.rendered_) {
      this.setRenderedMinimizeState_(false);
    }
    this.setContent(this.content_);
    this.setSize(this.width_, this.height_);
  }
};

/**
 * Dispose of any rendered comment components.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.disposeInternal_ = function() {
  this.textarea_ = null;
  this.foreignObject_ = null;
  this.svgRect_ = null;
  this.svgRectTarget_ = null;
  this.svgHandleTarget_ = null;
  this.disposed_ = true;
};

/**
 * Set the focus on the text area.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setFocus = function() {
  var comment = this;
  this.focused_ = true;
  // Defer CSS changes.
  setTimeout(function() {
    if (comment.disposed_) {
      return;
    }
    comment.textarea_.focus();
    comment.addFocus();
    Blockly.utils.dom.addClass(
        comment.svgRectTarget_, 'blocklyCommentTargetFocused');
    Blockly.utils.dom.addClass(
        comment.svgHandleTarget_, 'blocklyCommentHandleTargetFocused');
  }, 0);
};

/**
 * Remove focus from the text area.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.blurFocus = function() {
  var comment = this;
  this.focused_ = false;
  // Defer CSS changes.
  setTimeout(function() {
    if (comment.disposed_) {
      return;
    }

    comment.textarea_.blur();
    comment.removeFocus();
    Blockly.utils.dom.removeClass(
        comment.svgRectTarget_, 'blocklyCommentTargetFocused');
    Blockly.utils.dom.removeClass(
        comment.svgHandleTarget_, 'blocklyCommentHandleTargetFocused');
  }, 0);
};

/**
 * PXT Blockly: Create the text element for an uneditable comment.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createUneditableText_ = function() {
  this.uneditableTextGroup_ = Blockly.utils.dom.createSvgElement(
      'g',
      {
        'class': 'blocklyUneditableComment'
      },
      this.svgGroup_);
  this.uneditableBackground_ = Blockly.utils.dom.createSvgElement(
    'rect',
    {
      'class': 'blocklyUneditableMinimalBody',
      'y': Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT.toString()
    },
    this.svgGroup_);
  this.uneditableTextGroup_.appendChild(this.uneditableBackground_);
  this.uneditableTextLineY = Blockly.WorkspaceCommentSvg.TOP_BAR_HEIGHT * 2;
};

/**
 * PXT Blockly: Push a line of text onto the uneditable text node.
 * @param {!string} line text to push the uneditable text node.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.pushUneditableTextLine_ = function(line) {
  var uneditableTextNode = Blockly.utils.dom.createSvgElement(
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
