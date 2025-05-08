import axios from 'axios';

export interface Event {
  id: number;
  title: string;
  date: string;
  type: 'meeting' | 'deadline' | 'other';
  description: string;
}

export const eventsApi = {
  getEvents: async (): Promise<Event[]> => {
    const { data } = await axios.get('/api/events');
    return data;
  },

  createEvent: async (eventData: Omit<Event, 'id'>): Promise<Event> => {
    const { data } = await axios.post('/api/events', eventData);
    return data;
  },

  deleteEvent: async (eventId: number): Promise<void> => {
    await axios.delete(`/api/events/${eventId}`);
  },
};