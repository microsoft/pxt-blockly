# @license
# PXT Blockly
# 
# Copyright (c) Microsoft Corporation. All rights reserved.
# https://github.com/Microsoft/pxt-blockly
# See LICENSE file for details.
# 
# Blockly dts generation script. 
# based on https://github.com/trodi/blockly-d.ts (MIT)

#!/usr/bin/env bash

# go to root
cd ..

# create tmp directory
rm -rf tmp/
mkdir tmp

# move to blockly core directory
cd core

# generate input string for definition generator
ls *.js | sed 's:\([a-z]*[-*_*[a-z]*]*\).js:core/\1.js \1.d.ts :' | tr -d '\n' > ../tmp/out.txt

# move to blockly msg directory
cd ../msg

# generate input string for definition generator for messages
ls messages.js | sed 's:\([a-z]*[-*_*[a-z]*]*\).js:msg/\1.js \1.d.ts :' | tr -d '\n' >> ../tmp/out.txt

# go back to root
cd ..

# generate d.ts - run from project root
node ./node_modules/typescript-closure-tools/definition-generator/src/main.js --include_private true `< tmp/out.txt`

# create output dir and move files into it
mkdir tmp/output
mv *.d.ts tmp/output/

# combine output files into one master file
cat tmp/output/*.d.ts > tmp/blockly-core.d.ts.tmp

# remove reference paths since they are all in one file
sed -i.bak '/reference path/d' tmp/blockly-core.d.ts.tmp

# add other definition files
cat typings/parts/blockly-header.d.ts > typings/blockly.d.ts
cat typings/parts/blockly-colours.d.ts >> typings/blockly.d.ts
cat typings/parts/blockly-options.d.ts >> typings/blockly.d.ts
cat typings/parts/goog-closure.d.ts >> typings/blockly.d.ts
cat tmp/blockly-core.d.ts.tmp >> typings/blockly.d.ts
