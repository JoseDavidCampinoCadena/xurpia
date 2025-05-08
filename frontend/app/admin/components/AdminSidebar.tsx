'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTasks, FaUsers, FaCalendarAlt, FaChartLine, FaCog, FaHome } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useEffect, useState } from 'react';
import { projectsApi } from '@/app/api/projects.api'; // Asegúrate de que la ruta sea correcta
import { Project } from '../../hooks/useProjects';

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);

  // Obtener todos los proyectos desde la API y establecer el ID del proyecto actual
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsApi.getAll();
        setProjects(data);
        if (data.length > 0) {
          // Aquí puedes seleccionar el primer proyecto o cualquiera según la lógica
          const projectId = parseInt(pathname.split('/')[3]); // Suponiendo que el ID está en la URL
          setCurrentProjectId(projectId || data[0].id); // Si no se pasa un ID en la URL, se usa el primero
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, [pathname]); // Vuelve a cargar si cambia la URL

  const menuItems: MenuItem[] = [
    {
      path: `/admin/projects/${currentProjectId}`,
      name: 'Dashboard',
      icon: <FaHome className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
    },
    {
      path: `/admin/projects/${currentProjectId}/tasks`,
      name: 'Tareas',
      icon: <FaTasks className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
    },
    {
      path: `/admin/projects/${currentProjectId}/collaborators`,
      name: 'Colaboradores',
      icon: <FaUsers className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
    },
    {
      path: `/admin/projects/${currentProjectId}/calendar`,
      name: 'Calendario',
      icon: <FaCalendarAlt className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
    },
    {
      path: `/admin/projects/${currentProjectId}/progress`,
      name: 'Progreso',
      icon: <FaChartLine className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
    },
    {
      path: `/admin/projects/${currentProjectId}/settings`,
      name: 'Configuración',
      icon: <FaCog className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
    },
    {
      path: '/home',
      name: 'Regresar',
      icon: <FaHome className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
    }
  ];

  return (
    <aside className={`w-64 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white border-r border-gray-200'}`}>
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-green-500">XURP IA</span>
        </Link>

        <nav className="mt-8">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.path
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
