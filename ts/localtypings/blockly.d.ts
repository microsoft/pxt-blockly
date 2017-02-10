declare namespace goog {
    function require(name: string): void;
    function provide(name: string): void;
    function isFunction(f: any): boolean;

    namespace string {
        let caseInsensitiveCompare: (a: string, b: string) => number;
    }

    namespace array {
        function remove(ar: string[], v: string): void;
    }

    namespace dom {
        function createDom(tagName: string, opt_attributes?: Object, ...var_args: Object[]): Element;
        function createDom(name: string, ns?: string, children?: any): HTMLElement;
        function removeChildren(el: Element): void;
        function getViewportSize(): any;
    }

    namespace math {
        class Coordinate {
            x: number;
            y: number;
            constructor(x: number, y: number);
            clone(): Coordinate;

            static difference(a: Coordinate, b: Coordinate): Coordinate;
            static sum(a: Coordinate, b: Coordinate): Coordinate;
            static magnitude(a: Coordinate): number;
        }
        class Size {
            width: number;
            height: number
            constructor(width: number, height: number);
        }
    }

    namespace ui {
        class Control extends Component {
            setContent(content: string | Node | Array<Node> | null): void;
            getContent(): string | Node | Array<Node> | null;
            getContentElement(): Element;
            setVisible(visible: boolean, opt_force?: boolean | undefined): boolean;
        }
        class Component {
            getElement(): Element | null;
            render(opt_parentElement?: Element | null | undefined): void;
            setId(id: string): void
        }
        class ColorButton extends Control {
            title: string;
            setId(id: string): void;
            render(opt_parentElement?: Element | null | undefined): void;
        }
    }

    namespace style {
        let backgroundColor: number;
        function getViewportPageOffset(doc: Document): math.Coordinate;
    }

    namespace events {
        function listen(eventSource: Element, eventType: EventType, listener: any, capturePhase?: boolean, handler?: Object);
        type EventType = string;
        let EventType: {
            CLICK: EventType;
            RIGHTCLICK: EventType;
            DBLCLICK: EventType;
            MOUSEDOWN: EventType;
            MOUSEUP: EventType;
            MOUSEOVER: EventType;
            MOUSEOUT: EventType;
            MOUSEMOVE: EventType;
            MOUSEENTER: EventType;
            MOUSELEAVE: EventType;
            SELECTSTART: EventType;
            WHEEL: EventType;
            KEYPRESS: EventType;
            KEYDOWN: EventType;
            KEYUP: EventType;
            BLUR: EventType;
            FOCUS: EventType;
            DEACTIVATE: EventType;
            FOCUSIN: EventType;
            FOCUSOUT: EventType;
            CHANGE: EventType;
            SELECT: EventType;
            SUBMIT: EventType;
            INPUT: EventType;
            PROPERTYCHANGE: EventType;
            DRAGSTART: EventType;
            DRAG: EventType;
            DRAGENTER: EventType;
            DRAGOVER: EventType;
            DRAGLEAVE: EventType;
            DROP: EventType;
            DRAGEND: EventType;
            TOUCHSTART: EventType;
            TOUCHMOVE: EventType;
            TOUCHEND: EventType;
            TOUCHCANCEL: EventType;
            BEFOREUNLOAD: EventType;
            CONSOLEMESSAGE: EventType;
            CONTEXTMENU: EventType;
            DOMCONTENTLOADED: EventType;
            ERROR: EventType;
            HELP: EventType;
            LOAD: EventType;
            LOSECAPTURE: EventType;
            ORIENTATIONCHANGE: EventType;
            READYSTATECHANGE: EventType;
            RESIZE: EventType;
            SCROLL: EventType;
            UNLOAD: EventType;
            HASHCHANGE: EventType;
            PAGEHIDE: EventType;
            PAGESHOW: EventType;
            POPSTATE: EventType;
            COPY: EventType;
            PASTE: EventType;
            CUT: EventType;
            BEFORECOPY: EventType;
            BEFORECUT: EventType;
            BEFOREPASTE: EventType;
            ONLINE: EventType;
            OFFLINE: EventType;
            MESSAGE: EventType;
            CONNECT: EventType;
            ANIMATIONSTART: EventType;
            ANIMATIONEND: EventType;
            ANIMATIONITERATION: EventType;
            TRANSITIONEND: EventType;
            POINTERDOWN: EventType;
            POINTERUP: EventType;
            POINTERCANCEL: EventType;
            POINTERMOVE: EventType;
            POINTEROVER: EventType;
            POINTEROUT: EventType;
            POINTERENTER: EventType;
            POINTERLEAVE: EventType;
            GOTPOINTERCAPTURE: EventType;
            LOSTPOINTERCAPTURE: EventType;
            MSGESTURECHANGE: EventType;
            MSGESTUREEND: EventType;
            MSGESTUREHOLD: EventType;
            MSGESTURESTART: EventType;
            MSGESTURETAP: EventType;
            MSGOTPOINTERCAPTURE: EventType;
            MSINERTIASTART: EventType;
            MSLOSTPOINTERCAPTURE: EventType;
            MSPOINTERCANCEL: EventType;
            MSPOINTERDOWN: EventType;
            MSPOINTERENTER: EventType;
            MSPOINTERHOVER: EventType;
            MSPOINTERLEAVE: EventType;
            MSPOINTERMOVE: EventType;
            MSPOINTEROUT: EventType;
            MSPOINTEROVER: EventType;
            MSPOINTERUP: EventType;
            TEXT: EventType;
            TEXTINPUT: EventType;
            COMPOSITIONSTART: EventType;
            COMPOSITIONUPDATE: EventType;
            COMPOSITIONEND: EventType;
            EXIT: EventType;
            LOADABORT: EventType;
            LOADCOMMIT: EventType;
            LOADREDIRECT: EventType;
            LOADSTART: EventType;
            LOADSTOP: EventType;
            RESPONSIVE: EventType;
            SIZECHANGED: EventType;
            UNRESPONSIVE: EventType;
            VISIBILITYCHANGE: EventType;
            STORAGE: EventType;
            DOMSUBTREEMODIFIED: EventType;
            DOMNODEINSERTED: EventType;
            DOMNODEREMOVED: EventType;
            DOMNODEREMOVEDFROMDOCUMENT: EventType;
            DOMNODEINSERTEDINTODOCUMENT: EventType;
            DOMATTRMODIFIED: EventType;
            DOMCHARACTERDATAMODIFIED: EventType;
        };
    }
    namespace userAgent {

        /**
         * Whether the user agent is Opera.
         * @type {boolean}
         */
        var OPERA: boolean;

        /**
         * Whether the user agent is Internet Explorer.
         * @type {boolean}
         */
        var IE: boolean;

        /**
         * Whether the user agent is Gecko. Gecko is the rendering engine used by
         * Mozilla, Firefox, and others.
         * @type {boolean}
         */
        var GECKO: boolean;

        /**
         * Whether the user agent is WebKit. WebKit is the rendering engine that
         * Safari, Android and others use.
         * @type {boolean}
         */
        var WEBKIT: boolean;

        /**
         * Whether the user agent is running on a mobile device.
         *
         * TODO(nnaze): Consider deprecating MOBILE when labs.userAgent
         *   is promoted as the gecko/webkit logic is likely inaccurate.
         *
         * @type {boolean}
         */
        var MOBILE: boolean;

        /**
         * Used while transitioning code to use WEBKIT instead.
         * @type {boolean}
         * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
         * TODO(nicksantos): Delete this from goog.userAgent.
         */
        var SAFARI: boolean;

        /**
         * The platform (operating system) the user agent is running on. Default to
         * empty string because navigator.platform may not be defined (on Rhino, for
         * example).
         * @type {string}
         */
        var PLATFORM: string;

        /**
         * Whether the user agent is running on a Macintosh operating system.
         * @type {boolean}
         */
        var MAC: boolean;

        /**
         * Whether the user agent is running on a Windows operating system.
         * @type {boolean}
         */
        var WINDOWS: boolean;

        /**
         * Whether the user agent is running on a Linux operating system.
         *
         * Note that goog.userAgent.LINUX considers ChromeOS to be Linux,
         * while goog.labs.userAgent.platform considers ChromeOS and
         * Linux to be different OSes.
         *
         * @type {boolean}
         */
        var LINUX: boolean;

        /**
         * Whether the user agent is running on a X11 windowing system.
         * @type {boolean}
         */
        var X11: boolean;

        /**
         * Whether the user agent is running on Android.
         * @type {boolean}
         */
        var ANDROID: boolean;

        /**
         * Whether the user agent is running on an iPhone.
         * @type {boolean}
         */
        var IPHONE: boolean;

        /**
         * Whether the user agent is running on an iPad.
         * @type {boolean}
         */
        var IPAD: boolean;

        /**
         * The version of the user agent. This is a string because it might contain
         * 'b' (as in beta) as well as multiple dots.
         * @type {string}
         */
        var VERSION: string;

        /**
         * For IE version < 7, documentMode is undefined, so attempt to use the
         * CSS1Compat property to see if we are in standards mode. If we are in
         * standards mode, treat the browser version as the document mode. Otherwise,
         * IE is emulating version 5.
         * @type {number|undefined}
         * @const
         */
        var DOCUMENT_MODE: number | void;

        /**
         * Returns the userAgent string for the current browser.
         *
         * @return {string} The userAgent string.
         */
        function getUserAgentString(): string;

        /**
         * TODO(nnaze): Change type to "Navigator" and update compilation targets.
         * @return {Object} The native navigator object.
         */
        function getNavigator(): Object;

        /**
         * Compares two version numbers.
         *
         * @param {string} v1 Version of first item.
         * @param {string} v2 Version of second item.
         *
         * @return {number}  1 if first argument is higher
         *                   0 if arguments are equal
         *                  -1 if second argument is higher.
         * @deprecated Use goog.string.compareVersions.
         */
        function compare(v1: string, v2: string): number;

        /**
         * Whether the user agent version is higher or the same as the given version.
         * NOTE: When checking the version numbers for Firefox and Safari, be sure to
         * use the engine's version, not the browser's version number.  For example,
         * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
         * Opera and Internet Explorer versions match the product release number.<br>
         * @see <a href="http://en.wikipedia.org/wiki/Safari_version_history">
         *     Webkit</a>
         * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
         *
         * @param {string|number} version The version to check.
         * @return {boolean} Whether the user agent version is higher or the same as
         *     the given version.
         */
        function isVersionOrHigher(version: string | number): boolean;

        /**
         * Deprecated alias to {@code goog.userAgent.isVersionOrHigher}.
         * @param {string|number} version The version to check.
         * @return {boolean} Whether the user agent version is higher or the same as
         *     the given version.
         * @deprecated Use goog.userAgent.isVersionOrHigher().
         */
        function isVersion(version: string | number): boolean;

        /**
         * Whether the IE effective document mode is higher or the same as the given
         * document mode version.
         * NOTE: Only for IE, return false for another browser.
         *
         * @param {number} documentMode The document mode version to check.
         * @return {boolean} Whether the IE effective document mode is higher or the
         *     same as the given version.
         */
        function isDocumentModeOrHigher(documentMode: number): boolean;

        /**
         * Deprecated alias to {@code goog.userAgent.isDocumentModeOrHigher}.
         * @param {number} version The version to check.
         * @return {boolean} Whether the IE effective document mode is higher or the
         *      same as the given version.
         * @deprecated Use goog.userAgent.isDocumentModeOrHigher().
         */
        function isDocumentMode(version: number): boolean;
    }

}
declare namespace Blockly {
    let selected: any;
    function bindEvent_(node: any, eventName: string, target: any, fn: (e: any) => void): void;
    function genUid(): string;
    function terminateDrag_(): void;
    function mouseToSvg(e: Event, svg: Element): any;
    function svgResize(workspace: Blockly.Workspace): void;
    function hueToRgb(hue: number): string;

