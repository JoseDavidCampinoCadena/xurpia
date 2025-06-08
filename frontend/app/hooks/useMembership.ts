import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface MembershipInfo {
  type: 'FREE' | 'PRO' | 'ENTERPRISE';
  expiresAt: Date | null;
  evaluationLimits: {
    perProject: number;
    description: string;
  };
  features: string[];
  price: string;
}

export interface EvaluationUsage {
  projectId: number;
  projectName: string;
  technology: string;
  count: number;
  limit: number;
  remaining: number;
}

export const useMembership = () => {
  const { user } = useAuth();
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [evaluationUsage, setEvaluationUsage] = useState<EvaluationUsage[]>([]);
  const [availablePlans, setAvailablePlans] = useState<MembershipInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembershipInfo = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/membership/info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener información de membresía');
      }
      
      const data = await response.json();
      setMembershipInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationUsage = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/membership/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener uso de evaluaciones');
      }
      
      const data = await response.json();
      setEvaluationUsage(data);
    } catch (err) {
      console.error('Error fetching evaluation usage:', err);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch('/api/membership/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener planes disponibles');
      }
      
      const data = await response.json();
      setAvailablePlans(data);
    } catch (err) {
      console.error('Error fetching available plans:', err);
    }
  };

  const canCreateEvaluation = async (projectId: number, technology: string): Promise<{
    canCreate: boolean;
    reason?: string;
    currentCount: number;
    limit: number;
  }> => {
    if (!user) {
      return {
        canCreate: false,
        reason: 'Usuario no autenticado',
        currentCount: 0,
        limit: 0
      };
    }

    try {
      const response = await fetch(`/api/membership/can-evaluate/${projectId}/${encodeURIComponent(technology)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al verificar limitaciones');
      }
      
      return await response.json();
    } catch (err) {
      return {
        canCreate: false,
        reason: 'Error al verificar limitaciones',
        currentCount: 0,
        limit: 0
      };
    }
  };

  const upgradeMembership = async (membershipType: 'PRO' | 'ENTERPRISE') => {
    if (!user) throw new Error('Usuario no autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/membership/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ membershipType }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar membresía');
      }
      
      // Refresh membership info
      await fetchMembershipInfo();
      await fetchEvaluationUsage();
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downgradeMembership = async () => {
    if (!user) throw new Error('Usuario no autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/membership/downgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al degradar membresía');
      }
      
      // Refresh membership info
      await fetchMembershipInfo();
      await fetchEvaluationUsage();
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMembershipStatus = () => {
    if (!membershipInfo) return null;
    
    const now = new Date();
    const expiresAt = membershipInfo.expiresAt ? new Date(membershipInfo.expiresAt) : null;
    
    if (membershipInfo.type === 'FREE') {
      return {
        status: 'active',
        message: 'Plan gratuito activo',
        color: 'text-gray-600'
      };
    }
    
    if (!expiresAt) {
      return {
        status: 'active',
        message: `Plan ${membershipInfo.type} activo`,
        color: 'text-green-600'
      };
    }
    
    const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return {
        status: 'expired',
        message: 'Plan expirado',
        color: 'text-red-600'
      };
    } else if (daysUntilExpiration <= 7) {
      return {
        status: 'expiring',
        message: `Plan expira en ${daysUntilExpiration} días`,
        color: 'text-yellow-600'
      };
    } else {
      return {
        status: 'active',
        message: `Plan ${membershipInfo.type} activo`,
        color: 'text-green-600'
      };
    }
  };

  useEffect(() => {
    if (user) {
      fetchMembershipInfo();
      fetchEvaluationUsage();
      fetchAvailablePlans();
    }
  }, [user]);

  return {
    membershipInfo,
    evaluationUsage,
    availablePlans,
    loading,
    error,
    canCreateEvaluation,
    upgradeMembership,
    downgradeMembership,
    getMembershipStatus,
    refreshMembershipInfo: fetchMembershipInfo,
    refreshEvaluationUsage: fetchEvaluationUsage
  };
};
