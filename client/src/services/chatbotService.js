import axios from 'axios';
import { addKeyword } from "../redux/slices/keywordSlice";  

export const sendMessageToApi = async (input, previousMessages, dispatch) => {
    console.log("📌 전체 답벼는");
  try {
    const response = await axios.post('http://localhost:8080/api/chat', {
      message: input,
      history: previousMessages 
    });
    const { message, keyword } = response.data; 

    if (keyword) {
      console.log("📌 Redux에 추가될 키워드:", keyword); 
      dispatch(addKeyword(keyword)); 
    }

    return message; 
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};






