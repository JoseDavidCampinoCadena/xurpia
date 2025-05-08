"use client";
import React, { useState } from "react";
import MiniSidebar from "../components/MiniSidebar";

const ProfilePage = () => {
  const [description, setDescription] = useState("Hola !, somos los desarrolladores web oficiales Xurp IA");

  return (
    <div className="flex min-h-screen text-white">
      {/* Mini Sidebar */}
      <MiniSidebar />

      {/* Contenido */}
      <div className="flex-1 p-6">
        <h1 className="text-[#26D07C] text-2xl font-bold mb-4 mt-12">Configuración</h1>

        {/* Editar perfil */}
        <div className="bg-[#26D07C] p-4 rounded-lg flex items-center justify-between mb-4">
          <div>
            <p className="font-bold">Editar Perfil</p>
            <p className="text-sm">xurpia_original@gmail.com</p>
            <p className="text-xs">Xurp IA</p>
          </div>
          <button className="bg-[#1a1a1a] text-white px-4 py-1 rounded-lg">Cambiar Foto</button>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <p className="font-bold">Descripción</p>
          <div className="bg-[#26D07C] p-4 rounded-lg flex justify-between items-center">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent w-full outline-none"
            />
            <button className="bg-[#1a1a1a] text-white px-4 py-1 rounded-lg">Cambiar</button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Editar tu biografía o descripción está ahora disponible en Xurp IA.
            ¡Atrévete a que te conozcan un poco!
          </p>
        </div>

        {/* Género */}
        <div className="mb-4">
          <p className="font-bold">Género</p>
          <div className="bg-[#26D07C] rounded-lg overflow-hidden">
          <select className="bg-[#26D07C] text-white rounded-md p-2 w-full">
            <option>Prefiero no decirlo</option>
            <option>Hombre</option>
            <option>Mujer</option>
          </select>
          </div>
        </div>

        {/* Botón Guardar */}
        <button className="bg-[#26D07C] text-white px-6 py-2 rounded-lg">Guardar</button>
      </div>
    </div>
  );
};

export default ProfilePage;