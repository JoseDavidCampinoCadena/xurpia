'use client';

import { useState, useEffect } from 'react';
import { BsBell } from 'react-icons/bs';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useAuth } from '@/app/hooks/useAuth';
import { notificationsApi } from '@/app/api/notifications.api';

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

const Notifications = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      fetchNotifications();
    }
  }, [mounted, user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notification => 
          notificationsApi.markAsRead(notification.id)
        )
      );
      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true
      })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return '📋';
      case 'PROJECT_INVITATION':
        return '🎯';
      case 'TASK_COMPLETED':
        return '✅';
      case 'PROJECT_UPDATE':
        return '📊';
      case 'COLLABORATION_REQUEST':
        return '🤝';
      default:
        return '🔔';
    }
  };

  if (!mounted) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 ${
          theme === 'dark' ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-gray-200'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:text-blue-300 hover:bg-zinc-700'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Cargando notificaciones...
                </div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="text-sm text-red-500 mb-2">{error}</div>
                <button
                  onClick={fetchNotifications}
                  className={`text-xs px-3 py-1 rounded-md ${
                    theme === 'dark'
                      ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Reintentar
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No tienes notificaciones
                </div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b ${
                    theme === 'dark'
                      ? 'border-zinc-700 hover:bg-zinc-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  } cursor-pointer transition-colors ${notification.isRead ? 'opacity-60' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                        theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
                      }`} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className={`p-3 border-t text-center ${
              theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
            }`}>
              <button
                onClick={fetchNotifications}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Actualizar notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;