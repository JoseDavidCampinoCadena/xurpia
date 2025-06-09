'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { getCookie } from '@/app/utils/cookies';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'meeting' | 'deadline' | 'other';
  isPersonal?: boolean;
  projectName?: string;
  projectId?: number;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface QuickEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSave: (eventData: Omit<Event, 'id'>, eventId?: number) => void;
  existingEvent?: Event | null;
}

const QuickEventModal = ({ isOpen, onClose, selectedDate, onSave, existingEvent }: QuickEventModalProps) => {
  const [title, setTitle] = useState(existingEvent?.title || '');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [type, setType] = useState(existingEvent?.type || 'other');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, date: selectedDate, type }, existingEvent?.id);
    setTitle('');
    setDescription('');
    setType('other');
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {existingEvent ? 'Editar evento' : 'Agregar evento'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Event['type'])}
              className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700"
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
              className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {existingEvent ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isQuickEventModalOpen, setIsQuickEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [eventBeingEdited, setEventBeingEdited] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  // Load all user events (personal + project events)
  const loadUserEvents = async () => {
    try {
      setLoading(true);
      const token = getCookie('token');
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/events/user/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load events on component mount
  useEffect(() => {
    loadUserEvents();
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };
  const getEventColor = (event: Event) => {
    // Personal events get different styling
    if (event.isPersonal) {
      switch (event.type) {
        case 'meeting': return 'bg-purple-500';
        case 'deadline': return 'bg-pink-500';
        default: return 'bg-indigo-500';
      }
    }
    
    // Project events
    switch (event.type) {
      case 'meeting': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };
  const handleDayClick = (day: number) => {
    // Create date using local timezone to avoid timezone offset issues
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = clickedDate.toISOString().split('T')[0]; // This ensures YYYY-MM-DD format without timezone issues
    setSelectedDate(dateStr);
    setEventBeingEdited(null);
    setIsQuickEventModalOpen(true);
  };
  const handleQuickEventSave = async (eventData: Omit<Event, 'id'>, eventId?: number) => {
    try {
      const token = getCookie('token');
      
      if (eventId) {
        // Update existing event
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`, eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new personal event
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/events/user/personal`, eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Reload events to get updated data
      await loadUserEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedDate(event.date);
    setEventBeingEdited(event);
    setIsQuickEventModalOpen(true);
  };
  const handleDelete = async (eventId: number) => {
    try {
      const token = getCookie('token');
      
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reload events to get updated data
      await loadUserEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 relative shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-gray-900 dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={previousMonth} className="p-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600">
            <FaChevronLeft />
          </button>
          <button onClick={nextMonth} className="p-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600">
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayEvents = getEventsForDay(day);

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className="aspect-square bg-gray-50 dark:bg-zinc-900 rounded-lg flex flex-col items-center justify-center relative hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              <span className="text-gray-900 dark:text-white">{day}</span>              {dayEvents.map((event, i) => (
                <div
                  key={i}
                  className={`absolute bottom-1 w-2 h-2 rounded-full ${getEventColor(event)} ${i > 0 ? 'left-1.5' : ''}`}
                  title={`${event.title}${event.isPersonal ? ' (Personal)' : event.projectName ? ` (${event.projectName})` : ''}`}
                />
              ))}
            </div>
          );
        })}
      </div>

      <QuickEventModal
        isOpen={isQuickEventModalOpen}
        onClose={() => {
          setIsQuickEventModalOpen(false);
          setEventBeingEdited(null);
        }}
        selectedDate={selectedDate}
        onSave={handleQuickEventSave}
        existingEvent={eventBeingEdited}
      />

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {events.length > 0 && !loading && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Próximos eventos</h3>
          <ul className="space-y-2">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => (                <li key={event.id} className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-800 dark:text-gray-100 font-medium">{event.title}</p>
                      {event.isPersonal ? (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                          Personal
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          {event.projectName || 'Proyecto'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {event.date} - {event.type === 'meeting' ? 'Reunión' : event.type === 'deadline' ? 'Fecha límite' : 'Otro'}
                    </p>
                    {event.description && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {event.isPersonal && (
                      <button onClick={() => handleEdit(event)} className="text-blue-500 hover:text-blue-700">
                        <FaEdit />
                      </button>
                    )}
                    {event.isPersonal && (
                      <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-700">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Calendar;
