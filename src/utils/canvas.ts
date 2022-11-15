///
/// This file contains caches on canvas and methods for generating shapes on canvas.
///

import getStroke from "perfect-freehand";
import { Point } from "roughjs/bin/geometry";
import { MimeTypes } from "../consts/constants";
import { BinaryFiles, AnyElement, DefaultElementStyle, FileId, FreedrawElement, ImageCache, ImageElement } from "../models/types";
import { utils } from "../utils";

export let canvas: HTMLCanvasElement | null = null;
export type TranslatedCanvas = [canvas: HTMLCanvasElement, dx: number, dy: number, padding: number]

export const elementCanvasCaches = new WeakMap<AnyElement, TranslatedCanvas>();
export const pathCaches = new WeakMap<FreedrawElement, Path2D>();
// let lastPointerUp: ((event: any) => void) | null = null;
export const files: BinaryFiles = {}
// string 无法作为 WeakMap 的键
export const imageCaches = new Map<FileId, ImageCache>()

// TODO test 数据
files['fuck-you'] = {
  mimeType: MimeTypes.svg,
  dataURL: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjY4MzE3NTQ5Njk2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI1NjciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTgzNy43ODU2IDkxOC4zMjMySDI0OS42Yy02My4zODU2IDAtMTE0Ljc5MDQtNTEuNDA0OC0xMTQuNzkwNC0xMTQuNzkwNFYzMjQuOTE1MmMwLTYzLjM4NTYgNTEuNDA0OC0xMTQuNzkwNCAxMTQuNzkwNC0xMTQuNzkwNGg1ODguMTg1NmM2My4zODU2IDAgMTE0Ljc5MDQgNTEuNDA0OCAxMTQuNzkwNCAxMTQuNzkwNHY0NzguNjY4OGMwIDYzLjM4NTYtNTEuNDA0OCAxMTQuNzM5Mi0xMTQuNzkwNCAxMTQuNzM5MnoiIGZpbGw9IiNGRjdEN0IiIHAtaWQ9IjI1NjgiPjwvcGF0aD48cGF0aCBkPSJNOTUyLjgzMiA3ODAuMzM5MlYzMjMuMDIwOGMwLTcxLjA2NTYtNTcuMTkwNC0xMTYuNDgtMTExLjk3NDQtMTEyLjc0MjQgMTQuNjQzMiAxNy44MTc2IDMwLjM2MTYgNTEuNTU4NCAzMC4zNjE2IDExNC41ODU2djQ4My4yMjU2YzAgMjEuMzUwNC0zLjczNzYgNzAuMTk1Mi00MC44MDY0IDEwOS41NjggNjcuODkxMi0xLjQ4NDggMTIyLjQxOTItNjIuMzYxNiAxMjIuNDE5Mi0xMzcuMzE4NHoiIGZpbGw9IiNGNzUyNTIiIHAtaWQ9IjI1NjkiPjwvcGF0aD48cGF0aCBkPSJNNjUuOTk2OCA0NjcuNTA3MmMtOC40OTkyIDAtMTUuMzYtNi44NjA4LTE1LjM2LTE1LjM2di0xNy4zNTY4YzAtOC40OTkyIDYuODYwOC0xNS4zNiAxNS4zNi0xNS4zNnMxNS4zNiA2Ljg2MDggMTUuMzYgMTUuMzZ2MTcuMzU2OGMwIDguNDQ4LTYuODYwOCAxNS4zNi0xNS4zNiAxNS4zNnoiIGZpbGw9IiMzMzMzMzMiIHAtaWQ9IjI1NzAiPjwvcGF0aD48cGF0aCBkPSJNODE1LjE1NTIgOTMzLjY4MzJIMjAzLjQxNzZjLTg0LjIyNCAwLTE1Mi43Mjk2LTY4LjUwNTYtMTUyLjcyOTYtMTUyLjcyOTZWNTIwLjcwNGMwLTguNDk5MiA2Ljg2MDgtMTUuMzYgMTUuMzYtMTUuMzZzMTUuMzYgNi44NjA4IDE1LjM2IDE1LjM2djI2MC4xOTg0YzAgNjcuMjc2OCA1NC43MzI4IDEyMi4wMDk2IDEyMi4wMDk2IDEyMi4wMDk2aDYxMS43Mzc2YzY3LjI3NjggMCAxMjIuMDA5Ni01NC43MzI4IDEyMi4wMDk2LTEyMi4wMDk2VjI4Ny44OTc2YzAtNjcuMjc2OC01NC43MzI4LTEyMi4wMDk2LTEyMi4wMDk2LTEyMi4wMDk2SDIwMy40MTc2Yy02Ny4yNzY4IDAtMTIyLjAwOTYgNTQuNzMyOC0xMjIuMDA5NiAxMjIuMDA5NnY1MS4xNDg4YzAgOC40OTkyLTYuODYwOCAxNS4zNi0xNS4zNiAxNS4zNnMtMTUuMzYtNi44NjA4LTE1LjM2LTE1LjM2di01MS4xNDg4YzAtODQuMjI0IDY4LjUwNTYtMTUyLjcyOTYgMTUyLjcyOTYtMTUyLjcyOTZoNjExLjczNzZjODQuMjI0IDAgMTUyLjcyOTYgNjguNTA1NiAxNTIuNzI5NiAxNTIuNzI5NnY0OTMuMDA0OGMwLjA1MTIgODQuMjc1Mi02OC41MDU2IDE1Mi43ODA4LTE1Mi43Mjk2IDE1Mi43ODA4eiIgZmlsbD0iIzMzMzMzMyIgcC1pZD0iMjU3MSI+PC9wYXRoPjxwYXRoIGQ9Ik0zNDkuODQ5NiAyODguNDYwOGEzMi43NjggMzIuNzY4IDAgMCAxLTMyLjc2OC0zMi43NjhWMTE2Ljk5MmEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OC0zMi43NjggMzIuNzY4IDMyLjc2OCAwIDAgMSAzMi43NjggMzIuNzY4djEzOC43MDA4YzAgMTguMTI0OC0xNC42NDMyIDMyLjc2OC0zMi43NjggMzIuNzY4ek02NjguNzIzMiAyODguNDYwOGEzMi43NjggMzIuNzY4IDAgMCAxLTMyLjc2OC0zMi43NjhWMTE2Ljk5MmEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OC0zMi43NjggMzIuNzY4IDMyLjc2OCAwIDAgMSAzMi43NjggMzIuNzY4djEzOC43MDA4YzAuMDUxMiAxOC4xMjQ4LTE0LjY0MzIgMzIuNzY4LTMyLjc2OCAzMi43Njh6IiBmaWxsPSIjNzZCRkZGIiBwLWlkPSIyNTcyIj48L3BhdGg+PHBhdGggZD0iTTM0OS44NDk2IDMwMy44MjA4Yy0yNi41NzI4IDAtNDguMTI4LTIxLjYwNjQtNDguMTI4LTQ4LjE3OTJWMTE2Ljk5MmMwLTI2LjU3MjggMjEuNjA2NC00OC4xNzkyIDQ4LjEyOC00OC4xNzkyIDI2LjU3MjggMCA0OC4xNzkyIDIxLjYwNjQgNDguMTc5MiA0OC4xNzkydjEzOC43MDA4Yy0wLjA1MTIgMjYuNTIxNi0yMS42MDY0IDQ4LjEyOC00OC4xNzkyIDQ4LjEyOHogbTAtMjA0LjI4OGMtOS42MjU2IDAtMTcuNDA4IDcuODMzNi0xNy40MDggMTcuNDU5MnYxMzguNzAwOGMwIDkuNjI1NiA3LjgzMzYgMTcuNDU5MiAxNy40MDggMTcuNDU5MiA5LjYyNTYgMCAxNy40NTkyLTcuODMzNiAxNy40NTkyLTE3LjQ1OTJWMTE2Ljk5MmMtMC4wNTEyLTkuNjI1Ni03LjgzMzYtMTcuNDU5Mi0xNy40NTkyLTE3LjQ1OTJ6IiBmaWxsPSIjMzMzMzMzIiBwLWlkPSIyNTczIj48L3BhdGg+PHBhdGggZD0iTTI1MS40OTQ0IDU1MS42OGEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OC0zMi43NjhoNjQuODE5MmEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OCAzMi43NjggMzIuNzY4IDMyLjc2OCAwIDAgMS0zMi43NjggMzIuNzY4SDI4NC4yNjI0Yy0xOC4xMjQ4IDAtMzIuNzY4LTE0LjY0MzItMzIuNzY4LTMyLjc2OHpNMjUxLjQ5NDQgNjkzLjQwMTZhMzIuNzY4IDMyLjc2OCAwIDAgMSAzMi43NjgtMzIuNzY4aDY0LjgxOTJhMzIuNzY4IDMyLjc2OCAwIDAgMSAzMi43NjggMzIuNzY4IDMyLjc2OCAzMi43NjggMCAwIDEtMzIuNzY4IDMyLjc2OEgyODQuMjYyNGMtMTguMTI0OCAwLTMyLjc2OC0xNC42NDMyLTMyLjc2OC0zMi43Njh6TTQ0MS43MDI0IDU1MS42OGEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OC0zMi43NjhoNjQuODE5MmEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OCAzMi43NjggMzIuNzY4IDMyLjc2OCAwIDAgMS0zMi43NjggMzIuNzY4SDQ3NC41MjE2Yy0xOC4xMjQ4IDAtMzIuODE5Mi0xNC42NDMyLTMyLjgxOTItMzIuNzY4ek00NDEuNzAyNCA2OTMuNDAxNmEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OC0zMi43NjhoNjQuODE5MmEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OCAzMi43NjggMzIuNzY4IDMyLjc2OCAwIDAgMS0zMi43NjggMzIuNzY4SDQ3NC41MjE2Yy0xOC4xMjQ4IDAtMzIuODE5Mi0xNC42NDMyLTMyLjgxOTItMzIuNzY4ek02MzIuODMyIDU1MS42OGEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OC0zMi43NjhoNjQuODE5MmEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OCAzMi43NjggMzIuNzY4IDMyLjc2OCAwIDAgMS0zMi43NjggMzIuNzY4SDY2NS42YTMyLjc2OCAzMi43NjggMCAwIDEtMzIuNzY4LTMyLjc2OHpNNjMyLjgzMiA2OTMuNDAxNmEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OC0zMi43NjhoNjQuODE5MmEzMi43NjggMzIuNzY4IDAgMCAxIDMyLjc2OCAzMi43NjggMzIuNzY4IDMyLjc2OCAwIDAgMS0zMi43NjggMzIuNzY4SDY2NS42YTMyLjc2OCAzMi43NjggMCAwIDEtMzIuNzY4LTMyLjc2OHoiIGZpbGw9IiNFQ0QzMDAiIHAtaWQ9IjI1NzQiPjwvcGF0aD48cGF0aCBkPSJNMzQ5LjA4MTYgNTk5LjgwOEgyODQuMjYyNGMtMjYuNTcyOCAwLTQ4LjEyOC0yMS42MDY0LTQ4LjEyOC00OC4xNzkyczIxLjYwNjQtNDguMTI4IDQ4LjEyOC00OC4xMjhoNjQuODE5MmMyNi41NzI4IDAgNDguMTI4IDIxLjYwNjQgNDguMTI4IDQ4LjEyOCAwLjA1MTIgMjYuNTcyOC0yMS41NTUyIDQ4LjE3OTItNDguMTI4IDQ4LjE3OTJ6IG0tNjQuODE5Mi02NS41ODcyYy05LjYyNTYgMC0xNy40MDggNy44MzM2LTE3LjQwOCAxNy40MDggMCA5LjYyNTYgNy44MzM2IDE3LjQ1OTIgMTcuNDA4IDE3LjQ1OTJoNjQuODE5MmExNy40Mzg3MiAxNy40Mzg3MiAwIDAgMCAwLTM0Ljg2NzJIMjg0LjI2MjR6TTM0OS4wODE2IDc0Mi45NjMySDI4NC4yNjI0Yy0yNi41NzI4IDAtNDguMTI4LTIxLjYwNjQtNDguMTI4LTQ4LjE3OTJzMjEuNjA2NC00OC4xMjggNDguMTI4LTQ4LjEyOGg2NC44MTkyYzI2LjU3MjggMCA0OC4xMjggMjEuNjA2NCA0OC4xMjggNDguMTI4IDAuMDUxMiAyNi41NzI4LTIxLjU1NTIgNDguMTc5Mi00OC4xMjggNDguMTc5MnpNMjg0LjI2MjQgNjc3LjM3NmMtOS42MjU2IDAtMTcuNDA4IDcuODMzNi0xNy40MDggMTcuNDA4IDAgOS42MjU2IDcuODMzNiAxNy40NTkyIDE3LjQwOCAxNy40NTkyaDY0LjgxOTJhMTcuNDM4NzIgMTcuNDM4NzIgMCAwIDAgMC0zNC44NjcySDI4NC4yNjI0ek01NDEuMzM3NiA1OTkuODA4SDQ3Ni41MTg0Yy0yNi41NzI4IDAtNDguMTI4LTIxLjYwNjQtNDguMTI4LTQ4LjE3OTJzMjEuNjA2NC00OC4xMjggNDguMTI4LTQ4LjEyOGg2NC44MTkyYzI2LjU3MjggMCA0OC4xMjggMjEuNjA2NCA0OC4xMjggNDguMTI4IDAgMjYuNTcyOC0yMS42MDY0IDQ4LjE3OTItNDguMTI4IDQ4LjE3OTJ6IG0tNjQuODE5Mi02NS41ODcyYy05LjYyNTYgMC0xNy40MDggNy44MzM2LTE3LjQwOCAxNy40MDggMCA5LjYyNTYgNy44MzM2IDE3LjQ1OTIgMTcuNDA4IDE3LjQ1OTJoNjQuODE5MmExNy40Mzg3MiAxNy40Mzg3MiAwIDAgMCAwLTM0Ljg2NzJINDc2LjUxODR6TTU0MS4zMzc2IDc0Mi45NjMySDQ3Ni41MTg0Yy0yNi41NzI4IDAtNDguMTI4LTIxLjYwNjQtNDguMTI4LTQ4LjE3OTJzMjEuNjA2NC00OC4xMjggNDguMTI4LTQ4LjEyOGg2NC44MTkyYzI2LjU3MjggMCA0OC4xMjggMjEuNjA2NCA0OC4xMjggNDguMTI4IDAgMjYuNTcyOC0yMS42MDY0IDQ4LjE3OTItNDguMTI4IDQ4LjE3OTJ6TTQ3Ni41MTg0IDY3Ny4zNzZjLTkuNjI1NiAwLTE3LjQwOCA3LjgzMzYtMTcuNDA4IDE3LjQwOCAwIDkuNjI1NiA3LjgzMzYgMTcuNDU5MiAxNy40MDggMTcuNDU5Mmg2NC44MTkyYTE3LjQzODcyIDE3LjQzODcyIDAgMCAwIDAtMzQuODY3Mkg0NzYuNTE4NHpNNzMxLjY5OTIgNTk5LjgwOGgtNjQuODE5MmMtMjYuNTcyOCAwLTQ4LjEyOC0yMS42MDY0LTQ4LjEyOC00OC4xNzkyczIxLjYwNjQtNDguMTI4IDQ4LjEyOC00OC4xMjhoNjQuODE5MmMyNi41NzI4IDAgNDguMTc5MiAyMS42MDY0IDQ4LjE3OTIgNDguMTI4LTAuMDUxMiAyNi41NzI4LTIxLjY1NzYgNDguMTc5Mi00OC4xNzkyIDQ4LjE3OTJ6IG0tNjQuODcwNC02NS41ODcyYy05LjYyNTYgMC0xNy40MDggNy44MzM2LTE3LjQwOCAxNy40MDggMCA5LjYyNTYgNy44MzM2IDE3LjQ1OTIgMTcuNDA4IDE3LjQ1OTJoNjQuODE5MmM5LjYyNTYgMCAxNy40NTkyLTcuODMzNiAxNy40NTkyLTE3LjQ1OTIgMC05LjYyNTYtNy44MzM2LTE3LjQwOC0xNy40NTkyLTE3LjQwOGgtNjQuODE5MnpNNzMxLjY5OTIgNzQyLjk2MzJoLTY0LjgxOTJjLTI2LjU3MjggMC00OC4xMjgtMjEuNjA2NC00OC4xMjgtNDguMTc5MnMyMS42MDY0LTQ4LjEyOCA0OC4xMjgtNDguMTI4aDY0LjgxOTJjMjYuNTcyOCAwIDQ4LjE3OTIgMjEuNjA2NCA0OC4xNzkyIDQ4LjEyOC0wLjA1MTIgMjYuNTcyOC0yMS42NTc2IDQ4LjE3OTItNDguMTc5MiA0OC4xNzkyeiBtLTY0Ljg3MDQtNjUuNTg3MmMtOS42MjU2IDAtMTcuNDA4IDcuODMzNi0xNy40MDggMTcuNDA4IDAgOS42MjU2IDcuODMzNiAxNy40NTkyIDE3LjQwOCAxNy40NTkyaDY0LjgxOTJjOS42MjU2IDAgMTcuNDU5Mi03LjgzMzYgMTcuNDU5Mi0xNy40NTkyIDAtOS42MjU2LTcuODMzNi0xNy40MDgtMTcuNDU5Mi0xNy40MDhoLTY0LjgxOTJ6TTY2NS43MDI0IDMwMy44MjA4Yy0yNi41NzI4IDAtNDguMTI4LTIxLjYwNjQtNDguMTI4LTQ4LjE3OTJWMTE2Ljk5MmMwLTI2LjU3MjggMjEuNjA2NC00OC4xNzkyIDQ4LjEyOC00OC4xNzkyIDI2LjU3MjggMCA0OC4xNzkyIDIxLjYwNjQgNDguMTc5MiA0OC4xNzkydjEzOC43MDA4YzAgMjYuNTIxNi0yMS42MDY0IDQ4LjEyOC00OC4xNzkyIDQ4LjEyOHogbTAtMjA0LjI4OGMtOS42MjU2IDAtMTcuNDA4IDcuODMzNi0xNy40MDggMTcuNDU5MnYxMzguNzAwOGMwIDkuNjI1NiA3LjgzMzYgMTcuNDU5MiAxNy40MDggMTcuNDU5MiA5LjYyNTYgMCAxNy40NTkyLTcuODMzNiAxNy40NTkyLTE3LjQ1OTJWMTE2Ljk5MmMwLTkuNjI1Ni03LjgzMzYtMTcuNDU5Mi0xNy40NTkyLTE3LjQ1OTJ6TTg2MS4wMzA0IDM3Mi45NDA4SDE2Mi4yMDE2Yy04LjQ5OTIgMC0xNS4zNi02Ljg2MDgtMTUuMzYtMTUuMzZzNi44NjA4LTE1LjM2IDE1LjM2LTE1LjM2aDY5OC44Mjg4YzguNDk5MiAwIDE1LjM2IDYuODYwOCAxNS4zNiAxNS4zNnMtNi44NjA4IDE1LjM2LTE1LjM2IDE1LjM2eiIgZmlsbD0iIzMzMzMzMyIgcC1pZD0iMjU3NSI+PC9wYXRoPjxwYXRoIGQ9Ik0xOTEuNTkwNCA1NDQuMTAyNGExMi44IDEyLjggMCAwIDEtMTIuOC0xMi44di03NS43NzZjMC0yMC40Mjg4IDE2LjY0LTM3LjA2ODggMzcuMDY4OC0zNy4wNjg4aDQxLjc3OTJhMTIuOCAxMi44IDAgMCAxIDAgMjUuNmgtNDEuNzc5MmMtNi4yOTc2IDAtMTEuNDY4OCA1LjEyLTExLjQ2ODggMTEuNDY4OHY3NS43MjQ4YzAgNy4xMTY4LTUuNzM0NCAxMi44NTEyLTEyLjggMTIuODUxMnpNMTkxLjU5MDQgNjAzLjEzNmExMi44IDEyLjggMCAwIDEtMTIuOC0xMi44di0xNS45MjMyYTEyLjggMTIuOCAwIDAgMSAyNS42IDB2MTUuOTIzMmExMi44IDEyLjggMCAwIDEtMTIuOCAxMi44eiIgZmlsbD0iI0ZGRkZGRiIgcC1pZD0iMjU3NiI+PC9wYXRoPjwvc3ZnPg==',
  id: 'fuck-you',
  createdDate: Date.now()
}

