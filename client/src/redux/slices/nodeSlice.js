import { createSlice, createAction } from "@reduxjs/toolkit";

// ✅ [변경 2] nodeColors 세팅용 액션 생성
export const setNodeColors = createAction("node/setNodeColors");

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
    currentScrolledDialog: null, // 🔥 현재 스크롤된 대화 번호
    nodeColors: {},
  },

  reducers: {
    toggleActiveDialog: (state, action) => {
      const dialogNumber = action.payload;
    
      // 사용자 질문인지 확인 (홀수만 처리)
      if (dialogNumber % 2 === 0) return; // 짝수면 (GPT 응답), 무시
    
      const questionNumber = dialogNumber;
      const answerNumber = dialogNumber + 1;
    
      const isQuestionActive = state.activeDialogNumbers.includes(questionNumber);
      const isAnswerActive = state.activeDialogNumbers.includes(answerNumber);
    
      const isPairActive = isQuestionActive && isAnswerActive;
    
      if (isPairActive) {
        // 둘 다 비활성화
        state.activeDialogNumbers = state.activeDialogNumbers.filter(
          (n) => n !== questionNumber && n !== answerNumber
        );
      } else {
        // 둘 다 추가
        state.activeDialogNumbers.push(questionNumber);
        state.activeDialogNumbers.push(answerNumber);
      }
    
      // 🔁 노드 활성화 상태 재계산
      const newActiveNodeIds = new Set();
      Object.entries(state.nodes).forEach(([nodeId, node]) => {
        const dialogNumbers = Object.keys(node.dialog).map(Number);
        const hasActive = dialogNumbers.some((dn) => {
          const q = (dn - 1) * 2 + 1;
          const a = (dn - 1) * 2 + 2;
          return state.activeDialogNumbers.includes(q) || state.activeDialogNumbers.includes(a);
        });
    
        if (hasActive) {
          newActiveNodeIds.add(nodeId);
        }
      });
    
      state.activeNodeIds = [...newActiveNodeIds];
    },
    
    toggleActiveNode: (state, action) => {
      const nodeIds = Array.isArray(action.payload) ? action.payload : [action.payload];
    
      nodeIds.forEach((nodeId) => {
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

          // 🔥 오름차순 정렬
          uniqueDialogs.sort((a, b) => a - b);
          state.activeDialogNumbers = uniqueDialogs;

          // 🔥 가장 최근 대화로 스크롤되도록 설정
          const latestDialogNumber = uniqueDialogs[uniqueDialogs.length - 1];
          state.currentScrolledDialog = latestDialogNumber;

          console.log("✅ [Redux] 활성화됨:", nodeId);
          console.log("🔥 [Redux] 활성화된 노드 목록:", JSON.stringify(state.activeNodeIds));
          console.log("🔥 [Redux] 활성화된 대화 번호 목록:", JSON.stringify(state.activeDialogNumbers));
          console.log("🔥 [Redux] 현재 스크롤된 대화 번호:", state.currentScrolledDialog);
        }

        // 🔁 activeNodeIds 다시 계산
        const newActiveNodeIds = new Set();
        Object.entries(state.nodes).forEach(([nodeId, node]) => {
          const dialogNumbers = Object.keys(node.dialog).map(Number);
          const hasActive = dialogNumbers.some((dn) => {
            const q = (dn - 1) * 2 + 1;
            const a = (dn - 1) * 2 + 2;
            return state.activeDialogNumbers.includes(q) || state.activeDialogNumbers.includes(a);
          });
          if (hasActive) newActiveNodeIds.add(nodeId);
        });
        state.activeNodeIds = [...newActiveNodeIds];

    
        console.log("✅ 활성화됨:", nodeId);
        console.log("🔥 활성화된 노드 목록:", JSON.stringify(state.activeNodeIds));
        console.log("🔥 활성화된 대화 번호 목록:", JSON.stringify(state.activeDialogNumbers));
      });
    },

    addOrUpdateNode: (state, action) => {
      const { id, keyword, userMessage, gptMessage, contextMode } = action.payload;

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

      // 🔥 Context Mode가 켜져 있다면 자동으로 활성화 처리
      if (contextMode) {
        state.activeNodeIds.push(id);
        state.activeDialogNumbers.push((dialogNumber - 1) * 2 + 1);  // 질문 번호 추가
        state.activeDialogNumbers.push((dialogNumber - 1) * 2 + 2);  // 답변 번호 추가
        console.log("🔥 [Context Mode] 새로 추가된 노드 활성화:", id);
      }
      
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

    // 🔥 현재 스크롤된 대화 번호 설정 액션 추가
    setCurrentScrolledDialog: (state, action) => {
      state.currentScrolledDialog = action.payload;
    },

    resetState: (state, action) => {
      const { nodes, activeNodeIds, activeDialogNumbers, dialogCount } = action.payload;
      state.nodes = nodes;
      state.activeNodeIds = activeNodeIds;
      state.activeDialogNumbers = activeDialogNumbers;
      state.dialogCount = dialogCount;
    }  
  },

  extraReducers: (builder) => {
    builder.addCase(setNodeColors, (state, action) => {
      state.nodeColors = action.payload;
    });
  },
});

export const { toggleActiveDialog, toggleActiveNode, addOrUpdateNode, setParentNode, setCurrentScrolledDialog, resetState } = nodeSlice.actions;
export default nodeSlice.reducer;
