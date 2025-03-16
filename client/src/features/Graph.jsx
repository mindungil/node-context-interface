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
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // 🔹 Redux에서 nodes 가져오기
  const nodesData = useSelector((state) => state.node.nodes) || {};

  // 🔹 nodes를 그래프 데이터로 변환 (랜덤 초기 좌표 추가)
  const graphData = useMemo(() => {
    const nodes = Object.values(nodesData).map((node) => ({
      id: node.id,
      name: node.keyword,
      val: 10,
      x: node.x ?? Math.random() * 800,
      y: node.y ?? Math.random() * 400,
    }));

    const links = Object.values(nodesData)
      .filter((node) => node.parent !== null && nodesData[node.parent])
      .map((node) => ({
        source: node.parent,
        target: node.id,
        relation: node.relation || "관련",
      }));

    return { nodes, links };
  }, [nodesData]);

  // 🔹 창 크기 변경 감지하여 그래프 크기 업데이트
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

  // 🔹 d3Force 설정 (노드 간 거리 조정 + 충돌 방지)
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("charge", d3.forceManyBody().strength(-600)); // 🔹 노드 간 거리 증가
      graphRef.current.d3Force("link", d3.forceLink().distance(100)); // 🔹 간선 길이 증가
      graphRef.current.d3Force("collide", d3.forceCollide(50)); // 🔹 노드 간 충돌 방지
    }
  }, [graphData]);

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
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = Math.max(16 / globalScale, 10);
            const paddingX = 20; // 🔹 좌우 패딩 조정
            const paddingY = 10; // 🔹 상하 패딩 조정
            const textWidth = ctx.measureText(label).width;
            const nodeWidth = textWidth + paddingX * 2;
            const nodeHeight = fontSize + paddingY * 2;
            const borderRadius = nodeHeight / 2; // 🔹 캡슐 형태 유지

            ctx.fillStyle = "white";
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
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.6}
        />
      ) : (
        <p>No Data</p>
      )}
    </GraphContainer>
  );
}

export default Graph;
