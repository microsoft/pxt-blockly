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

    export namespace AudioContextManager {
        let _frequency = 0;
        let _context: any; // AudioContext
        let _vco: any; // OscillatorNode;
        let _vca: any; // GainNode;

        let _mute = false; //mute audio

        function context(): any {
            if (!_context) _context = freshContext();
            return _context;
        }

        function freshContext(): any {
            (<any>window).AudioContext = (<any>window).AudioContext || (<any>window).webkitAudioContext;
            if ((<any>window).AudioContext) {
                try {
                    // this call my crash.
                    // SyntaxError: audio resources unavailable for AudioContext construction
                    return new (<any>window).AudioContext();
                } catch (e) { }
            }
            return undefined;
        }

        export function mute(mute: boolean) {
            _mute = mute;
            stop();
        }

        export function stop() {
            if (_vca) _vca.gain.value = 0;
            _frequency = 0;
        }

        export function frequency(): number {
            return _frequency;
        }

        export function tone(frequency: number, gain: number) {
            if (_mute) return;
            if (frequency <= 0) return;
            _frequency = frequency;

            let ctx = context();
            if (!ctx) return;

            gain = Math.max(0, Math.min(1, gain));
            if (!_vco) {
                try {
                    _vco = ctx.createOscillator();
                    _vca = ctx.createGain();
                    _vco.connect(_vca);
                    _vca.connect(ctx.destination);
                    _vca.gain.value = gain;
                    _vco.start(0);
                } catch (e) {
                    _vco = undefined;
                    _vca = undefined;
                    return;
                }
            }

            _vco.frequency.value = frequency;
            _vca.gain.value = gain;
        }
    }

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
         * width of piano
         * @type {number}
         * @private
         */
        private pianoWidth_: number;
        /**
         * height of piano
         * @type {number}
         * @private
         */
        private pianoHeight_: number;
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
        * count the number of keys that have sounded in the piano editor
        * @type {number}
        * @private
        */
        private soundingKeys_: number = 0;
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
         * @param {number} topPosition top position of the label
         * @param {number} leftPosition
         * @param {pagination} pagination
         * @return {goog.dom} DOM with the new css style.
         * @private 
         */
        private getShowNoteStyle_(topPosition: number, leftPosition: number, pagination: boolean) {
            let div = goog.dom.createDom('div',
                {
                    'style': 'top: ' + ((this.keyHeight_) + topPosition)
                    + 'px; left: ' + leftPosition
                    + 'px; background-color: ' + this.colour_
                    + '; width: ' + this.pianoWidth_
                    + 'px; border-color: ' + this.colour_
                    + ';'
                });
            div.className = 'blocklyNoteLabel';
            return div;
        };

        /**
         * create a DOM to assing a style to the previous and next buttons
         * @param {number} topPosition top position of the label
         * @param {number} leftPosition
         * @param {boolean} isPrev true if is previous button false otherwise
         * @return {goog.dom} DOM with the new css style.
         * @private 
         */
        private getNextPrevStyle_(topPosition: number, leftPosition: number, isPrev: boolean) {
            //  x position of the button
            let position = (isPrev ? -20 : this.pianoWidth_ + 0.5);
            let div = goog.dom.createDom('div',
                {
                    'style': 'top: ' + ((this.pianoHeight_ / 2) + topPosition)
                    + 'px; left: ' + (position + leftPosition)
                    + 'px; color: ' + this.colour_
                    + ';'
                });
            div.className = 'blocklyNotePrevNext';
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
        private getKeyWidth_(idx: number): number {
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
        private getKeyHeight_(idx: number): number {
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

        /**
         * return next note prefix
         * @param {string} note current note prefix
         * @return {string} next note prefix
         * @private
         */
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

        /** get width of blockly editor space
        * @return { number } width of the blockly editor workspace
        * @private
        */
        getEditorWidth_(): number {
            let editorWidth = document.getElementById('blocklyDiv').offsetWidth;
            let toolBoxWidth = (<HTMLElement>document.getElementsByClassName('blocklyToolboxDiv')[0]).offsetWidth;
            return editorWidth - toolBoxWidth;
        }
        /**
         * Create a piano under the note field.
         */
        showEditor_(): void {
            //change Note name to number frequency
            Blockly.FieldNumber.prototype.setText.call(this, this.getText());
            FieldNote.superClass_.showEditor_.call(this, true);
            // initializate the number of keys that have sounded when the editor is open
            this.soundingKeys_ = 0;
            this.pianoWidth_ = this.keyWidth_ * (this.nKeys_ - (this.nKeys_ / 12 * 5));
            this.pianoHeight_ = this.keyHeight_;
            let pagination: boolean = false;
            let editorWidth = this.getEditorWidth_();
            let thisField = this;

            // Check if Mobile.. 
            // if(mobile) pagination -> true

            if (editorWidth < this.pianoWidth_) {
                pagination = true;
                this.pianoWidth_ = 7 * this.keyWidth_;
            }


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
            let pianoHeight = this.keyHeight_ + div.scrollHeight + 5;
            let xy = this.getAbsoluteXY_();
            let borderBBox = this.getScaledBBox_();

            let topPosition: number = 0, leftPosition: number = 0;

            // Flip the piano vertically if off the bottom.
            if (xy.y + pianoHeight + borderBBox.height >=
                windowSize.height + scrollOffset.y) {
                topPosition = -(pianoHeight + borderBBox.height);
            }
            if (this.sourceBlock_.RTL) {
                xy.x += borderBBox.width;
                xy.x -= this.pianoWidth_;
                leftPosition += borderBBox.width;
                leftPosition -= this.pianoWidth_;
                // Don't go offscreen left.
                if (xy.x < scrollOffset.x) {
                    leftPosition = scrollOffset.x - xy.x;
                }
            } else {
                // Don't go offscreen right.
                if (xy.x > windowSize.width + scrollOffset.x - this.pianoWidth_) {
                    leftPosition -= xy.x - (windowSize.width + scrollOffset.x - this.pianoWidth_) + 30;
                }
            }

            let octaveCounter = 0;
            // render piano keys
            for (let i = 0; i < this.nKeys_; i++) {
                if (i > 0 && i % 12 == 0)
                    octaveCounter++;
                let key = piano[i];
                let bgColor = this.getBgColor_(i);
                let width = this.getKeyWidth_(i);
                let height = this.getKeyHeight_(i);
                let position = this.getPosition_(i);
                if (pagination && i >= 12) // modify original position
                    position -= 7 * octaveCounter * this.keyWidth_;

                let style = this.getKeyStyle_(bgColor, width, height, position + leftPosition, topPosition, this.isWhite_(i) ? 1 : 2, this.isWhite_(i) ? this.colour_ : "black");
                key.setContent(style);
                key.setId(this.noteName_[i]);
                key.render(pianoDiv);
                let script = key.getContent() as HTMLElement;
                script.setAttribute("tag", this.noteFreq_[i].toString());

                // highlight current selected key
                if (Math.abs(this.noteFreq_[i] - Number(this.getValue())) < this.eps_)
                    script.style.backgroundColor = this.selectedKeyColor_;

                //  Listener when a new key is selected
                goog.events.listen(key.getElement(),
                    goog.events.EventType.MOUSEDOWN,
                    function () {
                        Blockly.WidgetDiv.hide();
                        let cnt = ++thisField.soundingKeys_;
                        let freq = this.getContent().getAttribute("tag");
                        thisField.setValue(freq);
                        AudioContextManager.tone(freq, 1);
                        setTimeout(function () {
                            // compare current sound counter with listener sound counter (avoid async problems)
                            if (thisField.soundingKeys_ == cnt)
                                AudioContextManager.stop();
                        }, 500);
                    }, false, key
                );

                //  Listener when the mouse is over a key
                goog.events.listen(key.getElement(),
                    goog.events.EventType.MOUSEOVER,
                    function () {
                        let script = showNoteLabel.getContent() as HTMLElement;
                        script.innerText = this.getId();
                        // current sound counter
                        let cnt = ++thisField.soundingKeys_;
                        let freq = this.getContent().getAttribute('tag');
                        AudioContextManager.tone(freq, 1);
                        setTimeout(function () {
                            // compare current sound counter with listener sound counter (avoid async problems)
                            if (thisField.soundingKeys_ == cnt)
                                AudioContextManager.stop();
                        }, 500);
                    }, false, key
                );

                //  Listener when the mouse leave a key
                goog.events.listen(key.getElement(),
                    goog.events.EventType.MOUSELEAVE,
                    function () {
                        AudioContextManager.stop();
                    }, false, key
                );

                //  increment white key counter
                if (this.isWhite_(i))
                    this.whiteKeyCounter_++;

                if (pagination && i > 11) // set octaves invisible
                    key.setVisible(false);
            }
            //  render note label
            let showNoteLabel = new goog.ui.ColorButton();
            let showNoteStyle = this.getShowNoteStyle_(topPosition, leftPosition, true);
            showNoteLabel.setContent(showNoteStyle);
            showNoteLabel.render(pianoDiv);
            let scriptLabel = showNoteLabel.getContent() as HTMLElement;
            scriptLabel.innerText = '-';

            // create next and previous buttons
            let prevButton = new goog.ui.ColorButton();
            let nextButton = new goog.ui.ColorButton();
            let prevButtonStyle = this.getNextPrevStyle_(topPosition, leftPosition, true);
            let nextButtonStyle = this.getNextPrevStyle_(topPosition, leftPosition, false);

            if (pagination) {
                //  render previous and next buttons
                let script: HTMLElement;
                prevButton.setContent(prevButtonStyle);
                prevButton.render(pianoDiv);
                script = prevButton.getContent() as HTMLElement;
                script.innerText = '<';
                prevButton.setVisible(false);
                nextButton.setContent(nextButtonStyle);
                nextButton.render(pianoDiv);
                script = nextButton.getContent() as HTMLElement;
                script.innerText = '>';
                scriptLabel.innerText = 'Octave # 1';

                let Npages = this.nKeys_ / 12;
                let currentPage = 0;

                goog.events.listen(prevButton.getElement(),
                    goog.events.EventType.MOUSEDOWN,
                    function () {
                        let curFirstKey = currentPage * 12;
                        let newFirstKey = currentPage * 12 - 12;
                        //  hide current octave
                        for (let i = 0; i < 12; i++)
                            piano[i + curFirstKey].setVisible(false);
                        //  show new octave
                        for (let i = 0; i < 12; i++)
                            piano[i + newFirstKey].setVisible(true);

                        currentPage--;
                        if (currentPage == 0)
                            this.setVisible(false);
                        nextButton.setVisible(true);
                        scriptLabel.innerText = 'Octave # ' + (currentPage + 1);
                    }, false, prevButton
                );

                goog.events.listen(nextButton.getElement(),
                    goog.events.EventType.MOUSEDOWN,
                    function () {
                        let curFirstKey = currentPage * 12;
                        let newFirstKey = currentPage * 12 + 12;
                        //  hide current octave
                        for (let i = 0; i < 12; i++)
                            piano[i + curFirstKey].setVisible(false);
                        for (let i = 0; i < 12; i++)
                            piano[i + newFirstKey].setVisible(true);
                        currentPage++;

                        //  show new octave
                        if (currentPage == Npages - 1)
                            this.setVisible(false);
                        prevButton.setVisible(true);
                        scriptLabel.innerText = 'Octave # ' + (currentPage + 1);
                    }, false, nextButton
                );
            }
        }
    }
}


