import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Formato de mensajes inválido" },
        { status: 400 }
      );
    }

    console.log("📨 Enviando datos a OpenRouter:", body.messages);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-70b-instruct", // Modelo válido
        messages: body.messages,
        provider: {
          sort: "throughput",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://tudominio.com", // Cambia esto si tienes dominio
          "X-Title": "Xurp IA",
        },
      }
    );

    console.log("✅ Respuesta de OpenRouter:", response.data);

    return NextResponse.json({ reply: response.data.choices[0].message.content });
  } catch (error: any) {
    console.error("❌ Error en la API:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || "Error en la solicitud al chatbot" },
      { status: 500 }
    );
  }
}
