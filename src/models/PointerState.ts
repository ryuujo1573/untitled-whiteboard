import { Point } from "roughjs/bin/geometry";
import { throttleByAnimationFrame } from "../utils";
import { AnyElement } from "./types";
import React from "react";


// TODO: support actions of scroll, drag, resize.
export type PointerState = {
  // The first position at which pointerDown happened
  readonly origin: Point,
  lastPoint: Point,
  // map of original elements data
  // originalElements: Map<string, AnyElement>,
  // hit when clicked down.
  hit: {
    element: AnyElement | null,
    // all: AnyElement[],
  },
  metaKey: boolean,
  shiftKey: boolean,
  // used only once, defined inside the initial pointerDown event
  listeners: {
    onPointerMove?: ReturnType<typeof throttleByAnimationFrame>,
    onPointerUp?: ((event: PointerEvent) => void),
    onKeyDown?: ((event: KeyboardEvent) => void),
    onKeyUp?: ((event: KeyboardEvent) => void),
  },
}

export function createPointerState({ clientX, clientY, metaKey, shiftKey }: React.PointerEvent<HTMLCanvasElement>): PointerState {
  const origin: Point = [clientX, clientY]

  return {
    origin,
    metaKey,
    shiftKey,
    lastPoint: [...origin] as Point,
    // save copies of original elements into a Map
    hit: { element: null },
    listeners: {}
  }
}