require('dotenv').config();
const express = require('express');
const path = require('path'); 
const OpenAI = require('openai');
const cors = require('cors'); 
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.static(path.join(__dirname, 'public')));

// 🚀 mongodb 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ Mongodb 연결 실패', err))

// 🟢 재시도 함수 - 응답 비어있을 때도 재시도
async function retryRequest(callback, maxRetries = 5) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const response = await callback();
      const gptResult = response?.choices?.[0]?.message?.content?.trim();
      
      // 응답 비어 있는 경우 다시 요청
      if (!gptResult) {
        throw new Error("GPT 응답이 비어 있음 - 재시도");
      }

      return response;
    } catch (error) {
      attempts++;
      console.error(`❌ 재시도 중... (${attempts}/${maxRetries}) - 오류: ${error.message}`);
      if (attempts >= maxRetries) throw error;
    }
  }
}

app.post('/api/chat', async (req, res) => {  
  const userPrompt = req.body.message;  
  const previousMessages = req.body.history || [];  

  try {
    const response = await retryRequest(() => openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: "system", 
          content: "사용자의 질문에 대한 답변을 해줘"
        },
        ...previousMessages,
        { role: 'user', content: userPrompt },
        { 
          role: "system", 
          content: "사용자의 질문과 너의 답변을 기반으로 관련된 키워드를 단 1개만 추출해서 JSON 형식으로 반환해줘. JSON 형식 예시는 다음과 같습니다:\n\n```json\n{\n  \"response\": \"GPT의 답변 내용\",\n  \"keyword\": \"키워드\"\n}\n```"
        }
      ],
      max_tokens: 800,
      response_format: { type: "json_object" } 
    }));

    const gptResult = response.choices[0].message.content;
    
    // 🔥 응답이 비어 있는 경우 강제 재시도
    if (!gptResult) {
      console.error("❗️ GPT 응답이 비어 있음! 재시도...");
      throw new Error("Empty response from GPT");
    }

    const parsedResult = JSON.parse(gptResult); 
    const gptResponse = parsedResult.response;
    const keyword = parsedResult.keyword; 

    console.log('✅ GPT Result:', gptResult);
    console.log('✅ Keyword:', keyword);

    res.json({ message: gptResponse, keyword });
     
  } catch (error) {
    console.error('❌ Error generating response:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/update-graph', async (req, res) => {  
  const { nodes, keyword, userMessage, gptMessage } = req.body;  
  const safeNodes = nodes || {};
  const existingKeywords = Object.values(safeNodes).map(node => node.keyword);

  console.log('📌 업데이트 요청 받음');
  console.log('📋 현재 노드 목록:', existingKeywords);

 // 🔥 노드 데이터 전체 출력
 console.log('🗺️ 전달된 노드 데이터:', JSON.stringify(safeNodes, null, 2));

  try {
    const response = await retryRequest(() => openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `
          1. 사용자의 대화 맥락을 고려하여 새로운 키워드(${keyword})가 어디에 연결되어야 하는지 판단해줘.
          2. 기존 노드 중 대화 맥락 상 가장 연관성이 높은 노드를 부모 노드로 선택해야 해.
          3. 부모-자식 간의 관계(온톨로지)를 설정해줘. 하지만 관계는 한 단어 또는 짧은 구로만 표현해야 해.
        `},
        { role: 'user', content: `현재 그래프 상태: ${JSON.stringify(safeNodes)}` },
        { role: 'user', content: `현재 존재하는 노드 목록: ${JSON.stringify(existingKeywords)}` },
        { role: 'user', content: `최근 대화 키워드: ${JSON.stringify({ keyword, userMessage, gptMessage })}` },
        { role: 'user', content: `반드시 JSON 형식으로 응답하세요.
          ✅ 올바른 JSON 응답 예시:
          \`\`\`json
          {
            "parentNodeId": "art-1",
            "relation": "작품"
          }
          \`\`\`
        ` }
      ],
      max_tokens: 800,
      temperature: 0.2,
      response_format: { type: "json_object" } 
    }));

    console.log("\n📝 [GPT 응답 원본 - /api/update-graph]:", response.choices[0].message.content);
     
    let gptResult = response.choices[0]?.message?.content?.trim();
    
    if (!gptResult) {
      console.error("❌ GPT 응답이 비어 있음! 재시도 중...");
      throw new Error("Empty GPT response");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(gptResult);
    } catch (parseError) {
      console.error("❌ JSON 파싱 오류:", parseError);
      throw new Error("GPT 응답을 JSON으로 변환하는 중 오류 발생");
    }

    let parentNodeId = parsedResult.parentNodeId?.trim() || "root";
    let relation = parsedResult.relation?.trim() || "관련";

    if (!Object.keys(safeNodes).includes(parentNodeId)) {
      parentNodeId = Object.keys(safeNodes).find(key => keyword.includes(safeNodes[key].keyword)) || "root";
    }

    console.log(`✅ 선택된 부모 노드: ${parentNodeId}, 관계: ${relation}`);
    
    res.json({ parentNodeId, relation });
    
  } catch (error) {
    console.error("❌ Error in Graph Update:", error);
    res.status(500).json({ error: "서버 내부 오류 발생" });
  }
});

app.listen(8080, function () {
  console.log('🚀 Server is listening on port 8080');
});
