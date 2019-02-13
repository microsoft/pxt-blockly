
declare module Blockly {

    interface Colours {
        text: string;
        workspace: string;
        toolboxHover: string;
        toolboxSelected: string;
        toolboxText: string;
        toolbox: string;
        flyout: string;
        scrollbar: string;
        scrollbarHover: string;
        textField: string;
        insertionMarker: string;
        insertionMarkerOpacity: number;
        dragShadowOpacity: number;
        stackGlow: string;
        stackGlowSize: number;
        stackGlowOpacity: number;
        replacementGlow: string;
        replacementGlowSize: number;
        replacementGlowOpacity: number;
        highlightGlow: string;
        highlightGlowSize: number;
        highlightGlowOpacity: number;
        selectedGlow: string;
        selectedGlowSize: number;
        warningGlow: string;
        warningGlowSize: number;
        warningGlowOpacity: number;
        colourPickerStroke: string;
        // CSS colours: support RGBA
        fieldShadow: string;
        dropDownShadow: string;
        numPadBackground: string;
        numPadBorder: string;
        numPadActiveBackground: string;
        numPadText: string;
        valueReportBackground: string;
        valueReportBorder: string;
        // Center on block transition
        canvasTransitionLength: number;
    }
}

