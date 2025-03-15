import React, { useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import ForceGraph2D from "react-force-graph-2d";
import { useSelector } from "react-redux";

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

  // 🔹 Redux에서 nodes 가져오기
  const nodesData = useSelector((state) => state.node.nodes) || {};

  // 🔹 nodes를 그래프 데이터로 변환
  const graphData = useMemo(() => {
    const nodes = Object.values(nodesData).map((node) => ({
      id: node.id,
      name: node.keyword,
      val: 10, // 노드 크기 조정
    }));

    const links = Object.values(nodesData)
      .filter((node) => node.parent)
      .map((node) => ({
        source: node.parent,
        target: node.id,
      }));

    return { nodes, links };
  }, [nodesData]);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }

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
