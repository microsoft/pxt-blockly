//TODO license

/**
 * @fileoverview Colour input field.
 */
'use strict';

goog.provide('Blockly.FieldNote');

goog.require('Blockly.Field');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.ColorButton');
goog.require('goog.dom');


/**
 * Class for a note input field.
 * @param {string} note The initial note in string format.
 * @param {Function=} opt_validator A function that is executed when a new
 *     note is selected.  Its sole argument is the new note value.  Its
 *     return value becomes the selected note
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldNote = function (note, opt_validator) {
    Blockly.FieldNote.superClass_.constructor.call(this, note, opt_validator);

};
goog.inherits(Blockly.FieldNote, Blockly.Field);

/**
 * default number of piano keys
 * @type {number}
 * @private
 */
Blockly.FieldNote.prototype.nKeys_ = 36;

/**
 * default width piano key
 * @type {number}
 * @private
 */
Blockly.FieldNote.prototype.keyWidth_ = 20;

/**
 * default height piano key
 * @type {number}
 * @private
 */
Blockly.FieldNote.prototype.keyHeight_ = 80;

/**
 * count the number of white piano key that have been rendered
 * @type {number}
 * @private
 */
Blockly.FieldNote.prototype.whiteKeyCounter_ = 0;



/**
 * Install this field on a block.
 */
Blockly.FieldNote.prototype.init = function () {
    Blockly.FieldNote.superClass_.init.call(this);
    this.borderRect_.style['fillOpacity'] = 1;
    this.whiteKeyCounter_ = 0;
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldNote.prototype.CURSOR = 'default';

/**
 * Close the note picker if this input is being deleted.
 */
Blockly.FieldNote.prototype.dispose = function () {
    Blockly.WidgetDiv.hideIfOwner(this);
    Blockly.FieldNote.superClass_.dispose.call(this);
};

/**
 * Return the current note.
 * @return {string} Current note in string format.
 */
Blockly.FieldNote.prototype.getValue = function () {
    return this.note_;
};

/**
 * Set the note.
 * @param {string} note The new note in string format.
 */
Blockly.FieldNote.prototype.setValue = function (note) {
    if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
        this.note_ != note) {
        Blockly.Events.fire(new Blockly.Events.Change(
            this.sourceBlock_, 'field', this.name, this.note_, note));
    }
    this.note_ = note;
    this.setText(note);
};

/**
 * Get the text from this field.  Used when the block is collapsed.
 * @return {string} Current text.
 */
Blockly.FieldNote.prototype.getText = function () {
    return this.note_;
};


/**
 * Set a custom number of keys for this field.
 * @param {number} nkeys Number of keys for this block,
 *     or 0 to use default (Blockly.FieldNote.COLUMNS).
 * @return {!Blockly.FieldNote} Returns itself (for method chaining).
 */
Blockly.FieldNote.prototype.setKeys = function (nkeys) {
    this.nKeys_ = nkeys;
    return this;
};

/**
 * create an Array of goo.ui.ColorButton as a piano keys
 * @return {Array.<goog.ui.colorButton>} piano keys.
 */
Blockly.FieldNote.prototype.createNewPiano = function () {
    var N = this.nKeys_;
    var piano = [];
    for (var i = 0; i < N; i++) {
        piano.push(new goog.ui.ColorButton(i));
        piano[i].title = i;
    }
    return piano;
};

/**
 * create a DOM to assing a style to the button
 * @param {string} bgColor color of the key background
 * @param {number} width width of the key
 * @param {number} heigth heigth of the key
 * @param {number} position position of the key
 * @param {number} z_index z-index of the key
 * @return {goog.dom} DOM with the new css style.
 * @private
 */
Blockly.FieldNote.prototype.getKeyStyle = function (bgColor, width, height, position, z_index) {
    var div = goog.dom.createDom('div',
        {
            'style': 'background-color: ' + bgColor + '; width: ' +
            width + 'px; height: ' + height + 'px; left: ' + position + 'px; z-index: ' + z_index + ';'
        },
        this.title);
    div.className = 'blocklyNote';
    return div;
};
/**
 * create a DOM to assing a style to the note label
 * @return {goog.dom} DOM with the new css style.
 * @private
 */
Blockly.FieldNote.prototype.getShowNoteStyle = function () {
    // get center of the piano
    var position = (this.nKeys_ / 12) * (this.nKeys_ / 12) * this.keyWidth_;
    var div = goog.dom.createDom('div',
        { 'style': 'left: ' + position + 'px; top: ' + (this.keyHeight_ + 10) + 'px;' },
        this.title);
    div.className = 'blocklyNoteLabel';
    return div;
};