    function registerButtonCallback(key: string, func: (button: Blockly.FlyoutButton) => void): void;

    function alert(message: string, opt_callback?: () => void): void;
    function confirm(message: string, callback: (response: boolean) => void): void;
    function prompt(message: string, defaultValue: string, callback: (response: string) => void): void;

    let ALIGN_RIGHT: number;

    namespace utils {
        function wrap(tip: string, limit: number): string;
    }

    class FieldImage {
        constructor(url: string, width: number, height: number, def: string);
    }

    interface BlockDefinition {
        codeCard?: any;
        init: () => void;
        getVars?: () => any[];
        renameVar?: (oldName: string, newName: string) => void;
        customContextMenu?: any;
    }

    const Blocks: {
        [index: string]: BlockDefinition;
    }

    class Field {
        name: string;
        EDITABLE: boolean;
        borderRect_: any;
        sourceBlock_: Block;
        init(block: Block): void;
        static superClass_: Field;
        getText(): string;
        setText(newText: any): void;
        updateEditable(): void;
        dispose(): void;
        showEditor_(): void;
        getAbsoluteXY_(): goog.math.Coordinate;
        getScaledBBox_(): goog.math.Size;
    }

    class FieldVariable extends Field {
        constructor(d: any);
    }

    class FieldCheckbox extends Field {
        constructor(val: string);
        static CHECK_CHAR: string;
    }

