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
        dialog: {
          0: { userMessage: "Root", gptMessage: "Root Node" }
        },
      },
    },
    activeNodeIds: [],
    activeDialogNumbers: [],
    dialogCount: 1,
  },

  reducers: {
    toggleActiveNode: (state, action) => {
      const nodeId = action.payload;
    
      // 이미 활성화된 노드라면 비활성화 처리
      if (state.activeNodeIds.includes(nodeId)) {
        state.activeNodeIds = state.activeNodeIds.filter(id => id !== nodeId);
    
        // 비활성화 처리: 해당 노드의 대화 번호 삭제
        const dialogNumbers = Object.keys(state.nodes[nodeId].dialog).map(Number);
        const newActiveDialogs = state.activeDialogNumbers.filter(number => {
          return !dialogNumbers.some(dialogNumber => {
            const questionNumber = (dialogNumber - 1) * 2 + 1;
            const answerNumber = (dialogNumber - 1) * 2 + 2;
            return number === questionNumber || number === answerNumber;
          });
        });
        state.activeDialogNumbers = newActiveDialogs;
    
        console.log("❌ 비활성화됨:", nodeId);
        console.log("🔥 활성화된 노드 목록:", JSON.stringify(state.activeNodeIds));
        console.log("🔥 활성화된 대화 번호 목록:", JSON.stringify(state.activeDialogNumbers));
        return;
      }
    
      // 활성화된 노드와 대화 번호 추가
      state.activeNodeIds.push(nodeId);
    
      let activeDialogs = [];
      if (state.nodes[nodeId]) {
        const dialogNumbers = Object.keys(state.nodes[nodeId].dialog).map(Number);
    
        // 질문-답변 쌍으로 활성화 목록 만들기
        dialogNumbers.forEach((number) => {
          activeDialogs.push((number - 1) * 2 + 1);  // 질문 번호 추가
          activeDialogs.push((number - 1) * 2 + 2);  // 답변 번호 추가
        });
    
        // 중복 제거하여 활성화 목록 갱신
        const uniqueDialogs = Array.from(new Set([...state.activeDialogNumbers, ...activeDialogs]));
        state.activeDialogNumbers = uniqueDialogs;
      }
    
      console.log("✅ 활성화됨:", nodeId);
      console.log("🔥 활성화된 노드 목록:", JSON.stringify(state.activeNodeIds));
      console.log("🔥 활성화된 대화 번호 목록:", JSON.stringify(state.activeDialogNumbers));
    },
    

    addOrUpdateNode: (state, action) => {
      const { id, keyword, userMessage, gptMessage } = action.payload;

      if (!state.nodes[id]) {
        const parentNodeId = "root";
        state.nodes[id] = {
          id,
          keyword,
          parent: parentNodeId,
          relation: "관련",
          children: [],
          dialog: {},
        };
        state.nodes[parentNodeId].children.push(id);
      }

      const dialogNumber = state.dialogCount;
      state.nodes[id].dialog[dialogNumber] = {
        userMessage,
        gptMessage,
      };
      
      // 대화 번호 증가
      state.dialogCount += 1;

      console.log("대화 번호 증가됨:",state.dialogCount);
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

export const { toggleActiveNode, addOrUpdateNode, setParentNode } = nodeSlice.actions;
export default nodeSlice.reducer;
