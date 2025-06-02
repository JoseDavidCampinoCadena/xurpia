'use client';

import React, { useState } from 'react';
import { useTasks } from '@/app/hooks/useTasks';
import { useAuth } from '@/app/hooks/useAuth';
import { useProjects } from '@/app/hooks/useProjects';
import { FaRobot } from 'react-icons/fa';
import { FaCheckCircle } from 'react-icons/fa';
import { TaskStatus } from '@/app/types/api.types';

export default function TasksPage() {
  const { tasks, loading, error, updateTask } = useTasks();
  const { user } = useAuth();
  const { projects, loading: loadingProjects } = useProjects();

  const [showLevelForm, setShowLevelForm] = useState(false);
  const [professionConfirmed, setProfessionConfirmed] = useState<boolean | null>(null);
  const [tech, setTech] = useState('');
  const [levelResult, setLevelResult] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);

  // Llama a la API de Hugging Face para generar preguntas
  const generateQuestions = async (tech: string, languageAnswer?: string) => {
    try {
      // Si ya tenemos la respuesta del lenguaje, pásala al backend para personalizar el resto de preguntas
      if (languageAnswer) {
        const response = await fetch('/api/ai/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tech: languageAnswer }), // SOLO usa el lenguaje para la IA
        });
        if (!response.ok) throw new Error('Error generando preguntas IA');
        const data = await response.json();
        return data.questions as string[];
      } else {
        // Primera pregunta siempre sobre el lenguaje
        return ['¿En qué lenguaje te especializas?'];
      }
    } catch {
      // fallback local
      if (languageAnswer) {
        const base = [
          `¿Qué es ${languageAnswer}?`,
          `¿Para qué sirve ${languageAnswer}?`,
          `¿Cómo declarar una variable en ${languageAnswer}?`,
          `¿Qué es una función en ${languageAnswer}?`,
          `¿Qué es el scope en ${languageAnswer}?`,
          `¿Qué es el hoisting en ${languageAnswer}?`,
          `¿Qué es una promesa en ${languageAnswer}?`,
          `¿Cómo manejar errores en ${languageAnswer}?`,
          `¿Qué es async/await en ${languageAnswer}?`,
          `¿Cómo optimizar el rendimiento en ${languageAnswer}?`
        ];
        return base;
      } else {
        return ['¿En qué lenguaje te especializas?'];
      }
    }
  };

  // Llama a la API de Hugging Face para evaluar el nivel
  const evaluateLevel = async (answers: string[], tech: string) => {
    try {
      const response = await fetch('/api/ai/evaluate-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, tech }),
      });
      if (!response.ok) throw new Error('Error evaluando nivel IA');
      const data = await response.json();
      // Normaliza la respuesta para aceptar variantes del modelo HF
      const level = (data.level || '').toLowerCase();
      if (level.includes('avanzado')) return 'Avanzado';
      if (level.includes('intermedio')) return 'Intermedio';
      if (level.includes('principiante')) return 'Principiante';
      // fallback si la IA responde algo inesperado
      return 'Principiante';
    } catch {
      // fallback local
      const score = answers.reduce((acc, a) => acc + (a && a.length > 20 ? 2 : a && a.length > 10 ? 1 : 0), 0);
      if (score > 15) return 'Avanzado';
      if (score > 8) return 'Intermedio';
      return 'Principiante';
    }
  };

  // Mostrar formulario si el usuario no tiene nivel
  if (showLevelForm) {
    if (levelResult) {
      return (
        <div className="p-4 max-w-xl mx-auto bg-gradient-to-br from-zinc-900 via-emerald-900 to-black rounded-3xl shadow-2xl border-2 border-emerald-700 animate-fade-in mt-24">
          <div className="flex items-center gap-3 mb-4">
            <FaRobot className="text-emerald-400 text-3xl animate-bounce" />
            <h2 className="text-2xl font-extrabold text-emerald-300 drop-shadow">¡Tu resultado IA!</h2>
          </div>
          <div className="bg-zinc-800/80 rounded-xl p-4 mb-4 flex flex-col items-center">
            <p className="text-emerald-200 text-lg mb-2 font-semibold">Tu nivel en <b className="text-emerald-400">{tech}</b> es:</p>
            <span className="text-3xl font-black text-emerald-400 drop-shadow-glow animate-pulse">{levelResult}</span>
            <p className="text-emerald-100 mt-2">Rol: <b className="text-emerald-300">{user?.name}: [{tech}] [{levelResult}]</b></p>
            <FaCheckCircle className="text-emerald-400 text-4xl mt-4 animate-pulse" />
          </div>
          <button className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 transition text-white rounded-full shadow-lg font-bold text-lg tracking-wide" onClick={() => setShowLevelForm(false)}>
            Volver a las tareas
          </button>
        </div>
      );
    }
    if (professionConfirmed === null) {
      return (
        <div className="p-4 max-w-xl mx-auto bg-gradient-to-br from-zinc-900 via-emerald-900 to-black rounded-3xl shadow-2xl border-2 border-emerald-700 animate-fade-in mt-24">
          <div className="flex items-center gap-3 mb-4">
            <FaRobot className="text-emerald-400 text-3xl animate-bounce" />
            <h2 className="text-2xl font-extrabold text-emerald-300 drop-shadow">Confirma tu profesión</h2>
          </div>
          <p className="text-emerald-200 mb-4 text-lg">¿Tu profesión es <b className="text-emerald-400">{user?.profession}</b>?</p>
          <div className="flex gap-6 mt-4 justify-center">
            <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 transition text-white rounded-full font-bold text-lg shadow" onClick={async () => { setProfessionConfirmed(true); setTech(user?.profession || ''); setQuestions(await generateQuestions(user?.profession || '')); }}>Sí</button>
            <button className="px-6 py-2 bg-zinc-700 hover:bg-zinc-800 transition text-emerald-200 rounded-full font-bold text-lg shadow" onClick={() => setProfessionConfirmed(false)}>No</button>
          </div>
        </div>
      );
    }
    if (professionConfirmed === false && !tech) {
      return (
        <div className="p-4 max-w-xl mx-auto bg-gradient-to-br from-zinc-900 via-emerald-900 to-black rounded-3xl shadow-2xl border-2 border-emerald-700 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <FaRobot className="text-yellow-400 text-3xl animate-bounce" />
            <h2 className="text-2xl font-extrabold text-emerald-300 drop-shadow">¿Cuál es tu profesión?</h2>
          </div>
          <input className="w-full p-3 rounded-xl mb-6 bg-zinc-800 text-emerald-200 border-2 border-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-lg" value={tech} onChange={e => setTech(e.target.value)} placeholder="Ejemplo: Frontend, Backend, QA..." />
          <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 transition text-white rounded-full font-bold text-lg shadow" onClick={async () => { setQuestions(await generateQuestions(tech)); setProfessionConfirmed(true); }}>Continuar</button>
        </div>
      );
    }
    // Si estamos en la primera pregunta, solo muestra esa
    if (questions.length > 0 && currentQuestion === 0) {
      return (
        <div className="p-4 max-w-xl mx-auto bg-gradient-to-br from-zinc-900 via-emerald-900 to-black rounded-3xl shadow-2xl border-2 border-emerald-700 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <FaRobot className="text-indigo-400 text-3xl animate-bounce" />
            <h2 className="text-2xl font-extrabold text-emerald-300 drop-shadow">Test de nivel: {tech}</h2>
          </div>
          <div className="bg-zinc-800/80 rounded-xl p-4 mb-4">
            <p className="text-emerald-200 mb-2 text-lg font-semibold">Pregunta 1 de {questions.length}</p>
            <p className="text-emerald-100 mb-4 font-semibold text-xl">{questions[0]}</p>
            <textarea className="w-full p-3 rounded-xl mb-4 bg-zinc-900 text-emerald-200 border-2 border-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-lg" value={answers[0] || ''} onChange={e => {
              const newAnswers = [...answers];
              newAnswers[0] = e.target.value;
              setAnswers(newAnswers);
            }} placeholder="Tu respuesta..." />
            <div className="flex gap-4 mt-2 justify-center">
              <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 transition text-white rounded-full font-bold text-lg shadow" onClick={async () => {
                // Cuando el usuario responde la primera pregunta, genera el resto usando SOLO la respuesta de lenguaje
                const restQuestions = await generateQuestions('', answers[0]);
                setQuestions([questions[0], ...restQuestions]);
                setCurrentQuestion(1);
              }}>Siguiente</button>
            </div>
          </div>
        </div>
      );
    }
    // Si estamos en las siguientes preguntas
    if (questions.length > 0 && currentQuestion > 0 && currentQuestion < questions.length) {
      return (
        <div className="p-4 max-w-xl mx-auto bg-gradient-to-br from-zinc-900 via-emerald-900 to-black rounded-3xl shadow-2xl border-2 border-emerald-700 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <FaRobot className="text-indigo-400 text-3xl animate-bounce" />
            <h2 className="text-2xl font-extrabold text-emerald-300 drop-shadow">Test de nivel: {tech}</h2>
          </div>
          <div className="bg-zinc-800/80 rounded-xl p-4 mb-4">
            <p className="text-emerald-200 mb-2 text-lg font-semibold">Pregunta {currentQuestion + 1} de {questions.length}</p>
            <p className="text-emerald-100 mb-4 font-semibold text-xl">{questions[currentQuestion]}</p>
            <textarea className="w-full p-3 rounded-xl mb-4 bg-zinc-900 text-emerald-200 border-2 border-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-lg" value={answers[currentQuestion] || ''} onChange={e => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }} placeholder="Tu respuesta..." />
            <div className="flex gap-4 mt-2 justify-center">
              {currentQuestion > 1 && <button className="px-6 py-2 bg-zinc-700 hover:bg-zinc-800 transition text-emerald-200 rounded-full font-bold text-lg shadow" onClick={() => setCurrentQuestion(currentQuestion - 1)}>Anterior</button>}
              <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 transition text-white rounded-full font-bold text-lg shadow" onClick={async () => {
                if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
                else setLevelResult(await evaluateLevel(answers, tech));
              }}>{currentQuestion < questions.length - 1 ? 'Siguiente' : 'Finalizar'}</button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (loading || loadingProjects) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!projects || projects.length === 0) {
    return (
      <div className="p-4">
        <div className="text-white">No hay proyectos disponibles. Necesitas crear un proyecto primero o Únete a un proyecto para ver las tareas asignadas</div>
      </div>
    );
  }

  // Filtrar tareas para mostrar solo las asignadas al usuario actual, si 'user' y 'task.assignee' están disponibles y son comparables.
  // Esto es un ejemplo, la estructura de 'task.assignee' y 'user' debe ser conocida.
  // Si 'tasks' ya viene filtrado desde el hook useTasks para el usuario actual, este filtro no es necesario aquí.
  // Asumiendo que task.assignee.id y user.id existen para la comparación.
  const assignedTasks = user ? tasks.filter(task => task.assignee && task.assignee.id === user.id) : tasks;
  // Si quieres mostrar TODAS las tareas del proyecto sin filtrar por asignado (como parece ser el comportamiento original),
  // simplemente usa 'tasks' directamente: const assignedTasks = tasks;

  const handleStatusChange = (taskId: number, newStatus: string) => {
    // Convierte el string a los valores permitidos por UpdateTaskData
    if (["PENDING", "IN_PROGRESS", "COMPLETED"].includes(newStatus)) {
      updateTask(taskId, { status: newStatus as "PENDING" | "IN_PROGRESS" | "COMPLETED" });
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-white mb-6">Tus Tareas</h1>
      <button className="mb-4 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 transition text-white rounded-full shadow-lg font-bold text-lg tracking-wide" onClick={() => setShowLevelForm(true)}>
        Realizar test de nivel IA
      </button>
      {/* Lista de tareas */}
      <div className="space-y-4">
        {assignedTasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border rounded-lg shadow-sm bg-zinc-900 border-zinc-700" // Estilo actualizado para mejor contraste
          >
            {/* Sección de edición de título ELIMINADA */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-white">{task.title}</h3>
                {task.assignee && (
                  <p className="text-sm text-gray-400">
                    Asignado a: {task.assignee.name || 'No asignado'}
                  </p>
                )}
                {task.project && (
                  <p className="text-sm text-gray-400">
                    Proyecto: {task.project.name || 'Sin proyecto'}
                  </p>
                )}
                 {task.description && ( // Mostrar descripción si existe
                  <p className="text-sm text-gray-300 mt-1">
                    Descripción: {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="p-2 border rounded-xl bg-zinc-700 text-white border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                  aria-label={`Estado de la tarea ${task.title}`}
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completada</option>
                </select>
                {/* Botón Editar ELIMINADO */}
                {/* Botón Eliminar ELIMINADO */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}