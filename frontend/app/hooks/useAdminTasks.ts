'use client';

import { useState, useEffect, useCallback } from 'react';
import { tasksApi, Task, CreateTaskData, UpdateTaskData } from '../api/tasks.api';
import { useAuth } from './useAuth';
import { useProjects } from './useProjects';

export const useAdminTasks = (projectId?: number) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { projects, loading: loadingProjects } = useProjects();

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Get ALL tasks (don't pass userId to get all tasks instead of user-specific ones)
      const data = await tasksApi.getAll();
      
      // If projectId is provided, filter tasks by project
      const filteredTasks = projectId 
        ? data.filter(task => task.projectId === projectId)
        : data;
      
      setTasks(filteredTasks);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

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

    const finalProjectId = taskData.projectId || projectId || projects[0].id;

    try {
      const newTask = await tasksApi.create({
        title: taskData.title || '',
        description: taskData.description,
        projectId: finalProjectId,
        assigneeId: taskData.assigneeId || user.id, // Use the provided assigneeId or fallback to current user
        status: taskData.status || 'PENDING'
      });
      
      setTasks(prev => [...prev, newTask]);
      setError(null);
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al crear la tarea';
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

    try {
      const updatedTask = await tasksApi.update(id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      setError(null);
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al actualizar la tarea';
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

    try {
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al eliminar la tarea';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (user && !loadingProjects) {
      fetchTasks();
    }
  }, [user, loadingProjects, fetchTasks]);

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
