import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux"; 
import { sendMessageToApi } from "../services/chatbotService.js";
import DialogBox from "../components/textBox/DialogBox.jsx";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const MessagesContainer = styled.div`
  flex: 1;
  width: 100%;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: none;
`;

const InputContainer = styled.div`
  display: flex;
  width: 80%;
  height: 40px;
  align-items: center;
  justify-content: center;
  padding: 5px 13px 5px 20px;
  border-radius: 100px;
  background-color: #f0f0f0;
`;

const Input = styled.input`
  height: 20px;
  flex: 1;
  border: none;
  background-color: #f0f0f0;
  margin-right: 10px;
  font-size: 16px;
  font-family: "Pretendard";

  &:focus {
    outline: none;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 50%;
  background-color: #486055;
  cursor: pointer;
`;

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    console.log("실행됨");

    const userMessage = { role: "user", content: input, isStep: null };
    let updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");

    try {
      const gptMessageContent = await dispatch(sendMessageToApi(input, updatedMessages));

      console.log("호출후응답")
      const gptMessage = { role: "assistant", content: gptMessageContent, isStep: null };
      updatedMessages = [...updatedMessages, gptMessage];

      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <DialogBox key={index} text={msg.content} isUser={msg.role === "user"} />
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메세지 입력하기"
        />
        <Button onClick={handleSend}>
          <span className="material-symbols-outlined md-white md-24">arrow_upward</span>
        </Button>
      </InputContainer>
    </ChatContainer>
  );
}

export default Chatbot;
