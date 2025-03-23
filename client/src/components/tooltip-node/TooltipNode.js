import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import styled from "styled-components";

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NodeContent = styled.div`
  padding: 10px 20px;
  border-radius: 20px;
  background: ${(props) => (props.isActive ? "#48BB78" : "#d9d9d9")};
  color: ${(props) => (props.isActive ? "#fff" : "#000")};
  text-align: center;
  border: ${(props) => (props.isActive ? "2px solid #48BB78" : "1px solid #555")};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
`;


const TooltipText = styled.div`
  visibility: hidden;
  width: 120px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
  white-space: nowrap;

  ${TooltipContainer}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

const TooltipNode = ({ data }) => {
  return (
    <TooltipContainer>
      <NodeContent isActive={data.isActive}>
        {data.label}
      </NodeContent>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </TooltipContainer>
  );
};

export default memo(TooltipNode);