export function getRelativeCoords(ele: FreedrawElement): [number, number, number, number] {
  return ele.points.reduce(([x1, y1, x2, y2], [x, y]) => [
    Math.min(x1, x),
    Math.min(y1, y),
    Math.max(x2, x),
    Math.max(y2, y),
  ], [Infinity, Infinity, -Infinity, -Infinity]);
}

export function getAbsoluteCoords(ele: AnyElement): [...Point, ...Point] {
  switch (ele.type) {
    case 'freedraw':
      const [xmin, ymin, xmax, ymax] = getRelativeCoords(ele as FreedrawElement);
      return [
        xmin + ele.x,
        ymin + ele.y,
        xmax + ele.x,
        ymax + ele.y,
      ];
    case 'image': {
      const imageElement = ele as ImageElement
      return [
        imageElement.x,
        imageElement.y,
        imageElement.x + imageElement.width!,
        imageElement.y + imageElement.height!,
      ]
    }
    default:
      return [0, 0, 0, 0]
  }

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
  canvas.width = d(x1, x2) + padding * 2;
  canvas.height = d(y1, y2) + padding * 2;

  utils.log(`🏞️ image: ${freedraw.id}, pmin(${[x1, y1]}) pmax(${[x2, y2]}), ${[canvas.width, canvas.height]}`);

  // offset from the most upperleft point to element [x,y]
  const offsetX = x > x1 ? d(x, x1) + padding : 0;
  const offsetY = y > y1 ? d(y, y1) + padding : 0;

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

export const generateImageCanvas = ({ id, fileId, x, y, width, height }: ImageElement): TranslatedCanvas => {
  const canvas = document.createElement('canvas')
  canvas.width = width!
  canvas.height = height!
  const ctx = canvas.getContext('2d')!

  const oldCache = imageCaches.get(fileId!)
  if (!oldCache) {
    const newCache: ImageCache = { image: new Image(), mimeType: files[fileId!].mimeType }
    newCache.image.src = files[fileId!].dataURL
    imageCaches.set(fileId!, newCache)
  }

  const { image: img } = oldCache ?? imageCaches.get(fileId!)!

  ctx.drawImage(img, 0, 0, width!, height!)
  // TODO padding?
  return [canvas, x, y, 12]

}