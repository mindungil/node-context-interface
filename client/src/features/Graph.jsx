import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import ReactFlow, { useNodesState, useEdgesState, addEdge, Background, Controls, BezierEdge } from "reactflow";
import 'reactflow/dist/style.css';
import { useSelector, useDispatch } from "react-redux";
import ContextButton from "../components/button/ContextButton";
import CustomEdge from "../components/graph/CustomEdge";
import CustomTooltipNode from "../components/tooltip-node/TooltipNode";
import ToggleButton from "../components/button/ToggleButton"; 
import { toggleContextMode } from "../redux/slices/modeSlice";

const edgeTypes = {
  custom: CustomEdge, 
  bezier: BezierEdge,
};

const nodeTypes = {
  tooltipNode: CustomTooltipNode,
};

const colorPalette = [
  "#A9DED3", "#FFD93D", "#EC7FA0", "#98E4FF", "#D1A3FF",
  "#6BCB77", "#FF914D", "#93AFEA", "#FFB6C1"
];

// 민트 노랑 초록 하늘 보라
// 빨강 주황 파랑 코랄 ???

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
  const spacingX = 250;
  const spacingY = 150;
  const centerY = parentPos.y;

  let yOffset = 0;
  if (siblingCount > 1) {
    yOffset = ((siblingCount - 1) / 2 - index) * spacingY;
  }

  const finalY = centerY + yOffset;
  return { x: parentPos.x + spacingX, y: finalY };
};

function getColor(index) {
  return colorPalette[index % colorPalette.length];
}

function Graph() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const activeNodeIds = useSelector((state) => state.node.activeNodeIds);
  const nodesData = useSelector((state) => state.node.nodes) || {};
  const contextMode = useSelector((state) => state.mode.contextMode);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleToggle = () => {
    dispatch(toggleContextMode());
  };

  useEffect(() => {
    const updatedNodes = [];
    const depthNodes = {};
    const rootColorMap = {};

    const sortedNodes = Object.values(nodesData).sort((a, b) => b.timestamp - a.timestamp);

    sortedNodes.forEach((node, index) => {
      const depth = calculateDepth(nodesData, node.id);
      if (!depthNodes[depth]) depthNodes[depth] = [];
      depthNodes[depth].push(node);

      if (depth === 1) {
        rootColorMap[node.id] = getColor(index);
      }

      if (node.parent && rootColorMap[node.parent]) {
        rootColorMap[node.id] = rootColorMap[node.parent];
      }
    });

    Object.keys(depthNodes).forEach((depth) => {
      const siblingCount = depthNodes[depth].length;

      depthNodes[depth].forEach((node, index) => {
        const parentPos = getParentPosition(updatedNodes, node.parent);
        const position = calculatePosition(parentPos, index, siblingCount);
        const isActive = activeNodeIds.includes(node.id);
        const nodeColor = rootColorMap[node.id] || "#333";

        updatedNodes.push({
          id: node.id,
          data: { 
            label: node.keyword,
            color: nodeColor,
            isActive: activeNodeIds.includes(node.id),
          },
          position: position,
          type: "tooltipNode",
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
        type: "custom",
        animated: false,
        style: {
          strokeWidth: 2,
          stroke: rootColorMap[node.id] || "#333",
        },
        labelStyle: {
          fontWeight: 600,
          fontSize: 14,
        },
        markerEnd: {
          type: "arrowclosed",
          color: rootColorMap[node.id] || "#333",
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
        edgeTypes={edgeTypes} 
        fitView
      >
        <Background variant="dots" gap={20} size={1.5} color="#ddd" />
        <Controls />
      </ReactFlow>
    </GraphContainer>
  );
}

export default Graph;
