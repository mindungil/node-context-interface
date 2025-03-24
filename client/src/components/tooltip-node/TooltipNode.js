import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { setHoveredNodes, clearHoveredNodes } from "../../redux/slices/modeSlice";
import { toggleActiveNode } from "../../redux/slices/nodeSlice"; // ✅ 노드 토글 액션 가져오기


const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NodeContent = styled.div`
  padding: 10px 20px;
  border-radius: 20px;
  background: ${(props) => (props.isActive ? "#48BB78" : props.isHovered ? "#A0AEC0" : "#d9d9d9")};
  color: #000;
  text-align: center;
  border: 1px solid #555;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
`;


// 부모 노드를 모두 가져오는 함수
const getAllParentNodes = (nodeId, nodesData) => {
  let currentNode = nodesData[nodeId];
  const parentNodes = [];

  console.log("🔍 부모 노드 추적 시작 - 현재 노드 ID:", nodeId);

  while (currentNode && currentNode.parent) {
    console.log("🔗 현재 노드:", currentNode.id, "| 부모 노드:", currentNode.parent);

    if (!nodesData[currentNode.parent]) {
      console.error("❗ 부모 노드를 찾을 수 없음:", currentNode.parent);
      break;
    }

    parentNodes.push(currentNode.parent);
    currentNode = nodesData[currentNode.parent];
  }

  console.log("✅ 부모 노드 추적 완료 - 부모 노드 목록:", parentNodes);
  return parentNodes.reverse(); // 부모에서 자식 순서로 정렬
};


const TooltipNode = ({ data, id }) => {
  const dispatch = useDispatch();
  const linearMode = useSelector((state) => state.mode.linearMode);
  const hoveredNodeIds = useSelector((state) => state.mode.hoveredNodeIds);
  const activeNodeIds = useSelector((state) => state.node.activeNodeIds);
  const nodesData = useSelector((state) => state.node.nodes);

  const isHovered = hoveredNodeIds.includes(id);
  const isActive = activeNodeIds.includes(id);

  const handleMouseEnter = () => {
    if (linearMode) {
      // 현재 노드와 모든 부모 노드들을 가져와 hover 처리
      const parentNodes = getAllParentNodes(id, nodesData);
      const hoverPath = [...parentNodes, id]; // 부모 + 현재 노드 순서
      dispatch(setHoveredNodes(hoverPath));
    }
  };

  const handleMouseLeave = () => {
    if (linearMode) {
      dispatch(clearHoveredNodes());
    }
  };

  // ✅ 클릭 핸들러 수정
  const handleClick = (event) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    console.log("🟢 노드 클릭됨:", id);

    if (linearMode && hoveredNodeIds.length > 0) {
      // 🔥 Hover 상태의 모든 노드를 활성화 또는 비활성화
      hoveredNodeIds.forEach((hoveredId) => {
        dispatch(toggleActiveNode(hoveredId)); // ✅ 노드 활성화 상태 토글
      });
    } else {
      dispatch(toggleActiveNode(id)); // ✅ 단일 노드 활성화 상태 토글
    }
  };


  return (
    <TooltipContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
      <NodeContent isHovered={isHovered} isActive={isActive}>
        {data.label}
      </NodeContent>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </TooltipContainer>
  );
};

export default memo(TooltipNode);
