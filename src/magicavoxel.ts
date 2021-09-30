import { readFileSync, writeFileSync } from 'fs';

import ColorLib from 'color';
import { PNG as PngLib } from 'pngjs';

type Voxel = {
  x: number;
  y: number;
  z: number;
  colorIndex: number;
};

type Triangle = {
  colorIndex: number;
  face: number;
};

type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type Pixels = { width: number; height: number; data: Uint8ClampedArray };

class Model {
  voxels: Voxel[] = [];
  private _triangles: Triangle[][][][] = [];

  constructor(public sizeX: number, public sizeY: number, public sizeZ: number) {}

  public get triangles(): Triangle[][][][] {
    if (this._triangles.length === 0) {
      const sizeU = this.sizeX + this.sizeY;
      const sizeV = sizeU + 2 * this.sizeZ - 1;

      const offsetV = sizeV - 3;
      const offsetW = this.sizeZ - 1;

      for (let side = 0; side < 4; side++) {
        const offsetU = side % 2 ? this.sizeX - 1 : this.sizeY - 1;

        const tris: Triangle[][][] = (this._triangles[side] = new Array(sizeU));
        for (let u = 0; u < sizeU; u++) {
          tris[u] = new Array(sizeV);
          for (let v = 0; v < sizeV; v++) {
            tris[u][v] = [];
          }
        }

        for (const voxel of this.voxels) {
          let vX, vY;

          if (side === 0) {
            vX = voxel.x;
            vY = voxel.y;
          } else if (side === 1) {
            vX = voxel.y;
            vY = this.sizeX - voxel.x - 1;
          } else if (side === 2) {
            vX = this.sizeX - voxel.x - 1;
            vY = this.sizeY - voxel.y - 1;
          } else {
            vX = this.sizeY - voxel.y - 1;
            vY = voxel.x;
          }

          const u = offsetU + vX - vY;
          const v = offsetV - vX - vY - 2 * voxel.z;
          const w = offsetW + vX + vY - voxel.z;

          const vData = {
            colorIndex: voxel.colorIndex,
          };

          tris[u][v][w] = tris[u + 1][v][w] = { ...vData, face: 0 };
          tris[u][v + 1][w] = tris[u][v + 2][w] = { ...vData, face: 2 };
          tris[u + 1][v + 1][w] = tris[u + 1][v + 2][w] = { ...vData, face: 1 };
        }
      }
    }
    return this._triangles;
  }
}

export class MagicaVoxel {
  models: Model[];
  palette: Color[];
  private _pixels: Pixels | null = null;

