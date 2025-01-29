'use client';

import { useState } from 'react';
import Calendar from '../components/Calendar';
import { IoClose } from 'react-icons/io5';

interface Event {
  id: number;
  title: string;
  date: string;
  type: 'meeting' | 'deadline' | 'other';
  description: string;
}

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: 'Reunión de equipo',
      date: '2024-07-15',
      type: 'meeting',
      description: 'Revisión semanal de progreso'
    },
    {
      id: 2,
      title: 'Entrega de proyecto',
      date: '2024-07-20',
      type: 'deadline',
      description: 'Entrega final del módulo de autenticación'
    }
  ]);

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    type: 'other',
    description: ''
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date) {
      setEvents([
        ...events,
        {
          id: Date.now(),
          title: newEvent.title,
          date: newEvent.date,
          type: newEvent.type as 'meeting' | 'deadline' | 'other',
          description: newEvent.description || ''
        }
      ]);
      setNewEvent({ title: '', date: '', type: 'other', description: '' });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-around items-center mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">Calendario de Proyecto</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Añadir Evento
        </button>
      </div>

      <Calendar />

      {/* Lista de eventos próximos */}
      <div className="mt-8 bg-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Eventos Próximos</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-zinc-900 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold">{event.title}</h3>
                  <p className="text-gray-400 text-sm">{event.date}</p>
                  <p className="text-gray-400 text-sm mt-2">{event.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  event.type === 'meeting' ? 'bg-blue-500' :
                  event.type === 'deadline' ? 'bg-red-500' : 'bg-green-500'
                } text-white`}>
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para añadir evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Añadir Evento</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Título</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Fecha</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Tipo</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                  className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
                >
                  <option value="meeting">Reunión</option>n
                  <option value="deadline">Fecha límite</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Descripción</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 