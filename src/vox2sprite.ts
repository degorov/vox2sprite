#!/usr/bin/env node

import parseArgs from 'minimist';
import { parseVoxData, readVoxFile } from './magicavoxel';
import { createSpriteSheet, writePngFile } from './spritesheet';

export default function vox2sprite(voxFileName: string, pngFileName: string): void {
  writePngFile(createSpriteSheet(parseVoxData(readVoxFile(voxFileName))).pixels, pngFileName);
}

if (require.main === module) {
  const {
    _: [inFile, outFile],
  } = parseArgs(process.argv.slice(2));

  if (inFile && outFile) {
    vox2sprite(inFile, outFile);
  } else {
    console.info('Usage: vox2sprite voxfile.vox pngfile.png');
  }
}
