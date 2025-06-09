'use client';

import { useState, useEffect } from 'react';
import { FaUserCircle, FaCopy } from 'react-icons/fa';
import { useProjects } from '@/app/hooks/useProjects';
import { useCollaborators } from '@/app/hooks/useCollaborators';
import { collaboratorsApi } from '@/app/api/collaborators.api';
import { usersApi, User } from '@/app/api/users.api';
import { useAuth } from '@/app/hooks/useAuth';
import { aiApi } from '@/app/api/ai.api';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import ChatModal from '@/app/components/ChatModal';
import { useRouter } from 'next/navigation';
import HiringAssistant from '@/app/admin/components/modals/HiringAssistant';

// Intereses disponibles para filtrar
const INTERESES = [
  'Backend',
  'Frontend',
  'Diseño',
  'Recursos Humanos',
  'Data Science',
  'DevOps',
  'QA',
  'Mobile',
  'Marketing',
  'Ventas',
  'Producto',
  'Otro',
];

export default function CollaboratorsPage() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invitationCode, setInvitationCode] = useState<{ code: string; expiresAt?: string } | null>(null);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [addUserLoading, setAddUserLoading] = useState<number | null>(null);
    const [addUserError, setAddUserError] = useState<string | null>(null);
    const [selectedInterest, setSelectedInterest] = useState<string>('');
    const [aiRecommendedUserIds, setAiRecommendedUserIds] = useState<number[]>([]);
    const [chatUser, setChatUser] = useState<User | null>(null);
    const router = useRouter();
    const { projects, loading: loadingProjects } = useProjects();
    // Filtra los proyectos donde el usuario es owner o colaborador
    const accessibleProjects = projects.filter(
      (project) =>
        project.ownerId === user?.id ||
        (project.collaborators && project.collaborators.some((c) => c.user.id === user?.id))
    );
    const currentProjectId = accessibleProjects.length > 0 ? accessibleProjects[0].id : undefined;
    const currentProject = accessibleProjects.find(project => project.id === currentProjectId);
    const isOwner = currentProject && currentProject.ownerId === user?.id;

    // Hook de colaboradores
    const {
      collaborators,
      refreshCollaborators,
      removeCollaborator
    } = useCollaborators(currentProjectId);

    // Función para generar el código de invitación (como la definiste)
    const handleGenerateInvitationCode = async () => {
        if (!currentProjectId) {
            alert("No hay un proyecto seleccionado para generar un código.");
            return;
        }
        setIsGeneratingCode(true);
        setInvitationCode(null); // Limpiar código anterior
        setCopySuccess('');    // Limpiar mensaje de copia
        try {
            const newCode = await collaboratorsApi.generateInvitationCode(currentProjectId);
            setInvitationCode(newCode);
        } catch (err) {
            console.error("Error generando código de invitación:", err);
            alert("No se pudo generar el código de invitación. Intenta de nuevo.");
        } finally {
            setIsGeneratingCode(false);
        }
    };

    // Función para copiar el código al portapapeles
    const handleCopyToClipboard = () => {
        if (invitationCode?.code) {
            navigator.clipboard.writeText(invitationCode.code)
                .then(() => {
                    setCopySuccess("¡Copiado!");
                    setTimeout(() => setCopySuccess(''), 2000);
                })
                .catch(err => {
                    console.error('Error al copiar:', err);
                    setCopySuccess("Error al copiar");
                });
        }
    };

    // Efecto para cargar colaboradores cuando currentProjectId cambie
    useEffect(() => {
        if (currentProjectId) {
            console.log('useEffect \[currentProjectId, refreshCollaborators]: Ejecutando refreshCollaborators para el proyecto ID:', currentProjectId);
            refreshCollaborators(currentProjectId);
            setInvitationCode(null); // Si también manejas el código de invitación aquí
        }
    }, [currentProjectId, refreshCollaborators]); // Dependencias clave

    // Cargar todos los usuarios registrados, excluyendo al usuario autenticado
    useEffect(() => {
        usersApi.getAll()
          .then(users => setAllUsers(users.filter(u => u.id !== user?.id)))
          .catch(() => setAllUsers([]));
    }, [user?.id]);

    // Filtro por profesión seleccionada
    const filteredUsers = selectedInterest
      ? allUsers.filter(user =>
          (user.profession || '').toLowerCase() === selectedInterest.toLowerCase()
        )
      : allUsers;

    // Llama a la IA real cuando cambia el interés
    useEffect(() => {
      if (!selectedInterest) {
        setAiRecommendedUserIds([]);
        return;
      }
      aiApi.recommendCollaborators(selectedInterest, filteredUsers)
        .then(setAiRecommendedUserIds)
        .catch(() => setAiRecommendedUserIds([]));
    }, [selectedInterest, filteredUsers]);

    const handleDeleteCollaborator = async (collaboratorId: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este colaborador?')) {
            try {
                await removeCollaborator(collaboratorId);
                // Opcional: mostrar un mensaje de éxito
            } catch (err) { // 'err' en lugar de 'error' para evitar conflicto con la variable de estado 'error'
                console.error('Error al eliminar colaborador:', err);
                alert('Error al eliminar el colaborador.');
            }
        }
    };

    // Al agregar colaborador, si el usuario no está ya en el proyecto, aumentar el conteo de proyectos
    const handleAddUserAsCollaborator = async (user: User) => {
      if (!currentProjectId || !currentProject) return;
      setAddUserLoading(user.id);
      setAddUserError(null);
      try {
        await collaboratorsApi.addCollaborator({
          name: user.name,
          email: user.email,
          role: 'MEMBER',
          projectId: currentProjectId,
          projectName: currentProject.name, // <-- necesario para el backend
        });
        // Si el usuario no estaba ya en el proyecto, aumentar el campo projects para ese usuario
        if (!currentProject.collaborators?.some(c => c.user.id === user.id)) {
          // Lógica para actualizar el campo projects del usuario agregado
          // Suponiendo que tienes un endpoint para actualizar el usuario:
          await usersApi.updateUserProfile(user.id, { projects: (user.projects || 0) + 1 });
        }
        await refreshCollaborators(currentProjectId);
        alert('Colaborador agregado exitosamente.');
        setCopySuccess('Colaborador agregado exitosamente.');
        setTimeout(() => setCopySuccess(''), 2000);
      } catch (err: unknown) {
        let errorMessage = 'Error al agregar colaborador.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setAddUserError(errorMessage);
      } finally {
        setAddUserLoading(null);
      }
    };

    const getRoleColor = (role: string) => {
        switch (role?.toLowerCase()) { // Añadir '?' por si role es undefined momentáneamente
            case 'admin':
                return 'text-red-400';
            case 'member':
                return 'text-blue-400';
            default:
                return 'text-gray-400';
        }
    };

    if (loadingProjects) {
        return <div className="p-8 text-center">Cargando proyectos...</div>;
    }

    if (!user) {
      return <div className="p-8 text-center text-red-500">Debes iniciar sesión para ver los colaboradores.</div>;
    }

    if (accessibleProjects.length === 0) {
      return <div className="p-8 text-center text-red-500">No tienes proyectos disponibles.</div>;
    }

    if (!currentProjectId) {
      return <div className="p-8 text-center text-red-500">No tienes permisos para ver los colaboradores de este proyecto.</div>;
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white mb-6">Gestión de Colaboradores</h1>

            <div className="card bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-6">
                {/* Sección para añadir manualmente y generar código */}
                {isOwner && (
                    <div className="flex flex-wrap gap-4 mb-8 items-center">
                        {/* Botón de Sugerencias de IA */}
                        <button
                            onClick={() => setIsModalOpen((prev) => !prev)}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                            Sugerencias de IA
                        </button>
                        <button
                            onClick={handleGenerateInvitationCode}
                            disabled={isGeneratingCode || !currentProjectId}
                            className="bg-green-500 text-white px-5 py-2.5 rounded-md hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            {isGeneratingCode ? 'Generando Código...' : 'Generar Código de Invitación'}
                        </button>
                    </div>
                )}

                {/* Sección para mostrar el código generado */}
                {invitationCode && (
                    <div className="mb-8 p-4 border border-dashed border-green-500 rounded-md bg-green-50 dark:bg-green-900 dark:border-green-700">
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1">Comparte este código para que otros se unan al proyecto:</p>
                        <div className="flex items-center gap-3">
                            <strong className="text-lg font-mono text-green-800 dark:text-green-200 bg-green-200 dark:bg-green-800 px-2 py-1 rounded">
                                {invitationCode.code}
                            </strong>
                            <button
                                onClick={handleCopyToClipboard}
                                title="Copiar código"
                                className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                            >
                                <FaCopy size={18} />
                            </button>
                            {copySuccess && <span className="text-xs text-green-600 dark:text-green-400">{copySuccess}</span>}
                        </div>
                        {invitationCode.expiresAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Válido hasta: {new Date(invitationCode.expiresAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}
 
                {/* Solo el owner puede editar/eliminar colaboradores y roles */}
                {collaborators.map((collaborator) => {
                  const c = collaborator as { id: number; user: { id: number; name: string; email: string; description?: string }; role: string };
                  const isProjectOwner = c.user?.id === currentProject?.ownerId;
                  const isCurrentUser = c.user?.id === user?.id;
                  return (
                    <div key={c.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 shadow hover:shadow-md transition-shadow mt-8">
                      <div className="flex items-start space-x-6 mt-2">
                          <FaUserCircle className="w-10 h-10 text-gray-400 dark:text-gray-500 mt-4" />
                          <div className="flex-1">
                              <h3 className="text-gray-800 dark:text-white font-semibold text-md">
                                  {c.user?.name || 'Nombre no disponible'}
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400 text-xs break-all">
                                  {c.user?.email || 'Email no disponible'}
                              </p>
                              <p className={`text-xs font-medium mt-1 ${getRoleColor(c.role)}`}>
                                  {c.role ? (c.role.charAt(0).toUpperCase() + c.role.slice(1).toLowerCase()) : 'Rol no definido'}
                              </p>
                          </div>
                      </div>
                      {/* El owner no puede editarse/eliminarse a sí mismo, pero puede eliminar a otros */}
                      {isOwner && !isProjectOwner && (
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                              onClick={() => handleDeleteCollaborator(c.id)}
                              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1 rounded-md border border-red-500 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                          >
                              Eliminar
                          </button>
                        </div>
                      )}
                      {/* Si el usuario actual es colaborador (no owner), puede salir del proyecto */}
                      {isCurrentUser && !isOwner && (
                        <div className="mt-4 flex justify-end">
                          <button
                            className="text-xs text-yellow-600 dark:text-yellow-400  px-3 py-1 rounded-md border border-yellow-500 dark:border-yellow-400 "
                          >
                            Yo
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Modal de Sugerencias de IA */}
            {isModalOpen && (
              <HiringAssistant />
            )}

            {/* Formulario de intereses y filtro de usuarios */}
            {isOwner && (
              <div className="mb-8">
                <h2 className="font-semibold mb-2 mt-12">Agregar colaborador por Profesión</h2>
                <form className="flex flex-col md:flex-row gap-4 items-center mb-4">
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={selectedInterest}
                    onChange={e => setSelectedInterest(e.target.value)}
                  >
                    <option value="">Selecciona una Profesión de interés</option>
                    {INTERESES.map(interes => (
                      <option key={interes} value={interes}>{interes}</option>
                    ))}
                  </select>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.length === 0 ? (
                    <div className="col-span-2 text-center text-zinc-500 dark:text-zinc-400 py-8">
                      No se encontraron usuarios con la profesión seleccionada.
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className={`p-4 rounded border shadow flex flex-col gap-1 bg-white dark:bg-zinc-800 ${aiRecommendedUserIds.includes(user.id) ? 'border-green-400 ring-2 ring-green-300' : 'border-gray-200 dark:border-zinc-700'}`}
                      >
                        <span className="font-semibold text-zinc-800 dark:text-white">{user.name}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-300">{user.email}</span>
                        {user.description && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-400">{user.description}</span>
                        )}
                        {user.profession && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-400">Profesión: <span className='text-sm font-extrabold'>{user.profession}</span></span>
                        )}
                        {user.nationality && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-400">Nacionalidad: {user.nationality}</span>
                        )}
                        {user.languages && user.languages.length > 0 && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-400">Idiomas: {user.languages.join(', ')}</span>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.cvUrl && (
                            <a
                              href={user.cvUrl.startsWith('http') ? user.cvUrl : `http://localhost:3001${user.cvUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline text-[#26D07C] flex items-center gap-1"
                            >
                              <HiOutlineDocumentArrowDown className="inline-block" /> Ver CV
                            </a>
                          )}
                          <button
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                            onClick={() => router.push(`/admin/projects/${currentProjectId}/chats?userId=${user.id}`)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v6a2.25 2.25 0 01-2.25 2.25H6.25L2.75 20.25V6.75A2.25 2.25 0 015 4.5h14.5a2.25 2.25 0 012.25 2.25z" />
                            </svg>
                            Chat
                          </button>
                        </div>                        {(() => {
                          const isAlreadyCollaborator = collaborators.some(collab => collab.user.id === user.id);
                          
                          if (isAlreadyCollaborator) {
                            return (
                              <button
                                className="mt-2 px-3 py-1 bg-green-600 text-white rounded cursor-default text-xs"
                                disabled
                              >
                                Ya Pertenece a tu proyecto
                              </button>
                            );
                          }
                          
                          return (
                            <button
                              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs disabled:opacity-50"
                              onClick={() => handleAddUserAsCollaborator(user)}
                              disabled={addUserLoading === user.id}
                            >
                              {addUserLoading === user.id ? 'Agregando...' : 'Agregar como colaborador'}
                            </button>
                          );
                        })()}
                        {addUserError && addUserLoading === user.id && (
                          <span className="text-xs text-red-500">{addUserError}</span>
                        )}
                        {aiRecommendedUserIds.includes(user.id) && (
                          <span className="text-xs text-green-600 font-bold">Recomendado por IA</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {chatUser && (
              <ChatModal isOpen={!!chatUser} onClose={() => setChatUser(null)} user={chatUser} />
            )}
        </div>
    );
};
