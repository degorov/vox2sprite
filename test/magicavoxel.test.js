/* eslint-disable @typescript-eslint/no-var-requires */
const { readFileSync, unlinkSync } = require('fs');
const vox2sprite = require('../bin/vox2sprite').default;

describe('End-to-end testing', () => {
  ['7-7-7', '7-7-8', '7-8-7', '7-8-8', '8-7-7', '8-7-8', '8-8-7', '8-8-8', 'horse'].forEach(
    (testName) => {
      // eslint-disable-next-line jest/valid-title
      test(testName, () => {
        const voxFileName = `${__dirname}/${testName}.vox`;
        const tmpFileName = `${__dirname}/${testName}.tmp`;
        const pngFileName = `${__dirname}/${testName}.png`;
        try {
          vox2sprite(voxFileName, tmpFileName);
          expect(readFileSync(tmpFileName)).toEqual(readFileSync(pngFileName));
        } finally {
          unlinkSync(tmpFileName);
        }
      });
    },
  );
});
