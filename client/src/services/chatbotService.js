import axios from 'axios';
import { addOrUpdateNode } from "../redux/slices/nodeSlice";

export const sendMessageToApi = async (input, previousMessages, dispatch) => {
  try {
    const response = await axios.post('http://localhost:8080/api/chat', {
      message: input,
      history: previousMessages
    });

    const { message, keyword } = response.data;

    if (keyword) {
      console.log("📌 Redux 업데이트: keyword:", keyword);
      
      dispatch(addOrUpdateNode({
        keyword,
        userMessage: input,
        gptMessage: message
      }));
    }

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};




