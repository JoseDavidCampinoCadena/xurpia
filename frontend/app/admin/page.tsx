'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/app/hooks/useProjects';
import { useAuth } from '@/app/hooks/useAuth';
import { FaUsers, FaProjectDiagram, FaTasks, FaBrain, FaChartLine, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import { Project } from '@/app/hooks/useProjects';

interface AdminDashboardProps {
  project?: Project | null;
}

export default function AdminDashboard({ project }: AdminDashboardProps) {
  const { projects } = useProjects();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCollaborators: 0,
    totalTasks: 0
  });

  // Use the passed project or fall back to the first project
  const currentProject = project || (projects && projects.length > 0 ? projects[0] : null);
  const currentProjectId = currentProject ? currentProject.id : null;
  
  // Check if current user is the owner of the project
  const isOwner = user && currentProject && user.id === currentProject.ownerId;
  useEffect(() => {
    const calculateStats = async () => {
      // Calcular estadísticas del proyecto actual
      setStats({
        totalProjects: projects.length,
        totalCollaborators: currentProject?.collaborators?.length || 0,
        totalTasks: currentProject?.tasks?.length || 0
      });
    };    calculateStats();
  }, [projects, currentProject]);

  // If there are no projects, show a message
  if (!currentProject) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-gray-100 dark:bg-gray-800/50 p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-md">
            <FaProjectDiagram className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No hay proyectos disponibles
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Necesitas tener al menos un proyecto para acceder al panel de administración.
            </p>
            <Link 
              href="/home/projects"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Ir a Proyectos
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        </div>        <div className="card p-6 flex items-center shadow-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <FaUsers className="text-4xl text-green-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Colaboradores del Proyecto</h3>
            <p className="text-2xl font-bold">{stats.totalCollaborators}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center shadow-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <FaTasks className="text-4xl text-purple-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Tareas del Proyecto</h3>
            <p className="text-2xl font-bold">{stats.totalTasks}</p>
          </div>
        </div>
      </div>       {/* Acciones rápidas */}
      <div className="card p-6 mb-8 shadow-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        
        {/* Show access denied message only for quick actions if user is not owner */}
        {currentProject && !isOwner ? (
          <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-2">
              <FaLock className="text-red-500 text-xl" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                Acceso Restringido
              </h3>
            </div>
            <p className="text-red-600 dark:text-red-300 text-sm mb-2">
              Solo el propietario del proyecto puede realizar acciones administrativas.
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p><strong>Propietario:</strong> {currentProject.owner?.name || 'Usuario desconocido'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
          <Link 
            href={currentProjectId ? `/admin/projects/${currentProjectId}/collaborators` : '#'}
            className={`btn-secondary p-4 rounded-lg text-center font-semibold hover:scale-[1.03] hover:opacity-90 transition-all duration-150${!currentProjectId ? ' opacity-50 pointer-events-none' : ''}`}
          >
            Gestionar Colaboradores
          </Link>
          <Link 
            href={currentProjectId ? `/admin/projects/${currentProjectId}/ai-tasks` : '#'}
            className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg text-center font-semibold hover:scale-[1.03] hover:opacity-90 transition-all duration-150 flex items-center justify-center gap-2${!currentProjectId ? ' opacity-50 pointer-events-none' : ''}`}
          >
            <FaBrain className="w-4 h-4" />
            Tareas IA
          </Link>
          <Link 
            href={currentProjectId ? `/admin/projects/${currentProjectId}/progress` : '#'}
            className={`bg-green-500 text-white p-4 rounded-lg text-center font-semibold hover:scale-[1.03] hover:opacity-90 transition-all duration-150 flex items-center justify-center gap-2${!currentProjectId ? ' opacity-50 pointer-events-none' : ''}`}
          >
            <FaChartLine className="w-4 h-4" />
            Progreso
          </Link>
          <Link 
            href={currentProjectId ? `/admin/projects/${currentProjectId}/calendar` : '#'}
            className={`bg-yellow-500 text-white p-4 rounded-lg text-center font-semibold hover:scale-[1.03] hover:opacity-90 transition-all duration-150${!currentProjectId ? ' opacity-50 pointer-events-none' : ''}`}          >
            Gestionar Calendario
          </Link>
        </div>
        )}
      </div>

      {/* Actividad Reciente */}
     
    </div>
  );
}