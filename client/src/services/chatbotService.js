import axios from "axios";
import { addOrUpdateNode, setParentNode } from "../redux/slices/nodeSlice";

export const sendMessageToApi = (input, previousMessages) => async (dispatch, getState) => {
  try {
    // 🔹 Step 1: /api/chat 호출하여 GPT 응답 받기
    const response = await axios.post("http://localhost:8080/api/chat", {
      message: input,
      history: previousMessages,
    });

    const { message: gptResponse, keyword } = response.data;

    if (!keyword) return gptResponse; // ✅ 키워드 없으면 그냥 메시지만 반환

    console.log("📌 GPT 응답:", { keyword, gptResponse });

    // 🔹 Step 2: 동일한 키워드가 이미 있는지 체크
    const existingNodeId = Object.keys(getState().node.nodes).find(
      (nodeId) => getState().node.nodes[nodeId].keyword === keyword
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
        })
      );

      console.log("🔄 업데이트된 Redux 상태 (기존 키워드 추가 후):", getState().node.nodes);
      return gptResponse;
    }

    // 🔹 Step 3: /api/update-graph 호출하여 부모 노드 찾기 (새로운 키워드일 때만 실행)
    const parentNode = await axios.post("http://localhost:8080/api/update-graph", {
      nodes: getState().node.nodes, // ✅ 현재 Redux 상태 전달
      history: previousMessages,
      keyword,
      userMessage: input,
      gptMessage: gptResponse,
    });

    // ✅ parentNodeId, relation JSON 객체로 가져오기
    const { parentNodeId, relation } = parentNode.data;
    console.log(`📌 ${keyword}의 부모 노드: ${parentNodeId}, 관계: ${relation}`);

    // 🔹 Step 4: 부모 노드 정보 기반으로 새로운 노드 추가
    const updatedNodes = getState().node.nodes;
    const childrenCount = updatedNodes[parentNodeId]?.children?.length || 0;
    const newNodeId = `${parentNodeId}-${childrenCount + 1}`;

    dispatch(
      addOrUpdateNode({
        id: newNodeId,
        keyword,
        userMessage: input,
        gptMessage: gptResponse,
      })
    );

    // 🔹 Step 5: 부모 노드와 연결
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
