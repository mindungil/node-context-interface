require('dotenv').config();
const express = require('express');
const path = require('path'); 
const OpenAI = require('openai');
const cors = require('cors'); 

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {  
  const userPrompt = req.body.message;  
  const previousMessages = req.body.history || [];  

  console.log('User Message:', userPrompt);
  console.log('Previous Messages:', previousMessages);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        ...previousMessages,  
        { role: 'user', content: userPrompt },
        { 
          role: "system", 
          content: "사용자의 질문과 GPT의 답변을 기반으로 관련된 키워드를 단 1개만 추출해서 JSON 형식으로 반환해 주세요. JSON 형식 예시는 다음과 같습니다:\n\n```json\n{\n  \"response\": \"GPT의 답변 내용\",\n  \"keyword\": \"키워드\"\n}\n```"
        }
      ],
      max_tokens: 800,
      response_format: { type: "json_object" } 
    });

    const gptResult = response.choices[0].message.content;
    const parsedResult = JSON.parse(gptResult); 
    const gptResponse = parsedResult.response;
    const keyword = parsedResult.keyword; 
    console.log('GPT Result:', gptResult);
    console.log('keyword:', keyword);

    res.json({ message: gptResponse, keyword});
     
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(8080, function () {
  console.log('Server is listening on port 8080');
});
