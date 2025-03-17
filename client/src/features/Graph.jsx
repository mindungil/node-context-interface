import React, { useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import ForceGraph2D from "react-force-graph-2d";
import { useSelector } from "react-redux";
import * as d3 from "d3";

const GraphContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

function Graph() {
  const graphRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const nodesData = useSelector((state) => state.node.nodes) || {};

  // 🟢 Graph Data 변환
  const graphData = useMemo(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    const nodes = Object.values(nodesData).map((node) => ({
      id: node.id,
      name: node.keyword,
      type: node.id === "root" ? "root" : "node",
      x: node.id === "root" ? centerX : node.x ?? Math.random() * 800,
      y: node.id === "root" ? centerY : node.y ?? Math.random() * 500,
    }));

    const links = Object.values(nodesData)
      .filter((node) => node.parent !== null && nodesData[node.parent])
      .map((node) => ({
        source: node.parent,
        target: node.id,
        relation: node.relation || "관련",
      }));

    return { nodes, links };
  }, [nodesData, dimensions]);

  // 🟢 창 크기 변경 감지하여 그래프 크기 업데이트
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });

        if (graphRef.current) {
          graphRef.current.zoomToFit(500, 50);
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 🟢 d3Force 설정 (트리 형태로 정렬)
  useEffect(() => {
    if (graphRef.current) {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      graphRef.current
        .d3Force("charge", d3.forceManyBody().strength(-250)) // 노드 간 거리 확장
        .d3Force("link", d3.forceLink().distance(150).strength(1)) // 간선 거리 증가
        .d3Force("collide", d3.forceCollide(50)) // 충돌 방지
        .d3Force("radial", d3.forceRadial(200, centerX, centerY)) // 🔥 트리 구조로 배치
        .d3Force("center", d3.forceCenter(centerX, centerY));
    }
  }, [graphData, dimensions]);

  // 🟢 Root 노드를 항상 화면 중앙에 배치
  useEffect(() => {
    if (graphRef.current) {
      setTimeout(() => {
        graphRef.current.centerAt(dimensions.width / 2, dimensions.height / 2, 1000);
        graphRef.current.zoom(1);
      }, 500);
    }
  }, [graphData, dimensions]);

  return (
    <GraphContainer ref={containerRef}>
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeAutoColorBy="id"
          linkColor={() => "rgba(200,200,200,0.5)"}
          linkWidth={1.5}
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          nodeRelSize={8}
          onNodeDragEnd={(node) => {
            console.log(`${node.id} 이동됨: (${node.x}, ${node.y})`);
          }}
          // 🔹 간선의 라벨을 표시
          linkCanvasObjectMode={() => "after"}
          linkCanvasObject={(link, ctx, globalScale) => {
            const label = link.relation;
            if (!label) return;

            const fontSize = Math.max(14 / globalScale, 8);
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = "rgba(50, 50, 50, 0.9)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const midX = (link.source.x + link.target.x) / 2;
            const midY = (link.source.y + link.target.y) / 2;

            ctx.fillText(label, midX, midY);
          }}
          // 🔹 노드 스타일링
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = Math.max(16 / globalScale, 10);
            const paddingX = 20;
            const paddingY = 10;
            const textWidth = ctx.measureText(label).width;
            const nodeWidth = textWidth + paddingX * 2;
            const nodeHeight = fontSize + paddingY * 2;
            const borderRadius = nodeHeight / 2;

            ctx.fillStyle = node.type === "root" ? "#ffcc00" : "white"; // 🔥 Root는 노란색
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(node.x - nodeWidth / 2, node.y - nodeHeight / 2, nodeWidth, nodeHeight, borderRadius);
            ctx.fill();
            ctx.stroke();

            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y);
          }}
          d3AlphaDecay={0.05}
          d3VelocityDecay={0.5}
        />
      ) : (
        <p>No Data</p>
      )}
    </GraphContainer>
  );
}

export default Graph;
