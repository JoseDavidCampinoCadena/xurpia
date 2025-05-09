import axiosInstance from './axios';
import { AxiosError } from 'axios';
import { EventType } from '../types/events';

// Interfaz para los datos de eventos
export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  type: 'meeting' | 'deadline' | 'other'; // Tipo visual del evento
  eventType: EventType; // PERSONAL, PROJECT o ADMIN_ASSIGNED
  projectId?: number;
  assigneeId?: number;
}

// Obtener todos los eventos con posibilidad de filtrado
export const getEvents = async (options?: {
  projectId?: string | number;
  eventType?: EventType;
}) => {
  try {
    let url = '/events';
    const params = new URLSearchParams();
    
    if (options?.projectId) {
      params.append('projectId', String(options.projectId));
    }
    
    if (options?.eventType) {
      // El backend espera 'type' como nombre del parámetro
      params.append('type', options.eventType);
    }
    
    const queryString = params.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
    
    console.log('Requesting events from:', url);
    
    // Verificar que existe token antes de hacer la petición
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
      
    if (!token) {
      console.warn('No authentication token found in cookies');
      // Podríamos redirigir al login o manejar de otra forma
      // window.location.href = '/login';
    }
    
    const response = await axiosInstance.get(url);
    console.log('Events received:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching events:', axiosError);
    if (axiosError.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Response data:', axiosError.response.data);
      console.error('Response status:', axiosError.response.status);
      console.error('Response headers:', axiosError.response.headers);
      
      if (axiosError.response.status === 403) {
        console.error('Authentication issue - check if your token is valid');
      }
    } else if (axiosError.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No response received:', axiosError.request);
    } else {
      // Algo ocurrió en la configuración de la solicitud
      console.error('Error message:', axiosError.message);
    }
    throw error;
  }
};

// Obtener un evento específico por ID
export const getEventById = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error fetching event with ID ${id}:`, axiosError);
    throw error;
  }
};

// Crear un nuevo evento
export const createEvent = async (eventData: {
  title: string;
  date: string;
  type: string;
  description?: string;
  projectId?: number;
  eventType: EventType;
  assigneeId?: number;
}) => {
  try {
    const response = await axiosInstance.post('/events', eventData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error creating event:', axiosError);
    throw error;
  }
};

// Actualizar un evento existente
export const updateEvent = async (id: number, eventData: Partial<Event>) => {
  try {
    const response = await axiosInstance.patch(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error updating event with ID ${id}:`, axiosError);
    throw error;
  }
};

// Eliminar un evento
export const deleteEvent = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error deleting event with ID ${id}:`, axiosError);
    throw error;
  }
}; 