  static readonly defaultPalette = [
    0x00000000, 0xffffffff, 0xffccffff, 0xff99ffff, 0xff66ffff, 0xff33ffff, 0xff00ffff, 0xffffccff,
    0xffccccff, 0xff99ccff, 0xff66ccff, 0xff33ccff, 0xff00ccff, 0xffff99ff, 0xffcc99ff, 0xff9999ff,
    0xff6699ff, 0xff3399ff, 0xff0099ff, 0xffff66ff, 0xffcc66ff, 0xff9966ff, 0xff6666ff, 0xff3366ff,
    0xff0066ff, 0xffff33ff, 0xffcc33ff, 0xff9933ff, 0xff6633ff, 0xff3333ff, 0xff0033ff, 0xffff00ff,
    0xffcc00ff, 0xff9900ff, 0xff6600ff, 0xff3300ff, 0xff0000ff, 0xffffffcc, 0xffccffcc, 0xff99ffcc,
    0xff66ffcc, 0xff33ffcc, 0xff00ffcc, 0xffffcccc, 0xffcccccc, 0xff99cccc, 0xff66cccc, 0xff33cccc,
    0xff00cccc, 0xffff99cc, 0xffcc99cc, 0xff9999cc, 0xff6699cc, 0xff3399cc, 0xff0099cc, 0xffff66cc,
    0xffcc66cc, 0xff9966cc, 0xff6666cc, 0xff3366cc, 0xff0066cc, 0xffff33cc, 0xffcc33cc, 0xff9933cc,
    0xff6633cc, 0xff3333cc, 0xff0033cc, 0xffff00cc, 0xffcc00cc, 0xff9900cc, 0xff6600cc, 0xff3300cc,
    0xff0000cc, 0xffffff99, 0xffccff99, 0xff99ff99, 0xff66ff99, 0xff33ff99, 0xff00ff99, 0xffffcc99,
    0xffcccc99, 0xff99cc99, 0xff66cc99, 0xff33cc99, 0xff00cc99, 0xffff9999, 0xffcc9999, 0xff999999,
    0xff669999, 0xff339999, 0xff009999, 0xffff6699, 0xffcc6699, 0xff996699, 0xff666699, 0xff336699,
    0xff006699, 0xffff3399, 0xffcc3399, 0xff993399, 0xff663399, 0xff333399, 0xff003399, 0xffff0099,
    0xffcc0099, 0xff990099, 0xff660099, 0xff330099, 0xff000099, 0xffffff66, 0xffccff66, 0xff99ff66,
    0xff66ff66, 0xff33ff66, 0xff00ff66, 0xffffcc66, 0xffcccc66, 0xff99cc66, 0xff66cc66, 0xff33cc66,
    0xff00cc66, 0xffff9966, 0xffcc9966, 0xff999966, 0xff669966, 0xff339966, 0xff009966, 0xffff6666,
    0xffcc6666, 0xff996666, 0xff666666, 0xff336666, 0xff006666, 0xffff3366, 0xffcc3366, 0xff993366,
    0xff663366, 0xff333366, 0xff003366, 0xffff0066, 0xffcc0066, 0xff990066, 0xff660066, 0xff330066,
    0xff000066, 0xffffff33, 0xffccff33, 0xff99ff33, 0xff66ff33, 0xff33ff33, 0xff00ff33, 0xffffcc33,
    0xffcccc33, 0xff99cc33, 0xff66cc33, 0xff33cc33, 0xff00cc33, 0xffff9933, 0xffcc9933, 0xff999933,
    0xff669933, 0xff339933, 0xff009933, 0xffff6633, 0xffcc6633, 0xff996633, 0xff666633, 0xff336633,
    0xff006633, 0xffff3333, 0xffcc3333, 0xff993333, 0xff663333, 0xff333333, 0xff003333, 0xffff0033,
    0xffcc0033, 0xff990033, 0xff660033, 0xff330033, 0xff000033, 0xffffff00, 0xffccff00, 0xff99ff00,
    0xff66ff00, 0xff33ff00, 0xff00ff00, 0xffffcc00, 0xffcccc00, 0xff99cc00, 0xff66cc00, 0xff33cc00,
    0xff00cc00, 0xffff9900, 0xffcc9900, 0xff999900, 0xff669900, 0xff339900, 0xff009900, 0xffff6600,
    0xffcc6600, 0xff996600, 0xff666600, 0xff336600, 0xff006600, 0xffff3300, 0xffcc3300, 0xff993300,
    0xff663300, 0xff333300, 0xff003300, 0xffff0000, 0xffcc0000, 0xff990000, 0xff660000, 0xff330000,
    0xff0000ee, 0xff0000dd, 0xff0000bb, 0xff0000aa, 0xff000088, 0xff000077, 0xff000055, 0xff000044,
    0xff000022, 0xff000011, 0xff00ee00, 0xff00dd00, 0xff00bb00, 0xff00aa00, 0xff008800, 0xff007700,
    0xff005500, 0xff004400, 0xff002200, 0xff001100, 0xffee0000, 0xffdd0000, 0xffbb0000, 0xffaa0000,
    0xff880000, 0xff770000, 0xff550000, 0xff440000, 0xff220000, 0xff110000, 0xffeeeeee, 0xffdddddd,
    0xffbbbbbb, 0xffaaaaaa, 0xff888888, 0xff777777, 0xff555555, 0xff444444, 0xff222222, 0xff111111,
  ];

