'use client';

import { useState } from 'react';
import { FaChartLine, FaCode, FaPaintBrush, FaServer, FaBug } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';

interface ProjectProgress {
  id: string;
  name: string;
  progress: number;
  icon: React.ReactNode;
}

export default function ProgressPage() {
  const { theme } = useTheme();
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([
    {
      id: 'frontend',
      name: 'Frontend',
      progress: 65,
      icon: <FaCode className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
    },
    {
      id: 'backend',
      name: 'Backend',
      progress: 45,
      icon: <FaServer className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
    },
    {
      id: 'design',
      name: 'Diseño UI/UX',
      progress: 80,
      icon: <FaPaintBrush className={`w-5 h-5 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-500'}`} />
    },
    {
      id: 'testing',
      name: 'Testing',
      progress: 0,
      icon: <FaBug className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
    }
  ]);

  const totalProgress = Math.round(
    projectProgress.reduce((acc, curr) => acc + curr.progress, 0) / projectProgress.length
  );

  const updateProgress = (id: string, newProgress: number) => {
    setProjectProgress(prev =>
      prev.map(item =>
        item.id === id ? { ...item, progress: newProgress } : item
      )
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Progreso del Proyecto
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progreso General */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <FaChartLine className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Progreso General
            </h2>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="relative w-48 h-48">
              <div className={`absolute inset-0 border-8 rounded-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-100'}`}></div>
              <div
                className={`absolute inset-0 border-8 rounded-full transition-all duration-1000 ${theme === 'dark' ? 'border-green-400' : 'border-green-500'}`}
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${totalProgress}%, 0 ${totalProgress}%)`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {totalProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles por Área */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Progreso por Área
          </h2>
          <div className="space-y-6">
            {projectProgress.map((area) => (
              <div key={area.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {area.icon}
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {area.name}
                    </span>
                  </div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {area.progress}%
                  </span>
                </div>
                <div className="relative">
                  <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-100'}`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${theme === 'dark' ? 'bg-green-400' : 'bg-green-500'}`}
                      style={{ width: `${area.progress}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={area.progress}
                    onChange={(e) => updateProgress(area.id, parseInt(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Estadísticas
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                Tareas Completadas
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                24/36
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                Tiempo Restante
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                15 días
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                Colaboradores
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                8
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                Hitos Alcanzados
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                3/5
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Timeline
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${theme === 'dark' ? 'bg-green-400' : 'bg-green-500'}`}></div>
              <div>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Fase de Diseño Completada
                </p>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Hace 2 días
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
              <div>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Desarrollo Frontend en Proceso
                </p>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  En curso
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
              <div>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Testing Pendiente
                </p>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Próximamente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 