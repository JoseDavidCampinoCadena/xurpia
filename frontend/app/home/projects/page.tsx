'use client';

import React, { useState, useEffect } from 'react';
import { useProjects } from '@/app/hooks/useProjects';
import AdminDashboard from '@/app/admin/page';

export default function ProjectsPage() {
  const { projects, loading, error, createProject } = useProjects();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    if (projects.length > 0) {
      // Redirigir o mostrar el dashboard si ya hay un proyecto
      setNewProjectName('');
      setNewProjectDescription('');
    }
  }, [projects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || projects.length > 0) return;

    try {
      await createProject({
        name: newProjectName,
        description: newProjectDescription,
      });
      setNewProjectName('');
      setNewProjectDescription('');
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  if (projects.length > 0) return <AdminDashboard />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Proyecto</h1>

      <form onSubmit={handleCreateProject} className="mb-6 bg-white p-4 dark:bg-zinc-900 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nombre del proyecto"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Descripción
            </label>
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Descripción del proyecto"
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={projects.length > 0}
          >
            Crear Proyecto
          </button>
        </div>
      </form>
    </div>
  );
}
