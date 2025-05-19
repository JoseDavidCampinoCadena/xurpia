'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaBell } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useProjects } from '@/app/hooks/useProjects';
import { useParams, useRouter } from 'next/navigation';

interface ProjectSettings {
  name: string;
  logo: string;
  location: string;
  description: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: 'es' | 'en';
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { projects, updateProject, deleteProject } = useProjects(); // Asegúrate de que `deleteProject` esté disponible
  const { id } = useParams(); // Obtén el ID del proyecto desde la URL
  const router = useRouter(); // Para redirigir después de eliminar
  const currentProject = projects.find((project) => project.id.toString() === id); // Encuentra el proyecto actual

  const [settings, setSettings] = useState<ProjectSettings>(() => {
    return {
      name: currentProject?.name || '',
      logo: currentProject?.logo || '',
      location: currentProject?.location || '',
      description: currentProject?.description || '',
      emailNotifications: true,
      pushNotifications: true,
      language: 'es',
    };
  });

  // Sincroniza settings cuando currentProject cambie
  useEffect(() => {
    if (currentProject) {
      setSettings((prev) => ({
        ...prev,
        name: currentProject.name || '',
        logo: currentProject.logo || '',
        location: currentProject.location || '',
        description: currentProject.description || '',
      }));
    }
  }, [currentProject]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const handleChange = (field: keyof ProjectSettings, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentProject) {
        await updateProject(currentProject.id, {
          name: settings.name,
          logo: settings.logo,
          location: settings.location,
          description: settings.description,
        });
      }
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('¿Estás seguro de que quieres restablecer todas las configuraciones?')) {
      const defaultSettings: ProjectSettings = {
        name: '',
        logo: '',
        location: '',
        description: 'Descripción del proyecto...',
        emailNotifications: true,
        pushNotifications: true,
        language: 'es',
      };
      setSettings(defaultSettings);
      setTheme('dark');
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;

    if (confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      setIsDeleting(true);

      try {
        // Llama a la función para eliminar el proyecto
        await deleteProject(currentProject.id);

        // Redirige a la lista de proyectos
        alert('Proyecto eliminado correctamente.');
        router.push(`/home`);
      } catch (error) {
        console.error('Error al eliminar el proyecto:', error);
        alert('No se pudo eliminar el proyecto. Inténtalo nuevamente.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Configuración de {currentProject?.name || 'Proyecto'}
        </h1>
        {showSavedMessage && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-md">
            Configuraciones guardadas correctamente
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración General */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <FaCog className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              General
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Logo del Proyecto (URL de imagen)
              </label>
              <input
                type="url"
                value={settings.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                className={`w-full px-4 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}
                required
              />
              {settings.logo && (
                <img
                  src={settings.logo}
                  alt="Logo del proyecto"
                  className="w-16 h-16 rounded-full mt-2 border"
                />
              )}
            </div>

            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Ubicación
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className={`w-full px-4 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}
                placeholder="Ciudad, país, remoto, etc."
              />
            </div>

            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Descripción
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`w-full px-4 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <FaBell className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Notificaciones
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Notificaciones por email
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    theme === 'dark'
                      ? 'bg-zinc-700 peer-checked:bg-green-500'
                      : 'bg-gray-200 peer-checked:bg-green-500'
                  }`}
                ></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Notificaciones push
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    theme === 'dark'
                      ? 'bg-zinc-700 peer-checked:bg-green-500'
                      : 'bg-gray-200 peer-checked:bg-green-500'
                  }`}
                ></div>
              </label>
            </div>
          </div>
        </div>
      </form>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleResetSettings}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
        >
          Restablecer
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button
          type="button"
          onClick={handleDeleteProject}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
          disabled={isDeleting}
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar Proyecto'}
        </button>
      </div>
    </div>
  );
}