import { createAction } from "@reduxjs/toolkit";
import { CommonElement, FreedrawElement } from "../../models/types";


export const strokeStop = createAction<{
  element: FreedrawElement
  historyLimit: number
  // event: PointerEvent
}>('FINISH_EDITING');
