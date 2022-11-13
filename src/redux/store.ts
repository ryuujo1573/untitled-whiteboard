import { configureStore, createListenerMiddleware, Middleware, Store } from "@reduxjs/toolkit";
import canvasReducer, { switchTool } from "./features/canvasSlice";
import generalReducer from "./features/generalSlice";
import userReducer from "./features/userSlice";
import undoable, { excludeAction } from 'redux-undo';
import { batchGroupBy } from "../utils/batchGroupBy";
import { canvas } from "../utils/canvas";
import freedrawReducer from "./features/freedrawSlice";


const store = configureStore({
  reducer: {
    user: userReducer,
    common: generalReducer,
    freedraw: freedrawReducer,
    canvas: canvasReducer,
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