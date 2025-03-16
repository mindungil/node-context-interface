import { createSlice } from "@reduxjs/toolkit";

const nodeSlice = createSlice({
  name: "node",
  initialState: { nodes: {} },

  reducers: {
    addOrUpdateNode: (state, action) => {
      const { id, keyword, userMessage, gptMessage } = action.payload;

      if (!state.nodes[id]) {
        state.nodes[id] = {
          id,
          keyword,
          parent: null,
          children: [],
          dialog: { 1: { userMessage, gptMessage } }
        };
      } else {
        const dialogLength = Object.keys(state.nodes[id].dialog).length + 1;
        state.nodes[id].dialog[dialogLength] = { userMessage, gptMessage };
      }
    },

    setParentNode: (state, action) => {
      const { nodeId, parentId } = action.payload;

      if (state.nodes[nodeId] && state.nodes[parentId]) {
        state.nodes[nodeId].parent = parentId;
        state.nodes[parentId].children.push(nodeId);
        console.log(`✅ ${nodeId}이(가) ${parentId}에 연결됨.`);
      } else {
        console.warn(`⚠️ setParentNode 실행 실패 - nodeId: ${nodeId}, parentId: ${parentId}`);
      }
    }
  },
});

export const { addOrUpdateNode, setParentNode } = nodeSlice.actions;
export default nodeSlice.reducer;

