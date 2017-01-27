//TODO license
/**
 * @fileoverview note-picker input field.
 */
'use strict';

goog.provide('Blockly.FieldNote');

goog.require('Blockly.Field');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.ColorButton');
goog.require('goog.dom');

goog.require('Blockly.FieldNumber');

/**
 * Class for a note input field.
 * @param {string} note The initial note in string format.
 * @param {Function=} opt_validator A function that is executed when a new
 *     note is selected.  Its sole argument is the new note value.  Its
 *     return value becomes the selected note
 * @extends {Blockly.FieldNumber}
 * @constructor
 */
Blockly.FieldNote = function (note, opt_validator) {
    Blockly.FieldNote.superClass_.constructor.call(this, note, opt_validator);
    note = (note && !isNaN(note)) ? String(note) : '0';
};
goog.inherits(Blockly.FieldNote, Blockly.FieldNumber);

/**
 * Ensure that only a non negative number may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid positive number, or null if invalid.
 */
Blockly.FieldNote.prototype.classValidator = function (text) {
    if (text === null) {
        return null;
    }
    text = String(text);

    var n = parseFloat(text || 0);
    if (isNaN(n) || n < 0) {
        // Invalid number.
        return null;
    }
    // Round to nearest multiple of precision.
    if (this.precision_ && isFinite(n)) {
        n = Math.round(n / this.precision_) * this.precision_;
    }
    // Get the value in range.
    return String(n);
};

/**
 * default number of piano keys
 * @type {number}
 * @private
 */
Blockly.FieldNote.prototype.nKeys_ = 36;

/**
 * Absolute error for note frequency identification (Hz)
 * @type {number}
 * @private
 */
Blockly.FieldNote.prototype.EPS = 1;

/**
 * array of notes frequency
 * @type {Array.<number>}
 * @private
 */
Blockly.FieldNote.prototype.noteFreq_ = [];

/**
 * array of notes names
 * @type {Array.<string>}
 * @private
 */
Blockly.FieldNote.prototype.noteName_ = [];

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
    //  create array of name/frequency notes
    this.noteFreq_.length = 0;
    this.noteName_.length = 0;
    this.whiteKeyCounter_ = 0;
    this.createNotesArray();
    this.setValue(this.callValidator(this.getValue()));
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
 * Return the current note frequency.
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
    note = String(parseFloat(note || 0));
    if (isNaN(note) || note < 0)
        return;
    if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
        this.note_ != note) {
        Blockly.Events.fire(new Blockly.Events.Change(
            this.sourceBlock_, 'field', this.name, this.note_, note));
    }
    this.note_ = note;
    this.setText(this.getNoteName());
};

/**
 * Get the text from this field.  Used when the block is collapsed.
 * @return {string} Current text.
 */
Blockly.FieldNote.prototype.getText = function () {
    return parseFloat(this.note_).toFixed(2);
};

/**
 * Set the text in this field and NOT fire a change event.
 * @param {*} newText New text.
 */
Blockly.FieldNote.prototype.setText = function (newText) {
    if (newText === null) {
        // No change if null.
        return;
    }
    newText = String(newText);
    if (!isNaN(newText))
        newText = this.getNoteName();

    if (newText === this.text_) {
        // No change.
        return;
    }
    Blockly.Field.prototype.setText.call(this, newText);
};

/**
 * get the note name to be displayed in the field
 * @return {string} note name
 */
Blockly.FieldNote.prototype.getNoteName = function () {
    var note = this.getValue();
    for (var i = 0; i < this.nKeys_; i++) {
        if (Math.abs(this.noteFreq_[i] - note) < this.EPS)
            return this.noteName_[i];
    }
    if (!isNaN(note))
        note += ' Hz';
    return note;
};

/**
 * Set a custom number of keys for this field.
 * @param {number} nkeys Number of keys for this block,
 *     or 26 to use default.
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
            'style': 'background-color: ' + bgColor
            + '; width: ' + width
            + 'px; height: ' + height
            + 'px; left: ' + position
            + 'px; z-index: ' + z_index
            + ';'
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
    var position = this.whiteKeyCounter_ / 2 * (this.keyWidth_);
    position -= this.keyWidth_;
    var div = goog.dom.createDom('div',
        {
            'style': 'left: ' + position
            + 'px; top: ' + (this.keyHeight_ + 10)
            + 'px;'
        },
        this.title);
    div.className = 'blocklyNoteLabel';
    return div;
};

/**
 * get background color of the current piano key
 * @param {number} idx index of the key
 * @return {string} key background color
 */
