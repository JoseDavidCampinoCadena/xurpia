'use client';

import { useState, useEffect } from 'react';
import { BsBell } from 'react-icons/bs';
import { useTheme } from '@/app/contexts/ThemeContext';
import { notificationsApi, Notification } from '@/app/api/notifications.api';

export default function AdminNotifications() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setMounted(true);
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
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
        <BsBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-96 rounded-lg shadow-xl z-50 ${
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
          </div>          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Cargando notificaciones...
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay notificaciones
                </span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b ${
                    theme === 'dark'
                      ? 'border-zinc-700 hover:bg-zinc-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  } cursor-pointer transition-colors ${
                    notification.read ? 'opacity-60' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </div>
                    {!notification.read && (
                      <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                        theme === 'dark' ? 'bg-green-500' : 'bg-green-600'
                      }`} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 