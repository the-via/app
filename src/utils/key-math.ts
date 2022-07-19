import type {VIAKey} from 'via-reader';

function applyRotation(
  x: number,
  y: number,
  xOrigin: number,
  yOrigin: number,
  rotation: number,
) {
  const rad = (rotation * Math.PI) / 180;
  const [normX, normY] = [x - xOrigin, y - yOrigin];
  return {
    x: xOrigin + normX * Math.cos(rad) - normY * Math.sin(rad),
    y: yOrigin + normX * Math.sin(rad) + normY * Math.cos(rad),
  };
}

export function getBoundingBox(key: VIAKey) {
  const {x2 = 0, y2 = 0, x, y, w = 1, h = 1, r = 0, rx = 0, ry = 0} = key;
  const {h2 = h, w2 = w} = key;
  const extraArgs: [number, number, number] = [rx, ry, r];
  const box = {
    xStart: Math.min(x, x + x2),
    yStart: Math.min(y, y + y2),
    xEnd: Math.max(x + w, x + x2 + w2),
    yEnd: Math.max(y + h, y + y2 + h2),
  };

  const rotatedPoints = [
    {x: box.xStart, y: box.yStart},
    {x: box.xEnd, y: box.yStart},
    {x: box.xStart, y: box.yEnd},
    {x: box.xEnd, y: box.yEnd},
  ].map((p) => applyRotation(p.x, p.y, ...extraArgs));
  return {
    xStart: Math.min(...rotatedPoints.map((p) => p.x)),
    xEnd: Math.max(...rotatedPoints.map((p) => p.x)),
    yStart: Math.min(...rotatedPoints.map((p) => p.y)),
    yEnd: Math.max(...rotatedPoints.map((p) => p.y)),
  };
}
