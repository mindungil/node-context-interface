import { createSlice } from "@reduxjs/toolkit";

const nodeSlice = createSlice({
  name: "node",
  initialState: { nodes: {} }, // 🔹 빈 객체로 초기화
  reducers: {
    addOrUpdateNode: (state, action) => {
      const { keyword, userMessage, gptMessage } = action.payload;
      const existingNodeKey = Object.keys(state.nodes).find(
        (key) => state.nodes[key].keyword === keyword
      );

      if (existingNodeKey) {
        // 🔹 기존 노드가 있으면 dialog 추가
        const dialogLength = Object.keys(state.nodes[existingNodeKey].dialog).length + 1;
        state.nodes[existingNodeKey].dialog[dialogLength] = { userMessage, gptMessage };
      } else {
        // 🔹 새로운 노드 추가
        const newNodeId = `node${Object.keys(state.nodes).length + 1}`;

        state.nodes[newNodeId] = {
          id: newNodeId,
          active: Object.keys(state.nodes).length === 0, // 첫 노드는 루트 역할
          keyword,
          children: [],
          parent: null, // 🔹 부모가 없으면 기본값을 `null`로 설정
          dialog: {
            1: { userMessage, gptMessage },
          },
        };
      }
    },
    setParentNode: (state, action) => {
      const { nodeId, parentId } = action.payload;
      if (state.nodes[nodeId] && state.nodes[parentId]) {
        state.nodes[nodeId].parent = parentId;
        state.nodes[parentId].children.push(nodeId);
      }
    },
    resetNodes: (state) => {
      state.nodes = {}; // 🔹 전체 상태 초기화
    },
  },
});

export const { addOrUpdateNode, setParentNode, resetNodes } = nodeSlice.actions;
export default nodeSlice.reducer;
