'use client';

import { useState } from 'react';
import { collaboratorsApi } from '../api/collaborators.api';

interface Invitation {
  id: number;
  email: string;
  projectId: number;
  role: 'ADMIN' | 'MEMBER';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  project: {
    id: number;
    name: string;
  };
}

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInvitation = async (email: string, projectId: number, role: 'ADMIN' | 'MEMBER') => {
    try {
      setLoading(true);
      await collaboratorsApi.addCollaborator({
        email,
        name: '', // El nombre se establecerá cuando el usuario acepte la invitación
        role,
        projectId
      });
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al enviar la invitación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: number) => {
    try {
      setLoading(true);
      // Aquí iría la lógica para aceptar la invitación
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'ACCEPTED' } 
            : inv
        )
      );
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al aceptar la invitación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const rejectInvitation = async (invitationId: number) => {
    try {
      setLoading(true);
      // Aquí iría la lógica para rechazar la invitación
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'REJECTED' } 
            : inv
        )
      );
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al rechazar la invitación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    invitations,
    loading,
    error,
    sendInvitation,
    acceptInvitation,
    rejectInvitation
  };
}; 