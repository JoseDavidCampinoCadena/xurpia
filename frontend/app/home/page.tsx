'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/contexts/ThemeContext';

import { useEffect, useState } from 'react';
import { useProjects } from '@/app/hooks/useProjects';


export default function Home() {
  const { theme } = useTheme();
  const { projects } = useProjects();
  const { currentProjectId } = useProjects();
  const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');
  
    useEffect(() => {
      if (currentProjectId) {
        refreshCollaborators();
        fetchProjectCode();
      }
    }, [currentProjectId]);

  const handleJoinWithCode = async () => {
      try {
        if (!joinCode.trim()) {
          setJoinError('Debes ingresar un código válido.');
          return;
        }
  
        const userEmail = localStorage.getItem('loggedInUserEmail');
        if (!userEmail) {
          setJoinError('No se encontró el usuario actual. Inicia sesión nuevamente.');
          return;
        }
  
        const project = await projectsApi.getProjectByCode(joinCode.trim());
  
        if (!project || !project.id) {
          setJoinError('Proyecto no encontrado.');
          return;
        }
  
        await collaboratorsApi.addCollaboratorByEmail({
          projectId: project.id,
          email: userEmail,
          role: 'MEMBER',
        });
  
        alert('¡Te uniste correctamente al proyecto!');
        setJoinCode('');
        setJoinError('');
      } catch (error: any) {
        console.error('Error al unirse al proyecto:', error);
        setJoinError('No se pudo unir al proyecto. Verifica el código o si ya eres colaborador.');
      }
    };

    const handleCopyCode = async () => {
      if (!projectCode) return;
      try {
        await navigator.clipboard.writeText(projectCode);
        alert('¡Código copiado al portapapeles!');
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    };

  return (
    <div className={`font-albert container mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center gap-4 mb-5">
        <div className={`font-bold search flex w-[400px] p-4 rounded-xl ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'
        }`}>
          <i className="bx bx-search text-xl mr-4" />
          <input
            type="text"
            placeholder="Buscar por trabajos o compañias"
            className={`bg-transparent outline-none w-full ${
              theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>  
        <div className={`font-bold city flex w-[400px] items-center p-4 rounded-xl ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'
        }`}>
          <i className="bx bxs-location-plus text-xl mr-4" />
          <input
            type="text"
            placeholder="Ingresa ciudad, estado, o región"
            className={`bg-transparent outline-none w-full ${
              theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <button className="font-bold bg-green-500 text-white py-4 px-8 rounded-xl hover:bg-green-600">
          Buscar
        </button>
      </div>

      <div className="main">
        <div className="content mt-20">
          <div className="header mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Grupos
                </h4>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Aquí estarán tus grupos de trabajo
                </p>
              </div>
            </div>
          </div>

            <Link href={'/home/addproject'}>
            <div className='Addproject flex justify-center mb-4 bg-green-500 rounded-lg shadow-md pr-6 p-4 w-[160px] cursor-pointer'>
              <button>Crear Proyecto</button>
            </div>
            </Link>

            <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-md mb-6">
        <p className="text-zinc-800 dark:text-white font-medium">¿Tienes un código de proyecto?</p>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            placeholder="Ingresa el código"
            className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white w-full"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button
            onClick={handleJoinWithCode}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Unirse
          </button>
        </div>
        {joinError && <p className="text-red-500 text-sm mt-2">{joinError}</p>}
      </div>
            

          <div className="card p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md mb-6">
            
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p> {/* Descripción agregada */}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.collaborators?.length || 0} colaboradores · {project.tasks?.length || 0} tareas
                      </p>
                    </div>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="bg-zinc-600 p-4 rounded-xl text-white hover:text-zinc-200"
                    >
                      Entrar
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No hay proyectos recientes.</p>
              )}
            </div>

          </div>




        </div>
      </div>
    </div>
  );
}