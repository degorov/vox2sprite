import { writeFileSync } from 'fs';
import { PNG as PngLib } from 'pngjs';

import { Model } from './magicavoxel';
import { prepareTriangles } from './triangles';
import { ImageData, preparePixels } from './pixels';

type SpriteSheet = {
  pixels: ImageData;
  frameCount: number;
};

export function renderChunk(spriteSheetPixels: ImageData, model: Model, side: number): void {
  const chunkPixels = preparePixels(prepareTriangles(model, side));

  for (let pos = 0, line = 0; pos < chunkPixels.data.length; pos += chunkPixels.width * 4, line++) {
    spriteSheetPixels.data.set(
      chunkPixels.data.subarray(pos, pos + chunkPixels.width * 4),
      side * spriteSheetPixels.width +
        line * spriteSheetPixels.width * 4 +
        model.frame * spriteSheetPixels.width * spriteSheetPixels.height,
    );
  }
}

export function createSpriteSheet(models: Model[]): SpriteSheet {
  const spriteSheetWidth = 8 * Math.max(...models.map((m) => m.sizeU));
  const spriteSheetHeight = models.length * Math.max(...models.map((m) => m.sizeV));

  const spriteSheet: SpriteSheet = {
    pixels: {
      width: spriteSheetWidth,
      height: spriteSheetHeight,
      data: new Uint8ClampedArray(spriteSheetWidth * spriteSheetHeight * 4),
    },
    frameCount: models.length,
  };

  models.forEach((model) => {
    for (let side = 0; side < 4; side++) {
      renderChunk(spriteSheet.pixels, model, side);
    }
  });

  return spriteSheet;
}

export function writePngFile(pixels: ImageData, pngFileName: string): void {
  const pngData = new PngLib({
    width: pixels.width,
    height: pixels.height,
  });
  pngData.data = Buffer.from(pixels.data);

  try {
    writeFileSync(pngFileName, PngLib.sync.write(pngData));
  } catch {
    throw new Error('Error writing file');
  }
}
