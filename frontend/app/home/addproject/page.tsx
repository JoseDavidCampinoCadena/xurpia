'use client';

import React, { useState, useEffect } from 'react';
import { useProjects } from '@/app/hooks/useProjects';
import { useRouter } from 'next/navigation';
import { membershipApi, MembershipInfo } from '@/app/api/membership.api';
import { FaRocket, FaLightbulb, FaClock, FaUsers, FaCrown, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

interface Project {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  location?: string;
  projectContext?: string;
  estimatedDuration?: string;
  aiSuggestions?: string;
}

interface AIAnalysis {
  recommendedTeamSize: number;
  roles: Array<{
    title: string;
    count: number;
    description: string;
    skillLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  }>;
  estimatedTimeline: string;
  keyTechnologies: string[];
  suggestions: string[];
}

export default function ProjectsPage() {
  const { projects, loading, error, createProject } = useProjects();
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);
  
  // Form states
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectLogo, setNewProjectLogo] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [projectContext, setProjectContext] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Analysis states
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiResults, setShowAiResults] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadMembershipInfo();
  }, []);

  const loadMembershipInfo = async () => {
    try {
      setLoadingMembership(true);
      const membershipInfo = await membershipApi.getUserMembership();
      setMembership(membershipInfo);
    } catch (error) {
      console.error("Error loading membership:", error);
    } finally {
      setLoadingMembership(false);
    }
  };

  const getProjectLimit = () => {
    if (!membership) return 1;
    switch (membership.type) {
      case 'FREE': return 1;
      case 'PRO': return 3;
      case 'ENTERPRISE': return -1; // Ilimitado
      default: return 1;
    }
  };

  const canCreateProject = () => {
    const limit = getProjectLimit();
    return limit === -1 || projects.length < limit;
  };

  const analyzeProjectWithAI = async () => {
    if (!projectContext.trim() || !estimatedDuration.trim()) {
      return;
    }    setIsAnalyzing(true);
    try {
      // Call the real AI API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/analyze-project`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          projectName: newProjectName,
          projectContext: projectContext,
          estimatedDuration: estimatedDuration
        })
      });

      if (response.ok) {
        const analysisData = await response.json();
        setAiAnalysis(analysisData);
        setShowAiResults(true);
      } else {
        throw new Error('Failed to analyze project');
      }

    } catch (error) {
      console.error('Error analyzing project:', error);
      
      // Fallback to mock analysis if API fails
      const mockAnalysis: AIAnalysis = {
        recommendedTeamSize: 5,
        roles: [
          {
            title: "Arquitecto de Software",
            count: 1,
            description: "Diseño de la arquitectura y patrones del sistema",
            skillLevel: "Avanzado"
          },
          {
            title: "Desarrollador Backend",
            count: 2,
            description: "Desarrollo de APIs y lógica del negocio",
            skillLevel: "Intermedio"
          },
          {
            title: "Desarrollador Frontend",
            count: 1,
            description: "Interfaz de usuario y experiencia",
            skillLevel: "Intermedio"
          },
          {
            title: "Diseñador UI/UX",
            count: 1,
            description: "Diseño de interfaces y experiencia de usuario",
            skillLevel: "Intermedio"
          }
        ],
        estimatedTimeline: `Para un proyecto de ${estimatedDuration}, se recomienda dividir en 4 sprints de 2 semanas cada uno`,
        keyTechnologies: ["Java", "Spring Boot", "React", "PostgreSQL", "Docker"],
        suggestions: [
          "Implementar arquitectura de microservicios para escalabilidad",
          "Usar metodología Agile con sprints de 2 semanas",
          "Implementar CI/CD desde el inicio",
          "Considerar pruebas automatizadas para QA"
        ]
      };
      
      setAiAnalysis(mockAnalysis);
      setShowAiResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !canCreateProject() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const projectData = {
        name: newProjectName,
        description: newProjectDescription,
        logo: newProjectLogo,
        location: newProjectLocation,
        projectContext,
        estimatedDuration,
        aiSuggestions: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        lastConnection: new Date().toISOString(),
      };

      const newProject: Project = await createProject(projectData);

      // Reset form
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectLogo('');
      setNewProjectLocation('');
      setProjectContext('');
      setEstimatedDuration('');
      setAiAnalysis(null);
      setShowAiResults(false);

      if (newProject && (typeof newProject.id === 'number' || typeof newProject.id === 'string')) {
        router.push(`/admin/projects/${newProject.id}`);
      }

    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading || loadingMembership) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-[#26D07C] w-12 h-12 mx-auto mb-4" />
            <p className="text-lg text-gray-300">Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-400 w-12 h-12 mx-auto mb-4" />
            <p className="text-lg text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-white">
      {/* Header */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header mejorado */}
          <div className="text-center mb-8 mt-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#26D07C] via-[#20B369] to-[#1AA05E] bg-clip-text text-transparent flex items-center justify-center gap-3">
              <FaRocket className="text-[#26D07C]" />
              Crear Nuevo Proyecto
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Define tu proyecto y deja que nuestra IA te ayude a planificarlo paso a paso
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#26D07C] to-[#20B369] mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Membership Status */}
          {membership && (
            <div className="mb-8 bg-gradient-to-br from-black via-green-900/80 to-green-400/20 backdrop-blur-sm border rounded-2xl p-6 border border-green-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCrown className={`w-6 h-6 ${
                    membership.type === 'ENTERPRISE' ? 'text-yellow-400' : 
                    membership.type === 'PRO' ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                  <div>
                    <h3 className="font-bold text-white">Plan {membership.type}</h3>
                    <p className="text-sm text-gray-400">
                      Proyectos disponibles: {getProjectLimit() === -1 ? '∞' : `${projects.length}/${getProjectLimit()}`}
                    </p>
                  </div>
                </div>
                {!canCreateProject() && (
                  <button
                    onClick={() => router.push('/home/settings/profile')}
                    className="bg-gradient-to-r from-[#26D07C] to-[#20B369] text-white px-4 py-2 rounded-lg font-medium hover:from-[#20B369] hover:to-[#1AA05E] transition-all"
                  >
                    Actualizar Plan
                  </button>
                )}
              </div>
            </div>
          )}          {/* Form */}
          <div className="bg-gradient-to-br from-black via-green-900/80 to-green-400/20 backdrop-blur-sm border border-green-400/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-10"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-green-300 rounded-full blur-2xl opacity-15"></div>

            <div className="relative">
              <form onSubmit={handleCreateProject} className="space-y-8">
                {/* Información básica */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="projectName" className="block text-sm font-semibold text-gray-300 mb-2">
                      🚀 Nombre del Proyecto
                    </label>                    <input
                      id="projectName"
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Ingresa el nombre de tu proyecto"
                      className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 transition-all duration-300"
                      required
                      disabled={!canCreateProject() || isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="projectLogo" className="block text-sm font-semibold text-gray-300 mb-2">
                      🎨 Logo del Proyecto
                    </label>                    <input
                      id="projectLogo"
                      type="url"
                      value={newProjectLogo}
                      onChange={(e) => setNewProjectLogo(e.target.value)}
                      placeholder="https://ejemplo.com/logo.png"
                      className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 transition-all duration-300"
                      disabled={!canCreateProject() || isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="projectLocation" className="block text-sm font-semibold text-gray-300 mb-2">
                      📍 Ubicación
                    </label>
                    <input
                      id="projectLocation"
                      type="text"
                      value={newProjectLocation}
                      onChange={(e) => setNewProjectLocation(e.target.value)}                      placeholder="Bogotá, Colombia / Remoto"
                      className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 transition-all duration-300"
                      disabled={!canCreateProject() || isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="estimatedDuration" className="block text-sm font-semibold text-gray-300 mb-2">
                      <FaClock className="inline mr-2" />
                      Tiempo Estimado
                    </label>                    <select
                      id="estimatedDuration"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white transition-all duration-300"
                      required
                      disabled={!canCreateProject() || isSubmitting}
                    >
                      <option value="">Selecciona duración</option>
                      <option value="1 mes">1 mes</option>
                      <option value="2 meses">2 meses</option>
                      <option value="3 meses">3 meses</option>
                      <option value="6 meses">6 meses</option>
                      <option value="1 año">1 año</option>
                      <option value="Más de 1 año">Más de 1 año</option>
                    </select>
                  </div>
                </div>

                {/* Descripción del proyecto para IA */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <HiSparkles className="text-[#26D07C] w-6 h-6" />
                    <h3 className="text-xl font-bold text-white">Cuéntanos de qué trata tu proyecto</h3>
                  </div>
                    <textarea
                    id="projectContext"
                    value={projectContext}
                    onChange={(e) => setProjectContext(e.target.value)}
                    placeholder="Ejemplo: Somos una empresa encargada de crear una aplicación para parqueaderos en Java. Los usuarios podrán reservar espacios, gestionar pagos y recibir notificaciones en tiempo real..."
                    className="w-full rounded-xl px-4 py-4 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 transition-all duration-300 resize-none"
                    rows={5}
                    required
                    disabled={!canCreateProject() || isSubmitting}
                  />
                  <p className="text-xs text-white font-semibold">
                    💡 Describe detalladamente tu proyecto para que nuestra IA pueda darte las mejores recomendaciones
                  </p>
                </div>

                {/* Botón para analizar con IA */}
                {projectContext.trim() && estimatedDuration && !showAiResults && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={analyzeProjectWithAI}
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 mx-auto disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <FaSpinner className="animate-spin w-5 h-5" />
                          Analizando proyecto...
                        </>
                      ) : (
                        <>
                          <FaLightbulb className="w-5 h-5" />
                          Analizar con IA
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Resultados de IA */}
                {showAiResults && aiAnalysis && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/30">
                    <div className="flex items-center gap-3 mb-6">
                      <HiSparkles className="text-purple-400 w-6 h-6" />
                      <h3 className="text-xl font-bold text-white">Análisis IA de tu Proyecto</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Equipo recomendado */}
                      <div>
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                          <FaUsers className="text-[#26D07C]" />
                          Equipo Recomendado ({aiAnalysis.recommendedTeamSize} personas)
                        </h4>
                        <div className="space-y-3">
                          {aiAnalysis.roles.map((role, index) => (
                            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-1">
                                <h5 className="font-semibold text-white">{role.title}</h5>
                                <span className="text-xs bg-[#26D07C] text-white px-2 py-1 rounded">
                                  {role.count}x
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mb-2">{role.description}</p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                role.skillLevel === 'Avanzado' ? 'bg-red-600/20 text-red-300' :
                                role.skillLevel === 'Intermedio' ? 'bg-yellow-600/20 text-yellow-300' :
                                'bg-green-600/20 text-green-300'
                              }`}>
                                {role.skillLevel}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Detalles adicionales */}
                      <div>
                        <h4 className="font-bold text-white mb-3">📊 Detalles del Proyecto</h4>
                        <div className="space-y-4">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <h5 className="font-semibold text-white mb-2">Cronograma</h5>
                            <p className="text-sm text-gray-300">{aiAnalysis.estimatedTimeline}</p>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <h5 className="font-semibold text-white mb-2">Tecnologías Clave</h5>
                            <div className="flex flex-wrap gap-2">
                              {aiAnalysis.keyTechnologies.map((tech, index) => (
                                <span key={index} className="bg-[#26D07C]/20 text-[#26D07C] px-2 py-1 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <h5 className="font-semibold text-white mb-2">Sugerencias</h5>
                            <ul className="text-sm text-gray-300 space-y-1">
                              {aiAnalysis.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <FaCheckCircle className="text-[#26D07C] w-3 h-3 mt-1 flex-shrink-0" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Descripción adicional */}
                <div className="space-y-2">
                  <label htmlFor="projectDescription" className="block text-sm font-semibold text-gray-300 mb-2">
                    📝 Descripción Adicional (Opcional)
                  </label>                  <textarea
                    id="projectDescription"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Información adicional sobre el proyecto..."
                    className="w-full rounded-xl px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 transition-all duration-300 resize-none"
                    rows={3}
                    disabled={!canCreateProject() || isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                {canCreateProject() ? (
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#26D07C] to-[#20B369] hover:from-[#20B369] hover:to-[#1AA05E] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-[#26D07C]/20 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    disabled={isSubmitting || !newProjectName.trim() || !projectContext.trim() || !estimatedDuration}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin w-5 h-5" />
                        Creando Proyecto...
                      </>
                    ) : (
                      <>
                        <FaRocket className="w-5 h-5" />
                        Crear Proyecto
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center bg-gray-800/50 rounded-xl p-6">
                    <FaExclamationTriangle className="text-yellow-400 w-8 h-8 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">Límite de Proyectos Alcanzado</h3>
                    <p className="text-gray-400 mb-4">
                      Has alcanzado el límite de {getProjectLimit()} proyecto{getProjectLimit() > 1 ? 's' : ''} para tu plan {membership?.type}.
                    </p>
                    <button
                      onClick={() => router.push('/home/settings/profile')}
                      className="bg-gradient-to-r from-[#26D07C] to-[#20B369] text-white px-6 py-3 rounded-lg font-bold hover:from-[#20B369] hover:to-[#1AA05E] transition-all"
                    >
                      Actualizar a PRO/ENTERPRISE
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}