    class FieldTextInput extends Field {
        constructor(text: string, validator: any);
        static numberValidator: any;
    }

    class FieldNumber extends FieldTextInput {
        constructor(value: string | number, opt_min?: any, opt_max?: any, opt_precision?: any, opt_validator?: any);
    }

    class FieldDropdown extends Field {
        constructor(val: string[][]);
    }

    class Block {
        static obtain(workspace: Workspace, prototypeName?: string): Block;

        // May allow downcasting (see below).
        type: string;
        id: string;
        isShadow_: boolean;
        nextConnection: Connection;
        outputConnection: Connection;
        previousConnection: Connection;
        workspace: Workspace;
        RTL: boolean;
        // private
        xy_: goog.math.Coordinate;


        // Returns null if the field does not exist on the specified block.
        getFieldValue(field: string): string;
        // Returns null if the input does not exist on the specified block, or
        // is disconnected.
        getInputTargetBlock(field: string): Block;
        getInputsInline(): boolean;
        // Returns null if no next block or is disconnected.
        getNextBlock(): Block;
        // Unplug this block from its superior block.  If this block is a statement, optionally reconnect the block underneath with the block on top.
        unplug(): void;

        moveBy(x: number, y: number): void;
        getHeightWidth(): { width: number; height: number; };
        getBoundingRectangle(): {
            topLeft: goog.math.Coordinate;
            bottomRight: goog.math.Coordinate;
        }

