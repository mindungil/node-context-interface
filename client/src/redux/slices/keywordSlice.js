// redux/keywordSlice.js
import { createSlice } from "@reduxjs/toolkit";

const keywordSlice = createSlice({
  name: "keyword",
  initialState: [],
  reducers: {
    addKeyword: (state, action) => {
      console.log("🔹 Redux에 추가된 키워드:", action.payload);
      console.log("📌 현재 Redux 상태:", state);

      if (!state.includes(action.payload)) {
        state.push(action.payload);
      }
    },
    resetKeyword: () => {
      return [];
    },
  },
});

export const { addKeyword, resetKeyword } = keywordSlice.actions;
export default keywordSlice.reducer;

