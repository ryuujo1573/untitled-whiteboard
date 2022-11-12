import { configureStore, createListenerMiddleware, Middleware, Store } from "@reduxjs/toolkit";
import canvasReducer, { startFreedraw, stopFreedraw } from "./features/canvasSlice";
import generalReducer from "./features/generalSlice";
import userReducer from "./features/userSlice";


const store = configureStore({
  reducer: {
    user: userReducer,
    common: generalReducer,
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