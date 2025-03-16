import React, { useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import ForceGraph2D from "react-force-graph-2d";
import { useSelector } from "react-redux";

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
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  // 🔹 Redux에서 nodes 가져오기
  const nodesData = useSelector((state) => state.node.nodes) || {};

  // 🔹 nodes를 그래프 데이터로 변환 (랜덤 초기 좌표 추가)
  const graphData = useMemo(() => {
    const nodes = Object.values(nodesData).map((node) => ({
      id: node.id,
      name: node.keyword,
      val: 10,
      x: node.x ?? Math.random() * 500, // 랜덤 위치 설정
      y: node.y ?? Math.random() * 500, // 랜덤 위치 설정
    }));

    const links = Object.values(nodesData)
      .filter((node) => node.parent !== null && nodesData[node.parent]) // 부모가 있는 노드만 처리
      .map((node) => ({
        source: node.parent,
        target: node.id,
      }));

    return { nodes, links };
  }, [nodesData]);

  // 🔹 창 크기 변경 감지하여 그래프 크기 업데이트
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
        
        // 🔥 그래프가 축소된 상태에서 고정되는 문제 해결
        if (graphRef.current) {
          graphRef.current.zoomToFit(500, 50); // 그래프를 다시 맞춤
        }
      }
    };

    // 초기 크기 설정
    updateSize();

    // 윈도우 크기 변경 이벤트 리스너 추가
    window.addEventListener("resize", updateSize);
    
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <GraphContainer ref={containerRef}>
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData} // 🔹 Redux에서 변환된 데이터 적용
          nodeAutoColorBy="id"
          linkColor={() => "rgba(200,200,200,0.5)"}
          linkWidth={1.5}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = Math.max(12 / globalScale, 8);
            const padding = 6;
            const textWidth = ctx.measureText(label).width;
            const nodeWidth = textWidth + padding * 2;
            const nodeHeight = fontSize + padding * 2;

            ctx.fillStyle = "white";
            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(node.x - nodeWidth / 2, node.y - nodeHeight / 2, nodeWidth, nodeHeight, 10);
            ctx.fill();
            ctx.stroke();

            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y);
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            const label = node.name;
            const padding = 6;
            const textWidth = ctx.measureText(label).width;
            const nodeWidth = textWidth + padding * 2;
            const nodeHeight = 20;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(node.x - nodeWidth / 2, node.y - nodeHeight / 2, nodeWidth, nodeHeight, 10);
            ctx.fill();
          }}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      ) : (
        <p>No Data</p>
      )}
    </GraphContainer>
  );
}

export default Graph;
