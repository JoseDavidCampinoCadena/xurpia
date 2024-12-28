'use client';

import { FaTasks, FaUsers, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';

export default function AdminDashboard() {
  const { theme } = useTheme();
  
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          (NOMBRE DEL PROYECTO)
        </h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Descripción del proyecto...
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel de Tareas */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaTasks className="text-green-500" />
            Tareas
          </h2>
          <div className="space-y-4">
            <button className="w-full bg-green-500 text-white py-2.5 px-4 rounded-md hover:bg-green-600 transition-colors font-medium">
              Crear Tareas
            </button>
            <button className="w-full bg-red-500 text-white py-2.5 px-4 rounded-md hover:bg-red-600 transition-colors font-medium">
              Eliminar Tareas
            </button>
            <div className="space-y-4 mt-6">
              {[1, 2, 3].map((task) => (
                <div 
                  key={task} 
                  className={`pb-4 border-b ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'} last:border-0 last:pb-0`}
                >
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Tarea {task}: Acá saldrán todas las tareas asignadas, con su fecha de entrega y responsable
                  </p>
                  <button className="mt-2 text-blue-500 hover:text-blue-600 transition-colors font-medium">
                    Ver Tarea
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de Progreso */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaChartLine className="text-blue-500" />
            Progreso Proyecto
          </h2>
          <div className="flex justify-center items-center h-[280px]">
            <div className="relative w-40 h-40">
              <div className={`absolute inset-0 border-4 rounded-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}></div>
              <div className="absolute inset-0 border-4 border-green-500 rounded-full" 
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% 25%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Calendario */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaCalendarAlt className="text-red-500" />
            Calendario
          </h2>
          <div className="flex justify-center items-center h-[280px]">
            <div className="text-center">
              <div className={`p-3 rounded-t-lg ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-100'}`}>
                <span className="text-red-500 font-bold text-lg">July</span>
              </div>
              <div className={`p-6 rounded-b-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                <span className={`text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>17</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Colaboradores */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaUsers className="text-purple-500" />
            Colaboradores
          </h2>
          <div className="flex flex-wrap gap-4 mb-6">
            {[1, 2, 3].map((collaborator) => (
              <div 
                key={collaborator} 
                className={`w-14 h-14 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-100'} flex items-center justify-center`}
              >
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  User {collaborator}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <button className="w-full bg-green-500 text-white py-2.5 px-4 rounded-md hover:bg-green-600 transition-colors font-medium">
              Asignar Administrador
            </button>
            <button className="w-full bg-red-500 text-white py-2.5 px-4 rounded-md hover:bg-red-600 transition-colors font-medium">
              Eliminar Colaborador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 