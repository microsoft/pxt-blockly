/// <reference path="../localtypings/blockly.d.ts" />

//TODO license
/**
 * @fileoverview note-picker input field.
 */
'use strict';
goog.provide('Blockly.FieldNote');

goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.ColorButton');
goog.require('goog.dom');
goog.require('Blockly.Field');
goog.require('Blockly.FieldNumber');

enum pianoSize {
    small = 12,
    medium = 36,
    large = 60
}
namespace Blockly {
    export class FieldNote extends FieldNumber {

        private note_: string;
        private text_: string;
        //  colour of the block
        private colour_: string;
        /**
         * default number of piano keys
         * @type {number}
         * @private
         */
        private nKeys_: number = pianoSize.medium;
        /**
         * Absolute error for note frequency identification (Hz)
         * @type {number}
         * @private
         */
        private eps_: number = 1;
        /**
         * array of notes frequency
         * @type {Array.<number>}
         * @private
         */
        private noteFreq_: Array<number> = [];
        /**
         * array of notes names
         * @type {Array.<string>}
         * @private
         */
        private noteName_: Array<string> = [];
        /**
         * default width piano key
         * @type {number}
         * @private
         */
        private keyWidth_: number = 18;
        /**
         * default height piano key
         * @type {number}
         * @private
         */
        private keyHeight_: number = 70;
        /**
         * count the number of white piano key that have been rendered
         * @type {number}
         * @private
         */
        private whiteKeyCounter_: number = 0;
        /**
        * color for the current selected key
        * @type {string}
        * @private
        */
        private selectedKeyColor_: string = "aqua";
        /**
         * Class for a note input field.
         * @param {string} note The initial note in string format.
         * @param {Function=} opt_validator A function that is executed when a new
         *     note is selected.  Its sole argument is the new note value.  Its
         *     return value becomes the selected note
         * @extends {Blockly.FieldNumber}
         * @constructor
         */
        constructor(note: string, colour: number, opt_validator?: any) {
            super(note);
            FieldNote.superClass_.constructor.call(this, note, opt_validator);
            this.note_ = note;
            this.colour_ = Blockly.hueToRgb(colour);
        }
        /**
         * Ensure that only a non negative number may be entered.
         * @param {string} text The user's text.
         * @return {?string} A string representing a valid positive number, or null if invalid.
         */
        classValidator(text: string) {
            if (text === null) {
                return null;
            }
            text = String(text);

            let n = parseFloat(text || '0');
            if (isNaN(n) || n < 0) {
                // Invalid number.
                return null;
            }
            // Get the value in range.
            return String(n);
        }
        /**
         * Install this field on a block.
         */
        init() {
            FieldNote.superClass_.init.call(this);
            this.borderRect_.style['fillOpacity'] = 1;
            this.noteFreq_.length = 0;
            this.noteName_.length = 0;
            this.whiteKeyCounter_ = 0;
            //  Create arrays of name/frequency of the notes
            this.createNotesArray_();
            this.setValue(this.getValue());
        }
        /**
         * Return the current note frequency.
         * @return {string} Current note in string format.
         */
        getValue(): string {
            return this.note_;
        }

        /**
         * Set the note.
         * @param {string} note The new note in string format.
         */
        setValue(note: string) {
            note = String(parseFloat(note || '0'));
            if (isNaN(Number(note)) || Number(note) < 0)
                return;
            if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
                this.note_ != note) {
                Blockly.Events.fire(new Blockly.Events.Change(
                    this.sourceBlock_, 'field', this.name, String(this.note_), String(note)));
            }
            this.note_ = note;
            this.setText(this.getNoteName_());
        }

        /**
         * Get the text from this field.  Used when the block is collapsed.
         * @return {string} Current text.
         */
        getText(): string {
            return Number(this.note_).toFixed(2);
        }


        /**
         * Set the text in this field and NOT fire a change event.
         * @param {*} newText New text.
         */
        setText(newText: string) {
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
        }

        /**
        * get the note name to be displayed in the field
        * @return {string} note name
        * @private
        */
        private getNoteName_(): string {
            let note: string = this.getValue();
            let text: string = note.toString();
            for (let i: number = 0; i < this.nKeys_; i++) {
                if (Math.abs(this.noteFreq_[i] - Number(note)) < this.eps_)
                    return this.noteName_[i];
            }
            if (!isNaN(Number(note)))
                text += ' Hz';
            return text;
        }

