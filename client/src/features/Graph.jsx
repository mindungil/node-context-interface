import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import ForceGraph2D from "react-force-graph-2d";

const GraphContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

function Graph() {
  const graphRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
    // Resize 이벤트 감지
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const data = {
    nodes: [
      { id: "node1", name: "ML 수업 설명 요청", val: 12 },
      { id: "node2", name: "선형 분리", val: 8 },
      { id: "node3", name: "Hard margin SVM", val: 10 },
    ],
    links: [
      { source: "node1", target: "node2" },
      { source: "node2", target: "node3" },
    ],
  };

  return (
    <GraphContainer ref={containerRef}>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeAutoColorBy="id"
        linkColor={() => "rgba(200,200,200,0.5)"} // 🔹 링크 색상 변경
        linkWidth={1.5} // 🔹 선 굵기 조절
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = Math.max(12 / globalScale, 8);
          const padding = 6;
          const textWidth = ctx.measureText(label).width;
          const nodeWidth = textWidth + padding * 2;
          const nodeHeight = fontSize + padding * 2;
          
          // 🔹 둥근 노드 배경
          ctx.fillStyle = "white";
          ctx.strokeStyle = "rgba(0,0,0,0.1)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(node.x - nodeWidth / 2, node.y - nodeHeight / 2, nodeWidth, nodeHeight, 10);
          ctx.fill();
          ctx.stroke();

          // 🔹 텍스트 스타일 적용
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
    </GraphContainer>
  );
}

export default Graph;
