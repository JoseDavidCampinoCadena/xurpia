'use client';

import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'meeting' | 'deadline' | 'other';
}

interface QuickEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSave: (event: Omit<Event, 'id'>) => void;
}

const QuickEventModal = ({ isOpen, onClose, selectedDate, onSave }: QuickEventModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Event['type']>('other');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      date: selectedDate,
      type
    });
    setTitle('');
    setDescription('');
    setType('other');
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            Agregar evento para {selectedDate}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del evento"
              className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del evento"
              className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Event['type'])}
              className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
            >
              <option value="meeting">Reunión</option>
              <option value="deadline">Fecha límite</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
}

const DayEventsModal = ({ isOpen, onClose, date, events, onAddEvent }: DayEventsModalProps) => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'other' as Event['type']
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent({
      ...newEvent,
      date
    });
    setNewEvent({ title: '', description: '', type: 'other' });
    setIsAddingEvent(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'text-blue-500';
      case 'deadline':
        return 'text-red-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            {formatDate(date)}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lista de eventos existentes */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-white">Eventos del día</h4>
              <button
                onClick={() => setIsAddingEvent(true)}
                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm"
              >
                + Nuevo Evento
              </button>
            </div>
            
            {events.length === 0 ? (
              <p className="text-gray-400">No hay eventos para este día</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-zinc-900 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className={`font-semibold ${getEventTypeColor(event.type)}`}>
                          {event.title}
                        </h5>
                        <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-zinc-800 px-2 py-1 rounded">
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario para nuevo evento */}
          {isAddingEvent && (
            <div className="bg-zinc-900 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Nuevo Evento</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Título"
                    className="w-full bg-zinc-800 text-white px-3 py-2 rounded-md text-sm"
                    required
                  />
                </div>

                <div>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Descripción"
                    className="w-full bg-zinc-800 text-white px-3 py-2 rounded-md text-sm resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
                    className="w-full bg-zinc-800 text-white px-3 py-2 rounded-md text-sm"
                  >
                    <option value="meeting">Reunión</option>
                    <option value="deadline">Fecha límite</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingEvent(false)}
                    className="px-3 py-1 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: 'Reunión de equipo',
      description: 'Revisión semanal de progreso del proyecto',
      date: '2024-07-15',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'Entrega de proyecto',
      description: 'Entrega final del módulo de autenticación',
      date: '2024-07-20',
      type: 'deadline'
    }
  ]);
  const [isQuickEventModalOpen, setIsQuickEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const getEventForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.find(event => event.date === dateStr);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'deadline':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setIsQuickEventModalOpen(true);
  };

  const handleQuickEventSave = (newEvent: Omit<Event, 'id'>) => {
    setEvents(prev => [...prev, { ...newEvent, id: Date.now() }]);
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-gray-400 py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const event = getEventForDay(day);
          
          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className="aspect-square bg-zinc-900 rounded-lg flex flex-col items-center justify-center relative hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              <span className="text-white">{day}</span>
              {event && (
                <div
                  className={`absolute bottom-1 w-2 h-2 rounded-full ${getEventColor(event.type)}`}
                  title={event.title}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      <DayEventsModal
        isOpen={isQuickEventModalOpen}
        onClose={() => setIsQuickEventModalOpen(false)}
        date={selectedDate}
        events={events.filter(event => event.date === selectedDate)}
        onAddEvent={handleQuickEventSave}
      />
    </div>
  );
} 