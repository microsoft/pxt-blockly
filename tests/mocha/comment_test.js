/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Comments', function() {
  setup(function() {
    sharedTestSetup.call(this);
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "empty_block",
        "message0": "",
        "args0": []
      },
    ]);
    this.workspace = Blockly.inject('blocklyDiv', {
      comments: true,
      scrollbars: true
    });
    this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="empty_block"/>'
    ), this.workspace);
    this.comment = new Blockly.Comment(this.block);
    this.comment.computeIconLocation();
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  suite('Visibility and Editability', function() {
    setup(function() {
      this.block.setCommentText('test text');
    });

    function assertEditable(comment) {
      chai.assert.isNotOk(comment.paragraphElement_);
      chai.assert.isOk(comment.textarea_);
      chai.assert.equal(comment.textarea_.value, 'test text');
    }
    function assertNotEditable(comment) {
      // pxt-blockly: Non editable comments also use textarea_
      chai.assert.isNotOk(comment.paragraphElement_);
      chai.assert.isOk(comment.textarea_);
      chai.assert.equal(comment.textarea_.getAttribute("readonly"), "true");
      chai.assert.equal(comment.textarea_.value, 'test text');
      // chai.assert.isNotOk(comment.textarea_);
      // chai.assert.isOk(comment.paragraphElement_);
      // chai.assert.equal(comment.paragraphElement_.firstChild.textContent,
      //     'test text');
    }
    test('Editable', function() {
      this.comment.setVisible(true);
      chai.assert.isTrue(this.comment.isVisible());
      assertEditable(this.comment);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.BubbleOpen,
          {bubbleType: 'comment', isOpen: true}, this.workspace.id,
          this.block.id);
    });
    test('Not Editable', function() {
      sinon.stub(this.block, 'isEditable').returns(false);

      // TODO(#4186): Remove stubbing of deprecation warning after fixing.
      var deprecationWarnStub = createDeprecationWarningStub();
      this.comment.setVisible(true);
      deprecationWarnStub.restore();

      chai.assert.isTrue(this.comment.isVisible());
      assertNotEditable(this.comment);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.BubbleOpen,
          {bubbleType: 'comment', isOpen: true}, this.workspace.id,
          this.block.id);
    });
    test('Editable -> Not Editable', function() {
      this.comment.setVisible(true);
      sinon.stub(this.block, 'isEditable').returns(false);

      // TODO(#4186): Remove stubbing of deprecation warning after fixing.
      var deprecationWarnStub = createDeprecationWarningStub();
      this.comment.updateEditable();
      deprecationWarnStub.restore();

      chai.assert.isTrue(this.comment.isVisible());
      assertNotEditable(this.comment);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.BubbleOpen,
          {bubbleType: 'comment', isOpen: true}, this.workspace.id,
          this.block.id);
    });
    test('Not Editable -> Editable', function() {
      var editableStub = sinon.stub(this.block, 'isEditable').returns(false);

      // TODO(#4186): Remove stubbing of deprecation warning after fixing.
      var deprecationWarnStub = createDeprecationWarningStub();
      this.comment.setVisible(true);
      deprecationWarnStub.restore();

      editableStub.returns(true);

      this.comment.updateEditable();
      chai.assert.isTrue(this.comment.isVisible());
      assertEditable(this.comment);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.BubbleOpen,
          {bubbleType: 'comment', isOpen: true}, this.workspace.id,
          this.block.id);
    });
  });
  suite('Set/Get Bubble Size', function() {
    teardown(function() {
      sinon.restore();
    });
    function assertBubbleSize(comment, height, width) {
      var size = comment.getBubbleSize();
      chai.assert.equal(size.height, height);
      chai.assert.equal(size.width, width);
    }
    function assertBubbleSizeDefault(comment) {
      assertBubbleSize(comment, 80, 160);
    }
    test('Set Size While Visible', function() {
      this.comment.setVisible(true);
      var bubbleSizeSpy = sinon.spy(this.comment.bubble_, 'setBubbleSize');

      assertBubbleSizeDefault(this.comment);
      this.comment.setBubbleSize(100, 100);
      assertBubbleSize(this.comment, 100, 100);
      sinon.assert.calledOnce(bubbleSizeSpy);

      this.comment.setVisible(false);
      assertBubbleSize(this.comment, 100, 100);
    });
    test('Set Size While Invisible', function() {
      assertBubbleSizeDefault(this.comment);
      this.comment.setBubbleSize(100, 100);
      assertBubbleSize(this.comment, 100, 100);

      this.comment.setVisible(true);
      assertBubbleSize(this.comment, 100, 100);
    });
  });
});
