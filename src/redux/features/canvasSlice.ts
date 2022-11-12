import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PointerState } from "../../models/PointerState";
import { AllTools, BoardState, CommonElement, DefaultElementStyle, FreedrawElement } from "../../models/types";
import { randomId } from "../../random";
import elements from "../../testElements";
import { toMappedList, utils } from "../../utils";
import { elementCanvasCaches, generateCanvas } from "../../utils/canvas";

type PointerEventData = { clientX: number, clientY: number, pressure: number }

const initialCanvas: BoardState & {
  // handy for adding type temporarily.
} = {
  id: 'scene-0',
  title: 'Untitled 1',
  size: {
    width: 1920,
    height: 1080,
  },
  allElements: toMappedList(elements),
  tool: 'freedraw',
  toolStyle: {},
  editingElement: null,
  renderConfig: {
    gridDisplay: true,
    debug: false,
  }
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState: initialCanvas,
  reducers: {
    switchTool(state, action: PayloadAction<AllTools>) {
      state.tool = action.payload;
    },
    startFreedraw(state, action: PayloadAction<PointerState>) {
      const id = randomId();
      const { ...pointerState } = action.payload;
      const [x, y] = pointerState.origin;
      utils.log(`🆕 Create freedraw element ${id} at (${x}, ${y})`);

      const newElement: FreedrawElement = {
        id,
        type: 'freedraw',
        x,
        y,
        points: [[0, 0]],
        pressures: undefined,
        last: null,
        // strokeColor: DefaultElementStyle.strokeColor,
        // backgroundColor: DefaultElementStyle.backgroundColor,
        // fillStyle: DefaultElementStyle.fillStyle,
        // strokeWidth: DefaultElementStyle.strokeWidth,
        // strokeStyle: DefaultElementStyle.strokeStyle,
        // opacity: DefaultElementStyle.opacity,
      };

      state.editingElement = newElement;
      state.allElements.indices.push(id);
      state.allElements.elementById[id] = newElement;
    },
    updateFreedraw(state, action: PayloadAction<PointerEventData>) {
      const { clientX, clientY, pressure } = action.payload;
      let { editingElement: freedraw } = state;

      // assuming element is freedraw (just for now)
      if (freedraw === null) return;
      const points = freedraw.points;
      const dx = clientX - freedraw.x;
      const dy = clientY - freedraw.y;

      const lastPoint = points.length > 0 && points.at(-1);
      const shouldIgnore = lastPoint && lastPoint[0] === dx && lastPoint[1] === dy;
      if (shouldIgnore) return;

      const pressures = !!freedraw.pressures ? [...freedraw.pressures, pressure] : undefined;

      freedraw.pressures = pressures;
      freedraw.points.push([dx, dy]);
      state.allElements.elementById[freedraw.id] = freedraw;

      // console.log('now', state.allElements.elementById[freedraw.id].points.length);

      elementCanvasCaches.set(freedraw, generateCanvas(freedraw));
    },
    stopFreedraw(state, action: PayloadAction<PointerEventData>) {
      const { clientX, clientY, pressure } = action.payload;
      let { editingElement } = state;

      if (!editingElement) return;
      const freedraw = editingElement as FreedrawElement;

      const points = freedraw.points;
      let dx = clientX - freedraw.x;
      let dy = clientY - freedraw.y;

      if (dx === points[0][0] && dy === points[0][1]) {
        // console.warn('stroke extremely small, changing its size to a visible level.');
        dx += 0.001;
        dy += 0.001;
      }

      freedraw.points = [...points, [dx, dy]];
      freedraw.pressures = freedraw.pressures
        ? [...freedraw.pressures, pressure]
        : undefined;
      freedraw.last = [dx, dy];

      editingElement = null;
    },
  },
  extraReducers: (builder) => { }
});


const canvasReducer = canvasSlice.reducer
export const {
  switchTool,
  startFreedraw,
  updateFreedraw,
  stopFreedraw,
} = canvasSlice.actions;

export default canvasReducer;


