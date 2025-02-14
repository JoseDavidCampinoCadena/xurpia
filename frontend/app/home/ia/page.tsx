'use client'
import { useState } from "react";
import axios from "axios";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/chat", { messages: newMessages });
      setMessages([...newMessages, { role: "assistant", content: response.data.reply }]);
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
      <div className="flex flex-col w-full max-w-4xl h-full bg-[#212121] p-4 rounded-xl shadow-lg space-y-4">
        <div className="flex-1 overflow-y-auto p-2 border-b border-[#2f2f2f]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-xs ${msg.role === "user" ? "ml-auto bg-[#2f2f2f]" : "mr-auto bg-green-500"}`}
            >
              {msg.content}
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 p-2 bg-[#2f2f2f] text-white rounded-lg outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-green-500 rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
