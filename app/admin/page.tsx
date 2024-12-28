import { FaTasks, FaUsers, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-gray-800 dark:text-gray-100 text-3xl font-bold mb-8">
        (NOMBRE DEL PROYECTO)
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Descripción del proyecto...
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel de Tareas */}
        <div className="card">
          <h2 className="text-gray-800 dark:text-gray-100 text-xl font-semibold mb-4 flex items-center gap-2">
            <FaTasks className="text-green-600 dark:text-green-500" />
            Tareas
          </h2>
          <div className="space-y-4">
            <button className="btn-primary w-full py-2 rounded-md">
              Crear Tareas
            </button>
            <button className="btn-danger w-full py-2 rounded-md">
              Eliminar Tareas
            </button>
            <div className="space-y-4 mt-4">
              {[1, 2, 3, 4].map((task) => (
                <div key={task} className="border-b border-zinc-700 pb-4">
                  <p className="text-gray-300">
                    Acá saldrán todas las tareas asignadas, con su fecha de entrega y responsable
                  </p>
                  <button className="mt-2 text-blue-400 hover:text-blue-500 transition-colors">
                    Ver Tarea
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de Progreso */}
        <div className="card p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="w-5 h-5" />
            Progreso Proyecto
          </h2>
          <div className="flex justify-center items-center h-48">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-4 border-zinc-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-green-500 rounded-full" 
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% 25%, 0% 25%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Calendario */}
        <div className="card p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FaCalendarAlt className="w-5 h-5" />
            Calendario
          </h2>
          <div className="flex justify-center items-center h-48">
            <div className="text-center">
              <div className="bg-zinc-700 p-2 rounded-t-lg">
                <span className="text-red-500 font-bold">July</span>
              </div>
              <div className="bg-zinc-900 p-4 rounded-b-lg">
                <span className="text-4xl font-bold text-white">17</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Colaboradores */}
        <div className="card p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FaUsers className="w-5 h-5" />
            Colaboradores
          </h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {[1, 2, 3].map((collaborator) => (
              <div key={collaborator} className="w-12 h-12 rounded-full bg-zinc-700"></div>
            ))}
          </div>
          <div className="space-y-2">
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors">
              Asignar Administrador
            </button>
            <button className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors">
              Eliminar Colaborador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 