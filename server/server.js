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
        // { role: "system", content: "사용자가 알기 쉽게 마크다운 형식으로 답변을 정리해서 보내줘. 근데 마크다운으로 정리했다고 하거"},
        ...previousMessages,  
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 800
    });
    
    const gptResponse = response.choices[0].message.content;
    console.log('GPT Response:', gptResponse);
    res.json({ message: gptResponse });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(8080, function () {
  console.log('Server is listening on port 8080');
});
