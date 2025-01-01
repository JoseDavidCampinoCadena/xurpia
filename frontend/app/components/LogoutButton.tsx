'use client';

import { useAuth } from '../hooks/useAuth';

export const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    >
      Cerrar sesión
    </button>
  );
}; 