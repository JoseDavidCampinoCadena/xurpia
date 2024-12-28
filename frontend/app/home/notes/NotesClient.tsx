'use client';

import { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface Nota {
  id: number;
  texto: string;
  completado: boolean;
}

interface NotesClientProps {
  initialNotes: Nota[];
}

const NotesClient = ({ initialNotes }: NotesClientProps) => {
  const { theme } = useTheme();
  const [notas, setNotas] = useState(initialNotes);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newText, setNewText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  const toggleCompletar = (id: number) => {
    setNotas((prevNotas) =>
      prevNotas.map((nota) =>
        nota.id === id ? { ...nota, completado: !nota.completado } : nota
      )
    );
  };

  const borrarNota = (id: number) => {
    setNotas((prevNotas) => prevNotas.filter((nota) => nota.id !== id));
  };

  const editarNota = (id: number, texto: string) => {
    setEditingId(id);
    setNewText(texto);
  };

  const guardarNota = (id: number) => {
    setNotas((prevNotas) =>
      prevNotas.map((nota) => (nota.id === id ? { ...nota, texto: newText } : nota))
    );
    setEditingId(null);
    setNewText('');
  };

  const agregarNota = () => {
    if (newNoteText.trim()) {
      setNotas((prevNotas) => [
        ...prevNotas,
        { id: Date.now(), texto: newNoteText.trim(), completado: false },
      ]);
      setNewNoteText('');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Notas:
      </h2>
      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
        Aquí estarán todas tus tareas pendientes
      </p>

      <div className="flex space-x-4 items-center">
        <input
          type="text"
          placeholder="Nueva nota"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          className={`flex-grow p-2 rounded-md placeholder-gray-400 focus:outline-none ${
            theme === 'dark'
              ? 'bg-gray-700 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        />
        <button
          onClick={agregarNota}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-medium"
        >
          Agregar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notas.map((nota) => (
          <div
            key={nota.id}
            className={`rounded-lg p-4 shadow-sm flex flex-col justify-between space-y-4 ${
              theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'
            } ${nota.completado ? 'opacity-50' : ''}`}
          >
            {editingId === nota.id ? (
              <textarea
                className={`p-2 rounded-md w-full resize-none ${
                  theme === 'dark'
                    ? 'bg-zinc-700 text-white'
                    : 'bg-gray-50 text-gray-900 border border-gray-200'
                }`}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
            ) : (
              <p className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {nota.texto}
              </p>
            )}

            <div className="flex justify-between items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nota.completado}
                  onChange={() => toggleCompletar(nota.id)}
                  className={`form-checkbox h-5 w-5 text-green-500 ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Lista
                </span>
              </label>

              <div className="flex space-x-2">
                {editingId === nota.id ? (
                  <button
                    onClick={() => guardarNota(nota.id)}
                    className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 font-medium"
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    onClick={() => editarNota(nota.id, nota.texto)}
                    className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 font-medium"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => borrarNota(nota.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 font-medium"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesClient; 