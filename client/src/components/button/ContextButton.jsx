import React from "react";
import styled from "styled-components";

const ButtonGroupContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 10;
`;

const ModeButton = styled.div`
  padding: 5px 10px;
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #eee;
  }
`;

const ButtonGroup = () => {
  return (
    <ButtonGroupContainer>
      <ModeButton>Linear</ModeButton>
      <ModeButton>Tree</ModeButton>
      <ModeButton>Node</ModeButton>
    </ButtonGroupContainer>
  );
};

export default ButtonGroup;
