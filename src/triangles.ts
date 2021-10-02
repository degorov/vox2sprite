import { Model } from './magicavoxel';

export type Triangles = {
  model: Model;
  side: number;
  data: Triangle[][][];
};

type Triangle = {
  face: Face;
  colorIndex: number;
};

enum Face {
  Top = 0,
  Right,
  Left,
}

export function prepareTriangles(model: Model, side: number): Triangles {
  const offsetU = side % 2 ? model.sizeX - 1 : model.sizeY - 1;
  const offsetV = model.sizeV - 4;
  const offsetW = model.sizeZ - 1;

  const triangles: Triangle[][][] = new Array(model.sizeU);
  for (let u = 0; u < model.sizeU; u++) {
    triangles[u] = new Array(model.sizeV - 1);
    for (let v = 0; v < model.sizeV - 1; v++) {
      triangles[u][v] = [];
    }
  }

  for (const voxel of model.voxels) {
    let vX, vY;

    if (side === 0) {
      vX = voxel.x;
      vY = voxel.y;
    } else if (side === 1) {
      vX = voxel.y;
      vY = model.sizeX - voxel.x - 1;
    } else if (side === 2) {
      vX = model.sizeX - voxel.x - 1;
      vY = model.sizeY - voxel.y - 1;
    } else {
      vX = model.sizeY - voxel.y - 1;
      vY = voxel.x;
    }

    const u = offsetU + vX - vY;
    const v = offsetV - vX - vY - 2 * voxel.z;
    const w = offsetW + vX + vY - voxel.z;

    triangles[u][v][w] = triangles[u + 1][v][w] = {
      colorIndex: voxel.colorIndex,
      face: Face.Top,
    };

    triangles[u][v + 1][w] = triangles[u][v + 2][w] = {
      colorIndex: voxel.colorIndex,
      face: Face.Left,
    };

    triangles[u + 1][v + 1][w] = triangles[u + 1][v + 2][w] = {
      colorIndex: voxel.colorIndex,
      face: Face.Right,
    };
  }

  return {
    model,
    side,
    data: triangles,
  };
}
