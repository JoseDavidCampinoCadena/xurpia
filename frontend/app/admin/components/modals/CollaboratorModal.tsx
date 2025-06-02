// components/CollaboratorModal.tsx
import React from 'react';

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  collaborator: unknown;
  onSave: (collaboratorData: unknown) => void;
}

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({ isOpen, onClose, mode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{mode === 'edit' ? 'Editar colaborador' : 'Agregar colaborador'}</h2>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">Cerrar</button>
      </div>
    </div>
  );
};

export default CollaboratorModal;