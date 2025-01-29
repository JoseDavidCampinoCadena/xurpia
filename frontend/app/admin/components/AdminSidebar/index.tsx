'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaUsers, FaChartLine, FaCog, FaArrowLeft } from 'react-icons/fa';

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', icon: <FaHome className="w-5 h-5" />, text: 'Dashboard' },
    { href: '/admin/collaborators', icon: <FaUsers className="w-5 h-5" />, text: 'Colaboradores' },
    { href: '/admin/progress', icon: <FaChartLine className="w-5 h-5" />, text: 'Progreso' },
    { href: '/admin/settings', icon: <FaCog className="w-5 h-5" />, text: 'Configuración' },
    // Separador visual
    { type: 'divider' },
    // Enlace de regreso al home
    { href: '/home', icon: <FaArrowLeft className="w-5 h-5" />, text: 'Volver al Home' }
  ];

  return (
    <div className="w-64 min-h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-700 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Panel <span className="text-green-500">Admin</span>
        </h1>
      </div>
      
      <nav className="space-y-2">
      {links.map((link, index) => {
  if (link.type === 'divider') {
    return <hr key={index} className="my-4 border-gray-200 dark:border-zinc-700" />;
  }

  if (!link.href) {
    return null; // O maneja el caso donde href es undefined
  }

  return (
    <Link
      key={link.href}
      href={link.href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        pathname === link.href
          ? 'bg-green-500 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
      }`}
    >
      {link.icon}
      <span>{link.text}</span>
    </Link>
  );
        })}
      </nav>
    </div>
  );
} 