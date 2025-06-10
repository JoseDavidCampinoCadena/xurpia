'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { skillAssessmentsApi } from '@/app/api/skill-assessments.api';
import { projectsApi } from '@/app/api/projects.api';
import { useAuth } from '@/app/hooks/useAuth';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

interface SkillAssessmentCheckProps {
  children: React.ReactNode;
}

export default function SkillAssessmentCheck({ children }: SkillAssessmentCheckProps) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [isProjectOwner, setIsProjectOwner] = useState(false);  const checkAssessment = useCallback(async () => {
    try {
      const projectId = parseInt(params.id as string);
        // First, check if the current user is the project owner
      if (user) {
        try {
          const projectBasicInfo = await projectsApi.getBasicInfo(projectId);
          if (projectBasicInfo.ownerId === user.id) {
            console.log('User is project owner, skipping skill assessment');
            setIsProjectOwner(true);
            setHasAssessment(true); // Allow access without assessment
            return;
          }
        } catch (projectError) {
          console.error('Error fetching project basic info:', projectError);
          // Continue with assessment check if project fetch fails
        }
      }
      
      // If not project owner, check for existing assessment
      const assessment = await skillAssessmentsApi.getUserAssessment(projectId);
      
      if (!assessment) {
        // User hasn't taken the assessment, redirect to assessment page
        router.push(`/admin/projects/${projectId}/skill-assessment`);
        return;
      }
      
      setHasAssessment(true);
    } catch (err: unknown) {
      // If we get a 404, it means no assessment exists, redirect to take it
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 404 || !error?.response) {
        const projectId = parseInt(params.id as string);
        router.push(`/admin/projects/${projectId}/skill-assessment`);
        return;
      }
      
      setError('Error al verificar la evaluación de habilidades');
      console.error('Error checking assessment:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id, router, user]);

  useEffect(() => {
    checkAssessment();
  }, [checkAssessment]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-400 w-8 h-8 mx-auto mb-4" />
          <span className="text-white">
            {isProjectOwner ? 'Verificando permisos del proyecto...' : 'Verificando evaluación de habilidades...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-8 text-center max-w-md">
          <FaExclamationTriangle className="text-red-400 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!hasAssessment) {
    // This shouldn't happen as we redirect above, but just in case
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-white">Redirigiendo a la evaluación...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
