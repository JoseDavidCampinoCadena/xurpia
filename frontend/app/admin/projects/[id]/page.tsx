'use client';

import { useParams } from 'next/navigation';
import { useProjects } from '@/app/hooks/useProjects';
import { useAuth } from '@/app/hooks/useAuth';
import { getUserPermissions } from '@/app/utils/permissions';
import AdminDashboard from '@/app/admin/page'; // Asegúrate de que esta ruta sea correcta
import SkillAssessmentCheck from '@/app/components/SkillAssessmentCheck';
import { FaSpinner } from 'react-icons/fa';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, loading: projectsLoading } = useProjects();
  const { user, loading: userLoading } = useAuth();

  const project = projects.find((p) => p.id.toString() === id) || null;
  
  // Show loading while data is being fetched
  if (userLoading || projectsLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del proyecto...</p>
        </div>
      </div>
    );
  }

  // If project not found after loading
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Proyecto no encontrado</p>
        </div>
      </div>
    );
  }
  
  // Check if user is project owner
  const isOwner = getUserPermissions(user, project).isOwner;

  // If user is owner, skip skill assessment check
  if (isOwner) {
    return <AdminDashboard project={project} />;
  }

  // For non-owners, apply skill assessment check
  return (
    <SkillAssessmentCheck>
      <AdminDashboard project={project} />
    </SkillAssessmentCheck>
  );
}
