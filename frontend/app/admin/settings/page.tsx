'use client';

import { useState } from 'react';
import { FaCog, FaBell, FaPalette } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';

interface ProjectSettings {
  projectName: string;
  description: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: 'es' | 'en';
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<ProjectSettings>(() => {
    // Intentar recuperar configuraciones guardadas
    const savedSettings = localStorage.getItem('projectSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      projectName: 'Mi Proyecto',
      description: 'Descripción del proyecto...',
      emailNotifications: true,
      pushNotifications: true,
      language: 'es'
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const handleChange = (field: keyof ProjectSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Guardar configuraciones en localStorage
      localStorage.setItem('projectSettings', JSON.stringify(settings));
      
      // Simular una llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostrar mensaje de éxito
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
        projectName: 'Mi Proyecto',
        description: 'Descripción del proyecto...',
        emailNotifications: true,
        pushNotifications: true,
        language: 'es'
      };
      setSettings(defaultSettings);
      localStorage.setItem('projectSettings', JSON.stringify(defaultSettings));
      setTheme('dark');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Configuración
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
                value={settings.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                className={`w-full px-4 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
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
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-700 peer-checked:bg-green-500'
                    : 'bg-gray-200 peer-checked:bg-green-500'
                }`}></div>
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
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-700 peer-checked:bg-green-500'
                    : 'bg-gray-200 peer-checked:bg-green-500'
                }`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <FaPalette className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Apariencia
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Tema
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                className={`w-full px-4 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <option value="dark">Oscuro</option>
                <option value="light">Claro</option>
              </select>
            </div>

            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Idioma
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value as 'es' | 'en')}
                className={`w-full px-4 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="col-span-full flex justify-between gap-4 mt-4">
          <button
            type="button"
            onClick={handleResetSettings}
            className="px-6 py-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
          >
            Restablecer configuración
          </button>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={`px-6 py-2.5 rounded-md font-medium ${
                theme === 'dark'
                  ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 