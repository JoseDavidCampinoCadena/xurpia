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
          Bienvenido al panel de administración
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 flex items-center">
          <FaProjectDiagram className="text-4xl text-blue-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Proyectos</h3>
            <p className="text-2xl font-bold">{stats.totalProjects}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center">
          <FaUsers className="text-4xl text-green-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Colaboradores</h3>
            <p className="text-2xl font-bold">{stats.totalCollaborators}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center">
          <FaTasks className="text-4xl text-purple-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Tareas</h3>
            <p className="text-2xl font-bold">{stats.totalTasks}</p>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin"
            className="btn-primary p-4 rounded-lg text-center hover:opacity-90 transition-opacity"
          >
            Gestionar Proyectos
          </Link>
          <Link 
            href="/admin/collaborators"
            className="btn-secondary p-4 rounded-lg text-center hover:opacity-90 transition-opacity"
          >
            Gestionar Colaboradores
          </Link>
          <Link 
            href="/admin/tasks"
            className="bg-purple-500 text-white p-4 rounded-lg text-center hover:opacity-90 transition-opacity"
          >
            Gestionar Tareas
          </Link>
        </div>
      </div>

      {/* Actividad Reciente */}
     
    </div>
  );
} 