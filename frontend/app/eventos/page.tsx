// page.tsx
// Página principal de eventos: muestra y permite crear eventos para un proyecto
'use client';
import { useEffect, useState } from 'react';
import { getEvents, createEvent } from '../api/events.api';

// Define la interfaz Event localmente
interface Event {
  id: number;
  title: string;
  date: string;
  type: 'meeting' | 'deadline' | 'other';
  description: string;
}

interface EventosPageProps {
  searchParams: { projectId?: string };
}

export default function EventosPage({ searchParams }: EventosPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', type: 'meeting', description: '' });
  const projectId = searchParams.projectId;

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      getEvents(String(projectId)).then(setEvents).finally(() => setLoading(false));
    }
  }, [projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setLoading(true);
    const newEvent = await createEvent(String(projectId), form);
    setEvents([...events, newEvent]);
    setForm({ title: '', date: '', type: 'meeting', description: '' });
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Eventos del Proyecto</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Título" required className="border p-2 w-full" />
        <input name="date" value={form.date} onChange={handleChange} type="datetime-local" required className="border p-2 w-full" />
        <select name="type" value={form.type} onChange={handleChange} className="border p-2 w-full">
          <option value="meeting">Reunión</option>
          <option value="deadline">Entrega</option>
          <option value="other">Otro</option>
        </select>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="border p-2 w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>Crear Evento</button>
      </form>
      <div>
        {loading && <p>Cargando...</p>}
        {events.length === 0 && !loading && <p>No hay eventos.</p>}
        <ul className="space-y-2">
          {events.map(ev => (
            <li key={ev.id} className="border p-2 rounded">
              <div className="font-semibold">{ev.title}</div>
              <div>{new Date(ev.date).toLocaleString()}</div>
              <div className="text-sm text-gray-600">{ev.type}</div>
              <div>{ev.description}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
