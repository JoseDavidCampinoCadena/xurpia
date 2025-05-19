'use client';

import React, { useState } from 'react';
import { useProjects } from '@/app/hooks/useProjects';
// Importa useRouter de next/navigation para el App Router
import { useRouter } from 'next/navigation'; // Asegúrate que sea 'next/navigation' si usas App Router

// (No necesitas importar AdminDashboard ni Link aquí si solo es para la lógica de creación y redirección)

// Asumimos que tu hook useProjects devuelve una función createProject
// que, al ser exitosa, devuelve el proyecto creado con su 'id'.
// Ejemplo de la interfaz del proyecto que esperamos:
interface Project {
  id: number; // o string, dependiendo de tu backend
  name: string;
  description?: string;
  // ...otras propiedades
}

export default function ProjectsPage() {
  const { projects, loading, error, createProject } = useProjects();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectLogo, setNewProjectLogo] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Para feedback mientras se crea

  const router = useRouter(); // Inicializa el router

  const maxProjects = 3;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectLogo.trim() || projects.length >= maxProjects || isSubmitting) return;

    setIsSubmitting(true); // Indicar que la operación está en curso

    try {
      // Asumimos que createProject devuelve el proyecto creado
      const newProject: Project = await createProject({
        name: newProjectName,
        description: newProjectDescription,
        logo: newProjectLogo,
        location: newProjectLocation,
        lastConnection: new Date().toISOString(),
      });

      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectLogo('');
      setNewProjectLocation('');

      // Redirigir si newProject tiene un id
      if (newProject && newProject.id) {
        router.push(`/admin/projects/${newProject.id}`);
      } else {
        // Opcional: manejar el caso en que no se obtuvo el ID (puede ser un error o refrescar la lista actual)
        console.warn('Proyecto creado, pero no se recibió ID para redireccionar.');
        // Podrías querer refrescar la lista de proyectos aquí si no lo hace automáticamente useProjects
        // Ejemplo: refetchProjects(); (si tienes esa función en useProjects)
      }

    } catch (err) {
      console.error('Error creating project:', err);
      // Aquí podrías mostrar un error al usuario (ej. con un toast o un mensaje en la UI)
    } finally {
      setIsSubmitting(false); // Finalizar el estado de envío
    }
  };

  if (loading) return <div className="p-4">Cargando proyectos...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Proyecto</h1>

      <form onSubmit={handleCreateProject} className="mb-6 bg-white p-4 dark:bg-zinc-900 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Proyecto
            </label>
            <input
              id="projectName"
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nombre del proyecto"
              className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              required
              disabled={projects.length >= maxProjects || isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="projectLogo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Logo del Proyecto (URL de imagen)
            </label>
            <input
              id="projectLogo"
              type="url"
              value={newProjectLogo}
              onChange={(e) => setNewProjectLogo(e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
              className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              required
              disabled={projects.length >= maxProjects || isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="projectLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ubicación (opcional)
            </label>
            <input
              id="projectLocation"
              type="text"
              value={newProjectLocation}
              onChange={(e) => setNewProjectLocation(e.target.value)}
              placeholder="Ciudad, país, remoto, etc."
              className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              disabled={projects.length >= maxProjects || isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              id="projectDescription"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Descripción del proyecto"
              className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              rows={3}
              disabled={projects.length >= maxProjects || isSubmitting}
            />
          </div>

          {projects.length < maxProjects && (
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={isSubmitting || !newProjectName.trim()} // Deshabilitar si está enviando o el nombre está vacío
            >
              {isSubmitting ? 'Creando Proyecto...' : 'Crear Proyecto'}
            </button>
          )}
        </div>
      </form>

      {projects.length >= maxProjects && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
          Has alcanzado el número máximo de proyectos ({maxProjects}).
        </div>
      )}
    </div>
  );
}