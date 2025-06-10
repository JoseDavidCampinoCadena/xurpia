'use client';

import { useParams } from 'next/navigation';
import { useProjects } from '@/app/hooks/useProjects';
import AdminDashboard from '@/app/admin/page'; // Asegúrate de que esta ruta sea correcta
import SkillAssessmentCheck from '@/app/components/SkillAssessmentCheck';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjects();

  const project = projects.find((p) => p.id.toString() === id) || null;

  return (
    <SkillAssessmentCheck>
      <AdminDashboard project={project} />
    </SkillAssessmentCheck>
  );
}
