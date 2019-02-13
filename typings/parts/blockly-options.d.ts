
declare module Blockly {

    interface WorkspaceOptions {
        readOnly?: boolean;
        toolbox?: Element | string;
        hasCategories?: boolean;
        trashcan?: boolean;
        collapse?: boolean;
        comments?: boolean;
        disable?: boolean;
        scrollbars?: boolean;
        sound?: boolean;
        css?: boolean;
        media?: string;
        horizontalLayout?: boolean;
        toolboxPosition?: string;
        grid?: {
            spacing?: number;
            length?: number;
            colour?: string;
            snap?: boolean;
        };
        zoom?: {
            enabled?: boolean;
            controls?: boolean;
            wheel?: boolean;
            maxScale?: number;
            minScale?: number;
            scaleSpeed?: number;
            startScale?: number;
        };
        enableRealTime?: boolean;
        rtl?: boolean;
        // PXT specific:
        toolboxOptions?: ToolboxOptions;
    }
    interface ToolboxOptions {
        colour?: boolean;
        border?: boolean;
        inverted?: boolean;
        invertedMultiplier?: number;
        disabledOpacity?: number;
    }

}