        /**
         * Set a custom number of keys for this field.
         * @param {number} nkeys Number of keys for this block,
         *     or 26 to use default.
         * @return {!Blockly.FieldNote} Returns itself (for method chaining).
         */
        setNumberOfKeys(size: number): FieldNote {
            if (size != pianoSize.small && size != pianoSize.medium && size != pianoSize.large)
                return this;
            this.nKeys_ = size;
            return this;
        }


        /**
         * create an Array of goo.ui.ColorButton as a piano keys
         * @return {Array.<goog.ui.colorButton>} piano keys.
         * @private
         */
        private createNewPiano_(): Array<goog.ui.ColorButton> {
            let N: number = this.nKeys_;
            let piano: Array<goog.ui.ColorButton> = [];
            for (let i = 0; i < N; i++) {
                piano.push(new goog.ui.ColorButton());
            }
            return piano;
        }

        /**
         * create a DOM to assing a style to the button
         * @param {string} bgColor color of the key background
         * @param {number} width width of the key
         * @param {number} heigth heigth of the key
         * @param {number} leftPosition position of the key
         * @param {number} topPosition position of the key
         * @param {number} z_index z-index of the key
         * @param {string} keyBorderColour 
         * @return {goog.dom} DOM with the new css style.
         * @private
         */
        private getKeyStyle_(bgColor: string, width: number, height: number, leftPosition: number, topPosition: number, z_index: number, keyBorderColour: string) {
            let div = goog.dom.createDom('div',
                {
                    'style': 'background-color: ' + bgColor
                    + '; width: ' + width
                    + 'px; height: ' + height
                    + 'px; left: ' + leftPosition
                    + 'px; top: ' + topPosition
                    + 'px; z-index: ' + z_index
                    + ';   border-color: ' + keyBorderColour
                    + ';'
                });
            div.className = 'blocklyNote';
            return div;
        }

        /**
         * create a DOM to assing a style to the note label
         * @return {goog.dom} DOM with the new css style.
         * @private 
         */
        private getShowNoteStyle_(topPosition: number, leftPosition: number) {
            // get center of the piano
            let div = goog.dom.createDom('div',
                {
                    'style': 'top: ' + ((this.keyHeight_) + topPosition)
                    + 'px; left: ' + leftPosition
                    + 'px; background-color: ' + this.colour_
                    + '; width: ' + (this.keyWidth_ * (this.nKeys_ - (this.nKeys_ / 12 * 5)))
                    + 'px; border-color: ' + this.colour_
                    + ';'
                });
            div.className = 'blocklyNoteLabel';
            return div;
        };

        /**
         * @param {number} idx index of the key
         * @return {boolean} true if idx key is white
         * @private
         */
        private isWhite_(idx: number): boolean {
            let octavePosition: number = idx % 12;
            if (octavePosition == 1 || octavePosition == 3 || octavePosition == 6 ||
                octavePosition == 8 || octavePosition == 10)
                return false;
            return true;
        };

        /**
         * get background color of the current piano key
         * @param {number} idx index of the key
         * @return {string} key background color
         * @private
         */
        private getBgColor_(idx: number): string {
            //  What color is idx key
            if (this.isWhite_(idx))
                return 'white';
            return 'black';
        }

        /**
         * get width of the piano key
         * @param {number} idx index of the key
         * @return {number} width of the key
         * @private
         */
        private getWidth_(idx: number): number {
            if (this.isWhite_(idx))
                return this.keyWidth_;
            return this.keyWidth_ / 2;
        }

        /**
         * get height of the piano key
         * @param {number} idx index of the key
         * @return {number} height of the key
         * @private
         */
        private getHeight_(idx: number): number {
            if (this.isWhite_(idx))
                return this.keyHeight_;
            return this.keyHeight_ / 2;
        }

        /**
         * get the position of the key in the piano
         * @param {number} idx index of the key
         * @return {number} position of the key
         */
        private getPosition_(idx: number): number {
            let pos: number = (this.whiteKeyCounter_ * this.keyWidth_);
            if (this.isWhite_(idx))
                return pos;
            return pos - (this.keyWidth_ / 4);
        }

        /**
         * return next note of a piano key
         * @param {string} note current note
         * @return {string} next note
         * @private
         */
        private nextNote_(note: string): string {
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
        }

