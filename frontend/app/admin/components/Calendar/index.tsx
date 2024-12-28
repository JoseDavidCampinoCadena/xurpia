'use client';

import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';

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
  const { theme } = useTheme();
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
        return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
      case 'deadline':
        return theme === 'dark' ? 'text-red-400' : 'text-red-600';
      default:
        return theme === 'dark' ? 'text-green-400' : 'text-green-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 w-full max-w-2xl ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-lg`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatDate(date)}
          </h3>
          <button onClick={onClose} className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lista de eventos existentes */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Eventos del día
              </h4>
              <button
                onClick={() => setIsAddingEvent(true)}
                className="bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 text-sm font-medium"
              >
                + Nuevo Evento
              </button>
            </div>
            
            {events.length === 0 ? (
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                No hay eventos para este día
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className={`font-semibold ${getEventTypeColor(event.type)}`}>
                          {event.title}
                        </h5>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {event.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        theme === 'dark' ? 'bg-zinc-800 text-gray-400' : 'bg-gray-200 text-gray-700'
                      }`}>
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
            <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
              <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Nuevo Evento
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Título"
                    className={`w-full px-3 py-2 rounded-md text-sm ${
                      theme === 'dark' 
                        ? 'bg-zinc-800 text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
                    }`}
                    required
                  />
                </div>

                <div>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Descripción"
                    className={`w-full px-3 py-2 rounded-md text-sm resize-none ${
                      theme === 'dark' 
                        ? 'bg-zinc-800 text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
                    }`}
                    rows={3}
                  />
                </div>

                <div>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
                    className={`w-full px-3 py-2 rounded-md text-sm ${
                      theme === 'dark' 
                        ? 'bg-zinc-800 text-white' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
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
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium"
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
  const { theme } = useTheme();
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
        return theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500';
      case 'deadline':
        return theme === 'dark' ? 'bg-red-400' : 'bg-red-500';
      default:
        return theme === 'dark' ? 'bg-green-400' : 'bg-green-500';
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
    <div className={`rounded-lg p-6 relative ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextMonth}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className={`text-center py-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
              className={`aspect-square rounded-lg flex flex-col items-center justify-center relative cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-900 hover:bg-zinc-700'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {day}
              </span>
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