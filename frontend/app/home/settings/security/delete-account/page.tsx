'use client';

import React, { useState } from 'react';
import MiniSidebar from '../../components/MiniSidebar';
import { useRouter } from 'next/navigation';
import { IoChevronBackOutline } from 'react-icons/io5';

const DeleteAccount = () => {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  
  const handleDelete = () => {
    if (confirm) {
      // Aquí iría la lógica para eliminar la cuenta en la base de datos
      console.log('Cuenta eliminada');
      // Redirigir al usuario después de eliminar la cuenta
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen text-white">
      <MiniSidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center mb-4">
          <button onClick={() => router.push('/home/settings/security')} className="mr-2 text-2xl">
            <IoChevronBackOutline />
          </button>
          <h1 className="text-[#26D07C] text-2xl font-bold mb-4 mt-12">Eliminar Cuenta</h1>
        </div>
        <p className="mb-4">¿Estás seguro que deseas eliminar la cuenta?</p>
        <p className="text-red-500 text-sm mb-6">Esto borrará todos tus datos asociados con Xurp IA.</p>
        <div className="flex space-x-4">
          <button 
            onClick={() => { setConfirm(true); handleDelete(); }} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Sí
          </button>
          <button 
            onClick={() => router.push('/home/settings/security')} 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