        getSurroundParent(): Block;

        svgGroup_: SVGElement;
        parentBlock_: Block;
        inputList: Input[];
        disabled: boolean;
        comment: string | Comment;

        appendDummyInput(opt_name?: string): Input;
        appendStatementInput(name: string): Input;
        appendValueInput(name: string): Input;
        getChildren(): Block[];
        getColour(): string;
        getDescendants(): Block[];
        initSvg(): void;
        removeInput(name: string, opt_quiet?: boolean): void;
        dispose(healGap: boolean): void;
        setCollapsed(collapsed: boolean): void;
        setColour(colour: number | string): void;
        setCommentText(text: string): void;
        setConnectionsHidden(hidden: boolean): void;
        setDeletable(deletable: boolean): void;
        setDisabled(disabled: boolean): void;
        setEditable(editable: boolean): void;
        setFieldValue(newValue: string, name: string): void;
        setHelpUrl(url: string): void;
        setInputsInline(newBoolean: boolean): void;
        setMovable(movable: boolean): void;
        setMutator(mutator: Mutator): void;
        setNextStatement(newBoolean: boolean, opt_check?: string | string[]): void;
        setOutput(newBoolean: boolean, opt_check?: string | string[]): void;
        setParent(newParent: Block): void;
        setPreviousStatement(newBoolean: boolean, opt_check?: string | string[]): void;
        setShadow(shadow: boolean): void;
        setTitleValue(newValue: string, name: string): void;
        setTooltip(newTip: string | (() => void)): void;
        // Passing null will delete current text
        setWarningText(text: string): void;
    }

