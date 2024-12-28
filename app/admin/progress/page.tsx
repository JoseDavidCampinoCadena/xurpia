'use client';

import { useState } from 'react';
import { FaChartLine, FaCode, FaPaintBrush, FaServer, FaBug } from 'react-icons/fa';

interface ProjectProgress {
  id: string;
  name: string;
  progress: number;
  icon: React.ReactNode;
}

export default function ProgressPage() {
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([
    {
      id: 'frontend',
      name: 'Frontend',
      progress: 65,
      icon: <FaCode className="w-5 h-5" />
    },
    {
      id: 'backend',
      name: 'Backend',
      progress: 45,
      icon: <FaServer className="w-5 h-5" />
    },
    {
      id: 'design',
      name: 'Diseño UI/UX',
      progress: 80,
      icon: <FaPaintBrush className="w-5 h-5" />
    },
    {
      id: 'testing',
      name: 'Testing',
      progress: 30,
      icon: <FaBug className="w-5 h-5" />
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
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Progreso del Proyecto</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progreso General */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-white">Progreso General</h2>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 border-8 border-zinc-700 rounded-full"></div>
              <div
                className="absolute inset-0 border-8 border-green-500 rounded-full transition-all duration-1000"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${totalProgress}%, 0 ${totalProgress}%)`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{totalProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles por Área */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Progreso por Área</h2>
          <div className="space-y-6">
            {projectProgress.map((area) => (
              <div key={area.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {area.icon}
                    <span className="text-white">{area.name}</span>
                  </div>
                  <span className="text-gray-400">{area.progress}%</span>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-zinc-700 rounded-full">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all duration-500"
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
        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Estadísticas</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Tareas Completadas</p>
              <p className="text-2xl font-bold text-white">24/36</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Tiempo Restante</p>
              <p className="text-2xl font-bold text-white">15 días</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Colaboradores</p>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Hitos Alcanzados</p>
              <p className="text-2xl font-bold text-white">3/5</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Timeline</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
              <div>
                <p className="text-white font-semibold">Fase de Diseño Completada</p>
                <p className="text-gray-400 text-sm">Hace 2 días</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
              <div>
                <p className="text-white font-semibold">Desarrollo Frontend en Proceso</p>
                <p className="text-gray-400 text-sm">En curso</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-gray-500 rounded-full mt-1.5"></div>
              <div>
                <p className="text-white font-semibold">Testing Pendiente</p>
                <p className="text-gray-400 text-sm">Próximamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 