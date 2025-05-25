'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useProjects } from '@/app/hooks/useProjects';
import { messagesApi } from '@/app/api/messages.api';
import { usersApi, User } from '@/app/api/users.api';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';

interface ChatSummary {
  user: User;
  lastMessage: string;
  lastDate: string;
}

export default function ProjectChatsPage() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const router = useRouter();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Obtener el id del proyecto desde la URL
  const projectId = typeof window !== 'undefined' ? Number(window.location.pathname.split('/')[2].replace('project', '')) : undefined;

  // Cargar chats (usuarios con los que el usuario ha hablado en este proyecto)
  useEffect(() => {
    if (!user || !projectId) return;
    setLoading(true);
    messagesApi.getChatsForProjectUser(projectId, user.id)
      .then(async (chatUsers: User[]) => {
        // Para cada usuario, obtener el último mensaje
        const chatSummaries: ChatSummary[] = await Promise.all(chatUsers.map(async (u) => {
          const lastMsg = await messagesApi.getLastMessageBetweenUsers(projectId, user.id, u.id);
          return {
            user: u,
            lastMessage: lastMsg?.content || '',
            lastDate: lastMsg?.createdAt || '',
          };
        }));
        // Ordenar por fecha descendente
        chatSummaries.sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());
        setChats(chatSummaries);
      })
      .finally(() => setLoading(false));
  }, [user, projectId]);

  // Cargar mensajes del chat seleccionado
  useEffect(() => {
    if (!selectedChat || !user || !projectId) return;
    setLoadingMessages(true);
    messagesApi.getMessagesBetweenUsers(projectId, user.id, selectedChat.id)
      .then(setMessages)
      .finally(() => setLoadingMessages(false));
  }, [selectedChat, user, projectId]);

  return (
    <div className="flex h-[90vh] bg-zinc-900">
      {/* Lista de chats */}
      <aside className="w-80 bg-zinc-800 border-r border-zinc-700 flex flex-col">
        <div className="p-4 border-b border-zinc-700">
          <input
            type="text"
            placeholder="Buscar un chat o iniciar uno nuevo"
            className="w-full px-3 py-2 rounded bg-zinc-700 text-white placeholder-zinc-400 focus:outline-none"
            // TODO: implementar búsqueda
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-zinc-400">Cargando chats...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-zinc-400">No tienes chats en este proyecto.</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.user.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-700 ${selectedChat?.id === chat.user.id ? 'bg-zinc-700' : ''}`}
                onClick={() => setSelectedChat(chat.user)}
              >
                <FaUserCircle className="w-10 h-10 text-zinc-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{chat.user.name}</div>
                  <div className="text-xs text-zinc-400 truncate">{chat.lastMessage}</div>
                </div>
                <div className="text-xs text-zinc-500 whitespace-nowrap">{chat.lastDate ? new Date(chat.lastDate).toLocaleDateString() : ''}</div>
              </div>
            ))
          )}
        </div>
      </aside>
      {/* Área de chat */}
      <main className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-zinc-700 flex items-center gap-3 bg-zinc-800">
              <FaUserCircle className="w-8 h-8 text-zinc-400" />
              <div className="font-semibold text-white">{selectedChat.name}</div>
            </div>
            <div className="flex-1 overflow-y-auto bg-zinc-900 p-6">
              {loadingMessages ? (
                <div className="text-zinc-400">Cargando mensajes...</div>
              ) : messages.length === 0 ? (
                <div className="text-zinc-400">No hay mensajes en este chat.</div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`mb-4 flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderId === user?.id ? 'bg-green-500 text-white' : 'bg-zinc-700 text-zinc-100'}`}>
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs text-right text-zinc-300 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Input para enviar mensajes (no implementado aquí) */}
            <div className="p-4 border-t border-zinc-700 bg-zinc-800">
              <input
                type="text"
                className="w-full px-3 py-2 rounded bg-zinc-700 text-white placeholder-zinc-400 focus:outline-none"
                placeholder="Escribe un mensaje... (no implementado)"
                disabled
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400 text-lg">
            Selecciona un chat para ver la conversación.
          </div>
        )}
      </main>
    </div>
  );
}