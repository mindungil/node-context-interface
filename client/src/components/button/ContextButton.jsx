import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { toggleLinearMode, toggleTreeMode } from "../../redux/slices/modeSlice";

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
  const dispatch = useDispatch();
  const linearMode = useSelector((state) => state.mode.linearMode);
  const treeMode = useSelector((state) => state.mode.treeMode);
  
  const handleLinearToggle = () => {
    dispatch(toggleLinearMode());
  };

  const handleTreeToggle = () => {
    dispatch(toggleTreeMode());
  };
  
  return (
    <ButtonGroupContainer>
      <ModeButton onClick={handleLinearToggle}>
        {linearMode ? "Linear (On)" : "Linear (Off)"}
      </ModeButton>
      <ModeButton onClick={handleTreeToggle}>
        {treeMode ? "Tree (On)" : "Tree (Off)"}
      </ModeButton>
      <ModeButton>Node</ModeButton>
    </ButtonGroupContainer>
  );
  
};

export default ButtonGroup;