    class Comment extends Icon {
        constructor(b: Block);

        dispose(): void;
        getBubbleSize(): { width: number, height: number };
        getText(): string;
        setBubbleSize(width: number, height: number): void;
        setText(text: string): void;
    }

    class Warning extends Icon {
    }

    class Icon {
        constructor(block: Block);

        collapseHidden: boolean;

        computeIconLocation(): void;
        createIcon(): void;
        dispose(): void;
        getIconLocation(): goog.math.Coordinate;
        isVisible(): boolean;
        setVisible(visible: boolean): void;
        renderIcon(cursorX: number): number;
        setIconLocation(xy: goog.math.Coordinate): void;
        updateColour(): void;
        updateEditable(): void;
    }

    // if type == controls_if
    class IfBlock extends Block {
        elseifCount_: number;
        elseCount_: number;
    }

    class Input {
        constructor(type: number, name: string, source: Block, target: Connection);
        name: string;
        connection: Connection;
        sourceBlock_: Block;
        fieldRow: Field[];

        appendField(field: Field | string, opt_name?: string): Input;
        appendTitle(field: any, opt_name?: string): Input;
        dispose(): void;
        init(): void;
        isVisible(): boolean;
        removeField(name: string): void;
        setAlign(align: number): Input;
        setCheck(check: string | string[]): Input;
        setVisible(visible: boolean): Block;
    }

    class Connection {
        constructor(b: Block, type: number);
        check_: string[];
        targetConnection: Connection;
        sourceBlock_: Block;
        targetBlock(): Block;
        connect(otherConnection: Connection): void;
    }

    // if type is one of "procedures_def{,no}return", or "procedures_call{,no}return"
    class DefOrCallBlock extends Block {
        arguments_: string[];
    }

    interface BlocklyEvent {
        type: string;
        blockId?: string;
        workspaceId: string;
        recordUndo: boolean;
        element?: string;
        oldValue?: string;
        newValue?: string;
        name?: string;
        xml?: any;
        group?: string;
    }

    class FlyoutButton {
        getTargetWorkspace(): Blockly.Workspace;
    }

    class Mutator extends Icon {
        /**
         * @param quarkNames: list of sub_blocks for toolbox in mutator workspace
         */
        constructor(quarkNames: string[]);

        reconnect(connectionChild: Connection, block: Block, inputName: string): boolean;
        dispose(): void;
    }

    class ScrollbarPair {
        hScroll: Scrollbar;
        vScroll: Scrollbar;
        resize(): void;
    }

    class Scrollbar {
        svgHandle_: Element;
        ratio_: number;
        set(x: number): void;
    }

    class Workspace {
        svgGroup_: any;
        scrollbar: ScrollbarPair;
        svgBlockCanvas_: SVGGElement;

        newBlock(prototypeName: string, opt_id?: string): Block;
        render(): void;
        clear(): void;
        dispose(): void;
        getTopBlocks(ordered: boolean): Block[];
        getBlockById(id: string): Block;
        getAllBlocks(): Block[];
        traceOn(armed: boolean): void;
        addChangeListener(f: (e: BlocklyEvent) => void): callbackHandler;
        removeChangeListener(h: callbackHandler): void;
        updateToolbox(newTree: Element | string): void;
        getCanvas(): any;
        getParentSvg(): Element;
        zoom(x: number, y: number, type: number): void;
        zoomCenter(type: number): void;
        highlightBlock(id: string): void;
        undo(redo?: boolean): void;
        redo(): void;
        clearUndo(): void;
        isDragging(): boolean;
        getMetrics(): {
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
        variableIndexOf(name: string): number;
    }

