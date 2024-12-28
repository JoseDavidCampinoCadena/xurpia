'use client';

import { useState } from 'react';
import { BsBell } from 'react-icons/bs';

interface AdminNotification {
  id: number;
  message: string;
  isRead: boolean;
  type: 'task' | 'collaborator' | 'progress' | 'system';
  timestamp: string;
}

export default function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: 1,
      message: "Nueva tarea asignada al equipo de desarrollo",
      isRead: false,
      type: 'task',
      timestamp: '2 min ago'
    },
    {
      id: 2,
      message: "Nuevo colaborador pendiente de aprobación",
      isRead: false,
      type: 'collaborator',
      timestamp: '5 min ago'
    },
    {
      id: 3,
      message: "Progreso del proyecto actualizado al 45%",
      isRead: false,
      type: 'progress',
      timestamp: '10 min ago'
    },
    {
      id: 4,
      message: "Reunión programada para revisión de proyecto",
      isRead: false,
      type: 'system',
      timestamp: '1 hour ago'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-zinc-700 rounded-full transition-colors"
      >
        <BsBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-zinc-800 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-zinc-700">
            <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-zinc-700 hover:bg-zinc-700 cursor-pointer transition-colors ${
                  notification.isRead ? 'opacity-60' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="text-sm text-white">{notification.message}</p>
                    <span className="text-xs text-gray-400">{notification.timestamp}</span>
                  </div>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 