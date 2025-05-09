'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { Event, EventType } from '../../../types/events';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../../api/events.api';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface QuickEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSave: (eventData: Partial<Event>, eventId?: number) => void;
  existingEvent: Event | null;
  loading: boolean;
}

const QuickEventModal = ({ isOpen, onClose, selectedDate, onSave, existingEvent, loading }: QuickEventModalProps) => {
  const [title, setTitle] = useState(existingEvent?.title || '');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [type, setType] = useState(existingEvent?.type || 'other');
  
  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDescription(existingEvent.description || '');
      setType(existingEvent.type);
    } else {
      setTitle('');
      setDescription('');
      setType('other');
    }
  }, [existingEvent]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      title, 
      description, 
      date: selectedDate, 
      type: type as 'meeting' | 'deadline' | 'other',
      // Los eventos personales siempre serán de tipo PERSONAL
      eventType: EventType.PERSONAL
    }, existingEvent?.id);
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
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700 resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'meeting' | 'deadline' | 'other')}
              className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700"
              disabled={loading}
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
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Guardando...' : existingEvent ? 'Guardar cambios' : 'Guardar'}
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
  
  // Cargar eventos personales al inicializar el componente
  useEffect(() => {
    fetchEvents();
  }, []);

  // Obtener eventos del backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents({ eventType: EventType.PERSONAL });
      if (Array.isArray(response)) {
        setEvents(response);
      } else if (response && Array.isArray(response.events)) {
        setEvents(response.events);
      }
    } catch (error) {
      console.error('Error al obtener eventos personales:', error);
    } finally {
      setLoading(false);
    }
  };

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
    return events.filter(event => {
      // Asegurarse de comparar solo la fecha sin hora
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setEventBeingEdited(null);
    setIsQuickEventModalOpen(true);
  };

  const handleQuickEventSave = async (eventData: Partial<Event>, eventId?: number) => {
    setLoading(true);
    try {
      if (eventId) {
        // Actualizar evento existente
        const updatedEvent = await updateEvent(eventId, eventData);
        setEvents(prev => prev.map(e => (e.id === eventId ? updatedEvent : e)));
      } else {
        // Crear nuevo evento
        const newEvent = await createEvent({
          title: eventData.title!,
          date: new Date(eventData.date!).toISOString(),
          type: eventData.type!,
          description: eventData.description,
          eventType: EventType.PERSONAL,
        });
        setEvents(prev => [...prev, newEvent]);
      }
      setIsQuickEventModalOpen(false);
    } catch (error) {
      console.error('Error al guardar el evento:', error);
      alert('No se pudo guardar el evento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedDate(event.date.split('T')[0]);  // Solo tomar la parte de la fecha
    setEventBeingEdited(event);
    setIsQuickEventModalOpen(true);
  };

  const handleDelete = async (eventId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      setLoading(true);
      try {
        await deleteEvent(eventId);
        setEvents(prev => prev.filter(e => e.id !== eventId));
      } catch (error) {
        console.error('Error al eliminar el evento:', error);
        alert('No se pudo eliminar el evento. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
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
              <span className="text-gray-900 dark:text-white">{day}</span>
              {dayEvents.map((event, i) => (
                <div
                  key={i}
                  className={`absolute bottom-1 w-2 h-2 rounded-full ${getEventColor(event.type)} ${i > 0 ? 'left-1.5' : ''}`}
                  title={event.title}
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
        loading={loading}
      />

      {events.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mis eventos</h3>
          <ul className="space-y-2">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => (
                <li key={event.id} className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                  <div>
                    <p className="text-gray-800 dark:text-gray-100 font-medium">{event.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(event.date).toLocaleDateString()} - 
                      {event.type === 'meeting' ? ' Reunión' : event.type === 'deadline' ? ' Fecha límite' : ' Otro'}
                    </p>
                    {event.description && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(event)} className="text-blue-500 hover:text-blue-700" disabled={loading}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-700" disabled={loading}>
                      <FaTrash />
                    </button>
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
