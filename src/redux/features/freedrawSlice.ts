import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FreedrawElement } from "../../models/types";
import { randomId } from "../../random";
import { elementCanvasCaches, generateCanvas } from "../../utils/canvas";
import { strokeStop } from "./actions";

const initialState: {
  freedraw: FreedrawElement | null
} = {
  freedraw: null,
}

const freedrawSlice = createSlice({
  name: 'freedraw',
  initialState,
  reducers: {
    strokeStart(state, action: PayloadAction<{ clientX: number, clientY: number, pressure: number }>) {
      const id = randomId();
      const { clientX: x, clientY: y } = action.payload;
      return {
        freedraw: {
          type: 'freedraw',
          id, x, y,
          points: [[0, 0]],
          last: null,
          // TODO: 压感, 样式
          // pressures: undefined, 
          // strokeColor: DefaultElementStyle.strokeColor,
          // backgroundColor: DefaultElementStyle.backgroundColor,
          // fillStyle: DefaultElementStyle.fillStyle,
          // strokeWidth: DefaultElementStyle.strokeWidth,
          // strokeStyle: DefaultElementStyle.strokeStyle,
          // opacity: DefaultElementStyle.opacity,
        }
      };
    },
    strokeUpdate(state, action: PayloadAction<{ clientX: number, clientY: number, pressure: number }>) {
      let freedraw = state.freedraw;
      if (freedraw != null) {
        const { clientX, clientY, pressure } = action.payload;
        console.log(state.freedraw, '#');

        const points = freedraw.points;
        const dx = clientX - freedraw.x;
        const dy = clientY - freedraw.y;

        const lastPoint = points.length > 0 && points.at(-1);
        const shouldIgnore = lastPoint && lastPoint[0] === dx &&
          lastPoint[1] === dy;
        if (shouldIgnore) return;

        const pressures = !!freedraw.pressures
          ? [...freedraw.pressures, pressure]
          : undefined;

        freedraw.pressures = pressures;
        freedraw.points.push([dx, dy]);
        elementCanvasCaches.set(freedraw, generateCanvas(freedraw));
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(strokeStop, (state, _action) => {
      let freedraw = state.freedraw;
      // console.log('# stop stroking element: ', freedraw?.id);

      if (freedraw) {
        if (freedraw.points.length < 3) {
          // prevent dots that are extremely small.
          freedraw.points = [[0, 0], [1, 1]];
        }

        freedraw.last = freedraw.points.at(-1)!
        console.log(freedraw, '#');

        elementCanvasCaches.set(freedraw, generateCanvas(freedraw));
        // freedraw = null;
      }
    });
  }
});

const freedrawReducer = freedrawSlice.reducer;
export const { strokeStart, strokeUpdate } = freedrawSlice.actions;
export default freedrawReducer;
