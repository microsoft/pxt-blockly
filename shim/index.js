/**
 * Webpack shim module
 *
 * Uses webpack imports-loader and exports-loader to provide the horizontal and
 * vertical flavors of Blockly.  All of the other files in this directory shim
 * Blockly and goog between blockly_compressed_* and blocks_compressed*.
 *
 * Vertical export Blockly out of
 *     blockly_compressed +
 *     blocks_compressed +
 *     msg/messages
**/
module.exports = {
    Vertical: require('./vertical')
};
