'use client';

import { useEffect, useState } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api/events.api';
import { Event, EventType } from '../../types/events';
import { getAllUsers } from '../../api/users.api';
import { getAllProjects } from '../../api/projects.api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Project {
  id: number;
  name: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    date: '',
    type: 'meeting' as 'meeting' | 'deadline' | 'other',
    description: '',
    eventType: EventType.ADMIN_ASSIGNED,
    assigneeId: 0,
    projectId: 0
  });
  
  const [editing, setEditing] = useState<number | null>(null);
  const [filter, setFilter] = useState<EventType | ''>('');

  useEffect(() => {
    fetchEvents();
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents(filter ? { eventType: filter as EventType } : {});
      if (Array.isArray(response)) {
        setEvents(response);
      } else if (response && Array.isArray(response.events)) {
        setEvents(response.events);
      }
    } catch (error) {
      console.error('Error al obtener eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsData = await getAllProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === 'assigneeId' || name === 'projectId' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editing) {
        // Actualizar evento existente
        const updatedEvent = await updateEvent(editing, form);
        setEvents(prev => prev.map(e => e.id === editing ? updatedEvent : e));
        setEditing(null);
      } else {
        // Crear nuevo evento
        const newEvent = await createEvent({
          ...form,
          date: new Date(form.date).toISOString(),
        });
        setEvents(prev => [...prev, newEvent]);
      }
      
      // Limpiar formulario
      setForm({
        title: '',
        date: '',
        type: 'meeting',
        description: '',
        eventType: EventType.ADMIN_ASSIGNED,
        assigneeId: 0,
        projectId: 0
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
      description: event.description || '',
      eventType: event.eventType,
      assigneeId: event.assigneeId || 0,
      projectId: event.projectId || 0
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

  const getEventTypeLabel = (type: EventType) => {
    switch (type) {
      case EventType.PERSONAL:
        return 'Personal';
      case EventType.PROJECT:
        return 'Proyecto';
      case EventType.ADMIN_ASSIGNED:
        return 'Asignado';
      default:
        return 'Desconocido';
    }
  };

  const renderAssigneeInfo = (event: Event) => {
    if (!event.assigneeId) return 'No asignado';
    const assignee = users.find(u => u.id === event.assigneeId);
    return assignee ? assignee.name : `Usuario #${event.assigneeId}`;
  };

  const renderProjectInfo = (event: Event) => {
    if (!event.projectId) return 'Sin proyecto';
    const project = projects.find(p => p.id === event.projectId);
    return project ? project.name : `Proyecto #${event.projectId}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Administración de Eventos</h1>
      
      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">Filtrar por tipo:</label>
        <div className="flex gap-2">
          <button
            onClick={() => { setFilter(''); fetchEvents(); }}
            className={`px-3 py-2 rounded ${filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-white'}`}
          >
            Todos
          </button>
          <button
            onClick={() => { setFilter(EventType.PERSONAL); fetchEvents(); }}
            className={`px-3 py-2 rounded ${filter === EventType.PERSONAL ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-white'}`}
          >
            Personales
          </button>
          <button
            onClick={() => { setFilter(EventType.PROJECT); fetchEvents(); }}
            className={`px-3 py-2 rounded ${filter === EventType.PROJECT ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-white'}`}
          >
            Proyectos
          </button>
          <button
            onClick={() => { setFilter(EventType.ADMIN_ASSIGNED); fetchEvents(); }}
            className={`px-3 py-2 rounded ${filter === EventType.ADMIN_ASSIGNED ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-white'}`}
          >
            Asignados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario para crear/editar eventos */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{editing ? 'Editar evento' : 'Crear evento asignado'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Título</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-700 dark:text-white border-gray-300 dark:border-zinc-700"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Fecha y hora</label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-700 dark:text-white border-gray-300 dark:border-zinc-700"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Tipo de evento</label>
              <select
                name="eventType"
                value={form.eventType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-700 dark:text-white border-gray-300 dark:border-zinc-700"
                required
              >
                <option value={EventType.ADMIN_ASSIGNED}>Asignado</option>
                <option value={EventType.PROJECT}>Proyecto</option>
                <option value={EventType.PERSONAL}>Personal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Tipo visual</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-700 dark:text-white border-gray-300 dark:border-zinc-700"
              >
                <option value="meeting">Reunión</option>
                <option value="deadline">Fecha límite</option>
                <option value="other">Otro</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Asignar a usuario</label>
              <select
                name="assigneeId"
                value={form.assigneeId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-700 dark:text-white border-gray-300 dark:border-zinc-700"
                disabled={form.eventType !== EventType.ADMIN_ASSIGNED}
              >
                <option value={0}>Seleccionar usuario</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {form.eventType === EventType.ADMIN_ASSIGNED && form.assigneeId === 0 && (
                <p className="text-red-500 text-sm mt-1">Se debe asignar a un usuario para eventos de tipo ADMIN_ASSIGNED</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Proyecto (opcional)</label>
              <select
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-700 dark:text-white border-gray-300 dark:border-zinc-700"
                disabled={form.eventType === EventType.PERSONAL}
              >
                <option value={0}>Sin proyecto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {form.eventType === EventType.PROJECT && form.projectId === 0 && (
                <p className="text-red-500 text-sm mt-1">Se debe seleccionar un proyecto para eventos de tipo PROJECT</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-700 dark:text-white border-gray-300 dark:border-zinc-700 resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={loading || (form.eventType === EventType.ADMIN_ASSIGNED && form.assigneeId === 0) || (form.eventType === EventType.PROJECT && form.projectId === 0)}
              >
                {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Evento'}
              </button>
              
              {editing && (
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  onClick={() => {
                    setEditing(null);
                    setForm({
                      title: '',
                      date: '',
                      type: 'meeting',
                      description: '',
                      eventType: EventType.ADMIN_ASSIGNED,
                      assigneeId: 0,
                      projectId: 0
                    });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Listado de eventos */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Lista de Eventos</h2>
          
          {loading && <p className="text-blue-600">Cargando...</p>}
          
          {events.length === 0 && !loading && (
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-8 text-center text-gray-500">
              No hay eventos que mostrar.
            </div>
          )}
          
          <div className="space-y-4">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(event => (
                <div key={event.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{event.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          dateStyle: 'full',
                          timeStyle: 'short'
                        })}
                      </p>
                      {event.description && (
                        <p className="text-gray-700 dark:text-gray-300 mt-2">{event.description}</p>
                      )}
                      <div className="mt-2 space-x-2">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                          {getEventTypeLabel(event.eventType)}
                        </span>
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {event.type === 'meeting' ? 'Reunión' : 
                          event.type === 'deadline' ? 'Fecha límite' : 'Otro'}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-semibold">Asignado a:</span> {renderAssigneeInfo(event)}
                        </div>
                        <div>
                          <span className="font-semibold">Proyecto:</span> {renderProjectInfo(event)}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
