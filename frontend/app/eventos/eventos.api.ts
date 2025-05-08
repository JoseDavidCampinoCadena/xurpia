// eventos.api.ts
import axios from 'axios';

// Definición local de la interfaz Event
export interface Event {
  id: number;
  title: string;
  date: string;
  type: 'meeting' | 'deadline' | 'other';
  description: string;
}

export const getEventsByProject = async (projectId: number): Promise<Event[]> => {
  const { data } = await axios.get(`/api/eventos/${projectId}`);
  return data;
};

export const createEventForProject = async (
  projectId: number,
  eventData: Omit<Event, 'id'>
): Promise<Event> => {
  const { data } = await axios.post(`/api/eventos/${projectId}`, eventData);
  return data;
};
