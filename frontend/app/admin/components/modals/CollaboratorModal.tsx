'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { collaboratorsApi } from '@/app/api/collaborators.api';
import { useProjects } from '@/app/hooks/useProjects';
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
  const { projects } = useProjects();

  useEffect(() => {
    if (collaborator && mode === 'edit') {
      setFormData({ name: collaborator.name, email: collaborator.email, role: collaborator.role });
    } else {
      setFormData({ name: '', email: '', role: '' });
    }
  }, [collaborator, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      if (mode === 'create' && projects.length > 0) {
        const newCollaborator = await collaboratorsApi.addCollaborator({
          name: formData.name,
          email: formData.email,
          role: formData.role === 'admin' ? 'ADMIN' : 'MEMBER',
          projectId: projects[0].id,
          projectName: projects[0].name // 🔥 AGREGAR ESTE CAMPO
        });
        
  
        // Enviar invitación por email con el proyecto y el rol
        await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            projectName: projects[0].name, // ✅ Enviar el nombre del proyecto
            role: formData.role === 'admin' ? 'ADMIN' : 'MEMBER' // ✅ Enviar el rol
          })
        });
  
        onSave({ 
          name: newCollaborator.user.name, 
          email: newCollaborator.user.email, 
          role: newCollaborator.role 
        });
      } else if (mode === 'edit' && collaborator) {
        const updatedCollaborator = await collaboratorsApi.updateRole(collaborator.id, { 
          role: formData.role === 'admin' ? 'ADMIN' : 'MEMBER' 
        });
  
        onSave({ 
          name: updatedCollaborator.user.name, 
          email: updatedCollaborator.user.email, 
          role: updatedCollaborator.role 
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };
  

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