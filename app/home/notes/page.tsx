import { useState } from 'react';

const Notes = () => {
  const [notas, setNotas] = useState([
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
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newText, setNewText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  const toggleCompletar = (id: number) => {
    setNotas((prevNotas) =>
      prevNotas.map((nota) =>
        nota.id === id ? { ...nota, completado: !nota.completado } : nota
      )
    );
  };

  const borrarNota = (id: number) => {
    setNotas((prevNotas) => prevNotas.filter((nota) => nota.id !== id));
  };

  const editarNota = (id: number, texto: string) => {
    setEditingId(id);
    setNewText(texto);
  };

  const guardarNota = (id: number) => {
    setNotas((prevNotas) =>
      prevNotas.map((nota) => (nota.id === id ? { ...nota, texto: newText } : nota))
    );
    setEditingId(null);
    setNewText('');
  };

  const agregarNota = () => {
    if (newNoteText.trim()) {
      setNotas((prevNotas) => [
        ...prevNotas,
        { id: Date.now(), texto: newNoteText.trim(), completado: false },
      ]);
      setNewNoteText('');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-white">Notas:</h2>
      <p className="text-gray-400">Aquí estarán todas tus tareas pendientes</p>

      <div className="flex space-x-4 items-center">
        <input
          type="text"
          placeholder="Nueva nota"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          className="flex-grow bg-gray-700 p-2 rounded-md text-white placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={agregarNota}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Agregar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notas.map((nota) => (
          <div
            key={nota.id}
            className={`bg-zinc-800 rounded-lg p-4 shadow-lg text-white flex flex-col justify-between space-y-4 ${
              nota.completado ? 'opacity-50' : ''
            }`}
          >
            {editingId === nota.id ? (
              <textarea
                className="bg-zinc-700 p-2 rounded-md text-white w-full resize-none"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
            ) : (
              <p className="whitespace-pre-wrap">{nota.texto}</p>
            )}

            <div className="flex justify-between items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nota.completado}
                  onChange={() => toggleCompletar(nota.id)}
                  className="form-checkbox h-5 w-5 text-green-500 bg-gray-700 border-gray-600"
                />
                <span className="text-gray-300">Lista</span>
              </label>

              <div className="flex space-x-2">
                {editingId === nota.id ? (
                  <button
                    onClick={() => guardarNota(nota.id)}
                    className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600"
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    onClick={() => editarNota(nota.id, nota.texto)}
                    className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => borrarNota(nota.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