/**
 * get background color of the piano key
 * @param {number} idx index of the key
 * @return {string} key background color
 */
Blockly.FieldNote.prototype.getBgColor = function (idx) {
    // What note is idx
    if (this.isWhite(idx))
        return 'white';
    return 'black';
};

/**
 * get background color of the piano key
 * @param {number} idx index of the key
 * @return {boolean} key background color
 */
Blockly.FieldNote.prototype.isWhite = function (idx) {
    var octavePosition = idx % 12;
    if (octavePosition == 1 || octavePosition == 3 || octavePosition == 6 ||
        octavePosition == 8 || octavePosition == 10)
        return false;
    return true;
};


/**
 * get width of the piano key
 * @param {number} idx index of the key
 * @return {number} width of the key
 */
Blockly.FieldNote.prototype.getWidth = function (idx) {
    if (this.isWhite(idx))
        return this.keyWidth_;
    return this.keyWidth_ / 2;
};

/**
 * get height of the piano key
 * @param {number} idx index of the key
 * @return {number} height of the key
 */
Blockly.FieldNote.prototype.getHeight = function (idx) {
    if (this.isWhite(idx))
        return this.keyHeight_;
    return this.keyHeight_ / 2;
};

/**
 * get the position of the key in the piano
 * @param {number} idx index of the key
 * @return {number} position of the key
 */
Blockly.FieldNote.prototype.getPosition = function (idx) {
    var pos = (this.whiteKeyCounter_ * this.keyWidth_);
    if (this.isWhite(idx))
        return pos;
    return pos - (this.keyWidth_ / 4);
};
/**
 * Create a piano under the note field.
 * @private
 */
Blockly.FieldNote.prototype.showEditor_ = function () {
    Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL,
        Blockly.FieldNote.widgetDispose_);

    // Create the piano using Closure (colorButton).
    var piano = this.createNewPiano();
    this.whiteKeyCounter_ = 0;

    // Record windowSize and scrollOffset before adding the piano.
    var windowSize = goog.dom.getViewportSize();
    var scrollOffset = goog.style.getViewportPageOffset(document);
    var xy = this.getAbsoluteXY_();
    var borderBBox = this.getScaledBBox_();
    var div = Blockly.WidgetDiv.DIV;
    for (var i = 0; i < this.nKeys_; i++) {
        var key = piano[i];
        var bgColor = this.getBgColor(i);
        var width = this.getWidth(i);
        var height = this.getHeight(i);
        var position = this.getPosition(i);
        var style = this.getKeyStyle(bgColor, width, height, position, this.isWhite(i) ? 0 : 1);
        div = Blockly.WidgetDiv.DIV;
        key.setContent(style);
        key.setId('pianoKey ' + i);
        key.render(div);
        var thisField = this;
        goog.events.listen(key.getElement(),
            goog.events.EventType.MOUSEDOWN,
            function () {
                Blockly.WidgetDiv.hide();
                //thisField.callValidator(this.getId());
                //thisField.setValue(thisField.callValidator(this.getId()));
                thisField.setValue(this.getId());
            }, false, key
        );
        goog.events.listen(key.getElement(),
            goog.events.EventType.MOUSEOVER,
            function () {
                showNoteLabel.content_.innerText = this.title;
            }, false, key
        );

        if (this.isWhite(i))
            this.whiteKeyCounter_++;
    }

    var showNoteLabel = new goog.ui.ColorButton();
    var showNoteStyle = this.getShowNoteStyle();
    showNoteLabel.setContent(showNoteStyle);
    showNoteLabel.render(div);

    var pianoSize = goog.style.getSize(piano[0].getElement());
    // Flip the palette vertically if off the bottom. 
    if (xy.y + pianoSize.height + borderBBox.height >=
        windowSize.height + scrollOffset.y) {
        xy.y -= pianoSize.height - 1;
    } else {
        xy.y += borderBBox.height - 1;
    }
    if (this.sourceBlock_.RTL) {
        xy.x += borderBBox.width;
        xy.x -= pianoSize.width;
        // Don't go offscreen left.
        if (xy.x < scrollOffset.x) {
            xy.x = scrollOffset.x;
        }
    } else {
        // Don't go offscreen right.
        if (xy.x > windowSize.width + scrollOffset.x - pianoSize.width) {
            xy.x = windowSize.width + scrollOffset.x - pianoSize.width;
        }
    }
    Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset,
        this.sourceBlock_.RTL);

};

/**
 * Hide the piano.
 * @private
 */
Blockly.FieldNote.widgetDispose_ = function () {
    if (Blockly.FieldNote.changeEventKey_) {
        goog.events.unlistenByKey(Blockly.FieldNote.changeEventKey_);
    }
    Blockly.Events.setGroup(false);
};
