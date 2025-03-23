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

const LineContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    right: -15px;
    top: 0;
    bottom: 0;
    height: 100%;
    justify-content: flex-start;
    align-items: center;
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
    padding: 10px 20px;
    margin: 10px 0px;
    border-radius: ${(props) => (props.isUser ? '30px 30px 0px 30px' : '0px 30px 30px 30px')};
    background-color: ${(props) => (props.isActive ? '#48BB78' : (props.isUser ? '#f5f5f5' : '#fff'))};
    color: ${(props) => (props.isActive ? '#fff' : '#000')};
    border: ${(props) => (props.isUser ? 'none' : '1px solid rgba(217, 217, 217, 0.5)')};
    word-wrap: break-word;
    text-align: ${(props) => (props.isUser ? 'right' : 'left')};
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
    const activeDialogNumbers = useSelector((state) => state.node.activeDialogNumbers);

// 🔥 대화 번호가 활성화 목록에 있는지 확인
const isActive = activeDialogNumbers.includes(number)

console.log("📝 DialogBox - 받은 대화 번호:", number);  // ✅ 콘솔 추가
console.log("📝 DialogBox - 활성화 여부:", isActive);  // ✅ 콘솔 추가

    return (
        <Container isUser={isUser}>
            <MessageBubble isUser={isUser} isActive={isActive}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {text}
                </ReactMarkdown>
            </MessageBubble>
            <LineContainer>
                {isUser && <Circle />}
                <Line />
            </LineContainer>
        </Container>
    );
};

export default DialogBox;

