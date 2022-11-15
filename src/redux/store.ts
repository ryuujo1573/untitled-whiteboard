import { configureStore } from "@reduxjs/toolkit";
import canvasReducer, { startFreedraw, stopFreedraw, switchTool, updateFreedraw } from "./features/canvasSlice";
import generalReducer from "./features/generalSlice";
import userReducer from "./features/userSlice";
import undoable, { excludeAction } from 'redux-undo';
import { batchGroupBy } from "../utils/batchGroupBy";


const store = configureStore({
  reducer: {
    user: userReducer,
    common: generalReducer,
    canvas: undoable(canvasReducer, {
      filter: excludeAction([switchTool]),
      groupBy: batchGroupBy.init([startFreedraw, updateFreedraw, stopFreedraw])
    }),
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;

// const listenerMiddleware = createListenerMiddleware<RootState, AppDispatch>();

// listenerMiddleware.startListening({
//   actionCreator: startFreedraw,
//   effect: (action, listenerApi) => {

//   },
// })


export default store;