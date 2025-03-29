'use client';

import React, { useState } from 'react';
import { useTasks } from '@/app/hooks/useTasks';
import { useAuth } from '@/app/hooks/useAuth';
import { useProjects } from '@/app/hooks/useProjects';

export default function TasksPage() {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const { user } = useAuth();
  const { projects, loading: loadingProjects } = useProjects();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await createTask({
        title: newTaskTitle,
      });
      setNewTaskTitle('');
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (taskId: number) => {
    if (!editTitle.trim()) return;

    try {
      await updateTask(taskId, {
        title: editTitle,
      });
      setEditingTask(null);
      setEditTitle('');
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTask(taskId, {
        status: newStatus as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
      });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  if (loading || loadingProjects) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!projects || projects.length === 0) {
    return (
      <div className="p-4">
        <div className="text-red-500">No hay proyectos disponibles. Necesitas crear un proyecto primero.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Tareas</h1>

      {/* Formulario para crear nueva tarea */}
      <form onSubmit={handleCreateTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Nueva tarea"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Agregar
          </button>
        </div>
      </form>

      {/* Lista de tareas */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border rounded-lg shadow-sm bg-black"
          >
            {editingTask === task.id ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={() => handleUpdateTask(task.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-zinc-500"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setEditTitle('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-500">
                    Asignado a: {task.assignee.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Proyecto: {task.project.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="p-2 border rounded-xl"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="COMPLETED">Completada</option>
                  </select>
                  <button
                    onClick={() => {
                      setEditingTask(task.id);
                      setEditTitle(task.title);
                    }}
                    className="px-4 bg-neutral-600 text-white hover:text-zinc-200 rounded-xl"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 bg-red-500 text-white hover:text-zinc-200 rounded-xl"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 