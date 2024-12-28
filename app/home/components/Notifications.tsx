'use client';

import { useState } from 'react';
import { BsBell } from 'react-icons/bs';

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
}

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-zinc-700 rounded-full"
      >
        <BsBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-800 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-zinc-700">
            <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-zinc-700 hover:bg-zinc-700 cursor-pointer ${
                  notification.isRead ? 'opacity-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="text-sm text-white">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1"></span>
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