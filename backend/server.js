const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { Groq } = require('groq-sdk');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY === 'your_groq_api_key_here' ? '' : (process.env.GROQ_API_KEY || ''),
});

// Hugging Face Helper
const generateWithHuggingFace = async (prompt, language) => {
  const hfToken = process.env.HUGGING_FACE_TOKEN;
  const hfModelUrl = process.env.HF_MODEL_URL || 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';

  if (!hfToken || hfToken === 'your_hugging_face_token_here') {
    throw new Error('Hugging Face token is missing or invalid.');
  }

  console.log(`[Backend] Calling Hugging Face API: ${hfModelUrl}`);

  const response = await axios.post(
    hfModelUrl,
    {
      inputs: `[INST] You are an expert code generator. Generate clean, readable, and efficient code in ${language} based on the following description. Only return the code itself, no explanations or markdown backticks. \nDescription: ${prompt} [/INST]`,
      parameters: { max_new_tokens: 1000, temperature: 0.1 }
    },
    { headers: { Authorization: `Bearer ${hfToken}` } }
  );

  // HF Inference API returns an array or object depending on the model
  const result = response.data;
  if (Array.isArray(result) && result[0]?.generated_text) {
    // Extract the code part (after the prompt if the model includes it)
    let text = result[0].generated_text;
    if (text.includes('[/INST]')) {
      text = text.split('[/INST]')[1].trim();
    }
    return text.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
  }

  throw new Error('Invalid response from Hugging Face.');
};

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    groqActive: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here',
    hfActive: !!process.env.HUGGING_FACE_TOKEN && process.env.HUGGING_FACE_TOKEN !== 'your_hugging_face_token_here'
  });
});

app.post('/api/generate', async (req, res) => {
  const { prompt, language } = req.body;
  console.log(`[Backend] Generation request received for language: ${language}`);

  if (!prompt || !language) {
    return res.status(400).json({ error: 'Prompt and language are required.' });
  }

  const groqKey = process.env.GROQ_API_KEY;
  const hfToken = process.env.HUGGING_FACE_TOKEN;

  // Try Groq first if available
  if (groqKey && groqKey !== 'your_groq_api_key_here') {
    try {
      console.log('[Backend] Attempting Groq Generation...');
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert code generator. Generate clean, readable, and efficient code in ${language} based on the user's description. Only return the code itself, no explanations or markdown backticks unless specifically asked. Ensure the code is ready to use.`,
          },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
      });
      const generatedCode = completion.choices[0]?.message?.content || '';
      return res.json({ code: generatedCode, provider: 'Groq' });
    } catch (error) {
      console.error('[Backend] Groq Error:', error.message);
      // Fallback to HF if Groq fails
    }
  }

  // Fallback to Hugging Face
  if (hfToken && hfToken !== 'your_hugging_face_token_here') {
    try {
      console.log('[Backend] Attempting Hugging Face Generation...');
      const code = await generateWithHuggingFace(prompt, language);
      return res.json({ code, provider: 'Hugging Face' });
    } catch (error) {
      console.error('[Backend] Hugging Face Error:', error.message);
      return res.status(500).json({ error: `Hugging Face generation failed: ${error.message}` });
    }
  }

  res.status(500).json({
    error: 'No active AI providers found. Please set GROQ_API_KEY or HUGGING_FACE_TOKEN in .env'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
