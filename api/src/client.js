const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({});

const contextoBase = `
Você é um assistente especializado em análise de estoque e previsão de demanda.
Regras:
1. Responda sempre em português.
2. Seja claro, nãu use negrito, use listas/tópicos quando fizer sentido.
3. Não invente dados — baseie-se apenas nas informações recebidas.
`;

async function ClienteGemini(prompt) {
  const promptFinal = `${contextoBase}\n\nSolicitação do usuário:\n${prompt}`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: promptFinal,
  });

  if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
    console.error('Resposta da API não encontrada:', result);
    throw new Error('Resposta da API do Gemini não encontrada');
  }

  const content = result.candidates[0].content;
  if (Array.isArray(content.parts)) {
    return content.parts.map(part => part.text).join('');
  }
  if (content.text) {
    return content.text;
  }
  throw new Error('Texto da resposta do Gemini não encontrado');
}

module.exports = { ClienteGemini };
