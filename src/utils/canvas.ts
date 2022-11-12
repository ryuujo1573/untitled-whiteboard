///
/// This file contains caches on canvas and methods for generating shapes on canvas.
///

import getStroke from "perfect-freehand";
import { Point } from "roughjs/bin/geometry";
import { CommonElement, DefaultElementStyle, FreedrawElement } from "../models/types";
import { utils } from "../utils";

export let canvas: HTMLCanvasElement | null = null;
export type TranslatedCanvas = [canvas: HTMLCanvasElement, dx: number, dy: number, padding: number]

export const elementCanvasCaches = new WeakMap<CommonElement, TranslatedCanvas>();
export const pathCaches = new WeakMap<FreedrawElement, Path2D>();
// let lastPointerUp: ((event: any) => void) | null = null;

export function getRelativeCoords(ele: FreedrawElement): [number, number, number, number] {
  return ele.points.reduce(([x1, y1, x2, y2], [x, y]) => [
    Math.min(x1, x),
    Math.min(y1, y),
    Math.max(x2, x),
    Math.max(y2, y),
  ], [Infinity, Infinity, -Infinity, -Infinity]);
}

export function getAbsoluteCoords(ele: FreedrawElement): [...Point, ...Point] {
  const [xmin, ymin, xmax, ymax] = getRelativeCoords(ele);
  return [
    xmin + ele.x,
    ymin + ele.y,
    xmax + ele.x,
    ymax + ele.y,
  ];
}

export function generateCanvas(freedraw: FreedrawElement): TranslatedCanvas {
  let canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  //#region Get points ranges.

  // TODO: no need for those elements with w|h.
  // in that case, x1 = x x2 = x + width and y vice versa.
  const [x1, y1, x2, y2] = getAbsoluteCoords(freedraw);
  //#endregion

  //#region Initialize canvas.
  const { x, y } = freedraw;
  const d = (a: number, b: number) => Math.abs(a - b);

  // in preceding case, `d(x1, x2)` should be `width`.
  const padding = (freedraw.strokeWidth ?? DefaultElementStyle.strokeWidth) * 12;
  canvas.width = d(x1, x2) * 1.0 + padding * 2;
  canvas.height = d(y1, y2) * 1.0 + padding * 2;

  utils.log(`🏞️ image: ${freedraw.id}, pmin(${[x1, y1]}) pmax(${[x2, y2]}), ${[canvas.width, canvas.height]}`);

  // offset from the most upperleft point to element [x,y]
  const offsetX = x > x1 ? d(x, x1) * 1.0 + padding : 0;
  const offsetY = y > y1 ? d(y, y1) * 1.0 + padding : 0;

  ctx.translate(
    offsetX,
    offsetY);
  utils.log(`🏞️ image: ${freedraw.id}, translate (${offsetX}, ${offsetY}).`);

  ctx.save(); // why?
  // ctx.scale(devicePixelRatio * 1.0, devicePixelRatio * 1.0)

  ctx.globalAlpha = freedraw.opacity ?? DefaultElementStyle.opacity;

  ctx.save();
  ctx.fillStyle = freedraw.strokeColor ?? 'black';
  //#endregion


  //#region Generate freedraw path from points.
  const pointsEx = freedraw.pressures !== undefined
    ? freedraw.points.map(([x, y], i) => [x, y, freedraw.pressures![i]])
    : freedraw.points as readonly number[][] as number[][];

  // get stroke by 'perfect-freehand'
  const points = getStroke(pointsEx, {
    simulatePressure: freedraw.pressures === undefined,
    size: (freedraw.strokeWidth ?? DefaultElementStyle.strokeWidth) * 4.25,
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t) => Math.sin((t * Math.PI) / 2), // https://easings.net/#easeOutSine
    last: !!freedraw.last, // LastCommittedPoint is added on pointerup
  });

  const TO_FIXED_PRECISION = /(\s?[A-Z]?,?-?[0-9]*\.[0-9]{0,2})(([0-9]|e|-)*)/g;
  const med = (A: number[], B: number[]): number[] =>
    [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];

  // generate SVG path data string.
  const path = new Path2D(points
    .reduce(
      (acc, point, i, arr) => {
        if (i === points.length - 1) {
          acc.push(point, med(point, arr[0]), "L", arr[0], "Z");
        } else {
          acc.push(point, med(point, arr[i + 1]));
        }
        return acc;
      },
      ["M", points[0], "Q"],
    )
    .join(" ")
    .replace(TO_FIXED_PRECISION, "$1"));

  pathCaches.set(freedraw, path);

  ctx.restore();
  //#endregion

  //#region Draw element on canvas.

  // TODO: implement scale for element
  ctx.save();

  ctx.fillStyle = 'rgb(0,0,0,.8)';
  ctx.fill(path);
  ctx.restore();

  //#endregion

  utils.log('🏞️ image: fill path.');

  return [canvas, offsetX, offsetY, padding];
}