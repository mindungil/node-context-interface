import { configureStore } from "@reduxjs/toolkit";
import nodeReducer from "./slices/nodeSlice";

export const store = configureStore({
  reducer: {
    node: nodeReducer,
  },
});
