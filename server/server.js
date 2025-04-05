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
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: "system", 
          content: "사용자의 질문에 대한 답변을 해줘"
        },
        ...previousMessages,
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 800,
    }));

    const gptResponse = response.choices[0].message.content;
    
    // 🔥 응답이 비어 있는 경우 강제 재시도
    if (!gptResponse) {
      console.error("❗️ GPT 응답이 비어 있음! 재시도...");
      throw new Error("Empty response from GPT");
    }

    res.json({ message: gptResponse});
     
  } catch (error) {
    console.error('❌ Error generating response:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/update-graph', async (req, res) => {  
  const { nodes, userMessage, gptMessage } = req.body;  
  const safeNodes = nodes || {};
  const existingKeywords = Object.values(safeNodes).map(node => node.keyword);

  console.log('📌 업데이트 요청 받음');
  console.log('📋 현재 노드 목록:', existingKeywords);
  console.log('🗺️ 전달된 노드 데이터:', JSON.stringify(safeNodes, null, 2));

  try {
    const response = await retryRequest(() => openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
          다음 정보를 기반으로 사용자의 대화 키워드도 추출하고,
          그래프 업데이트 정보를 생성하세요.

          1. 대화 기반으로 관련된 키워드 1개만 JSON 형태로 추출하세요.
          2. 그래프 내 어디에 연결되어야 할지 판단하고, 가장 연관된 부모 노드를 찾아 관계도 설정하세요.
          3. 관계는 한 단어 또는 짧은 구로 표현하세요.

          반드시 아래 형식으로 응답하세요:
          \`\`\`json
          {
            "keyword": "추출된 키워드",
            "parentNodeId": "부모 노드 ID",
            "relation": "부모와의 관계"
          }
          \`\`\`
        `
        },
        { role: 'user', content: `현재 그래프 상태: ${JSON.stringify(safeNodes)}` },
        { role: 'user', content: `현재 존재하는 노드 목록: ${JSON.stringify(existingKeywords)}` },
        { role: 'user', content: `최근 대화 내용: ${JSON.stringify({ userMessage, gptMessage })}` }
      ],
      max_tokens: 800,
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

    let keyword = parsedResult.keyword?.trim() || "???";
    let parentNodeId = parsedResult.parentNodeId?.trim() || "root";
    let relation = parsedResult.relation?.trim() || "관련";

    if (!Object.keys(safeNodes).includes(parentNodeId)) {
      parentNodeId = Object.keys(safeNodes).find(key => keyword.includes(safeNodes[key].keyword)) || "root";
    }

    console.log(`✅ 키워드: ${keyword}, 선택된 부모 노드: ${parentNodeId}, 관계: ${relation}`);
    
    res.json({ keyword, parentNodeId, relation });

  } catch (error) {
    console.error("❌ Error in Graph Update:", error);
    res.status(500).json({ error: "서버 내부 오류 발생" });
  }
});

app.listen(8080, function () {
  console.log('🚀 Server is listening on port 8080');
});
