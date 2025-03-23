import React from 'react';
import styled from 'styled-components';
import DialogBox from './DialogBox';

const DialogPairContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    margin: 20px 0;
`;

const LineContainer = styled.div`
    position: absolute;
    right: -15px;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
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

const DialogPair = ({ question, answer }) => {
    return (
        <DialogPairContainer>
            <DialogBox text={question} isUser={true} />
            <DialogBox text={answer} isUser={false} />
            <LineContainer>
                <Circle />
                <Line />
            </LineContainer>
        </DialogPairContainer>
    );
};

export default DialogPair;
