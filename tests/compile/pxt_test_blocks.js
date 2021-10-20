/**
 * @license
 * PXT Blockly fork
 *
 * The MIT License (MIT)
 *
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  {
    "type": "event_with_draggable_params_all",
    "message0": "All args %1 %2 %3 %4 %5",
    "args0": [
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myStr",
        "check": "String"
      },
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myNum",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myBool",
        "check": "Boolean"
      },
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myArg",
      },
      {
        "type": "input_statement",
        "name": "STACK",
      }
    ],
    "inputsInline": true,
  },
  {
    "type": "event_with_draggable_params_string",
    "message0": "String arg %1 %2",
    "args0": [
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myStr",
        "check": "String"
      },
      {
        "type": "input_statement",
        "name": "STACK",
      }
    ],
    "inputsInline": true,
  },
  {
    "type": "event_with_draggable_params_number",
    "message0": "Number arg %1 %2",
    "args0": [
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myNum",
        "check": "Number"
      },
      {
        "type": "input_statement",
        "name": "STACK",
      }
    ],
    "inputsInline": true,
  },
  {
    "type": "event_with_draggable_params_boolean",
    "message0": "Boolean arg %1 %2",
    "args0": [
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myBool",
        "check": "Boolean"
      },
      {
        "type": "input_statement",
        "name": "STACK",
      }
    ],
    "inputsInline": true,
  },
  {
    "type": "event_with_draggable_params_custom",
    "message0": "Custom arg %1 %2",
    "args0": [
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myArg"
      },
      {
        "type": "input_statement",
        "name": "STACK",
      }
    ],
    "inputsInline": true,
  },
  {
    "type": "event_with_draggable_params_wrong_names",
    "message0": "Bool and Num args wrong name %1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myNum",
        "check": "Boolean"
      },
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myBool",
        "check": "Number"
      },
      {
        "type": "input_statement",
        "name": "STACK",
      }
    ],
    "inputsInline": true,
  },
  {
    "type": "event_with_draggable_variable",
    "message0": "Draggable variables %1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myVar1",
        "check": "Variable"
      },
      {
        "type": "input_value",
        "name": "HANDLER_DRAG_PARAM_myVar2",
        "check": "Variable"
      },
      {
        "type": "input_statement",
        "name": "STACK",
      }
    ],
    "inputsInline": true,
  },
  {
    "type": "test_fields_text_dropdown",
    "message0": "%1",
    "args0": [
      {
        "type": "field_textdropdown",
        "name": "FIELDNAME",
        "value": "Hello world",
        "options": [
          [ "Hello", "Hello" ],
          [ "World", "World" ]
        ],
        "alt":
          {
            "type": "field_label",
            "text": "NO TEXT DROPDOWN FIELD"
          }
      }],
    "output": null,
    "inputsInline": true,
  },
  {
    "type": "test_fields_number_dropdown",
    "message0": "%1",
    "args0": [
      {
        "type": "field_numberdropdown",
        "name": "FIELDNAME",
        "value": "0",
        "options": [
          [ "500 ms", "500" ],
          [ "1 second", "1000" ]
        ],
        "alt":
          {
            "type": "field_label",
            "text": "NO NUMBER DROPDOWN FIELD"
          }
      }],
    "output": null,
    "inputsInline": true,
  },
  {
    "type": "test_fields_vertical_separator",
    "message0": "vertical %1 separator",
    "args0": [
      {
        "type": "field_vertical_separator",
        "name": "FIELDNAME",
        "alt":
          {
            "type": "field_label",
            "text": "NO VERTICAL SEPARATOR FIELD"
          }
      }],
    "output": null,
    "inputsInline": true,
    "style": "math_blocks"
  }
]);  // END JSON EXTRACT (Do not delete this comment.)