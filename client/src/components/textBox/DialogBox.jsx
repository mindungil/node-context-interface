import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown'; 
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 
import { COLORS } from "../../styles/colors.jsx";
import { useSelector } from "react-redux";

const Container = styled.div`
    display: flex;
    flex-direction: row; 
    justify-content: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')}; 
    margin: 10px;
    position: relative;
`;

const Circle = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #d9d9d9;
    margin-bottom: 2px;
`;

const Line = styled.div`
    width: 2px;
    flex-grow: 1;
    background-color: #d9d9d9;
`;

const MessageBubble = styled.div`
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
    margin: 10px 0px;
    border-radius: ${(props) => (props.isUser ? '30px 30px 0px 30px' : '0px 30px 30px 30px')};
    background-color: ${(props) => {
        if (props.isActive) {
          if (props.isUser) {
            return props.isScrolled
                ? `${props.activeColor}88` // 53%
                : `${props.activeColor}66`; // 40%
          } else {
            return props.isScrolled
            ? `${props.activeColor}05` // AI: 적당히 투명하게
            : `${props.activeColor}05`; // 덜 강조
            }
        }
    
        if (props.isContextMode) {
          return props.isUser ? 'rgba(240, 240, 240, 0.5)' : 'transparent';
        }
    
        return props.isUser ? '#f5f5f5' : '#fff';
      }};
    color: '#343942'; 
    opacity: ${(props) => (props.isContextMode && !props.isActive ? 0.3 : 1)};
    border: ${(props) => {
        if (!props.isUser && props.isActive) {
          const color = props.activeColor || '#2C7A7B';
          return `1.5px solid ${color}88`; // 🔥 53% 투명도
        }
        return props.isUser ? 'none' : '1px solid rgba(217, 217, 217, 0.5)';
      }};
    word-wrap: break-word;
    text-align: ${(props) => (props.isUser ? 'right' : 'left')};
    transition: all 0.3s ease;
    transform: ${(props) => (props.isActive && props.isScrolled ? 'scale(1.05)' : 'scale(1)')};
    box-shadow: ${(props) => (props.isActive && props.isScrolled ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none')};
`;

const LabelContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;
`;

const Label = styled.div`
    font-size: 14px;
    color: ${COLORS.basic_font};
`;

const DialogBox = ({ text, isUser, nodeId, number }) => {
    const nodes = useSelector((state) => state.node.nodes); // 🔥 모든 노드 정보
    const activeDialogNumbers = useSelector((state) => state.node.activeDialogNumbers);
    const currentScrolledDialog = useSelector((state) => state.node.currentScrolledDialog);
    const contextMode = useSelector((state) => state.mode.contextMode);
    const nodeColors = useSelector((state) => state.node.nodeColors);

    const isActive = activeDialogNumbers.includes(number);
    const isScrolled = currentScrolledDialog === number;

    // 🔥 nodeId가 주어졌더라도 항상 역추적해서 실제 nodeId로 덮어씌움
    let actualNodeId = "root";
    Object.entries(nodes).forEach(([id, node]) => {
        Object.keys(node.dialog).forEach((dialogNumStr) => {
            const dialogNum = Number(dialogNumStr);
            const questionNum = (dialogNum - 1) * 2 + 1;
            const answerNum = (dialogNum - 1) * 2 + 2;
            if (number === questionNum || number === answerNum) {
                actualNodeId = id;
            }
        });
    });

    const activeColor = nodeColors[actualNodeId];

    console.log("🎯 nodeId:", actualNodeId);
    console.log("🎯 activeColor:", activeColor);
    console.log("🎯 nodeColors:", nodeColors);

    return (
        <Container isUser={isUser}>
            <MessageBubble isUser={isUser} isActive={isActive} isScrolled={isScrolled} isContextMode={contextMode} activeColor={activeColor}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {text}
                </ReactMarkdown>
            </MessageBubble>
            {/* <LineContainer>
                {isUser && <Circle />}
                <Line />
            </LineContainer> */}
        </Container>
    );
};

export default DialogBox;
