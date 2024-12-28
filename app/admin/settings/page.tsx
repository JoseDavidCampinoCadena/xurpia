'use client';

import { useState } from 'react';
import { FaCog, FaBell, FaUsers, FaPalette, FaShieldAlt } from 'react-icons/fa';
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

  const handleChange = (field: keyof ProjectSettings, value: any) => {
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
      const defaultSettings = {
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        {showSavedMessage && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-md">
            Configuraciones guardadas correctamente
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración General */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaCog className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">General</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Nombre del Proyecto</label>
              <input
                type="text"
                value={settings.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Descripción</label>
              <textarea
                value={settings.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaBell className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Notificaciones</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Notificaciones por email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white">Notificaciones push</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaPalette className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Apariencia</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Tema</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
              >
                <option value="dark">Oscuro</option>
                <option value="light">Claro</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Idioma</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full bg-zinc-900 text-white px-4 py-2 rounded-md"
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
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Restablecer configuración
          </button>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 ${
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