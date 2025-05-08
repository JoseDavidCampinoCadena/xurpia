'use client';

import React from 'react'; // useState fue removido ya que no se usa directamente aquí después de los cambios
import { useTasks } from '@/app/hooks/useTasks';
import { useAuth } from '@/app/hooks/useAuth'; // Mantener si es necesario para el contexto o futuras comprobaciones de roles
import { useProjects } from '@/app/hooks/useProjects';

export default function TasksPage() {
  // Solo necesitamos 'updateTask' para cambiar el estado.
  // 'createTask' y 'deleteTask' son removidos de las importaciones del hook y de su uso.
  const { tasks, loading, error, updateTask } = useTasks();
  const { user } = useAuth(); // Se mantiene por si se necesita para lógica de permisos en el futuro.
  const { projects, loading: loadingProjects } = useProjects();

  // Estados para nueva tarea y edición son eliminados:
  // const [newTaskTitle, setNewTaskTitle] = useState('');
  // const [editingTask, setEditingTask] = useState<number | null>(null);
  // const [editTitle, setEditTitle] = useState('');

  // Función para crear tarea eliminada:
  // const handleCreateTask = async (e: React.FormEvent) => { ... };

  // Función para actualizar título de tarea eliminada (la función updateTask del hook se usará solo para estado):
  // const handleUpdateTask = async (taskId: number) => { ... };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTask(taskId, {
        status: newStatus as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      // Aquí podrías añadir un feedback al usuario si falla la actualización.
    }
  };

  // Función para eliminar tarea eliminada:
  // const handleDeleteTask = async (taskId: number) => { ... };

  if (loading || loadingProjects) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!projects || projects.length === 0) {
    return (
      <div className="p-4">
        <div className="text-white">No hay proyectos disponibles. Necesitas crear un proyecto primero o Únete a un proyecto para ver las tareas asignadas</div>
      </div>
    );
  }

  // Filtrar tareas para mostrar solo las asignadas al usuario actual, si 'user' y 'task.assignee' están disponibles y son comparables.
  // Esto es un ejemplo, la estructura de 'task.assignee' y 'user' debe ser conocida.
  // Si 'tasks' ya viene filtrado desde el hook useTasks para el usuario actual, este filtro no es necesario aquí.
  // Asumiendo que task.assignee.id y user.id existen para la comparación.
  const assignedTasks = user ? tasks.filter(task => task.assignee && task.assignee.id === user.id) : tasks;
  // Si quieres mostrar TODAS las tareas del proyecto sin filtrar por asignado (como parece ser el comportamiento original),
  // simplemente usa 'tasks' directamente: const assignedTasks = tasks;

  if (assignedTasks.length === 0 && projects.length > 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Mis Tareas Asignadas</h1>
        <p className="text-gray-400">No tienes tareas asignadas en los proyectos actuales o no hay tareas creadas.</p>
      </div>
    );
  }


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Tareas Asignadas del Proyecto</h1>

      {/* Formulario para crear nueva tarea ELIMINADO */}

      {/* Lista de tareas */}
      <div className="space-y-4">
        {assignedTasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border rounded-lg shadow-sm bg-zinc-900 border-zinc-700" // Estilo actualizado para mejor contraste
          >
            {/* Sección de edición de título ELIMINADA */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-white">{task.title}</h3>
                {task.assignee && (
                  <p className="text-sm text-gray-400">
                    Asignado a: {task.assignee.name || 'No asignado'}
                  </p>
                )}
                {task.project && (
                  <p className="text-sm text-gray-400">
                    Proyecto: {task.project.name || 'Sin proyecto'}
                  </p>
                )}
                 {task.description && ( // Mostrar descripción si existe
                  <p className="text-sm text-gray-300 mt-1">
                    Descripción: {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="p-2 border rounded-xl bg-zinc-700 text-white border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                  aria-label={`Estado de la tarea ${task.title}`}
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completada</option>
                </select>
                {/* Botón Editar ELIMINADO */}
                {/* Botón Eliminar ELIMINADO */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}