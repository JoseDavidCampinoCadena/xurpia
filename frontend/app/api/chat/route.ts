import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Agregar un mensaje de sistema para forzar respuestas breves
    const updatedMessages = [
      { role: "system", content: "Responde siempre en el mismo idioma en el que te hablen. Sé ultra breve y conciso."  },
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: updatedMessages,
       // Limita la respuesta a pocas palabras
    });

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json({ error: "Error procesando la solicitud" }, { status: 500 });
  }
}
