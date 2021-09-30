/* eslint-disable @typescript-eslint/no-var-requires */
const { readFileSync, unlinkSync } = require('fs');
const { MagicaVoxel } = require('../bin/magicavoxel');

describe('End-to-end testing', () => {
  ['7-7-7', '7-7-8', '7-8-7', '7-8-8', '8-7-7', '8-7-8', '8-8-7', '8-8-8', 'horse'].forEach(
    (testName) => {
      // eslint-disable-next-line jest/valid-title
      test(testName, () => {
        try {
          new MagicaVoxel(`${__dirname}/${testName}.vox`).renderTo(`${__dirname}/${testName}.tmp`);
          expect(readFileSync(`${__dirname}/${testName}.tmp`)).toEqual(
            readFileSync(`${__dirname}/${testName}.png`),
          );
        } finally {
          unlinkSync(`${__dirname}/${testName}.tmp`);
        }
      });
    },
  );
});
