/**
 * @license
 * PXT Blockly
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * https://github.com/Microsoft/pxt-blockly
 * 
 * See LICENSE file for details.
 */

/**
 * @fileoverview Number slider input field.
 */

/// <reference path="../localtypings/blockly.d.ts" />

'use strict';
goog.provide('Blockly.FieldString');

goog.require('Blockly.FieldTextInput');
goog.require('goog.math');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');

namespace pxtblocky {
    export class FieldString extends Blockly.FieldTextInput {

        private quoteSize_: number;
        private quoteLeftX_: number;
        private quoteRightX_: number;
        private quoteY_: number;

        private quoteLeft_: SVGImageElement;
        private quoteRight_: SVGImageElement;

        static quotePadding = 0;

        public static QUOTE_0_DATA_URI: string = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0icmVwZWF0IgogICB4PSIwcHgiCiAgIHk9IjBweCIKICAgdmlld0JveD0iMCAwIDI0IDI0IgogICBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNCAyNDsiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTEgcjEzNzI1IgogICBzb2RpcG9kaTpkb2NuYW1lPSJxdW90ZTAuc3ZnIgogICBpbmtzY2FwZTpleHBvcnQtZmlsZW5hbWU9Ii9Vc2Vycy9zYW1teXNhbS9Xb3JrL3B4dC1ibG9ja2x5L21lZGlhL3F1b3RlMC5wbmciCiAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSIxOTguNzUiCiAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIxOTguNzUiPjxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTE1Ij48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjxkYzp0aXRsZT5yZXBlYXQ8L2RjOnRpdGxlPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzMTMiIC8+PHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxMzYzIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjgzNCIKICAgICBpZD0ibmFtZWR2aWV3MTEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjkuODMzMzMzNSIKICAgICBpbmtzY2FwZTpjeD0iMTkuMDkzNTg3IgogICAgIGlua3NjYXBlOmN5PSIxMy4yODgxMzYiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMCIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJyZXBlYXQiIC8+PHN0eWxlCiAgICAgdHlwZT0idGV4dC9jc3MiCiAgICAgaWQ9InN0eWxlMyI+Cgkuc3Qwe2ZpbGw6I0NGOEIxNzt9Cgkuc3Qxe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU+PHRpdGxlCiAgICAgaWQ9InRpdGxlNSI+cmVwZWF0PC90aXRsZT48dGV4dAogICAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgICAgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXNpemU6MzAuOTc1OTk5ODNweDtsaW5lLWhlaWdodDoxMjUlO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7bGV0dGVyLXNwYWNpbmc6MHB4O3dvcmQtc3BhY2luZzowcHg7ZmlsbDojYTMxNTE1O2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoxcHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICB4PSI3Ljc5MjM4NjUiCiAgICAgeT0iMjUuNjc5MTgyIgogICAgIGlkPSJ0ZXh0NDEzNyIKICAgICBzb2RpcG9kaTpsaW5lc3BhY2luZz0iMTI1JSI+PHRzcGFuCiAgICAgICBzb2RpcG9kaTpyb2xlPSJsaW5lIgogICAgICAgaWQ9InRzcGFuNDEzOSIKICAgICAgIHg9IjcuNzkyMzg2NSIKICAgICAgIHk9IjI1LjY3OTE4MiIKICAgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtZmFtaWx5Ok1vbmFjbzstaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOk1vbmFjbztmaWxsOiNhMzE1MTU7ZmlsbC1vcGFjaXR5OjEiPiZxdW90OzwvdHNwYW4+PC90ZXh0Pgo8L3N2Zz4=';
        public static QUOTE_1_DATA_URI: string = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0icmVwZWF0IgogICB4PSIwcHgiCiAgIHk9IjBweCIKICAgdmlld0JveD0iMCAwIDI0IDI0IgogICBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNCAyNDsiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTEgcjEzNzI1IgogICBzb2RpcG9kaTpkb2NuYW1lPSJxdW90ZTEuc3ZnIgogICBpbmtzY2FwZTpleHBvcnQtZmlsZW5hbWU9Ii9Vc2Vycy9zYW1teXNhbS9Xb3JrL3B4dC1ibG9ja2x5L21lZGlhL3F1b3RlMS5wbmciCiAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSIxOTguNzUiCiAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIxOTguNzUiPjxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTE1Ij48cmRmOlJERj48Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+PGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPjxkYzp0aXRsZT5yZXBlYXQ8L2RjOnRpdGxlPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcwogICAgIGlkPSJkZWZzMTMiIC8+PHNvZGlwb2RpOm5hbWVkdmlldwogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxIgogICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgICAgZ3VpZGV0b2xlcmFuY2U9IjEwIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxMzYzIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjgzNCIKICAgICBpZD0ibmFtZWR2aWV3MTEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjkuODMzMzMzNSIKICAgICBpbmtzY2FwZTpjeD0iMTkuMDkzNTg3IgogICAgIGlua3NjYXBlOmN5PSIxMy4yODgxMzYiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMCIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJyZXBlYXQiIC8+PHN0eWxlCiAgICAgdHlwZT0idGV4dC9jc3MiCiAgICAgaWQ9InN0eWxlMyI+Cgkuc3Qwe2ZpbGw6I0NGOEIxNzt9Cgkuc3Qxe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU+PHRpdGxlCiAgICAgaWQ9InRpdGxlNSI+cmVwZWF0PC90aXRsZT48dGV4dAogICAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgICAgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXNpemU6MzAuOTc1OTk5ODNweDtsaW5lLWhlaWdodDoxMjUlO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7bGV0dGVyLXNwYWNpbmc6MHB4O3dvcmQtc3BhY2luZzowcHg7ZmlsbDojYTMxNTE1O2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoxcHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICB4PSItMi4yMDc2MTM1IgogICAgIHk9IjI1LjY3OTE4MiIKICAgICBpZD0idGV4dDQxMzciCiAgICAgc29kaXBvZGk6bGluZXNwYWNpbmc9IjEyNSUiPjx0c3BhbgogICAgICAgc29kaXBvZGk6cm9sZT0ibGluZSIKICAgICAgIGlkPSJ0c3BhbjQxMzkiCiAgICAgICB4PSItMi4yMDc2MTM1IgogICAgICAgeT0iMjUuNjc5MTgyIgogICAgICAgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1mYW1pbHk6TW9uYWNvOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246TW9uYWNvO2ZpbGw6I2EzMTUxNTtmaWxsLW9wYWNpdHk6MSI+JnF1b3Q7PC90c3Bhbj48L3RleHQ+Cjwvc3ZnPg==';

