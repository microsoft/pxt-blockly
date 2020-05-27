
declare module Blockly {

  interface BlocklyOptions {
    toolbox?: HTMLElement | string;
    readOnly?: boolean;
    trashcan?: boolean;
    maxTrashcanContents?: number;
    collapse?: boolean;
    comments?: boolean;
    disable?: boolean;
    sounds?: boolean;
    rtl?: boolean;
    horizontalLayout?: boolean;
    toolboxPosition?: string;
    css?: boolean;
    oneBasedIndex?: boolean;
    media?: string;
    theme?: Blockly.Theme | BlocklyThemeOptions;
    move?: {
      scrollbars?: boolean;
      drag?: boolean;
      wheel?: boolean;
    };
    grid?: {
      spacing?: number;
      colour?: string;
      length?: number;
      snap?: boolean;
    };
    zoom?: {
      controls?: boolean;
      wheel?: boolean;
      startScale?: number;
      maxScale?: number;
      minScale?: number;
      scaleSpeed?: number;
      pinch?: boolean;
    };
    renderer?: string;
    // PXT specific:
    toolboxOptions?: ToolboxOptions;
    hasCategories?: boolean;
  }

  // PXT specific:
  interface ToolboxOptions {
    colour?: boolean;
    border?: boolean;
    inverted?: boolean;
    invertedMultiplier?: number;
    disabledOpacity?: number;
  }

  interface BlocklyThemeOptions {
    blockStyles?: {[blocks: string]: Blockly.Theme.BlockStyle;};
    categoryStyles?: {[category: string]: Blockly.Theme.CategoryStyle;};
    componentStyles?: {[component: string]: any;};
  }

  interface Metrics {
    absoluteLeft: number;
    absoluteTop: number;
    contentHeight: number;
    contentLeft: number;
    contentTop: number;
    contentWidth: number;
    viewHeight: number;
    viewLeft: number;
    viewTop: number;
    viewWidth: number;
  }

  // pxt-blockly specific
  namespace ContextMenu {
    interface Option {
      enabled?: boolean;
      text?: string;
      callback?: () => void;
    }
  }

  /**
   * Set the Blockly locale.
   * Note: this method is only available in the npm release of Blockly.
   * @param {!Object} msg An object of Blockly message strings in the desired
   *     language.
   */
  function setLocale(msg: {[key: string]: string;}): void;
}
