'use client';

import { useState, useEffect } from 'react';
import { tasksApi, Task, CreateTaskData, UpdateTaskData } from '../api/tasks.api';
import { useAuth } from './useAuth';
import { useProjects } from './useProjects';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { projects, loading: loadingProjects } = useProjects();

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await tasksApi.getAll(user.id);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Partial<CreateTaskData>) => {
    if (!user) {
      setError('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    if (loadingProjects) {
      setError('Cargando proyectos...');
      throw new Error('Cargando proyectos...');
    }

    if (!projects || projects.length === 0) {
      setError('No hay proyectos disponibles. Crea un proyecto primero.');
      throw new Error('No hay proyectos disponibles');
    }

    const projectId = taskData.projectId || projects[0].id;

    try {
      const newTask = await tasksApi.create({
        title: taskData.title || '',
        description: taskData.description,
        projectId,
        assigneeId: user.id,
        status: taskData.status || 'PENDING'
      });
      
      setTasks(prev => [...prev, newTask]);
      setError(null);
      return newTask;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear la tarea';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTask = async (id: number, taskData: UpdateTaskData) => {
    if (!user) {
      setError('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    const task = tasks.find(t => t.id === id);
    if (!task) {
      setError('Tarea no encontrada');
      throw new Error('Tarea no encontrada');
    }

    if (task.assigneeId !== user.id) {
      setError('No tienes permiso para actualizar esta tarea');
      throw new Error('No tienes permiso para actualizar esta tarea');
    }

    try {
      const updatedTask = await tasksApi.update(id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      setError(null);
      return updatedTask;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la tarea';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTask = async (id: number) => {
    if (!user) {
      setError('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    const task = tasks.find(t => t.id === id);
    if (!task) {
      setError('Tarea no encontrada');
      throw new Error('Tarea no encontrada');
    }

    if (task.assigneeId !== user.id) {
      setError('No tienes permiso para eliminar esta tarea');
      throw new Error('No tienes permiso para eliminar esta tarea');
    }

    try {
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la tarea';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (user && !loadingProjects) {
      fetchTasks();
    }
  }, [user, loadingProjects]);

  return {
    tasks,
    loading: loading || loadingProjects,
    error,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
}; 