import { configureStore } from "@reduxjs/toolkit";
import nodeReducer from "./slices/nodeSlice";
import modeReducer from "./slices/modeSlice";

export const store = configureStore({
  reducer: {
    node: nodeReducer,
    mode: modeReducer,
  },
});
