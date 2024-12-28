'use client';

import { useState, useEffect } from 'react';
import { BsBell } from 'react-icons/bs';
import { useTheme } from '@/app/contexts/ThemeContext';

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
}

const Notifications = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: "Se te ha invitado a un proyecto",
      isRead: false,
    },
    {
      id: 2,
      message: "Se ha creado una nueva tarea",
      isRead: false,
    },
    {
      id: 3,
      message: "Mira el progreso del proyecto HEEQ",
      isRead: false,
    },
    {
      id: 4,
      message: "Tienes una nueva solicitud de colaboración",
      isRead: false,
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${
          theme === 'dark'
            ? 'text-gray-300 hover:text-white hover:bg-zinc-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <BsBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'
        }`}>
          <div className={`p-4 border-b ${
            theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Notificaciones
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b ${
                  theme === 'dark'
                    ? 'border-zinc-700 hover:bg-zinc-700'
                    : 'border-gray-200 hover:bg-gray-50'
                } cursor-pointer ${notification.isRead ? 'opacity-50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <span className={`w-2 h-2 rounded-full mt-1 ${
                      theme === 'dark' ? 'bg-green-500' : 'bg-green-600'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 