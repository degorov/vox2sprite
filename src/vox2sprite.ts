#!/usr/bin/env node

import parseArgs from 'minimist';
import vox2sprite from './spritesheet';

const {
  _: [inFile, outFile],
} = parseArgs(process.argv.slice(2));

if (inFile && outFile) {
  try {
    vox2sprite(inFile, outFile);
  } catch (err) {
    console.log((err as Error).message);
  }
} else {
  console.info('Usage: vox2sprite voxfile.vox pngfile.png');
}