        /**
         * Class for an editable text field.
         * @param {string} text The initial content of the field.
         * @param {Function=} opt_validator An optional function that is called
         *     to validate any constraints on what the user entered.  Takes the new
         *     text as an argument and returns either the accepted text, a replacement
         *     text, or null to abort the change.
         * @param {RegExp=} opt_restrictor An optional regular expression to restrict
         *     typed text to. Text that doesn't match the restrictor will never show
         *     in the text field.
         * @extends {Blockly.Field}
         * @constructor
         */
        constructor(text: any, opt_validator?: () => void, opt_restrictor?: () => void) {
            super(text, opt_validator, opt_restrictor);
        }

        init() {
            Blockly.FieldTextInput.superClass_.init.call(this);

            // Add quotes around the string
            // Positioned on render, after text size is calculated.
            this.quoteSize_ = 12;
            this.quoteLeftX_ = 0;
            this.quoteRightX_ = 0;
            this.quoteY_ = 8;
            this.quoteLeft_ = Blockly.utils.createSvgElement('image', {
                'height': this.quoteSize_ + 'px',
                'width': this.quoteSize_ + 'px'
            }) as SVGImageElement;
            this.quoteRight_ = Blockly.utils.createSvgElement('image', {
                'height': this.quoteSize_ + 'px',
                'width': this.quoteSize_ + 'px'
            }) as SVGImageElement;
            this.quoteLeft_.setAttributeNS('http://www.w3.org/1999/xlink',
                'xlink:href', FieldString.QUOTE_0_DATA_URI);
            this.quoteRight_.setAttributeNS('http://www.w3.org/1999/xlink',
                'xlink:href', FieldString.QUOTE_1_DATA_URI);

            // Force a reset of the text to add the arrow.
            var text = this.text_;
            this.text_ = null;
            this.setText(text);
        }

        setText(text: string) {
            if (text === null || text === this.text_) {
                // No change if null.
                return;
            }
            this.text_ = text;
            if (this.textElement_) {
                this.textElement_.parentNode.appendChild(this.quoteLeft_);
            }
            this.updateTextNode_();
            if (this.textElement_) {
                this.textElement_.parentNode.appendChild(this.quoteRight_);
            }
            if (this.sourceBlock_ && this.sourceBlock_.rendered) {
                this.sourceBlock_.render();
                this.sourceBlock_.bumpNeighbours_();
            }
        }

        // Position Left
        positionLeft(x: number) {
            if (!this.quoteLeft_) {
              return 0;
            }
            this.quoteLeftX_ = 0;
            var addedWidth = this.quoteSize_;
            this.quoteLeft_.setAttribute('transform',
                'translate(' + this.quoteLeftX_ + ',' + this.quoteY_ + ')'
            );
            return addedWidth;
        }

        // Position Right
        positionArrow(x: number) {
            if (!this.quoteRight_) {
              return 0;
            }
            this.quoteRightX_ = x + FieldString.quotePadding / 2;
            var addedWidth = this.quoteSize_ + FieldString.quotePadding;
            if (this.box_) {
              // Bump positioning to the right for a box-type drop-down.
              this.quoteRightX_ += (Blockly as any).BlockSvg.BOX_FIELD_PADDING;
            }
            this.quoteRight_.setAttribute('transform',
              'translate(' + this.quoteRightX_ + ',' + this.quoteY_ + ')'
            );
            return addedWidth;
          };
    }
}

(Blockly as any).FieldString = pxtblocky.FieldString;