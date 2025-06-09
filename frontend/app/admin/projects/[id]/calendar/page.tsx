'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Calendar from '../../../components/Calendar';
import { IoClose } from 'react-icons/io5';
import { Project } from '../../../../hooks/useProjects';
import { useAuth } from '@/app/hooks/useAuth';
import { getUserPermissions } from '@/app/utils/permissions';
import { projectsApi } from '@/app/api/projects.api';
import axios from '@/app/api/axios';
import { AxiosError } from 'axios';

interface Event {
  id: number;
  title: string;
  date: string;
  type: 'meeting' | 'deadline' | 'other';
  description: string;
}

export default function CalendarPage() {
  const params = useParams();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch current project information and events
  useEffect(() => {
    const fetchProjectAndEvents = async () => {
      if (params.id) {        try {
          setLoading(true);
          const projectId = parseInt(params.id as string);
          
          // Fetch project information
          const projects = await projectsApi.getAll();
          const project = projects.find(p => p.id === projectId);
          setCurrentProject(project || null);// Fetch events for this project
          if (project) {
            console.log('🔍 Making API call to fetch events for project:', projectId);
              try {
              const response = await axios.get<Event[]>(`/events/${projectId}`);
              console.log('🔍 Events data received:', response.data);
              setEvents(response.data);            } catch (error: unknown) {
              if (error instanceof AxiosError && error.response?.status !== 404) {
                console.error('🔍 Error fetching events:', error.response?.status, error.response?.statusText, error.response?.data);
                setError('Error al cargar los eventos');
              }
            }
          }
        } catch (error) {
          console.error('🔍 Error fetching project and events:', error);
          setError('Error al cargar la información del proyecto');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProjectAndEvents();
  }, [params.id]);

  // Get user permissions for the current project
  const permissions = getUserPermissions(user, currentProject || undefined);

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    type: 'other',
    description: ''
  });  const handleCalendarEventCreate = async (newEvent: Omit<Event, 'id'>) => {
    try {
      console.log('Creating event:', newEvent);
      console.log('Current project ID:', currentProject?.id);
      
      if (!currentProject?.id) {
        throw new Error('No se encontró ID del proyecto');
      }      const response = await axios.post<Event>(`/events/${currentProject.id}`, {
        title: newEvent.title,
        date: newEvent.date,
        type: newEvent.type,
        description: newEvent.description,
      });

      console.log('Saved event:', response.data);

      setEvents(prevEvents => [
        ...prevEvents,
        {
          id: response.data.id,
          title: response.data.title,
          date: response.data.date,
          type: response.data.type,
          description: response.data.description,
        },
      ]);
    } catch (error: unknown) {
      console.error('Error completo al crear evento desde calendario:', error);
      
      // Mostrar un mensaje más específico al usuario
      let errorMessage = 'Error desconocido al guardar el evento';
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Error: ${errorMessage}`);
      setError(errorMessage);
    }
  };
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date) {
      try {        const response = await axios.post<Event>(`/events/${currentProject?.id}`, {
          title: newEvent.title,
          date: newEvent.date,
          type: newEvent.type,
          description: newEvent.description,
        });

        setEvents(prevEvents => [
          ...prevEvents,
          {
            id: response.data.id,
            title: response.data.title,
            date: response.data.date,
            type: response.data.type,
            description: response.data.description,
          },
        ]);

        setNewEvent({ title: '', date: '', type: 'other', description: '' });
        setIsModalOpen(false);
      } catch (error: unknown) {
        console.error('Error al añadir el evento:', error);
        let errorMessage = 'Error al guardar el evento';
        if (error instanceof AxiosError) {
          errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert(`Hubo un error al guardar el evento: ${errorMessage}`);
        setError(errorMessage);
      }
    }
  };
  return (    
  
  <div className="p-8">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600 dark:text-gray-400">Cargando calendario...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-red-600 dark:text-red-400">{error}</div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black dark:text-white">Calendario de Proyecto</h1>
            <div className="flex items-center gap-4">
              {/* Show message for collaborators */}
              {!permissions.canCreateEvents && permissions.canViewCalendar && (
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-60">
                  Solo lectura - No puedes crear eventos
                </span>
              )}
              {/* Only show Add Event button if user can create events */}
              {permissions.canCreateEvents && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mr-60"
                >
                  Añadir Evento
                </button>
              )}
            </div>
          </div>

          <Calendar 
            events={events}
            onEventCreate={handleCalendarEventCreate}
            canCreateEvents={permissions.canCreateEvents}
          />

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
        </>
      )}{/* Modal para añadir evento - Only show if user can create events */}
      {isModalOpen && permissions.canCreateEvents && (
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
                <label className="block text-gray-400 mb-2">Tipo</label>                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as 'meeting' | 'deadline' | 'other' })}
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