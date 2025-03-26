import React from "react";
import styled from "styled-components";
import { COLORS } from "../../styles/colors";
import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";

// 🔥 스타일 컴포넌트
const EdgeLabelContainer = styled.div`
  position: absolute;
  background-color: #fcfcfc;
  padding: 2px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.black_font};
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transform: translate(-50%, -50%);
`;

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  label,
  markerEnd,
}) => {
  // 베지어 경로와 중앙점 계산
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <EdgeLabelContainer
          style={{
            left: `${labelX}px`,
            top: `${labelY}px`,
          }}
        >
          {label}
        </EdgeLabelContainer>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
