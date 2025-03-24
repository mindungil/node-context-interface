import { createSlice } from "@reduxjs/toolkit";

const modeSlice = createSlice({
  name: "mode",
  initialState: {
    linearMode: false,  // 🔥 Linear 모드 상태
    hoveredNodeIds: [], // 🔥 hover된 노드 ID 목록
  },

  reducers: {
    toggleLinearMode: (state) => {
      state.linearMode = !state.linearMode;
    },

    setHoveredNodes: (state, action) => {
      state.hoveredNodeIds = action.payload;
    },

    clearHoveredNodes: (state) => {
      state.hoveredNodeIds = [];
    },
  },
});

export const { toggleLinearMode, setHoveredNodes, clearHoveredNodes } = modeSlice.actions;
export default modeSlice.reducer;
