import { createSlice } from "@reduxjs/toolkit";

const nodeSlice = createSlice({
  name: "node",
  initialState: {
    nodes: {
      root: {
        id: "root",
        keyword: "Root",
        parent: null,
        relation: null,
        children: [],
        dialog: {},
      },
    },
  },

  reducers: {
    addOrUpdateNode: (state, action) => {
      const { id, keyword, userMessage, gptMessage } = action.payload;

      if (!state.nodes[id]) {
        const parentNodeId = "root"; // 🔹 첫 노드는 root가 부모
        state.nodes[id] = {
          id,
          keyword,
          parent: parentNodeId,
          relation: "관련",
          children: [],
          dialog: { 1: { userMessage, gptMessage } },
        };

        state.nodes[parentNodeId].children.push(id); // 🔥 root에 추가
      } else {
        const dialogLength = Object.keys(state.nodes[id].dialog).length + 1;
        state.nodes[id].dialog[dialogLength] = { userMessage, gptMessage };
      }
    },

    setParentNode: (state, action) => {
      const { nodeId, parentId, relation } = action.payload;

      if (state.nodes[nodeId] && state.nodes[parentId]) {
        state.nodes[nodeId].parent = parentId;
        state.nodes[nodeId].relation = relation;
        state.nodes[parentId].children.push(nodeId);
      }
    },
  },
});

export const { addOrUpdateNode, setParentNode } = nodeSlice.actions;
export default nodeSlice.reducer;
