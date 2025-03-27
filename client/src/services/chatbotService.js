import axios from "axios";
import { addOrUpdateNode, setParentNode } from "../redux/slices/nodeSlice";

// 🟢 API 요청을 위한 노드 데이터 경량화 함수
const simplifyNodes = (nodes) => {
  const simplified = {}; // 직접 객체 생성
  Object.keys(nodes).forEach((id) => {
    const node = nodes[id];
    simplified[id] = {
      id: node.id,
      keyword: node.keyword,
      parent: node.parent,
      relation: node.relation,
      children: node.children,
    };
  });
  return simplified;
};

// 🟢 API 요청을 처리하는 함수
export const sendMessageToApi = (input, previousMessages) => async (dispatch, getState) => {
  try {
    const contextMode = getState().mode.contextMode;
    const activeDialogNumbers = getState().node.activeDialogNumbers;
    const allNodes = getState().node.nodes;
    const activeNodeIds = getState().node.activeNodeIds;

    // 🔥 Context Mode 활성화 시 활성 대화만 필터링
    let filteredMessages = previousMessages;
    if (contextMode) {
      filteredMessages = previousMessages.filter((msg, index) => activeDialogNumbers.includes(index + 1));
      console.log("🔥 Context Mode 활성화 - 활성 대화 필터링:", filteredMessages);
    }

    // 🔥 Context Mode 활성화 시 활성 노드만 필터링
    const filteredNodes = contextMode
      ? Object.fromEntries(Object.entries(allNodes).filter(([id]) => activeNodeIds.includes(id)))
      : allNodes;

    console.log("🔥 Context Mode 활성화 - 활성 노드 필터링:", filteredNodes);

    // 🔹 Step 1: /api/chat 호출하여 GPT 응답 받기
    const response = await axios.post("http://localhost:8080/api/chat", {
      message: input,
      history: filteredMessages,
    });

    const { message: gptResponse, keyword } = response.data;

    if (!keyword) return gptResponse;

    console.log("📌 GPT 응답:", { keyword, gptResponse });

    // 🔹 Step 2: 동일한 키워드가 이미 있는지 체크
    const existingNodeId = Object.keys(filteredNodes).find(
      (nodeId) => filteredNodes[nodeId].keyword === keyword
    );

    if (existingNodeId) {
      console.log(`✅ 기존 키워드(${keyword}) 발견 - ${existingNodeId} 노드에 대화 추가`);

      // 🔹 기존 노드에 dialog 추가
      dispatch(
        addOrUpdateNode({
          id: existingNodeId,
          keyword,
          userMessage: input,
          gptMessage: gptResponse,
          contextMode,
        })
      );

      console.log("🔄 업데이트된 Redux 상태 (기존 키워드 추가 후):", getState().node.nodes);
      return gptResponse;
    }

    // 🔥 새로운 노드 ID를 만드는 함수
    const generateNodeId = (parentNodeId, nodes) => {
      const childIds = nodes[parentNodeId]?.children || [];
      let maxSuffix = 0;

      // 현재 자식 노드 중 가장 큰 번호를 찾음
      childIds.forEach((childId) => {
        const suffix = parseInt(childId.split("-").pop(), 10);
        if (!isNaN(suffix)) {
          maxSuffix = Math.max(maxSuffix, suffix);
        }
      });

      return `${parentNodeId}-${maxSuffix + 1}`;
    };

    // 🔹 Step 3: /api/update-graph 호출하여 부모 노드 찾기 (새로운 키워드일 때만 실행)
    const simplifiedNodes = simplifyNodes(filteredNodes);

    const parentNode = await axios.post("http://localhost:8080/api/update-graph", {
      nodes: simplifiedNodes,
      keyword,
      userMessage: input,
      gptMessage: gptResponse,
    });

    const { parentNodeId, relation } = parentNode.data;
    console.log(`📌 ${keyword}의 부모 노드: ${parentNodeId}, 관계: ${relation}`);

    const updatedNodes = getState().node.nodes;
    const newNodeId = generateNodeId(parentNodeId, updatedNodes);

    dispatch(
      addOrUpdateNode({
        id: newNodeId,
        keyword,
        userMessage: input,
        gptMessage: gptResponse,
        contextMode,
      })
    );

    if (parentNodeId && updatedNodes[parentNodeId]) {
      dispatch(setParentNode({ nodeId: newNodeId, parentId: parentNodeId, relation }));
      console.log(`✅ ${newNodeId}이(가) ${parentNodeId}에 "${relation}" 관계로 연결됨.`);
    }

    console.log("🔄 업데이트된 Redux 상태 (새로운 키워드 추가 후):", getState().node.nodes);
    return gptResponse;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
