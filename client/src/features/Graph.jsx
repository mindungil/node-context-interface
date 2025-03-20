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

// 🟢 부모 노드의 위치를 안전하게 가져오는 함수
const getParentPosition = (nodes, parentId) => {
  const parentNode = nodes.find((node) => node.id === parentId);
  return parentNode ? parentNode.position : { x: 0, y: 0 };
};

// 🟢 깊이 계산 함수
const calculateDepth = (nodes, nodeId) => {
  let depth = 0;
  let currentNode = nodes[nodeId];
  while (currentNode && currentNode.parent) {
    currentNode = nodes[currentNode.parent];
    depth += 1;
  }
  return depth;
};

// 🟢 대칭 배치 계산 함수
const calculatePosition = (parentPos, index, siblingCount) => {
  const spacingX = 350;
  const spacingY = 150;
  const centerY = parentPos.y;

  // 부모 기준 대칭 위치 계산
  let yOffset = 0;
  if (siblingCount > 1) {
    yOffset = ((siblingCount - 1) / 2 - index) * spacingY; // 최신 노드가 상단에 위치하도록 수정
  }

  // 부모 노드의 Y 좌표 기준으로 정렬
  const finalY = centerY + yOffset;

  return { x: parentPos.x + spacingX, y: finalY };
};

function Graph() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const nodesData = useSelector((state) => state.node.nodes) || {};
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
        updatedNodes.push({
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
        type: "bezier",  // 🟢 간선을 곡선 형태로 변경
        animated: true,
        style: {
          strokeWidth: 2,      // 🟢 간선 두께
          stroke: "#48BB78",   // 🟢 초록색 기본
        },
        labelStyle: { fill: "#333", fontWeight: 600 },  // 🟢 레이블 스타일
        markerEnd: {
          type: "arrowclosed", // 🟢 화살표 모양
          color: "#48BB78",
        },
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