        // octave_count. 
        private nextNotePrefix_(prefix: string): string {
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
        }
        /**
         * create Array of notes name and frequencies
         * @private
         */
        private createNotesArray_() {
            let prefix: string;
            let curNote: string = 'C';

            let keyNumber: number;
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
            for (let i = 0; i < this.nKeys_; i++) {
                // set name of the i note
                this.noteName_.push(prefix + ' ' + curNote);
                // get frequency using math formula -> https://en.wikipedia.org/wiki/Piano_key_frequencies
                let curFreq = Math.pow(2, (keyNumber - 49) / 12) * 440;
                // set frequency of the i note
                this.noteFreq_.push(curFreq);
                // get name of the next note
                curNote = this.nextNote_(curNote);
                if ((i + 1) % 12 == 0)
                    prefix = this.nextNotePrefix_(prefix);
                // increment keyNumber
                keyNumber++;
            }
        }

        /**
         * Create a piano under the note field.
         */
        showEditor_(): void {
            //change Note name to number frequency
            Blockly.FieldNumber.prototype.setText.call(this, this.getText());
            FieldNote.superClass_.showEditor_.call(this, true);

            // Check if Mobile.. 


            //create piano div
            let div = Blockly.WidgetDiv.DIV;
            let pianoDiv = goog.dom.createDom('div', {});
            pianoDiv.className = 'blocklyPianoDiv';
            div.appendChild(pianoDiv);

            // Create the piano using Closure (colorButton).
            let piano = this.createNewPiano_();
            this.whiteKeyCounter_ = 0;

            // Record windowSize and scrollOffset before adding the piano.
            let windowSize = goog.dom.getViewportSize();
            let scrollOffset = goog.style.getViewportPageOffset(document);
            let xy = this.getAbsoluteXY_();
            let borderBBox = this.getScaledBBox_();
            let pianoHeight = this.keyHeight_ + div.scrollHeight + 5;
            let pianoWidth = this.keyWidth_ * (this.nKeys_ - (this.nKeys_ / 12 * 5));
            let topPosition: number = 0, leftPosition: number = 0;

            // Flip the piano vertically if off the bottom.
            if (xy.y + pianoHeight + borderBBox.height >=
                windowSize.height + scrollOffset.y) {
                topPosition = -(pianoHeight + borderBBox.height);
            }
            if (this.sourceBlock_.RTL) {
                xy.x += borderBBox.width;
                xy.x -= pianoWidth;
                leftPosition += borderBBox.width;
                leftPosition -= pianoWidth;
                // Don't go offscreen left.
                if (xy.x < scrollOffset.x) {
                    leftPosition = scrollOffset.x - xy.x;
                }
            } else {
                // Don't go offscreen right.
                if (xy.x > windowSize.width + scrollOffset.x - pianoWidth) {
                    leftPosition -= xy.x - (windowSize.width + scrollOffset.x - pianoWidth) + 5;
                }
            }

            // render piano keys
            for (let i = 0; i < this.nKeys_; i++) {
                let key = piano[i];
                let bgColor = this.getBgColor_(i);
                let width = this.getWidth_(i);
                let height = this.getHeight_(i);
                let position = this.getPosition_(i);
                let style = this.getKeyStyle_(bgColor, width, height, position + leftPosition, topPosition, this.isWhite_(i) ? 1 : 2, this.isWhite_(i) ? this.colour_ : "black");
                key.setContent(style);
                key.setId(this.noteName_[i]);
                key.render(pianoDiv);
                let script = key.getContent() as HTMLElement;
                script.setAttribute("tag", this.noteFreq_[i].toString());

                // highlight current selected key
                if (Math.abs(this.noteFreq_[i] - Number(this.getValue())) < this.eps_)
                    script.style.backgroundColor = this.selectedKeyColor_;

                let thisField = this;

                //  Listener when a new key is selected
                goog.events.listen(key.getElement(),
                    goog.events.EventType.MOUSEDOWN,
                    function () {
                        Blockly.WidgetDiv.hide();
                        let val = this.getContent().getAttribute("tag");
                        thisField.setValue(val);
                    }, false, key
                );

                //  Listener when the mouse is over a key
                goog.events.listen(key.getElement(),
                    goog.events.EventType.MOUSEOVER,
                    function () {
                        let script = showNoteLabel.getContent() as HTMLElement;
                        script.innerText = this.getId();
                    }, false, key
                );

                //  increment white key counter
                if (this.isWhite_(i))
                    this.whiteKeyCounter_++;
            }
            let showNoteLabel = new goog.ui.ColorButton();
            let showNoteStyle = this.getShowNoteStyle_(topPosition, leftPosition);
            showNoteLabel.setContent(showNoteStyle);
            showNoteLabel.render(pianoDiv);
            let scriptLabel = showNoteLabel.getContent() as HTMLElement;
            scriptLabel.innerText = '-';
        }
    }
}