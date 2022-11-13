import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PointerState } from "../../models/PointerState";
import { AllTools, BoardState, CommonElement, DefaultElementStyle, FreedrawElement, ImageElement } from "../../models/types";
import { randomId } from "../../random";
import elements from "../../testElements";
import { toMappedList, utils } from "../../utils";
import { elementCanvasCaches, generateCanvas, getAbsoluteCoords } from "../../utils/canvas";
import { strokeStop } from "./actions";

type PointerEventData = { clientX: number, clientY: number, pressure: number }

const elementAdapter = createEntityAdapter<CommonElement>({
  selectId: ele => ele.id,
});

const initialCanvas: BoardState & {
  // handy for adding type temporarily.
} = {
  id: 'scene-0',
  title: 'Untitled 1',
  size: {
    width: 1920,
    height: 1080,
  },
  allElements: elementAdapter.getInitialState(),
  tool: 'selector',
  toolStyle: {},
  editingElement: null,
  selected: false,
  selectingArea: null,
  renderConfig: {
    gridDisplay: true,
    debug: false,
  },
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState: initialCanvas,
  reducers: {
    switchTool(state, action: PayloadAction<AllTools>) {
      state.tool = action.payload;
    },
    startSelection(state, action: PayloadAction<{ clientX: number, clientY: number }>) {
      // if (shiftKey) {
      //   // TODO: multiple selection
      // }
      const { clientX, clientY } = action.payload;
      state.selectingArea = [clientX, clientY, clientX, clientY];
    },
    updateSelection(state, action: PayloadAction<PointerEventData>) {
      if (!state.selectingArea) return;
      state.selectingArea[2] = action.payload.clientX;
      state.selectingArea[3] = action.payload.clientY;
      // state.selection = [...state.selection];
    },
    stopSelection(state, action: PayloadAction<PointerEventData>) {
      const { selectingArea: selection } = state;
      if (!selection) return;
      const [_x1, _y1, _x2, _y2] = selection;
      const [xmin, ymin, xmax, ymax] = [
        _x1 < _x2 ? _x1 : _x2,
        _y1 < _y2 ? _y1 : _y2,
        _x1 < _x2 ? _x2 : _x1,
        _y1 < _y2 ? _y2 : _y1,
      ]

      let x1: number, y1: number, x2: number, y2: number;

      state.allElements.ids.forEach((id) => {
        const ele = state.allElements.entities[id]!;
        switch (ele.type) {
          case 'freedraw':
            const freedraw = ele as FreedrawElement;
            [x1, y1, x2, y2] = getAbsoluteCoords(freedraw);
            break;
          case 'image':
            const imageElement = ele as ImageElement;
            [x1, y1, x2, y2] = getAbsoluteCoords(imageElement)
            break;
          default:
            // TODO: implement range checks for other types.
            [x1, y1, x2, y2] = [-Infinity, -Infinity, Infinity, Infinity]
        }

        if (xmax > x2 && ymax > y2 && xmin < x1 && ymin < y1) {
          ele.selected = true;
        } else {
          ele.selected = undefined;
        }
      });

      state.selectingArea = null;
    },
    addElement(state, { payload }: PayloadAction<CommonElement>) {
      console.log(payload, '#2');

      elementAdapter.addOne(state.allElements, payload);
    },
    imageAdded(state, action: PayloadAction<ImageElement>) {
      const imageElement = action.payload;
      elementAdapter.addOne(state.allElements, imageElement);
    }
  },
  extraReducers: (builder) => {
    // builder.addCase(strokeStop, (state, action) => {
    //   const { element, historyLimit: _ } = action.payload;
    //   console.log('# got element to push: ', element.id);

    //   elementAdapter.addOne(state.allElements, element);
    // });
  }
});


const canvasReducer = canvasSlice.reducer
export const {
  switchTool,

  startSelection,
  updateSelection,
  stopSelection,
  addElement,

  imageAdded,
  // startFreedraw,
  // updateFreedraw,
  // stopFreedraw,
} = canvasSlice.actions;

export default canvasReducer;


