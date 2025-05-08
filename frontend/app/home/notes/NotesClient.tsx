'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
// Import notesApi and related types
import { notesApi, Note, CreateNotePayload, UpdateNotePayload } from '../../api/notes.api';

// Remove initialNotes prop, component will fetch its own data
const NotesClient = () => {
  const { theme } = useTheme();
  const [notas, setNotas] = useState<Note[]>([]); // Use imported Note type, initialize as empty
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState(''); // Was editText, changed to align with 'title' field
  const [newNoteTitle, setNewNoteTitle] = useState(''); // Was newNoteText, changed to align with 'title' field
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const data = await notesApi.getNotes(); // Use notesApi
        setNotas(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError(err instanceof Error ? err.message : 'Un error desconocido ocurrió al cargar las notas.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleApiCall = async <T,>(
    apiCall: () => Promise<T>,
    onSuccess: (data: T) => void,
    operationName: string
  ) => {
    try {
      const data = await apiCall();
      onSuccess(data);
      setError(null);
    } catch (err) {
      console.error(`Error en ${operationName}:`, err);
      setError(err instanceof Error ? err.message : `Falló la operación: ${operationName}`);
    }
  };

  const agregarNota = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const nuevaNotaPayload: CreateNotePayload = { title: newNoteTitle.trim(), completed: false };

    const tempId = Date.now(); // Temporary ID for UI
    // Create an optimistic note matching the full Note structure
    const optimisticNota: Note = {
      id: tempId,
      title: newNoteTitle.trim(),
      completed: false,
      // Add placeholder/temporary values for other required fields
      content: undefined, // Or provide if there's an input for it
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 0, // Placeholder, actual userId will be set by backend
    };
    setNotas(prevNotas => [...prevNotas, optimisticNota]);
    setNewNoteTitle('');

    await handleApiCall(
      async () => notesApi.createNote(nuevaNotaPayload), // Use notesApi
      (notaGuardada) => {
        setNotas(prevNotas => prevNotas.map(n => n.id === tempId ? notaGuardada : n));
      },
      'agregar nota'
    );
  };

  const toggleCompletar = async (id: number) => {
    const notaOriginal = notas.find(n => n.id === id);
    if (!notaOriginal) return;

    const nuevoEstadoCompletado = !notaOriginal.completed;

    setNotas(prevNotas =>
      prevNotas.map(nota =>
        nota.id === id ? { ...nota, completed: nuevoEstadoCompletado } : nota
      )
    );

    const payload: UpdateNotePayload = { completed: nuevoEstadoCompletado };

    await handleApiCall(
      async () => notesApi.updateNote(id, payload), // Use notesApi
      (notaActualizada) => {
        setNotas(prevNotas => prevNotas.map(n => n.id === id ? notaActualizada : n));
      },
      'actualizar estado de la nota'
    );
  };

  const borrarNota = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;

    setNotas(prevNotas => prevNotas.filter(nota => nota.id !== id));

    await handleApiCall(
      async () => notesApi.deleteNote(id), // Use notesApi
      () => { /* Note already removed optimistically */ },
      'eliminar nota'
    );
  };

  const iniciarEdicion = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setEditTitle('');
  }

  const guardarNotaEditada = async (id: number) => {
    if (!editTitle.trim()) return;

    setNotas(prevNotas =>
      prevNotas.map(nota => (nota.id === id ? { ...nota, title: editTitle.trim() } : nota))
    );
    setEditingId(null);

    const payload: UpdateNotePayload = { title: editTitle.trim() };

    await handleApiCall(
      async () => notesApi.updateNote(id, payload), // Use notesApi
      (notaActualizada) => {
        setNotas(prevNotas => prevNotas.map(n => n.id === id ? notaActualizada : n));
        setEditTitle('');
      },
      'guardar edición de nota'
    );
  };

  if (loading) {
    return <div className={`p-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cargando notas...</div>;
  }

  if (error) {
    return <div className={`p-8 text-red-500`}>Error: {error} <button onClick={() => window.location.reload()} className="ml-2 p-1 bg-blue-500 text-white rounded">Reintentar</button></div>;
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Notas
      </h2>
      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
        Aquí estarán todas tus notas guardadas en la base de datos.
      </p>

      <form onSubmit={agregarNota} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-stretch">
        <input
          type="text"
          placeholder="Título de la nueva nota..."
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          className={`flex-grow p-3 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
            theme === 'dark'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'bg-white text-gray-900 border border-gray-300'
          }`}
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 font-medium transition-colors duration-150 ease-in-out whitespace-nowrap"
        >
          Agregar Nota
        </button>
      </form>

      {notas.length === 0 && !loading && (
         <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            No hay notas todavía. ¡Agrega una!
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notas.map((nota) => (
          <div
            key={nota.id}
            className={`rounded-lg p-4 shadow-lg flex flex-col justify-between space-y-4 transition-opacity duration-300 ${
              theme === 'dark' ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-gray-200'
            } ${nota.completed ? 'opacity-60' : ''}`}>
            {editingId === nota.id ? (
              <div className='space-y-2'>
                <textarea
                  className={`p-2 rounded-md w-full resize-none h-24 focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-zinc-700 text-white border-zinc-600'
                      : 'bg-gray-50 text-gray-900 border-gray-300'
                  }`}
                  value={editTitle} // Value is editTitle
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
                 <button
                    onClick={() => guardarNotaEditada(nota.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-medium text-sm"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={cancelarEdicion}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 font-medium text-sm ml-2"
                  >
                    Cancelar
                  </button>
              </div>
            ) : (
              // Display nota.title. If nota.content is also relevant, you might want to display it too.
              <p className={`whitespace-pre-wrap flex-grow ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                {nota.title}
              </p>
            )}

            <div className="flex justify-between items-center pt-2 border-t mt-2_MOD" // border-t y mt-2 pueden ser redundantes o necesitar ajuste
                 style={{borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nota.completed} // Use nota.completed
                  onChange={() => toggleCompletar(nota.id)}
                  className={`form-checkbox h-5 w-5 rounded text-green-500 transition-colors duration-150 ease-in-out ${
                    theme === 'dark' ? 'bg-zinc-700 border-zinc-600 focus:ring-offset-zinc-800' : 'bg-gray-100 border-gray-300 focus:ring-offset-white'
                  } focus:ring-2 focus:ring-green-500`}
                />
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${nota.completed ? 'line-through' : ''}`}>
                  {nota.completed ? 'Completada' : 'Pendiente'} {/* Use nota.completed */}
                </span>
              </label>

              <div className="flex space-x-2">
                {editingId !== nota.id && (
                  <button
                    onClick={() => iniciarEdicion(nota.id, nota.title)} // Pass nota.title
                    className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 font-medium text-sm transition-colors duration-150 ease-in-out"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => borrarNota(nota.id)}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 font-medium text-sm transition-colors duration-150 ease-in-out"
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