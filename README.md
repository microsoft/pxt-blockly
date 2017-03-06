# Blockly (Microsoft PXT fork)

This is a fork of [Blockly](https://github.com/google/blockly/), an open source visual programming environment.

Major additions and changes in this fork:

* Note field editor
* Slider for the number field editor
* Edge / IE fixes

Minor changes:

* Blockly zoom with Ctrl / Cmd + mousewheel scroll, and scroll workspace with just mousewheel scroll
* Support icons in toolbox
* Inverted and coloured toolbox mode


### Prerequisites

* node, npm
* python

## Development

* `git clone https://github.com/Microsoft/pxt-blockly`
* `cd pxt-blockly`
* `npm install .`
* `npm run watch` to compile Typescript files

## Building

* `python build.py` to build blockly

## Playground

There is a playground manual testing page at [tests/playground.html](./tests/playground.html), which requires no build step or server running.

`open tests/playground.html`

## License

The original Google/Blockly is licensed under Apache License (Version 2.0).

The new code is licensed under MIT.
