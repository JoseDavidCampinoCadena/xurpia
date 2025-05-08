'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';

// La interfaz de la Nota (puede que necesites ajustarla si tu API devuelve campos diferentes, ej: _id)
interface Nota {
  id: number; // O string, dependiendo de tu BD (ej. MongoDB usa string)
  texto: string;
  completado: boolean;
  // Podrías añadir userId si las notas son por usuario
  // userId?: string;
}

// Props del componente (initialNotes ya no es tan crucial si siempre cargamos desde la API)
interface NotesClientProps {
  // initialNotes?: Nota[]; // Podrías quitarlo o usarlo como fallback/SSR
}

const NotesClient = ({ /* initialNotes = [] */ }: NotesClientProps) => {
  const { theme } = useTheme();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState(''); // Renombrado para claridad (antes newText)
  const [newNoteText, setNewNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar notas desde la API al montar el componente
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/notes'); // Asegúrate que esta URL es correcta
        if (!response.ok) {
          throw new Error('Error al cargar las notas');
        }
        const data: Nota[] = await response.json();
        setNotas(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Un error desconocido ocurrió.');
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
      // Aquí podrías revertir el estado optimista si lo implementaste
    }
  };

  const agregarNota = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const nuevaNotaPayload = { texto: newNoteText.trim(), completado: false };

    // Optimistic update (opcional, pero mejora la UX)
    const tempId = Date.now(); // ID temporal para la UI
    const optimisticNota: Nota = { ...nuevaNotaPayload, id: tempId };
    setNotas(prevNotas => [...prevNotas, optimisticNota]);
    setNewNoteText('');

    await handleApiCall(
      async () => {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaNotaPayload),
        });
        if (!response.ok) throw new Error('Error al crear la nota');
        return await response.json() as Nota;
      },
      (notaGuardada) => {
        // Reemplaza la nota optimista con la real de la BD
        setNotas(prevNotas => prevNotas.map(n => n.id === tempId ? notaGuardada : n));
      },
      'agregar nota'
    );
    // Si la llamada falla y no se actualiza con la notaGuardada,
    // la nota optimista seguirá ahí. Considera removerla en el catch de handleApiCall
    // o forzar una resincronización. Por simplicidad, aquí se deja.
  };

  const toggleCompletar = async (id: number) => {
    const notaOriginal = notas.find(n => n.id === id);
    if (!notaOriginal) return;

    const nuevoEstadoCompletado = !notaOriginal.completado;

    // Optimistic update
    setNotas(prevNotas =>
      prevNotas.map(nota =>
        nota.id === id ? { ...nota, completado: nuevoEstadoCompletado } : nota
      )
    );

    await handleApiCall(
      async () => {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completado: nuevoEstadoCompletado }),
        });
        if (!response.ok) throw new Error('Error al actualizar estado de la nota');
        return await response.json() as Nota;
      },
      (notaActualizada) => {
        setNotas(prevNotas => prevNotas.map(n => n.id === id ? notaActualizada : n));
      },
      'actualizar estado'
    );
  };

  const borrarNota = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;

    const notasOriginales = [...notas];
    // Optimistic update
    setNotas(prevNotas => prevNotas.filter(nota => nota.id !== id));

    await handleApiCall(
      async () => {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar la nota');
        // DELETE puede no devolver contenido o devolver un objeto de éxito
        return id; // O un objeto de éxito si la API lo devuelve
      },
      () => {
        // La nota ya fue removida optimísticamente
      },
      'eliminar nota'
    );
    // Si falla, podrías revertir:
    // .catch(() => setNotas(notasOriginales));
  };

  const iniciarEdicion = (id: number, textoActual: string) => {
    setEditingId(id);
    setEditText(textoActual);
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setEditText('');
  }

  const guardarNotaEditada = async (id: number) => {
    if (!editText.trim()) return;

    const notaOriginal = notas.find(n => n.id === id);
    if (!notaOriginal) return;

    const textoAnterior = notaOriginal.texto;
    // Optimistic update
    setNotas(prevNotas =>
      prevNotas.map(nota => (nota.id === id ? { ...nota, texto: editText } : nota))
    );
    setEditingId(null);

    await handleApiCall(
      async () => {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: editText.trim() }),
        });
        if (!response.ok) throw new Error('Error al guardar la nota');
        return await response.json() as Nota;
      },
      (notaActualizada) => {
        setNotas(prevNotas => prevNotas.map(n => n.id === id ? notaActualizada : n));
        setEditText(''); // Limpiar solo si es exitoso y se mantiene la edición
      },
      'guardar edición de nota'
    );
    // Si falla, podrías revertir:
    // .catch(() => {
    //   setNotas(prevNotas =>
    //     prevNotas.map(nota => (nota.id === id ? { ...nota, texto: textoAnterior } : nota))
    //   );
    //   setEditingId(id); // Reabrir edición
    // });
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
          placeholder="Nueva nota..."
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
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
            } ${nota.completado ? 'opacity-60' : ''}`}
          >
            {editingId === nota.id ? (
              <div className='space-y-2'>
                <textarea
                  className={`p-2 rounded-md w-full resize-none h-24 focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-zinc-700 text-white border-zinc-600'
                      : 'bg-gray-50 text-gray-900 border-gray-300'
                  }`}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
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
              <p className={`whitespace-pre-wrap flex-grow ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                {nota.texto}
              </p>
            )}

            <div className="flex justify-between items-center pt-2 border-t mt-2_MOD" // border-t y mt-2 pueden ser redundantes o necesitar ajuste
                 style={{borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nota.completado}
                  onChange={() => toggleCompletar(nota.id)}
                  className={`form-checkbox h-5 w-5 rounded text-green-500 transition-colors duration-150 ease-in-out ${
                    theme === 'dark' ? 'bg-zinc-700 border-zinc-600 focus:ring-offset-zinc-800' : 'bg-gray-100 border-gray-300 focus:ring-offset-white'
                  } focus:ring-2 focus:ring-green-500`}
                />
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${nota.completado ? 'line-through' : ''}`}>
                  {nota.completado ? 'Completada' : 'Pendiente'}
                </span>
              </label>

              <div className="flex space-x-2">
                {editingId !== nota.id && ( // Mostrar Editar solo si no se está editando esta nota
                  <button
                    onClick={() => iniciarEdicion(nota.id, nota.texto)}
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