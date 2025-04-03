"use client";
import React from "react";
import Link from "next/link";
import MiniSidebar from "../components/MiniSidebar";


const NotificationsPage = () => {
  return (
    <div className="flex  min-h-screen text-white">
      {/* Mini Sidebar */}
      <MiniSidebar />

      {/* Contenido */}
      <div className="flex-1 p-6">
        <h1 className="text-[#26D07C] text-2xl font-bold mb-4 mt-12">Notificaciones</h1>

        {/* Sección de Notificaciones */}
        <div>
         

          {/* Opciones */}
          <div className="border-green-300 border-2 p-4 rounded-lg mt-4">
            <Link href="/home/settings/notifications/push">
              <div className="flex justify-between items-center p-3 cursor-pointer rounded-lg">
                <span>Notificaciones Push</span>
                <span>➜</span>
              </div>
            </Link>

            <Link href="/home/settings/notifications/email">
              <div className="flex justify-between items-center p-3 cursor-pointer rounded-lg">
                <span>Notificaciones del Email</span>
                <span>➜</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
