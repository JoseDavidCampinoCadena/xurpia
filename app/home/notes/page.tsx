'use client';

import NotesClient from './NotesClient';
import { useTheme } from '@/app/contexts/ThemeContext';

// Aquí podrías tener funciones async para obtener datos iniciales
const getInitialNotes = () => {
  // Esto es un ejemplo - aquí normalmente harías una llamada a tu base de datos
  // o a una API externa usando fetch
  const initialNotes = [
    {
      id: 1,
      texto: 'El proyecto se debe de entregar para el 1 de Noviembre, dando información sobre el Diagrama de Flujo, BD y todo lo aprendido en clase.',
      completado: false,
    },
    {
      id: 2,
      texto: 'Acomodar las ideas principales del proyecto para ir a la programación:\n- Reunirse con equipo de trabajo\n- Realizar boceto de ideas',
      completado: false,
    },
  ];

  return initialNotes;
}

function Notes() {
  const { theme } = useTheme();
  // Obtener las notas iniciales
  const initialNotes = getInitialNotes();

  return (
    <div className="p-8 space-y-6">
      <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Notas:
      </h2>
      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
        Aquí estarán todas tus tareas pendientes
      </p>
      
      {/* Pasamos las notas iniciales al componente cliente */}
      <NotesClient initialNotes={initialNotes} />
    </div>
  );
}

export default Notes;
