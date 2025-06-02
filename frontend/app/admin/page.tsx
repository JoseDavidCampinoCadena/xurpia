'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/app/hooks/useProjects';
import { useCollaborators } from '@/app/hooks/useCollaborators';
import { FaUsers, FaProjectDiagram, FaTasks } from 'react-icons/fa';
import Link from 'next/link';

export default function AdminDashboard() {
  const { projects } = useProjects();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCollaborators: 0,
    totalTasks: 0
  });

  const currentProject = projects && projects.length > 0 ? projects[0] : null;
  const currentProjectId = currentProject ? currentProject.id : null;

  useEffect(() => {
    const calculateStats = async () => {
      // Calcular estadísticas
      setStats({
        totalProjects: projects.length,
        totalCollaborators: projects.reduce((acc, project) => 
          acc + (project.collaborators?.length || 0), 0),
        totalTasks: projects.reduce((acc, project) => 
          acc + (project.tasks?.length || 0), 0)
      });
    };

    calculateStats();
  }, [projects]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">
          Panel de Administración
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {currentProject ? `Proyecto actual: ${currentProject.name}` : 'No hay proyectos disponibles'}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 flex items-center shadow-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <FaProjectDiagram className="text-4xl text-blue-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Nombre del Proyecto</h3>
            {currentProject && (
              <p className="text-lg font-bold">{currentProject.name}</p>
            )}
          </div>
        </div>
        <div className="card p-6 flex items-center shadow-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <FaUsers className="text-4xl text-green-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Colaboradores</h3>
            <p className="text-2xl font-bold">{stats.totalCollaborators}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center shadow-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <FaTasks className="text-4xl text-purple-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Tareas</h3>
            <p className="text-2xl font-bold">{stats.totalTasks}</p>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card p-6 mb-8 shadow-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full">
          <Link 
            href={currentProjectId ? `/admin/projects/${currentProjectId}/collaborators` : '#'}
            className={`btn-secondary p-4 rounded-lg text-center font-semibold hover:scale-[1.03] hover:opacity-90 transition-all duration-150${!currentProjectId ? ' opacity-50 pointer-events-none' : ''}`}
          >
            Gestionar Colaboradores
          </Link>
          <Link 
            href={currentProjectId ? `/admin/projects/${currentProjectId}/tasks` : '#'}
            className={`bg-purple-500 text-white p-4 rounded-lg text-center font-semibold hover:scale-[1.03] hover:opacity-90 transition-all duration-150${!currentProjectId ? ' opacity-50 pointer-events-none' : ''}`}
          >
            Gestionar Tareas
          </Link>
          <Link 
            href={currentProjectId ? `/admin/projects/${currentProjectId}/calendar` : '#'}
            className={`bg-yellow-500 text-white p-4 rounded-lg text-center font-semibold hover:scale-[1.03] hover:opacity-90 transition-all duration-150${!currentProjectId ? ' opacity-50 pointer-events-none' : ''}`}
          >
            Gestionar Calendario
          </Link>
        </div>
      </div>

      {/* Actividad Reciente */}
     
    </div>
  );
}