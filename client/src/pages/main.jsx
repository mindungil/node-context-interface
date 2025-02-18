import React from 'react';
import styled from 'styled-components';
import Chatbot from "../features/Chatbot.jsx";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
`;

const ChatSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  flex: 1;
`;

const ChatContainer = styled.div`
  display: flex;
  width: 900px;
  height: 80%;
`;

function Main() {
  return (
    <Container>
      <ChatSection>
        <ChatContainer>
          <Chatbot/>
        </ChatContainer>
      </ChatSection>
    </Container>
  );
}

export default Main;