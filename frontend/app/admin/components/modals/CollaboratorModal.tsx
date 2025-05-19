'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { usersApi, User } from '@/app/api/users.api';
import { motion, AnimatePresence } from 'framer-motion';

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  collaborator?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  onSave: (collaborator: { name: string; email: string; role: string }) => void;
}

export default function CollaboratorModal({
  isOpen,
  onClose,
  mode,
  collaborator,
  onSave
}: CollaboratorModalProps) {
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [addUserLoading, setAddUserLoading] = useState<number | null>(null);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  useEffect(() => {
    if (collaborator && mode === 'edit') {
      setFormData({ name: collaborator.name, email: collaborator.email, role: collaborator.role });
    } else {
      setFormData({ name: '', email: '', role: '' });
    }
  }, [collaborator, mode]);

  useEffect(() => {
    if (mode === 'create' && isOpen) {
      usersApi.getAll().then(setAllUsers).catch(() => setAllUsers([]));
    }
  }, [mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave({
        name: formData.name,
        email: formData.email,
        role: formData.role === 'admin' ? 'ADMIN' : 'MEMBER',
      });
      onClose();
    } catch (err: any) {
      setError('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user: User, role: string) => {
    setAddUserLoading(user.id);
    setAddUserError(null);
    try {
      await onSave({ name: user.name, email: user.email, role });
      onClose();
    } catch (err: any) {
      setAddUserError('No se pudo agregar el usuario.');
    } finally {
      setAddUserLoading(null);
    }
  };

  if (!isOpen) return null;

  // Mostrar listado de usuarios registrados en modo 'create'
  if (mode === 'create' && allUsers.length > 0) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-zinc-900 text-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Selecciona un usuario para agregar</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <IoClose size={24} />
                </button>
              </div>
              {addUserError && <div className="text-red-500 text-sm mb-2">{addUserError}</div>}
              <div className="space-y-2">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-zinc-800 rounded p-2 mb-1">
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-500 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                        disabled={addUserLoading === user.id}
                        onClick={() => handleAddUser(user, 'MEMBER')}
                      >
                        {addUserLoading === user.id ? 'Agregando...' : 'Agregar como Miembro'}
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                        disabled={addUserLoading === user.id}
                        onClick={() => handleAddUser(user, 'ADMIN')}
                      >
                        {addUserLoading === user.id ? 'Agregando...' : 'Agregar como Admin'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Formulario manual para editar
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-zinc-900 text-white rounded-lg shadow-lg p-6 w-full max-w-md" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{mode === 'create' ? 'Añadir Colaborador' : 'Editar Colaborador'}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <IoClose size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nombre</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 rounded-md bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={loading} />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 rounded-md bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={loading} />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Rol</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full p-2 rounded-md bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={loading}>
                  <option value="">Seleccionar rol</option>
                  <option value="admin">Administrador</option>
                  <option value="member">Miembro</option>
                </select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors" disabled={loading}>{loading ? 'Procesando...' : mode === 'create' ? 'Añadir' : 'Guardar'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}