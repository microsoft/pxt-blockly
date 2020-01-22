
# blockly.d.ts

TypeScript definition file for pxt-blockly.

``npm run typings`` generates the TypeScript definition file (d.ts file) for this Blockly fork. 

## Update definition file

In order to update the definition file, from a command line, and run the following:

```
npm run typings
```

The newly generated dts file will be in ``typings/blockly.d.ts``


## Static definitions

A number of static definitions are included in the generated blockly defenition file. 

### Google closure typings
Today, Blockly has a dependency on the Google Closure library. The typings for these dependencies are handcrafted to only the ones used by ``blockly.d.ts`` and can be found under ``typings/parts/goog-closure.d.ts``

### Typings header
A header file that includes the license header. This can be found under ``typings/parts/blockly-header.d.ts``

### Blockly interfaces
An interface describing the Blockly options and related interfaces. This can be found under ``typings/parts/blockly-interfaces.d.ts``

### Blockly colours
An interface describing the Blockly colour options. This can be found under ``typings/parts/blockly-colours.d.ts``

## LICENSE

MIT
