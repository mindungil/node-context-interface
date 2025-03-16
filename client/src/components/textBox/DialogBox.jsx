import React, { useEffect } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown'; 
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 
import { COLORS } from "../../styles/colors.jsx";

const Container = styled.div`
    display: flex;
    flex-direction: row; 
    justify-content: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')}; 
    margin: 10px;
`;

const MessageBubble = styled.div`
    display: flex;
    flex-direction: column;
    padding: 1px 20px;
    margin: 10px 0px;
    border-radius: ${(props) => (props.isUser ? '30px 30px 0px 30px' : '0px 30px 30px 30px')};
    background-color: ${(props) => (props.isUser ? '#f5f5f5' : '#fff')};
    border: ${(props) => (props.isUser ? 'none' : '1px solid rgba(217, 217, 217, 0.5)')};
    word-wrap: break-word;
    text-align: ${(props) => (props.isUser ? 'right' : 'left')};
`;

const LabelContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center; 
`
const Label = styled.div`
    font-size: 14px;
    color: ${COLORS.basic_font};
`;

const checkpoints = [
    { step: 1, label: "RSA 암호화 방법", active: true },
    { step: 2, label: "소수의 곱", active: true },
    { step: 3, label: "오일러 토션트 함수", active: true },
    { step: 4, label: "공개 키 생성", active: true },
    { step: 5, label: "비밀 키 생성", active: true },
    { step: 6, label: "RSA를 통한 암호화", active: true },
];

const DialogBox = ({ text, isUser, isStep }) => {
    return (
        <Container isUser={isUser}>
        <MessageBubble isUser={isUser}>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {text}
          </ReactMarkdown>
        </MessageBubble>
      </Container>
    );
};

export default DialogBox;