Blockly.FieldNote.prototype.getBgColor = function (idx) {
    //  What color is idx key
    if (this.isWhite(idx))
        return 'white';
    return 'black';
};

/**
 * @param {number} idx index of the key
 * @return {boolean} true if idx key is white
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
 * return next note of a piano key
 * @param {string} note current note
 * @return {string} next note
 */
Blockly.FieldNote.prototype.nextNote = function (note) {
    if (note == 'A#')
        return 'B';

    if (note == 'B')
        return 'C';

    if (note == 'C#')
        return 'D';

    if (note == 'D#')
        return 'E';

    if (note == 'E')
        return 'F';

    if (note == 'F#')
        return 'G';

    if (note == 'G#')
        return 'A';

    return note + '#';
};

/**
 * create Array of notes name and frequencies
 */
Blockly.FieldNote.prototype.createNotesArray = function () {
    var prefix = 'Low';
    var curNote = 'C';
    //keyNumber of low C -> https://en.wikipedia.org/wiki/Piano_key_frequencies
    var keyNumber = 28;
    for (var i = 0; i < this.nKeys_; i++) {
        // set name of the i note
        this.noteName_.push(prefix + ' ' + curNote);
        // get frequency using math formula -> https://en.wikipedia.org/wiki/Piano_key_frequencies
        var curFreq = Math.pow(2, (keyNumber - 49) / 12) * 440;
        // set frequency of the i note
        this.noteFreq_.push(curFreq);
        // get name of the next note
        curNote = this.nextNote(curNote);
        if (i == 11)
            prefix = 'Middle ';
        if (i == 23)
            prefix = 'High ';
        // increment keyNumber
        keyNumber++;
    }
};

/**
 * Create a piano under the note field.
 * @private
 */
Blockly.FieldNote.prototype.showEditor_ = function () {

    //change Note name to number frequency
    Blockly.FieldNumber.prototype.setText.call(this, this.getText());
    Blockly.FieldNote.superClass_.showEditor_.call(this);

    //create piano div
    div = Blockly.WidgetDiv.DIV;
    var pianoDiv = goog.dom.createDom('div', {});
    pianoDiv.className = 'blocklyPianoDiv';
    div.appendChild(pianoDiv);

    // Create the piano using Closure (colorButton).
    var piano = this.createNewPiano();
    this.whiteKeyCounter_ = 0;

    // Record windowSize and scrollOffset before adding the piano.
    var windowSize = goog.dom.getViewportSize();
    var scrollOffset = goog.style.getViewportPageOffset(document);
    var xy = this.getAbsoluteXY_();
    var borderBBox = this.getScaledBBox_();
    var div = Blockly.WidgetDiv.DIV;

    // render piano keys
    for (var i = 0; i < this.nKeys_; i++) {
        var key = piano[i];
        var bgColor = this.getBgColor(i);
        var width = this.getWidth(i);
        var height = this.getHeight(i);
        var position = this.getPosition(i);
        var style = this.getKeyStyle(bgColor, width, height, position, this.isWhite(i) ? 0 : 1);
        key.setContent(style);
        key.setId(this.noteName_[i]);
        key.render(pianoDiv);

        // highlight current selected key
        if (Math.abs(this.noteFreq_[i] - this.getValue()) < this.EPS)
            key.getContent().style.backgroundColor = "greenyellow";

        key.getContent().setAttribute("tag", this.noteFreq_[i]);
        var thisField = this;

        //  Listener when a new key is selected
        goog.events.listen(key.getElement(),
            goog.events.EventType.MOUSEDOWN,
            function () {
                Blockly.WidgetDiv.hide();
                var val = this.getContent().getAttribute("tag");
                thisField.setValue(val);
            }, false, key
        );

        //  Listener when the mouse is over a key
        goog.events.listen(key.getElement(),
            goog.events.EventType.MOUSEOVER,
            function () {
                showNoteLabel.getContent().innerText = this.getId();
            }, false, key
        );

        //  increment white key counter
        if (this.isWhite(i))
            this.whiteKeyCounter_++;
    }
    
    var showNoteLabel = new goog.ui.ColorButton();
    var showNoteStyle = this.getShowNoteStyle();
    showNoteLabel.setContent(showNoteStyle);
    showNoteLabel.render(pianoDiv);
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