    class WorkspaceSvg {
        moveDrag(e: Event): goog.math.Coordinate;
        showContextMenu_(e: Event): void;
    }



    namespace Xml {
        function domToText(dom: Element): string;
        function domToPrettyText(dom: Element): string;
        function domToWorkspace(dom: Element, workspace: Workspace): void;
        function textToDom(text: string): Element;
        function workspaceToDom(workspace: Workspace): Element;
    }

    interface Options {
        readOnly?: boolean;
        toolbox?: Element | string;
        trashcan?: boolean;
        collapse?: boolean;
        comments?: boolean;
        disable?: boolean;
        scrollbars?: boolean;
        sound?: boolean;
        css?: boolean;
        media?: string;
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
        };
        enableRealTime?: boolean;
        rtl?: boolean;
    }

    // tslint:disable-next-line
    interface callbackHandler { }

    function inject(elt: Element, options?: Options): Workspace;

    function createSvgElement(tag: string, options: any, fg: any): any;

    namespace Names {
        function equals(old: string, n: any): boolean;
    }

    namespace Variables {
        function allVariables(wp: Workspace): string[];
        let flyoutCategory: (wp: Workspace) => HTMLElement[];
        function createVariable(wp: Workspace, opt_callback?: ((e: any) => void)): void;
    }

    namespace ContextMenu {
        interface MenuItem {
            enabled?: boolean;
            text?: string;
            callback?: () => void;
        }

        function callbackFactory(block: Block, xml: HTMLElement): void;
        function show(e: any, menu: MenuItem[], rtl: boolean): void;
    }

    namespace Msg {
        const VARIABLES_DEFAULT_NAME: string;
        const VARIABLES_SET_CREATE_GET: string;
        const CONTROLS_FOR_INPUT_DO: string;
        const CONTROLS_FOR_TOOLTIP: string;
        const UNDO: string;
        const REDO: string;
        const COLLAPSE_ALL: string;
        const EXPAND_ALL: string;
        const DELETE_BLOCK: string;
        const DELETE_X_BLOCKS: string;
        const DELETE_ALL_BLOCKS: string;
    }

    namespace BlockSvg {
        let START_HAT: boolean;
    }

    namespace Events {
        const CREATE: string;
        const DELETE: string;
        const CHANGE: string;
        const MOVE: string;
        const UI: string;
        function setGroup(group: any): void;
        function fire(ev: Abstract): void;
        function disableOrphans(ev: Abstract): void;
        function isEnabled(): boolean;
        class Abstract {
            type: string;
        }
        class Change extends Abstract {
            constructor(block: Block, element: String, name: String, oldValue: String, newValue: String);
        }
    }

    namespace Toolbox {
        class TreeNode {
            isUserCollapsible_: boolean;

            getChildCount(): number;
            getParent(): TreeNode;
            getTree(): TreeControl;
            hasChildren(): boolean;
            isSelected(): boolean;
            onMouseDown(e: Event): void;
            select(): void;
            setExpanded(expanded: boolean): void;
            toggle(): void;
            updateRow(): void;
        }

        class TreeControl {
            selectedItem_: TreeNode;

            getSelectedItem(): TreeNode;
            setSelectedItem(t: TreeNode): void;
        }
    }

    namespace WidgetDiv {
        let DIV: Element;
        function hideIfOwner(oldOwner: any): void;
        function hide(): void;
        function position(anchorX: number, anchorY: number, windowSize: goog.math.Size,
            scrollOffset: goog.math.Coordinate, rtl: boolean): void;
    }

    var Tooltip: any;
}
