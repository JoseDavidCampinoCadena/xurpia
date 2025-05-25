import React, { useEffect, useRef, useState } from 'react';
import { messagesApi } from '@/app/api/messages.api';
import { User } from '@/app/api/users.api';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ChatModal({ isOpen, onClose, user }: ChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
    // eslint-disable-next-line
  }, [isOpen, user.id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const msgs = await messagesApi.getMessages(user.id);
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await messagesApi.sendMessage(user.id, input);
    setInput('');
    fetchMessages();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md p-4 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg text-zinc-800 dark:text-white">Chat con {user.name}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-red-500">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto mb-2 max-h-80 border rounded p-2 bg-zinc-100 dark:bg-zinc-800">
          {loading ? (
            <div className="text-center text-xs text-zinc-400">Cargando mensajes...</div>
          ) : (
            messages.length === 0 ? (
              <div className="text-center text-xs text-zinc-400">No hay mensajes aún.</div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`mb-2 flex ${msg.fromUserId === user.id ? 'justify-start' : 'justify-end'}`}>
                  <div className={`px-3 py-1 rounded-lg text-sm ${msg.fromUserId === user.id ? 'bg-green-100 dark:bg-green-900 text-zinc-800 dark:text-white' : 'bg-blue-100 dark:bg-blue-900 text-zinc-800 dark:text-white'}`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2 mt-2">
          <input
            className="flex-1 rounded border px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
          <button type="submit" className="bg-[#26D07C] text-white px-4 py-2 rounded font-bold">Enviar</button>
        </form>
      </div>
    </div>
  );
}
