import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name, projectName } = await req.json();

    const data = await resend.emails.send({
      from: "tu-email@tudominio.com",
      to: email,
      subject: `Invitación a unirte al proyecto "${projectName}"`,
      html: `
        <h2>Hola, ${name} 👋</h2>
        <p>Has sido invitado a colaborar en el proyecto <strong>${projectName}</strong>.</p>
        <p>Haz clic en el siguiente enlace para unirte:</p>
        <a href="https://tuapp.com/invitacion">Unirme al proyecto</a>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
