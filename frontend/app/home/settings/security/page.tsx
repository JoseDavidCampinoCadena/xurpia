"use client";
import React from "react";
import MiniSidebar from "../components/MiniSidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SecuritySettings = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen text-white">
      <MiniSidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center mb-4">
          
          <h1 className="text-[#26D07C] text-2xl font-bold mb-4 mt-12">Seguridad</h1>
        </div>

        <div className="p-4 rounded-lg mt-4 space-y-4">
          <Link href="/home/settings/security/change-password" className="block p-3 border border-green-300 rounded-lg ">
            Cambiar contraseña
          </Link>
          
          <Link href="/home/settings/security/delete-account" className="block p-3 border border-red-600 text-red-500 rounded-lg hover:bg-red-800 hover:text-white">
            Eliminar cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
