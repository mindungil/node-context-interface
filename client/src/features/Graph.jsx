import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import ReactFlow, { useNodesState, useEdgesState, addEdge, Background, Controls, BezierEdge } from "reactflow";
import 'reactflow/dist/style.css';
import { useSelector, useDispatch } from "react-redux";
import { toggleActiveNode } from "../redux/slices/nodeSlice";
import ContextButton from "../components/button/ContextButton";
import CustomTooltipNode from "../components/tooltip-node/TooltipNode";
import ToggleButton from "../components/button/ToggleButton"; 
import { toggleContextMode } from "../redux/slices/modeSlice";

const edgeTypes = {
  bezier: BezierEdge,
};

const nodeTypes = {
  tooltipNode: CustomTooltipNode,
};

const GraphContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative; 
`;

const ToggleContainer = styled.div`
  position: absolute;
  top: 70px;
  left: 20px;
  z-index: 10;
`;

const getParentPosition = (nodes, parentId) => {
  const parentNode = nodes.find((node) => node.id === parentId);
  return parentNode ? parentNode.position : { x: 0, y: 0 };
};

const calculateDepth = (nodes, nodeId) => {
  let depth = 0;
  let currentNode = nodes[nodeId];
  while (currentNode && currentNode.parent) {
    currentNode = nodes[currentNode.parent];
    depth += 1;
  }
  return depth;
};

const calculatePosition = (parentPos, index, siblingCount) => {
  const spacingX = 350;
  const spacingY = 150;
  const centerY = parentPos.y;

  let yOffset = 0;
  if (siblingCount > 1) {
    yOffset = ((siblingCount - 1) / 2 - index) * spacingY;
  }

  const finalY = centerY + yOffset;
  return { x: parentPos.x + spacingX, y: finalY };
};

function Graph() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const activeNodeIds = useSelector((state) => state.node.activeNodeIds);
  const nodesData = useSelector((state) => state.node.nodes) || {};
  const contextMode = useSelector((state) => state.mode.contextMode);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 🔥 토글 상태 변경 핸들러
  const handleToggle = () => {
    dispatch(toggleContextMode());
  };
  

  useEffect(() => {
    const updatedNodes = [];
    const depthNodes = {};

    const sortedNodes = Object.values(nodesData).sort((a, b) => b.timestamp - a.timestamp);

    sortedNodes.forEach((node) => {
      const depth = calculateDepth(nodesData, node.id);
      if (!depthNodes[depth]) depthNodes[depth] = [];
      depthNodes[depth].push(node);
    });

    Object.keys(depthNodes).forEach((depth) => {
      const siblingCount = depthNodes[depth].length;

      depthNodes[depth].forEach((node, index) => {
        const parentPos = getParentPosition(updatedNodes, node.parent);
        const position = calculatePosition(parentPos, index, siblingCount);
        const isActive = activeNodeIds.includes(node.id);

        updatedNodes.push({
          id: node.id,
          data: { 
            label: node.keyword,
            isActive: activeNodeIds.includes(node.id), // 활성 상태도 데이터로 넘기기
          },
          position: position,
          type: "tooltipNode",  // 커스텀 노드 타입
          sourcePosition: "right",
          targetPosition: "left",
        });
      });
    });

    const updatedEdges = Object.values(nodesData)
      .filter((node) => node.parent !== null && nodesData[node.parent])
      .map((node) => ({
        id: `${node.parent}-${node.id}`,
        source: node.parent,
        target: node.id,
        label: node.relation || "관련",
        type: "bezier",
        animated: true,
        style: {
          strokeWidth: 2,
          stroke: "#48BB78",
        },
        labelStyle: { fill: "#333", fontWeight: 600 },
        markerEnd: {
          type: "arrowclosed",
          color: "#48BB78",
        },
      }));

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [nodesData, activeNodeIds]);

  return (
    <GraphContainer ref={containerRef}>
      <ToggleContainer>
        <ToggleButton active={contextMode} onToggle={handleToggle} />
      </ToggleContainer>
      <ContextButton />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={16} size={0.5} color="#aaa" />
        <Controls />
      </ReactFlow>
    </GraphContainer>
  );
}

export default Graph;
