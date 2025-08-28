import { useState } from 'react';

export default function AnaliseIA() {
  const [prompt, setPrompt] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function gerarResposta() {
    setCarregando(true);
    setResposta('');

    const res = await fetch('http://localhost:3001/ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setResposta(data.resposta || 'Nenhuma resposta.');
    setCarregando(false);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Análise com IA (Gemini)</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        placeholder="Digite uma pergunta ou solicite uma análise..."
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <button onClick={gerarResposta} disabled={carregando}>
        {carregando ? 'Gerando...' : 'Enviar'}
      </button>
      <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
        <strong>Resposta:</strong>
        <p>{resposta}</p>
      </div>
    </div>
  );
}
