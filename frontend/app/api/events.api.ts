import axiosInstance from './axios';

export const getEvents = async (projectId: string) => {
  try {
    const response = await axiosInstance.get(`/events/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const createEvent = async (projectId: string, eventData: any) => {
  try {
    const response = await axiosInstance.post(`/events/${projectId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}; 