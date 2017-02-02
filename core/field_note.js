/// <reference path="../localtypings/blockly.d.ts" />
//TODO license
/**
 * @fileoverview note-picker input field.
 */
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
goog.provide('Blockly.FieldNote');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.ColorButton');
goog.require('goog.dom');
goog.require('Blockly.Field');
goog.require('Blockly.FieldNumber');
var pianoSize;
(function (pianoSize) {
    pianoSize[pianoSize["small"] = 12] = "small";
    pianoSize[pianoSize["medium"] = 36] = "medium";
    pianoSize[pianoSize["large"] = 60] = "large";
})(pianoSize || (pianoSize = {}));
var Blockly;
(function (Blockly) {
    var FieldNote = (function (_super) {
        __extends(FieldNote, _super);
        /**
         * Class for a note input field.
         * @param {string} note The initial note in string format.
         * @param {Function=} opt_validator A function that is executed when a new
         *     note is selected.  Its sole argument is the new note value.  Its
         *     return value becomes the selected note
         * @extends {Blockly.FieldNumber}
         * @constructor
         */
        function FieldNote(note, colour, opt_validator) {
            var _this = _super.call(this, note) || this;
            /**
             * default number of piano keys
             * @type {number}
             * @private
             */
            _this.nKeys_ = pianoSize.medium;
            /**
             * Absolute error for note frequency identification (Hz)
             * @type {number}
             * @private
             */
            _this.eps_ = 1;
            /**
             * array of notes frequency
             * @type {Array.<number>}
             * @private
             */
            _this.noteFreq_ = [];
            /**
             * array of notes names
             * @type {Array.<string>}
             * @private
             */
            _this.noteName_ = [];
            /**
             * default width piano key
             * @type {number}
             * @private
             */
            _this.keyWidth_ = 18;
            /**
             * default height piano key
             * @type {number}
             * @private
             */
            _this.keyHeight_ = 70;
            /**
             * count the number of white piano key that have been rendered
             * @type {number}
             * @private
             */
            _this.whiteKeyCounter_ = 0;
            /**
            * color for the current selected key
            * @type {number}
            * @private
            */
            _this.selectedKeyColor_ = "aqua";
            FieldNote.superClass_.constructor.call(_this, note, opt_validator);
            _this.note_ = note;
            _this.colour_ = Blockly.hueToRgb(colour);
            return _this;
        }
        /**
         * Ensure that only a non negative number may be entered.
         * @param {string} text The user's text.
         * @return {?string} A string representing a valid positive number, or null if invalid.
         */
        FieldNote.prototype.classValidator = function (text) {
            if (text === null) {
                return null;
            }
            text = String(text);
            var n = parseFloat(text || '0');
            if (isNaN(n) || n < 0) {
                // Invalid number.
                return null;
            }
            // Get the value in range.
            return String(n);
        };
        /**
         * Install this field on a block.
         */
        FieldNote.prototype.init = function () {
            FieldNote.superClass_.init.call(this);
            this.borderRect_.style['fillOpacity'] = 1;
            this.noteFreq_.length = 0;
            this.noteName_.length = 0;
            this.whiteKeyCounter_ = 0;
            //  Create arrays of name/frequency of the notes
            this.createNotesArray_();
            this.setValue(this.getValue());
        };
        /**
         * Return the current note frequency.
         * @return {string} Current note in string format.
         */
        FieldNote.prototype.getValue = function () {
            return this.note_;
        };
        /**
         * Set the note.
         * @param {string} note The new note in string format.
         */
        FieldNote.prototype.setValue = function (note) {
            note = String(parseFloat(note || '0'));
            if (isNaN(Number(note)) || Number(note) < 0)
                return;
            if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
                this.note_ != note) {
                Blockly.Events.fire(new Blockly.Events.Change(this.sourceBlock_, 'field', this.name, String(this.note_), String(note)));
            }
            this.note_ = note;
            this.setText(this.getNoteName_());
        };
        /**
         * Get the text from this field.  Used when the block is collapsed.
         * @return {string} Current text.
         */
        FieldNote.prototype.getText = function () {
            return Number(this.note_).toFixed(2);
        };
        /**
         * Set the text in this field and NOT fire a change event.
         * @param {*} newText New text.
         */
        FieldNote.prototype.setText = function (newText) {
            if (newText === null) {
                // No change if null.
                return;
            }
            newText = String(newText);
            if (!isNaN(Number(newText)))
                newText = this.getNoteName_();
            if (newText === this.text_) {
                // No change.
                return;
            }
            Blockly.Field.prototype.setText.call(this, newText);
        };
        /**
        * get the note name to be displayed in the field
        * @return {string} note name
        * @private
        */
        FieldNote.prototype.getNoteName_ = function () {
            var note = this.getValue();
            var text = note.toString();
            for (var i = 0; i < this.nKeys_; i++) {
                if (Math.abs(this.noteFreq_[i] - Number(note)) < this.eps_)
                    return this.noteName_[i];
            }
            if (!isNaN(Number(note)))
                text += ' Hz';
            return text;
        };
        /**
         * Set a custom number of keys for this field.
         * @param {number} nkeys Number of keys for this block,
         *     or 26 to use default.
         * @return {!Blockly.FieldNote} Returns itself (for method chaining).
         */
        FieldNote.prototype.setNumberOfKeys = function (size) {
            if (size != pianoSize.small && size != pianoSize.medium && size != pianoSize.large)
                return this;
            this.nKeys_ = size;
            return this;
        };
        /**
         * create an Array of goo.ui.ColorButton as a piano keys
         * @return {Array.<goog.ui.colorButton>} piano keys.
         * @private
         */
        FieldNote.prototype.createNewPiano_ = function () {
            var N = this.nKeys_;
            var piano = [];
            for (var i = 0; i < N; i++) {
                piano.push(new goog.ui.ColorButton());
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
         * @param {string} keyBorderColour
         * @return {goog.dom} DOM with the new css style.
         * @private
         */
        FieldNote.prototype.getKeyStyle_ = function (bgColor, width, height, position, z_index, keyBorderColour) {
            var div = goog.dom.createDom('div', {
                'style': 'background-color: ' + bgColor
                    + '; width: ' + width
                    + 'px; height: ' + height
                    + 'px; left: ' + position
                    + 'px; z-index: ' + z_index
                    + ';   border-color: ' + keyBorderColour
                    + ';'
            });
            div.className = 'blocklyNote';
            return div;
        };
        /**
         * create a DOM to assing a style to the note label
         * @return {goog.dom} DOM with the new css style.
         * @private
         */
        FieldNote.prototype.getShowNoteStyle_ = function () {
            // get center of the piano
            var div = goog.dom.createDom('div', {
                'style': 'top: ' + (this.keyHeight_)
                    + 'px; background-color: ' + this.colour_
                    + '; width: ' + (this.keyWidth_ * this.whiteKeyCounter_)
                    + 'px; border-color: ' + this.colour_
                    + ';'
            });
            div.className = 'blocklyNoteLabel';
            return div;
        };
        ;
        /**
         * @param {number} idx index of the key
         * @return {boolean} true if idx key is white
         * @private
         */
        FieldNote.prototype.isWhite_ = function (idx) {
            var octavePosition = idx % 12;
            if (octavePosition == 1 || octavePosition == 3 || octavePosition == 6 ||
                octavePosition == 8 || octavePosition == 10)
                return false;
            return true;
        };
        ;
        /**
         * get background color of the current piano key
         * @param {number} idx index of the key
         * @return {string} key background color
         * @private
         */
        FieldNote.prototype.getBgColor_ = function (idx) {
            //  What color is idx key
            if (this.isWhite_(idx))
                return 'white';
            return 'black';
        };
        /**
         * get width of the piano key
         * @param {number} idx index of the key
         * @return {number} width of the key
         * @private
         */
        FieldNote.prototype.getWidth_ = function (idx) {
            if (this.isWhite_(idx))
                return this.keyWidth_;
            return this.keyWidth_ / 2;
        };
        /**
         * get height of the piano key
         * @param {number} idx index of the key
         * @return {number} height of the key
         * @private
         */
        FieldNote.prototype.getHeight_ = function (idx) {
            if (this.isWhite_(idx))
                return this.keyHeight_;
            return this.keyHeight_ / 2;
        };
        /**
         * get the position of the key in the piano
         * @param {number} idx index of the key
         * @return {number} position of the key
         */
        FieldNote.prototype.getPosition_ = function (idx) {
            var pos = (this.whiteKeyCounter_ * this.keyWidth_);
            if (this.isWhite_(idx))
                return pos;
            return pos - (this.keyWidth_ / 4);
        };
        /**
         * return next note of a piano key
         * @param {string} note current note
         * @return {string} next note
         * @private
         */
        FieldNote.prototype.nextNote_ = function (note) {
            switch (note) {
                case 'A#':
                    return 'B';
                case 'B':
                    return 'C';
                case 'C#':
                    return 'D';
                case 'D#':
                    return 'E';
                case 'E':
                    return 'F';
                case 'F#':
                    return 'G';
                case 'G#':
                    return 'A';
            }
            return note + '#';
        };
        // octave_count. 
        FieldNote.prototype.nextNotePrefix_ = function (prefix) {
            switch (prefix) {
                case 'Deep':
                    return 'Low';
                case 'Low':
                    return 'Middle';
                case 'Middle':
                    if (this.nKeys_ == pianoSize.medium)
                        return 'High';
                    return 'Tenor';
                case 'Tenor':
                    return 'High';
            }
        };
        /**
         * create Array of notes name and frequencies
         * @private
         */
        FieldNote.prototype.createNotesArray_ = function () {
            var prefix;
            var curNote = 'C';
            var keyNumber;
            // set piano start key number and key prefix (keyNumbers -> https://en.wikipedia.org/wiki/Piano_key_frequencies)
            switch (this.nKeys_) {
                case pianoSize.small:
                    keyNumber = 40;
                    //  no prefix for a single octave
                    prefix = '';
                    break;
                case pianoSize.medium:
                    keyNumber = 28;
                    prefix = 'Low';
                    break;
                case pianoSize.large:
                    keyNumber = 16;
                    prefix = 'Deep';
                    break;
            }
            for (var i = 0; i < this.nKeys_; i++) {
                // set name of the i note
                this.noteName_.push(prefix + ' ' + curNote);
                // get frequency using math formula -> https://en.wikipedia.org/wiki/Piano_key_frequencies
                var curFreq = Math.pow(2, (keyNumber - 49) / 12) * 440;
                // set frequency of the i note
                this.noteFreq_.push(curFreq);
                // get name of the next note
                curNote = this.nextNote_(curNote);
                if ((i + 1) % 12 == 0)
                    prefix = this.nextNotePrefix_(prefix);
                // increment keyNumber
                keyNumber++;
            }
        };
        /**
         * Create a piano under the note field.
         */
        FieldNote.prototype.showEditor_ = function () {
            //change Note name to number frequency
            Blockly.FieldNumber.prototype.setText.call(this, this.getText());
            FieldNote.superClass_.showEditor_.call(this);
            //create piano div
            var div = Blockly.WidgetDiv.DIV;
            var pianoDiv = goog.dom.createDom('div', {});
            pianoDiv.className = 'blocklyPianoDiv';
            div.appendChild(pianoDiv);
            // Create the piano using Closure (colorButton).
            var piano = this.createNewPiano_();
            this.whiteKeyCounter_ = 0;
            // Record windowSize and scrollOffset before adding the piano.
            var windowSize = goog.dom.getViewportSize();
            var scrollOffset = goog.style.getViewportPageOffset(document);
            var xy = this.getAbsoluteXY_();
            var borderBBox = this.getScaledBBox_();
            div = Blockly.WidgetDiv.DIV;
            var _loop_1 = function (i) {
                var key = piano[i];
                var bgColor = this_1.getBgColor_(i);
                var width = this_1.getWidth_(i);
                var height = this_1.getHeight_(i);
                var position = this_1.getPosition_(i);
                var style = this_1.getKeyStyle_(bgColor, width, height, position, this_1.isWhite_(i) ? 1 : 2, this_1.isWhite_(i) ? this_1.colour_ : "black");
                key.setContent(style);
                key.setId(this_1.noteName_[i]);
                key.render(pianoDiv);
                var script_1 = key.getContent();
                script_1.setAttribute("tag", this_1.noteFreq_[i].toString());
                // highlight current selected key
                if (Math.abs(this_1.noteFreq_[i] - Number(this_1.getValue())) < this_1.eps_)
                    script_1.style.backgroundColor = this_1.selectedKeyColor_;
                var thisField = this_1;
                //  Listener when a new key is selected
                goog.events.listen(key.getElement(), goog.events.EventType.MOUSEDOWN, function () {
                    Blockly.WidgetDiv.hide();
                    var val = this.getContent().getAttribute("tag");
                    thisField.setValue(val);
                }, false, key);
                //  Listener when the mouse is over a key
                goog.events.listen(key.getElement(), goog.events.EventType.MOUSEOVER, function () {
                    var script = showNoteLabel.getContent();
                    script.innerText = this.getId();
                }, false, key);
                //  increment white key counter
                if (this_1.isWhite_(i))
                    this_1.whiteKeyCounter_++;
            };
            var this_1 = this;
            // render piano keys
            for (var i = 0; i < this.nKeys_; i++) {
                _loop_1(i);
            }
            var showNoteLabel = new goog.ui.ColorButton();
            var showNoteStyle = this.getShowNoteStyle_();
            showNoteLabel.setContent(showNoteStyle);
            showNoteLabel.render(pianoDiv);
            var script = showNoteLabel.getContent();
            script.innerText = '-';
        };
        return FieldNote;
    }(Blockly.FieldNumber));
    Blockly.FieldNote = FieldNote;
})(Blockly || (Blockly = {}));
