import { configureStore } from "@reduxjs/toolkit";
import keywordReducer from "./slices/keywordSlice";

export const store = configureStore({
  reducer: {
    keyword: keywordReducer,
  },
});
