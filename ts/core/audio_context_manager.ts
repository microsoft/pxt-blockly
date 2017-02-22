/**
 * @license
 * Copyright (c) Microsoft Corporation
 * Use of this source code is governed by the MIT License.
 * see the license.txt file for details
 */

/**
 * @fileoverview Audio Manager.
 */

'use strict';

goog.provide('Blockly.AudioContextManager');

namespace Music { 
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

}

(Blockly as any).AudioContextManager = Music.AudioContextManager;