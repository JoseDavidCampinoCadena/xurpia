"use client";
import React, { useEffect, useState } from "react";
import MiniSidebar from "../../components/MiniSidebar";
import { useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { Switch } from "@headlessui/react";

const PushNotifications = () => {
  const router = useRouter();

  // Estado para los switches
  const [notifications, setNotifications] = useState({
    friendsRequest: false,
    commentReactions: false,
    collaboratorsInvite: false,
    approvalRequest: false,
  });

  // Cargar configuraciones guardadas al montar el componente
  useEffect(() => {
    const savedSettings = localStorage.getItem("pushNotifications");
    if (savedSettings) {
      setNotifications(JSON.parse(savedSettings));
    }
  }, []);

  // Guardar en localStorage cuando cambia el estado
  useEffect(() => {
    localStorage.setItem("pushNotifications", JSON.stringify(notifications));
  }, [notifications]);

  // Función para manejar cambios en los switches
  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex min-h-screen text-white">
      <MiniSidebar />

      <div className="flex-1 p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.push("/home/settings/notifications")}
            className="mr-3 mt-9"
          >
            <IoChevronBackOutline size={25} /> {/* Icono más grande */}
          </button>
          <h1 className="text-[#26D07C] text-2xl font-bold mb-4 mt-12">
            Notificaciones Push
          </h1>
        </div>

        {/* Sección de Notificaciones Push */}
        <div className="p-4 rounded-lg mt-4">
          {[
            { key: "friendsRequest", label: "Solicitud de Amigos" },
            { key: "commentReactions", label: "Reacciones a los comentarios" },
            { key: "collaboratorsInvite", label: "Invitación de colaboradores" },
            { key: "approvalRequest", label: "Solicitud de Aprobación" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex justify-between items-center p-3 border-b border-gray-600"
            >
              <span>{label}</span>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onChange={() => handleToggle(key as keyof typeof notifications)}
                className={`${
                  notifications[key as keyof typeof notifications]
                    ? "bg-[#26D07C]"
                    : "bg-gray-500"
                } relative inline-flex h-6 w-11 items-center rounded-full transition`}
              >
                <span
                  className={`${
                    notifications[key as keyof typeof notifications]
                      ? "translate-x-6"
                      : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PushNotifications;
