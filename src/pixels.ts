import { hsluvToRgb, rgbToHsluv } from 'hsluv';
import { Triangles } from './triangles';

// https://developer.mozilla.org/en-US/docs/Web/API/ImageData
export type ImageData = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export function preparePixels(triangles: Triangles): ImageData {
  const model = triangles.model;

  const pixelWidth = model.sizeU * 2;
  const pixelHeight = model.sizeV;

  const pixels: ImageData = {
    width: pixelWidth,
    height: pixelHeight,
    data: new Uint8ClampedArray(pixelWidth * pixelHeight * 4),
  };

  const putDoubleHeightPixel = (
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ) => {
    [(pixels.width * y + x) * 4, (pixels.width * (y + 1) + x) * 4].forEach((idx) => {
      pixels.data[idx] = r;
      pixels.data[idx + 1] = g;
      pixels.data[idx + 2] = b;
      pixels.data[idx + 3] = a;
    });
  };

  let rightSide, leftSide;

  if (triangles.side % 2) {
    rightSide = model.sizeY;
    leftSide = model.sizeX;
  } else {
    rightSide = model.sizeX;
    leftSide = model.sizeY;
  }

  for (let u = 0; u < triangles.data.length; u++) {
    const startV = Math.max(rightSide - u - 1, u - rightSide);
    const endV = model.sizeV - Math.max(leftSide - u - 1, u - leftSide) - 1;

    for (let v = startV; v < endV; v++) {
      const ray = triangles.data[u][v].filter(Boolean);
      if (ray.length > 0) {
        const triangle = ray[0];
        const triangleColor = model.palette[triangle.colorIndex];

        const colorHsluv = rgbToHsluv([
          triangleColor.r / 256,
          triangleColor.g / 256,
          triangleColor.b / 256,
        ]);

        colorHsluv[2] *= 1 - triangle.face / 3;

        const [pxR, pxG, pxB, pxA] = [
          ...hsluvToRgb(colorHsluv).map((x) => Math.round(x * 256)),
          triangleColor.a,
        ];

        const pxToggle = rightSide % 2 ^ v % 2 ^ u % 2;
        putDoubleHeightPixel(u * 2 + pxToggle, v, pxR, pxG, pxB, pxA);
      }
    }
  }

  return pixels;
}
