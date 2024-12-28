'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaTasks, 
  FaUsers, 
  FaCalendarAlt, 
  FaChartLine,
  FaCog,
  FaHome 
} from 'react-icons/fa';

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      path: '/admin',
      name: 'Dashboard',
      icon: <FaHome className="w-5 h-5" />
    },
    {
      path: '/admin/tasks',
      name: 'Tareas',
      icon: <FaTasks className="w-5 h-5" />
    },
    {
      path: '/admin/collaborators',
      name: 'Colaboradores',
      icon: <FaUsers className="w-5 h-5" />
    },
    {
      path: '/admin/calendar',
      name: 'Calendario',
      icon: <FaCalendarAlt className="w-5 h-5" />
    },
    {
      path: '/admin/progress',
      name: 'Progreso',
      icon: <FaChartLine className="w-5 h-5" />
    },
    {
      path: '/admin/settings',
      name: 'Configuración',
      icon: <FaCog className="w-5 h-5" />
    }
  ];

  return (
    <aside className="sidebar">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-green-600 dark:text-green-500">XURP IA</span>
        </Link>
        
        <nav className="mt-8">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.path
                      ? 'bg-green-600 text-white dark:bg-green-500'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800'
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