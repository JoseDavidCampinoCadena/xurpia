import axios from './axios';

export interface Note {
  id: number;
  title: string;
  content?: string;
  completed: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  userId: number;
}

export interface CreateNotePayload {
  title: string;
  content?: string;
  completed?: boolean;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  completed?: boolean;
}

const API_URL = '/notes'; // Ensure this matches the backend routing, likely under /api

export const notesApi = {
  createNote: async (noteData: CreateNotePayload): Promise<Note> => {
    const { data } = await axios.post<Note>(API_URL, noteData);
    return data;
  },

  getNotes: async (): Promise<Note[]> => {
    const { data } = await axios.get<Note[]>(API_URL);
    return data;
  },

  getNoteById: async (id: number): Promise<Note> => {
    const { data } = await axios.get<Note>(`${API_URL}/${id}`);
    return data;
  },

  updateNote: async (id: number, noteData: UpdateNotePayload): Promise<Note> => {
    const { data } = await axios.patch<Note>(`${API_URL}/${id}`, noteData);
    return data;
  },

  deleteNote: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
};
