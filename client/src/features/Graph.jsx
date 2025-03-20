import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import ReactFlow, { useNodesState, useEdgesState, addEdge, Background, Controls } from "reactflow";
import 'reactflow/dist/style.css';
import { useSelector } from "react-redux";

const GraphContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

// 🟢 노드 깊이 계산 함수
const calculateDepth = (nodes, nodeId) => {
  let depth = 0;
  let currentNode = nodes[nodeId];
  while (currentNode && currentNode.parent) {
    currentNode = nodes[currentNode.parent];
    depth += 1;
  }
  return depth;
};

// 🟢 Depth별로 노드 개수를 카운팅하여 위치 계산
const calculatePosition = (depth, index, siblingCount, depthCounts) => {
  const spacingX = 350;
  const spacingY = 150;
  const nextDepthHeight = (depthCounts[depth + 1] || 0) * spacingY;
  const yOffset = Math.max((index - (siblingCount - 1) / 2) * spacingY, nextDepthHeight);
  const xOffset = depth * spacingX;
  return { x: xOffset, y: yOffset };
};

function Graph() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const nodesData = useSelector((state) => state.node.nodes) || {};
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 🟢 Depth별 노드 개수 카운트
  const depthCounts = {};

  useEffect(() => {
    const updatedNodes = Object.values(nodesData).map((node) => {
      const depth = calculateDepth(nodesData, node.id);

      if (!depthCounts[depth]) depthCounts[depth] = 0;
      const nodeIndex = depthCounts[depth];
      depthCounts[depth] += 1;

      const position = calculatePosition(depth, nodeIndex, depthCounts[depth], depthCounts);

      return {
        id: node.id,
        data: { label: node.keyword },
        position: position,
        sourcePosition: "right",
        targetPosition: "left",
        style: {
          background: node.id === "root" ? "#ffcc00" : "#d9d9d9",
          borderRadius: 20,
          padding: 10,
          border: "1px solid #555",
        },
      };
    });

    const updatedEdges = Object.values(nodesData)
      .filter((node) => node.parent !== null && nodesData[node.parent])
      .map((node) => ({
        id: `${node.parent}-${node.id}`,
        source: node.parent,
        target: node.id,
        label: node.relation || "관련",
        type: "straight",
        animated: true,
      }));

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [nodesData]);

  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge({ ...params, animated: true }, els)),
    []
  );

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <GraphContainer ref={containerRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
        style={{ background: "#f0f0f0" }}
      >
        <Background gap={16} size={0.5} color="#aaa" />
        <Controls />
      </ReactFlow>
    </GraphContainer>
  );
}

export default Graph;
