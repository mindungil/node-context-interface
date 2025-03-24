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
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 6px 15px 6px 12px;
  background: ${(props) => (props.active ? "#AA89DB" : "#ffffff")};
  color: ${(props) => (props.active ? "#fff" : "#000")};
  border: 1px solid ${(props) => (props.active ? "#AA89DB" : "#D9D9D9")};
  border-radius: 100px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  gap: 7px;

  &:hover {
    background: ${(props) => (props.active ? "#B693EA" : "#eee")};
  }

  .material-symbols-outlined {
    color: ${(props) => (props.active ? "#fff" : "#000")}; /* 아이콘 색상도 active에 따라 변경 */
  }
`;

const ButtonGroup = () => {
  const dispatch = useDispatch();
  const linearMode = useSelector((state) => state.mode.linearMode);
  const treeMode = useSelector((state) => state.mode.treeMode);
  const nodeMode = !linearMode && !treeMode;

  const handleLinearToggle = () => {
    dispatch(toggleLinearMode());
  };

  const handleTreeToggle = () => {
    dispatch(toggleTreeMode());
  };

  const handleNodeToggle = () => {
    if (linearMode) dispatch(toggleLinearMode());
    if (treeMode) dispatch(toggleTreeMode());
  };

  return (
    <ButtonGroupContainer>
      <ModeButton onClick={handleLinearToggle} active={linearMode}>
        <span className="material-symbols-outlined md-black-font md-18">
          diagonal_line
        </span>
        Line
      </ModeButton>
      <ModeButton onClick={handleTreeToggle} active={treeMode}>
        <span className="material-symbols-outlined md-black-font md-18">
          graph_1
        </span>
        Tree
      </ModeButton>
      <ModeButton onClick={handleNodeToggle} active={nodeMode}>
        <span className="material-symbols-outlined md-black-font md-18">
          scatter_plot
        </span>
        Node
      </ModeButton>
    </ButtonGroupContainer>
  );
};

export default ButtonGroup;
