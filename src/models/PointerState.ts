import { waitForRequestAnimationFrame } from "../canvasHelper";
import { CommonElement, Point } from "./Elements";


// TODO: support actions of scroll, drag, resize.
export type PointerState = {
  // The first position at which pointerDown happened
  readonly origin: Point,
  lastPoint: Point,
  // map of original elements data
  // originalElements: Map<string, CommonElement>,
  // hit when clicked down.
  hit: {
    element: CommonElement | null,
    // all: CommonElement[],
  },
  metaKeyDown: boolean,
  // used only once, defined inside the initial pointerDown event
  listeners: {
    onPointerMove?:  ReturnType<typeof waitForRequestAnimationFrame>,
    onPointerUp?:  ((event: PointerEvent) => void),
    onKeyDown?:  ((event: KeyboardEvent) => void),
    onKeyUp?:  ((event: KeyboardEvent) => void),
  },
}

export function createPointerState({ clientX, clientY, metaKey }: React.PointerEvent<HTMLCanvasElement>): PointerState {
  const origin: Point = [clientX, clientY]

  return {
    origin,
    metaKeyDown: metaKey,
    lastPoint: [...origin] as Point,
    // save copies of original elements into a Map
    hit: {element: null},
    listeners: {}
  }
}