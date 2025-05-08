'use client';

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useTheme } from '@/app/contexts/ThemeContext';

interface Nota {
  id: number;
  texto: string;
  completado: boolean;
}

interface NotesClientProps {}

const NotesClient = ({}: NotesClientProps) => {
  const { theme } = useTheme();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<Nota[]>('/api/notes');
        setNotas(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Error al cargar las notas.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const agregarNota = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const nuevaNotaPayload = { texto: newNoteText.trim(), completado: false };

    const tempId = Date.now();
    const optimisticNota: Nota = { ...nuevaNotaPayload, id: tempId };
    setNotas((prevNotas) => [...prevNotas, optimisticNota]);
    setNewNoteText('');

    try {
      const { data: notaGuardada } = await axios.post<Nota>('/api/notes', nuevaNotaPayload);
      setNotas((prevNotas) =>
        prevNotas.map((n) => (n.id === tempId ? notaGuardada : n))
      );
    } catch (err) {
      console.error('Error al crear la nota:', err);
      setError('Error al crear la nota.');
    }
  };

  const toggleCompletar = async (id: number) => {
    const notaOriginal = notas.find((n) => n.id === id);
    if (!notaOriginal) return;

    const nuevoEstadoCompletado = !notaOriginal.completado;

    setNotas((prevNotas) =>
      prevNotas.map((nota) =>
        nota.id === id ? { ...nota, completado: nuevoEstadoCompletado } : nota
      )
    );

    try {
      const { data: notaActualizada } = await axios.put<Nota>(`/api/notes/${id}`, {
        completado: nuevoEstadoCompletado,
      });
      setNotas((prevNotas) =>
        prevNotas.map((n) => (n.id === id ? notaActualizada : n))
      );
    } catch (err) {
      console.error('Error al actualizar estado de la nota:', err);
      setError('Error al actualizar estado de la nota.');
    }
  };

  const borrarNota = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;

    const notasOriginales = [...notas];
    setNotas((prevNotas) => prevNotas.filter((nota) => nota.id !== id));

    try {
      await axios.delete(`/api/notes/${id}`);
    } catch (err) {
      console.error('Error al eliminar la nota:', err);
      setError('Error al eliminar la nota.');
      setNotas(notasOriginales); // Revertir si falla
    }
  };

  const guardarNotaEditada = async (id: number) => {
    if (!editText.trim()) return;

    const notaOriginal = notas.find((n) => n.id === id);
    if (!notaOriginal) return;

    const textoAnterior = notaOriginal.texto;
    setNotas((prevNotas) =>
      prevNotas.map((nota) => (nota.id === id ? { ...nota, texto: editText } : nota))
    );
    setEditingId(null);

    try {
      const { data: notaActualizada } = await axios.put<Nota>(`/api/notes/${id}`, {
        texto: editText.trim(),
      });
      setNotas((prevNotas) =>
        prevNotas.map((n) => (n.id === id ? notaActualizada : n))
      );
    } catch (err) {
      console.error('Error al guardar la nota:', err);
      setError('Error al guardar la nota.');
      setNotas((prevNotas) =>
        prevNotas.map((nota) => (nota.id === id ? { ...nota, texto: textoAnterior } : nota))
      );
    }
  };

  if (loading) {
    return <div className={`p-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cargando notas...</div>;
  }

  if (error) {
    return <div className={`p-8 text-red-500`}>Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Resto del código del componente */}
    </div>
  );
};

export default NotesClient;