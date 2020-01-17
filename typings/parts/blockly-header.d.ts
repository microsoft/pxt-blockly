/**
 * @license
 * Copyright 2019 Google LLC
 *
 * See LICENSE file for details.
 */

declare module Blockly {

    /**
     * Interfaces
     */ 

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

    interface ImageJson {
        width: number;
        height: number;
        src: string;
    }

    namespace ContextMenu {
        interface MenuItem {
            enabled?: boolean;
            text?: string;
            callback?: () => void;
        }
    }
}