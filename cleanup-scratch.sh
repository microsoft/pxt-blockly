#!/bin/bash

# Script for cleaning up scratch specific files when merging scratch-blocks into pxt-blockly
# Removes files and directories that pxt-blockly doesn't want.

# On separate lines so that a failure to find one doesn't block removal of the other directories.

git checkout --ours blockly_compressed.js
git checkout --ours blockly_uncompressed.js
git checkout --ours blocks_compressed.js
git checkout --ours php_compressed.js
git checkout --ours dart_compressed.js
git checkout --ours lua_compressed.js
git checkout --ours javascript_compressed.js
git checkout --ours python_compressed.js

# Restore from pxt-blockly
git checkout --ours accessible/
git checkout --ours demos/
git checkout --ours generators/
git checkout --ours generators/dart/
git checkout --ours generators/javascript/
git checkout --ours generators/lua/
git checkout --ours generators/php/
git checkout --ours generators/python/
git checkout --ours tests/generators/
git checkout --ours msg/

git checkout --ours package.json
git checkout --ours README.md
git checkout --ours .travis.yml
git checkout --ours webpack.config.js
git checkout --ours gh-pages/index.md
git checkout --ours core/block_render_svg.js
git checkout --ours tests/playground.html
git checkout --ours tests/multi_playground.html

git checkout --ours media/disconnect.mp3
git checkout --ours media/disconnect.ogg
git checkout --ours media/disconnect.wav
git checkout --ours media/quote0.png
git checkout --ours media/quote1.png

# Core files to always favour
git checkout --ours core/toolbox.js
git checkout --ours core/zoom_controls.js
git checkout --ours core/trashcan.js


# Remove the field_variable_getter
rm -rf core/field_variable_getter.js
rm -rf tests/jsunit/field_variable_getter_test.js

# Scratch specific
git rm -rf blocks_common
git rm -rf blocks_horizontal
git rm -rf blocks_vertical
rm -rf shim/
rm -rf TRADEMARK
rm -rf .github/
rm -rf core/block_render_svg_horizontal.js

# Remove media icons
rm -rf media/icons/
rm -rf media/turnleft_arrow.png
rm -rf media/turnright_arrow.png
rm -rf media/zoom-in.svg
rm -rf media/zoom-out.svg
rm -rf media/zoom-reset.svg
