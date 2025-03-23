import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import ReactFlow, { useNodesState, useEdgesState, addEdge, Background, Controls, BezierEdge } from "reactflow";
import 'reactflow/dist/style.css';
import { useSelector, useDispatch } from "react-redux";
import { toggleActiveNode } from "../redux/slices/nodeSlice";

const edgeTypes = {
  bezier: BezierEdge,
};

const GraphContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative; 
`;

const ButtonGroup = styled.div`
  position: absolute; 
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 10; 
`;

const ModeButton = styled.div`
  padding: 5px 10px;
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #eee;
  }
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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 🟢 노드 클릭 핸들러
  const handleNodeClick = useCallback((event, node) => {
    console.log("🔵 노드 클릭됨:", node.id); // ✅ 클릭 확인 로그
    dispatch(toggleActiveNode(node.id));
  }, [dispatch]);

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
          data: { label: node.keyword },
          position: position,
          sourcePosition: "right",
          targetPosition: "left",
          style: {
            background: isActive ? "#48BB78" : "#d9d9d9",
            color: isActive ? "#fff" : "#000",
            borderRadius: 20,
            padding: 10,
            border: isActive ? "2px solid #48BB78" : "1px solid #555",
          },
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
      <ButtonGroup>
        <ModeButton>Linear</ModeButton>
        <ModeButton>Tree</ModeButton>
        <ModeButton>Node</ModeButton>
      </ButtonGroup>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick} // ✅ 클릭 핸들러 추가
        fitView
      >
        <Background gap={16} size={0.5} color="#aaa" />
        <Controls />
      </ReactFlow>
    </GraphContainer>
  );
}

export default Graph;