  constructor(public fileName: string) {
    this.fileName = fileName;

    let voxFileData: Buffer;

    try {
      voxFileData = readFileSync(this.fileName);
    } catch {
      throw new Error('Error reading file');
    }

    const voxHeader = voxFileData.toString('ascii', 0, 4);
    if (voxHeader !== 'VOX ') throw new Error('Not a MagicaVoxel file');

    const voxVersion = voxFileData.readUInt32LE(4);
    if (voxVersion !== 150) throw new Error('Unsupported MagicaVoxel version');

    let currentModel: Model;
    this.models = [];
    this.palette = [];

    const parseChunk = (offset = 8) => {
      const chunkId = voxFileData.toString('ascii', offset, offset + 4);
      const chunkContentLength = voxFileData.readUInt32LE(offset + 4);
      const chunkChildrenLength = voxFileData.readUInt32LE(offset + 8);

      if (chunkContentLength > 0) {
        if (chunkId === 'SIZE') {
          const sizeX = voxFileData.readUInt32LE(offset + 12);
          const sizeY = voxFileData.readUInt32LE(offset + 16);
          const sizeZ = voxFileData.readUInt32LE(offset + 20);
          currentModel = new Model(sizeX, sizeY, sizeZ);
          this.models.push(currentModel);
        } else if (chunkId === 'XYZI') {
          const numVoxels = voxFileData.readUInt32LE(offset + 12);
          for (let v = 0; v < numVoxels; v++) {
            const dataOffset = offset + 16 + v * 4;
            currentModel.voxels.push({
              x: voxFileData.readUInt8(dataOffset),
              y: voxFileData.readUInt8(dataOffset + 1),
              z: voxFileData.readUInt8(dataOffset + 2),
              colorIndex: voxFileData.readUInt8(dataOffset + 3),
            });
          }
        } else if (chunkId === 'RGBA') {
          for (let c = 0; c < 255; c++) {
            const dataOffset = offset + 12 + c * 4;
            this.palette[c + 1] = {
              r: voxFileData.readUInt8(dataOffset),
              g: voxFileData.readUInt8(dataOffset + 1),
              b: voxFileData.readUInt8(dataOffset + 2),
              a: voxFileData.readUInt8(dataOffset + 3),
            };
          }
        }
      }

      if (chunkChildrenLength > 0) {
        parseChunk(offset + 12 + chunkContentLength);
      }

      const newOffset = offset + 12 + chunkChildrenLength + chunkContentLength;
      if (newOffset < voxFileData.length) {
        parseChunk(newOffset);
      }
    };

    parseChunk();

    if (this.palette.length === 0) {
      this.palette = MagicaVoxel.defaultPalette.map((hexColor) => {
        return {
          r: hexColor & 0x000000ff,
          g: (hexColor & 0x0000ff00) >>> 8,
          b: (hexColor & 0x00ff0000) >>> 16,
          a: (hexColor & 0xff000000) >>> 24,
        };
      });
    }
  }

  public get pixels(): Pixels {
    if (this._pixels === null) {
      const frameCount = this.models.length;
      const maxModelWidth = Math.max(...this.models.map((m) => m.sizeX + m.sizeY));
      const maxModelHeight = Math.max(...this.models.map((m) => m.sizeX + m.sizeY + m.sizeZ * 2));

      const pixelsWidth = maxModelWidth * 2 * 4;
      const pixelsHeight = maxModelHeight * frameCount;

      this._pixels = {
        width: pixelsWidth,
        height: pixelsHeight,
        data: new Uint8ClampedArray(pixelsWidth * pixelsHeight * 4),
      };

      const putDoubleHeightPixel = (
        x: number,
        y: number,
        r: number,
        g: number,
        b: number,
        a: number,
      ) => {
        [(this.pixels.width * y + x) * 4, (this.pixels.width * (y + 1) + x) * 4].forEach((idx) => {
          this.pixels.data[idx] = r;
          this.pixels.data[idx + 1] = g;
          this.pixels.data[idx + 2] = b;
          this.pixels.data[idx + 3] = a;
        });
      };

      for (let frame = 0; frame < frameCount; frame++) {
        const model = this.models[frame];

        for (let side = 0; side < 4; side++) {
          const triangles = model.triangles[side];
          const sizeV = model.sizeX + model.sizeY + 2 * model.sizeZ - 1;

          let rightSide, leftSide;

          if (side % 2) {
            rightSide = model.sizeY;
            leftSide = model.sizeX;
          } else {
            rightSide = model.sizeX;
            leftSide = model.sizeY;
          }

          for (let u = 0; u < triangles.length; u++) {
            const startV = Math.max(rightSide - u - 1, u - rightSide);
            const endV = sizeV - Math.max(leftSide - u - 1, u - leftSide);

            for (let v = startV; v < endV; v++) {
              const ray = triangles[u][v].filter(Boolean);
              if (ray.length > 0) {
                const tri = ray[0];
                const triColor = this.palette[tri.colorIndex];

                const [pxR, pxG, pxB, pxA] = [
                  ...ColorLib.rgb(triColor.r, triColor.g, triColor.b)
                    .darken(tri.face / 3)
                    .rgb()
                    .array(),
                  triColor.a,
                ];

                const pxParity = rightSide % 2 ^ v % 2 ^ u % 2;
                const [pxX, pxY] = [
                  u * 2 + pxParity + maxModelWidth * 2 * side,
                  v + maxModelHeight * frame,
                ];

                putDoubleHeightPixel(pxX, pxY, pxR, pxG, pxB, pxA);
              }
            }
          }
        }
      }
    }
    return this._pixels;
  }

  renderTo(fileName: string): void {
    const pngData = new PngLib({
      width: this.pixels.width,
      height: this.pixels.height,
    });
    pngData.data = Buffer.from(this.pixels.data);
    writeFileSync(fileName, PngLib.sync.write(pngData));
  }
}
