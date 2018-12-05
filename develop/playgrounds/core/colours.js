/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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

'use strict';

goog.provide('Blockly.Colours');

Blockly.Colours = {
  // SVG colours: these must be specificed in #RRGGBB style
  // To add an opacity, this must be specified as a separate property (for SVG fill-opacity)
  "text": "#575E75",
  "workspace": "#F9F9F9",
  "toolboxHover": "#4C97FF",
  "toolboxSelected": "#e9eef2",
  "toolboxText": "#575E75",
  "toolbox": "#FFFFFF",
  "flyout": "#444",
  "scrollbar": "#CECDCE",
  "scrollbarHover": '#CECDCE',
  "textField": "#FFFFFF",
  "insertionMarker": "#000000",
  "insertionMarkerOpacity": 0.2,
  "dragShadowOpacity": 0.4,
  "stackGlow": "#FFF200",
  "stackGlowSize": 4,
  "stackGlowOpacity": 1,
  "replacementGlow": "#FFF200",
  "replacementGlowSize": 2,
  "replacementGlowOpacity": 1,
  "highlightGlow": "#FFF200",
  "highlightGlowSize": 1.1,
  "highlightGlowOpacity": 1,
  "selectedGlow": "#FFF200",
  "selectedGlowSize": 0.4,
  "warningGlow": "#E53D00",
  "warningGlowSize": 1.1,
  "warningGlowOpacity": 1,
  "colourPickerStroke": "#FFFFFF",
  // CSS colours: support RGBA
  "fieldShadow": "rgba(255, 255, 255, 0.2)",
  "dropDownShadow": "rgba(0, 0, 0, .3)",
  "numPadBackground": "#547AB2",
  "numPadBorder": "#435F91",
  "numPadActiveBackground": "#435F91",
  "numPadText": "#FFFFFF",
  "valueReportBackground": "#FFFFFF",
  "valueReportBorder": "#AAAAAA",
  // Center on block transition
  "canvasTransitionLength": 500
};
