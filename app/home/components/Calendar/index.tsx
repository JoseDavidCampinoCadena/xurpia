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
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Agregar evento para {selectedDate}
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
              placeholder="Título del evento"
              className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del evento"
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
              Guardar
            </button>
          </div>
        </form>
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
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 relative shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-gray-900 dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600"
          >
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
          const event = getEventForDay(day);
          
          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className="aspect-square bg-gray-50 dark:bg-zinc-900 rounded-lg flex flex-col items-center justify-center relative hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              <span className="text-gray-900 dark:text-white">{day}</span>
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

      <QuickEventModal
        isOpen={isQuickEventModalOpen}
        onClose={() => setIsQuickEventModalOpen(false)}
        date={selectedDate}
        onSave={handleQuickEventSave}
      />
    </div>
  );
} 