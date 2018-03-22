#!/bin/bash

# Script for cleaning up Blockly built files

git checkout --ours blockly_compressed.js
git checkout --ours blockly_uncompressed.js
git checkout --ours blocks_compressed.js
git checkout --ours php_compressed.js
git checkout --ours dart_compressed.js
git checkout --ours lua_compressed.js
git checkout --ours javascript_compressed.js
git checkout --ours python_compressed.js

rm -rf accessible/*
rm -rf demos/*
rm -rf .github/*