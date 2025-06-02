import { useState } from 'react';
import { getCookie } from '../../../utils/cookies';

export default function HiringAssistant() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    try {
      // Obtener el token JWT desde la cookie
      const token = getCookie('token');
      const res = await fetch('http://localhost:3001/collaborators/hire-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data.suggestions);
    } catch (error) {
      setResponse(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl w-full max-w-2xl mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-4">Asistente de Contratación Inteligente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl"
          rows={4}
          placeholder="¿A quién deseas contratar? Ej: Necesito un diseñador UX que hable inglés y sea de México"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-xl font-semibold"
        >
          {loading ? 'Buscando candidatos...' : 'Buscar'}
        </button>
      </form>

      {response && (
        <div className="mt-6 p-4 bg-zinc-800 border border-zinc-700 rounded-xl whitespace-pre-wrap">
          <h3 className="text-lg font-semibold mb-2">Candidatos sugeridos:</h3>
          {response}
        </div>
      )}
    </div>
  );
}
