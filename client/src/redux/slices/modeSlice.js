import { createSlice } from "@reduxjs/toolkit";

const modeSlice = createSlice({
  name: "mode",
  initialState: {
    linearMode: false,
    treeMode: false,  // 🔥 Tree 모드 상태 추가
    hoveredNodeIds: [],
  },

  reducers: {
    toggleLinearMode: (state) => {
      state.linearMode = !state.linearMode;
      if (state.linearMode) state.treeMode = false; // Linear 모드 시 Tree 모드 해제
    },

    toggleTreeMode: (state) => {  // 🔥 Tree 모드 토글 추가
      state.treeMode = !state.treeMode;
      if (state.treeMode) state.linearMode = false; // Tree 모드 시 Linear 모드 해제
    },

    setHoveredNodes: (state, action) => {
      state.hoveredNodeIds = action.payload;
    },

    clearHoveredNodes: (state) => {
      state.hoveredNodeIds = [];
    },
  },
});

export const { toggleLinearMode, toggleTreeMode, setHoveredNodes, clearHoveredNodes } = modeSlice.actions;
export default modeSlice.reducer;
