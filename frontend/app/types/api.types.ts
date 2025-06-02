// Tipos de usuario
export interface User {
  id: number;
  name: string;
  email: string;
  description?: string;
  profileImage?: string;
  cvUrl?: string;
  gender?: string;
  profession?: string; // Asegura que profession está presente
  nationality?: string;
  age?: number;
  languages?: string[];
  projectsCount?: number; // Nuevo campo para el conteo de proyectos
}

// Tipos de proyecto
export interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  owner?: User;
  collaborators?: Collaborator[];
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de tarea
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assigneeId: number;
  assignee?: User;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de colaborador
export interface Collaborator {
  id: number;
  userId: number;
  projectId: number;
  role: CollaboratorRole;
  user?: User;
  project?: Project;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum CollaboratorRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

// Tipos de respuesta API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}