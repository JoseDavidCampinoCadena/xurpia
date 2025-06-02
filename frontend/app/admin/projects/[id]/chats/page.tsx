'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '@/app/hooks/useAuth';

const socket = io('http://localhost:3001'); // CAMBIA si tu backend NestJS usa otro puerto

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const toUserId = parseInt(searchParams.get('userId') || '', 10);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  // Cargar historial y escuchar
  useEffect(() => {
    if (!user?.id || !toUserId) return;

    fetch(`/api/messages?from=${user.id}&to=${toUserId}`)
      .then(res => res.json())
      .then(setMessages);

    socket.on('newMessage', (msg: Message) => {
      if (
        (msg.fromUserId === user.id && msg.toUserId === toUserId) ||
        (msg.fromUserId === toUserId && msg.toUserId === user.id)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [user?.id, toUserId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const message = {
      fromUserId: user!.id,
      toUserId,
      content: input,
    };

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    socket.emit('sendMessage', message);
    setInput('');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto text-white">
      <h2 className="text-xl font-bold mb-4">Chat con usuario #{toUserId}</h2>

      <div className="h-[400px] overflow-y-auto bg-zinc-800 p-4 rounded mb-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.fromUserId === user?.id ? 'bg-blue-600 ml-auto text-right' : 'bg-gray-700 mr-auto text-left'
            } max-w-[70%]`}
          >
            <p>{msg.content}</p>
            <span className="text-xs text-gray-300 block mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 p-2 bg-zinc-700 text-white rounded"
          placeholder="Escribe un mensaje..."
        />
        <button onClick={sendMessage} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white">
          Enviar
        </button>
      </div>
    </div>
  );
}
