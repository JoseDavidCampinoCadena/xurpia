// Tipos de eventos según la enumeración del backend
export enum EventType {
  PERSONAL = 'PERSONAL',
  PROJECT = 'PROJECT',
  ADMIN_ASSIGNED = 'ADMIN_ASSIGNED'
}

// Interfaz completa para un evento
export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  type: 'meeting' | 'deadline' | 'other'; // Tipo visual del evento
  eventType: EventType; // PERSONAL, PROJECT o ADMIN_ASSIGNED
  projectId?: number;
  assigneeId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para crear un evento
export interface CreateEventDto {
  title: string;
  date: string;
  type: string;
  description?: string;
  projectId?: number;
  eventType: EventType;
  assigneeId?: number;
}

// Interfaz para actualizar un evento
export interface UpdateEventDto {
  title?: string;
  date?: string;
  type?: string;
  description?: string;
  projectId?: number;
  eventType?: EventType;
  assigneeId?: number;
}
