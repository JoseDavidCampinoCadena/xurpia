import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // URL de Groq
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: "mixtral-8x7b-32768", // Modelo gratuito de Groq (puedes probar también llama3-70b)
      messages,
    });

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json({ error: "Error procesando la solicitud" }, { status: 500 });
  }
}
