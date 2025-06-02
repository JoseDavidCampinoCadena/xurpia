// Este archivo es para el frontend. NO uses Prisma aquí.
// Usa fetch para comunicarte con tu backend/API.

const messagesApi = {
  async getMessages(userId: number) {
    // Ajusta la URL según tu API real
    const res = await fetch(`/api/messages?to=${userId}`);
    if (!res.ok) throw new Error('Error al obtener mensajes');
    return res.json();
  },
  async sendMessage(userId: number, content: string) {
    // Ajusta la URL según tu API real
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId: userId, content }),
    });
    if (!res.ok) throw new Error('Error al enviar mensaje');
    return res.json();
  },
};

export default messagesApi;
