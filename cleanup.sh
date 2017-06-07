#!/bin/bash

# Script for cleaning up blockly-specific files when merging blockly into pxt-blockly
# Removes files and directories that pxt-blockly doesn't want.

# On separate lines so that a failure to find one doesn't block removal of the other directories.
git rm -rf accessible
git rm -rf appengine
git rm blockly_compressed.js
git rm blockly_uncompressed.js
git rm blocks_compressed.js
git rm -f core/block_render_svg.js

# Turn on more powerful globbing
shopt -s extglob

# Having trouble with directories.  Let's just go there.
cd msg/json
git rm -f !(en.json)
cd ../..

# Having trouble with directories.  Let's just go there.
cd msg/js
git rm -f !(en.js)
cd ../..

# Turn powerful globbing off again
shopt -u extglob
