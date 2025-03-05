import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import ForceGraph2D from 'react-force-graph-2d';

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
      { id: "node1", name: "Node 1", val: 10 },
      { id: "node2", name: "Node 2", val: 8 },
      { id: "node3", name: "Node 3", val: 12 },
    ],
    links: [
      { source: "node1", target: "node2" },
      { source: "node2", target: "node3" },
      { source: "node3", target: "node1" },
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
        linkDirectionalParticles={2}
        nodeLabel="name"
      />
    </GraphContainer>
  );
}

export default Graph;