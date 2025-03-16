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

  // console.log('User Message:', userPrompt);
  // console.log('Previous Messages:', previousMessages);

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

app.post('/api/update-graph', async (req, res) => {  
  const { nodes, history, keyword, userMessage, gptMessage } = req.body;  

  const safeNodes = nodes || {};
  const existingKeywords = Object.values(safeNodes).map(node => node.keyword);

  console.log('📌 그래프 업데이트 요청 받음');
  console.log('현재 노드 목록:', existingKeywords);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `
          1. 사용자의 대화 맥락을 고려하여 새로운 키워드가 어디에 연결되어야 하는지 판단해줘.
          2. 기존 노드 중 가장 연관성이 높은 노드를 부모 노드로 선택해야 해.
          3. 부모 노드의 ID만 단순한 텍스트로 반환하고, 다른 설명은 포함하지 마.
        `},
        { role: 'user', content: `현재 그래프 상태: ${JSON.stringify(safeNodes)}` },
        { role: 'user', content: `현재 존재하는 노드 목록: ${JSON.stringify(existingKeywords)}` },
        { role: 'user', content: `최근 대화 키워드: ${JSON.stringify({ keyword, userMessage, gptMessage })}` },
        { role: 'user', content: "새로운 노드를 연결할 부모 노드의 ID만 반환해." }
      ],
      max_tokens: 50
    });

    let parentNodeId = response.choices[0].message.content.trim();

    // ✅ parentNode가 기존 노드 목록에 없으면 자동 보정
    if (!Object.keys(safeNodes).includes(parentNodeId)) {
      parentNodeId = Object.keys(safeNodes).find(key => keyword.includes(safeNodes[key].keyword)) || "root";
    }

    console.log(`✅ 선택된 부모 노드: ${parentNodeId}`);
    
    res.send(parentNodeId);
    
  } catch (error) {
    console.error('Error in Graph Update:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(8080, function () {
  console.log('Server is listening on port 8080');
});
