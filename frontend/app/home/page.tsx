'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

import { useProjects } from '@/app/hooks/useProjects';


export default function Home() {
  const { theme } = useTheme();
  const { projects } = useProjects();
  const router = useRouter();
    // Estados para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Filtrar proyectos basado en los términos de búsqueda
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLocation = locationFilter === '' || 
        (project.location && project.location.toLowerCase().includes(locationFilter.toLowerCase()));
      
      return matchesSearch && matchesLocation;
    });
  }, [projects, searchTerm, locationFilter]);

  const handleSearch = () => {
    // La búsqueda ya se realiza automáticamente a través del useMemo
    console.log('Buscando proyectos:', { searchTerm, locationFilter });
  };

  return (
    <div className={`font-albert container mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center gap-4 mb-5">        <div className={`font-bold search flex w-[400px] p-4 rounded-xl transition-all duration-200 ${
          searchTerm ? 'ring-2 ring-green-500' : ''
        } ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'
        }`}>
          <i className="bx bx-search text-xl mr-4" />          <input
            type="text"
            placeholder="Buscar por trabajos o compañias"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className={`bg-transparent outline-none w-full ${
              theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>        <div className={`font-bold city flex w-[400px] items-center p-4 rounded-xl transition-all duration-200 ${
          locationFilter ? 'ring-2 ring-green-500' : ''
        } ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'
        }`}>
          <i className="bx bxs-location-plus text-xl mr-4" />          <input
            type="text"
            placeholder="Ingresa ciudad, estado, o región"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className={`bg-transparent outline-none w-full ${
              theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>        <button 
          className="font-bold bg-green-500 text-white py-4 px-8 rounded-xl hover:bg-green-600"
          onClick={handleSearch}
        >
          Buscar
        </button>
      </div>

      <div className="main">
        <div className="content mt-20">
          <div className="header mb-4">
            <div className="flex justify-between items-center mb-2">              <div>
                <h4 className={`text-2xl font-bold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Aquí están tus proyectos
                </h4>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Maximiza todo tu potencial y lleva tus proyectos al siguiente nivel
                </p>
                {(searchTerm || locationFilter) && (
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mostrando {filteredProjects.length} de {projects.length} proyectos
                  </p>
                )}
              </div>
              <button
                className="ml-4 bg-green-600 text-white px-6 py-2 mt-12 rounded-xl font-bold hover:bg-green-700 transition"
                onClick={() => router.push('/home/addproject')}
              >
                Crear Proyecto
              </button>
            </div>
          </div>          <div className="space-y-6 mt-12">
            {filteredProjects.length > 0 ? (
              filteredProjects.slice(0, 5).map((project) => {
                console.log('Project data:', project); // Debug log
                return (
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
                        onClick={() => {
                          console.log('Navigating to project ID:', project.id); // Debug log
                          router.push(`/admin/projects/${project.id}`);
                        }}
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
                );
              })            ) : (
              <div className="text-center py-8">
                {projects.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No hay proyectos recientes.</p>
                ) : (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No se encontraron proyectos que coincidan con tu búsqueda.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setLocationFilter('');
                      }}
                      className="text-blue-500 hover:text-blue-600 underline"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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