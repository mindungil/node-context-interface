require('dotenv').config();
const express = require('express');
const path = require('path'); 
const OpenAI = require('openai');
const cors = require('cors'); 
const { encoding_for_model } = require("@dqbd/tiktoken");
const enc = encoding_for_model("gpt-3.5-turbo");

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

const MAX_TOKENS = 15900;
const RESERVED_FOR_RESPONSE = 1200;
const MAX_CONTEXT_TOKENS = MAX_TOKENS - RESERVED_FOR_RESPONSE;

const countTokens = (messages) => {
  let tokens = 0;
  for (const message of messages) {
    tokens += 4; // role, structure overhead
    tokens += enc.encode(message.content || "").length;
    if (message.name) tokens -= 1; // name 사용 시 1토큰 줄어듦
  }
  tokens += 2; // assistant reply priming
  return tokens;
};

let summaryText = ""; // 누적 요약 저장

app.post('/api/chat', async (req, res) => {
  const userPrompt = req.body.message;
  const previousMessages = req.body.history || [];

  // 1. 전체 메시지 기반 메시지 구성
  let finalMessages = [
    { role: "system", content: "사용자의 질문에 대한 답변을 해줘" },
    ...previousMessages,
    { role: "user", content: userPrompt },
  ];

  let totalTokens = countTokens(finalMessages);
  console.log("💡 전체 메시지 토큰 수:", totalTokens);

  if (totalTokens > MAX_CONTEXT_TOKENS) {
    console.log("⚠️ 토큰 초과 감지, 요약 시작...");

    // 2. 요약을 위한 messages 정리
    let keptMessages = [...previousMessages];
    let removedMessages = [];

    while (
      countTokens([
        { role: "system", content: "사용자의 질문에 대한 답변을 해줘" },
        ...(summaryText ? [{ role: "assistant", content: `이전 대화 요약: ${summaryText}` }] : []),
        ...keptMessages,
        { role: "user", content: userPrompt },
      ]) > MAX_CONTEXT_TOKENS - 300
    ) {
      removedMessages.push(keptMessages.shift());
    }

    // 3. 요약 수행
    const toSummarize = [
      ...(summaryText ? [{ role: "assistant", content: summaryText }] : []),
      ...removedMessages,
    ];

    try {
      const summaryResponse = await retryRequest(() =>
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "다음 대화를 이전 요약과 함께 간결하게 다시 요약해줘." },
            ...toSummarize,
          ],
          max_tokens: 300,
        })
      );
      summaryText = summaryResponse.choices[0]?.message?.content?.trim() || summaryText;
      console.log("📌 누적 요약 업데이트:", summaryText);
    } catch (error) {
      console.error("❌ 요약 실패:", error);
    }

    // 4. 최종 메시지 구성
    finalMessages = [
      { role: "system", content: "사용자의 질문에 대한 답변을 해줘" },
      ...(summaryText ? [{ role: "assistant", content: `이전 대화 요약: ${summaryText}` }] : []),
      ...keptMessages,
      { role: "user", content: userPrompt },
    ];
  }

  // 5. 최종 메시지 토큰 수 확인
  const finalTokenCount = countTokens(finalMessages);
  console.log("📦 최종 메시지 토큰 수:", finalTokenCount);
  console.log("📉 응답을 위한 남은 토큰:", MAX_TOKENS - finalTokenCount);

  // 6. GPT 응답 호출
  try {
    const response = await retryRequest(() =>
      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: finalMessages,
        max_tokens: RESERVED_FOR_RESPONSE,
      })
    );

    const gptResponse = response.choices[0].message.content;
    res.json({ message: gptResponse });
  } catch (error) {
    console.error("❌ GPT 응답 오류:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/api/update-graph', async (req, res) => {  
  const { nodes, userMessage, gptMessage } = req.body;  
  const safeNodes = nodes || {};
  const existingKeywords = Object.values(safeNodes).map(node => node.keyword);

  // ✅ safeNodes에서 dialog 등 불필요한 필드 제거 (id, keyword만 유지)
  const simplifiedNodes = Object.fromEntries(
    Object.entries(safeNodes).map(([id, node]) => {
      return [id, { id, keyword: node.keyword }];
    })
  );

  console.log('📌 업데이트 요청 받음');
  console.log('📋 현재 노드 목록:', existingKeywords);
  console.log('🗺️ 전달된 노드 데이터:', JSON.stringify(simplifiedNodes, null, 2));

  try {
    const response = await retryRequest(() => openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
          다음 정보를 기반으로 사용자의 대화 키워드도 추출하고,
          그래프 업데이트 정보를 생성하세요.
          
          1. 현재 그래프 상태와 존재하는 노드 목록을 참고해서, 최근 대화 내용이 어떤 노드(키워드)에 들어가야 하는지 판단하시오
          2. 판단한 근거로 최근 대화 내용의 키워드를 정한 다음, 그래프 내 어디에 연결되어야 할지 판단하고, 가장 연관된 부모 노드를 찾아 관계도 설정하세요.
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
        { role: 'user', content: `현재 그래프 상태: ${JSON.stringify(simplifiedNodes)}` },
        { role: 'user', content: `현재 존재하는 노드 목록: ${JSON.stringify(existingKeywords)}` },
        { role: 'user', content: `최근 대화 내용: ${JSON.stringify({ userMessage, gptMessage })}` }
      ],
      max_tokens: 1200,
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
