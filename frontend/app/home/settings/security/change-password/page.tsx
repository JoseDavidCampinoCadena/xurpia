'use client';
import React, { useState } from 'react';
import MiniSidebar from '../../components/MiniSidebar';
import { useRouter } from 'next/navigation';
import { IoChevronBackOutline } from 'react-icons/io5';
import { usersApi } from '@/app/api/users.api';
import { useAuth } from '@/app/hooks/useAuth';

const ChangePassword = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!user) {
      setError('No hay usuario autenticado.');
      return;
    }
    try {
      await usersApi.changePassword(user.id, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess('Contraseña cambiada con éxito.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      // @ts-expect-error: err type is unknown, but we want to access response.data.message for error feedback
      setError(err?.response?.data?.message || 'Error al cambiar la contraseña.');
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
          <h1 className="text-[#26D07C] text-2xl font-bold">Cambiar Contraseña</h1>
        </div>
        <form onSubmit={handleSubmit} className=" p-6 rounded-lg">
          <div className="mb-4">
            <label className="block text-gray-400">Contraseña Actual</label>
            <input
              type="password"
              className="w-full p-2 bg-zinc-800 rounded"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400">Nueva Contraseña</label>
            <input
              type="password"
              className="w-full p-2 bg-zinc-800 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              className="w-full p-2 bg-zinc-800 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <button
            type="submit"
            className="w-full p-2 bg-[#26D07C] rounded mt-4 hover:bg-green-600">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
