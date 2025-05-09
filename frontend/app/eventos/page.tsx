// page.tsx
// Página principal de eventos: muestra y permite crear eventos para un proyecto
'use client';
import { useEffect, useState } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../api/events.api';
import { Event, EventType } from '../types/events';

interface EventosPageProps {
  searchParams: { projectId?: string };
}

export default function EventosPage({ searchParams }: EventosPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    date: '', 
    type: 'meeting' as 'meeting' | 'deadline' | 'other', 
    description: '' 
  });
  const [editing, setEditing] = useState<number | null>(null);
  const projectId = searchParams.projectId ? Number(searchParams.projectId) : undefined;

  useEffect(() => {
    fetchEvents();
  }, [projectId]);

  const fetchEvents = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await getEvents({ projectId, eventType: EventType.PROJECT });
      if (Array.isArray(response)) {
        setEvents(response);
      } else if (response && Array.isArray(response.events)) {
        setEvents(response.events);
      }
    } catch (error) {
      console.error('Error al obtener eventos del proyecto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    
    setLoading(true);
    try {
      if (editing) {
        // Actualizar evento existente
        const updatedEvent = await updateEvent(editing, {
          ...form,
          eventType: EventType.PROJECT,
          projectId
        });
        setEvents(prev => prev.map(e => e.id === editing ? updatedEvent : e));
        setEditing(null);
      } else {
        // Crear nuevo evento
        const newEvent = await createEvent({
          ...form,
          date: new Date(form.date).toISOString(),
          eventType: EventType.PROJECT,
          projectId
        });
        setEvents(prev => [...prev, newEvent]);
      }
      
      // Limpiar formulario
      setForm({ 
        title: '', 
        date: '', 
        type: 'meeting',
        description: '' 
      });
    } catch (error) {
      console.error('Error al guardar el evento:', error);
      alert('No se pudo guardar el evento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (event: Event) => {
    setEditing(event.id);
    setForm({
      title: event.title,
      date: new Date(event.date).toISOString().split('.')[0], // Formatear para datetime-local
      type: event.type,
      description: event.description || ''
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
    
    try {
      setLoading(true);
      await deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
      alert('No se pudo eliminar el evento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Eventos del Proyecto</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2 bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold">{editing ? 'Editar evento' : 'Crear nuevo evento'}</h2>
        <input 
          name="title" 
          value={form.title} 
          onChange={handleChange} 
          placeholder="Título" 
          required 
          className="border p-2 w-full rounded" 
        />
        <input 
          name="date" 
          value={form.date} 
          onChange={handleChange} 
          type="datetime-local" 
          required 
          className="border p-2 w-full rounded" 
        />
        <select name="type" value={form.type} onChange={handleChange} className="border p-2 w-full rounded">
          <option value="meeting">Reunión</option>
          <option value="deadline">Entrega</option>
          <option value="other">Otro</option>
        </select>
        <textarea 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          placeholder="Descripción" 
          className="border p-2 w-full rounded"
          rows={3}
        />
        <div className="flex gap-2">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Evento'}
          </button>
          {editing && (
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => {
                setEditing(null);
                setForm({ title: '', date: '', type: 'meeting', description: '' });
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      <div>
        {loading && <p className="text-blue-600">Cargando...</p>}
        {events.length === 0 && !loading && <p className="text-gray-500">No hay eventos para este proyecto.</p>}
        <ul className="space-y-4">
          {events
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(event => (
              <li key={event.id} className="border p-4 rounded-lg shadow bg-white hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-gray-600 mt-1">
                      {new Date(event.date).toLocaleString('es-ES', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                        ${event.type === 'meeting' ? 'bg-blue-100 text-blue-800' : 
                          event.type === 'deadline' ? 'bg-red-100 text-red-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {event.type === 'meeting' ? 'Reunión' : 
                         event.type === 'deadline' ? 'Fecha límite' : 'Otro'}
                      </span>
                    </div>
                    {event.description && (
                      <p className="mt-2 text-gray-700">{event.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-800"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
