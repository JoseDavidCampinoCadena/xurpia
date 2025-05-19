'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';
import { useProjects } from '@/app/hooks/useProjects';
import { collaboratorsApi } from '@/app/api/collaborators.api';


export default function Home() {
  const { theme } = useTheme();
  const { projects } = useProjects();
  const { currentProjectId } = useProjects();
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const router = useRouter();
  
    useEffect(() => {
      if (currentProjectId) {
        refreshCollaborators();
        fetchProjectCode();
      }
    }, [currentProjectId]);

  const handleJoinWithCode = async () => {
    setJoinError('');
    setJoinSuccess('');
    try {
      if (!joinCode.trim()) {
        setJoinError('Debes ingresar un código válido.');
        return;
      }
      await collaboratorsApi.joinByCode(joinCode.trim());
      setJoinSuccess('¡Te uniste correctamente al proyecto!');
      setJoinCode('');
      setTimeout(() => setJoinSuccess(''), 3000);
    } catch (error: any) {
      if (error?.response?.data?.message) {
        setJoinError(error.response.data.message);
      } else if (typeof error?.response?.data === 'string') {
        setJoinError(error.response.data);
      } else {
        setJoinError('No se pudo unir al proyecto. Verifica el código o si ya eres colaborador.');
      }
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
                  Aquí están tus proyectos
                </h4>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Aquí estarán tus grupos de trabajo
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6 mt-12">
            {projects.length > 0 ? (
              projects.slice(0, 5).map((project) => (
                <div key={project.id} className="dark:bg-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-md">
                  {/* Logo */}
                  <img
                    src={project.logo}
                    alt={project.name + ' logo'}
                    className="w-20 h-20 rounded-lg object-cover border border-zinc-700 bg-white"
                  />
                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                          <span className="text-gray-400 text-sm md:ml-4 md:border-l md:border-gray-700 md:pl-4">
                            Última conexión {getTimeAgo(project.lastConnection)}
                          </span>
                        </div>
                        <span className="text-gray-300 text-base">{project.location}</span>
                        <span className="text-gray-300 text-base">Cantidad de Integrantes : {project.collaborators?.length || 0}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/projects/${project.id}`)}
                        className="mt-4 md:mt-0 px-6 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-900 transition"
                      >
                        Entrar
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm mt-4 max-w-2xl">
                      {project.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No hay proyectos recientes.</p>
            )}
          </div>
        </div>

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
          {joinSuccess && <p className="text-green-500 text-sm mt-2">{joinSuccess}</p>}
        </div>
      </div>
    </div>
  );
}

/* Función utilitaria para mostrar el tiempo transcurrido */
function getTimeAgo(dateString?: string) {
  if (!dateString) return 'desconocida';
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `hace ${diff} segundos`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} minutos`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} horas`;
  return `hace ${Math.floor(diff / 86400)} días`;
}