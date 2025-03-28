import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true para 465, false para 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendInvitationEmail(to: string, projectName: string, role: string) {
    const mailOptions = {
      from: `"Xurp IA" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Invitación a unirte al proyecto "${projectName}"`,
      html: `
        <h2>Has sido invitado a ${projectName}</h2>
        <p>Rol asignado: <strong>${role}</strong></p>
        <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
        <a href="https://xurpia.com/invitacion?email=${to}" target="_blank">Aceptar Invitación</a>
        <p>Si no solicitaste esto, ignora este correo.</p>
      `,
    };
  
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Correo enviado a ${to}`);
    } catch (error) {
      console.error('Error al enviar el correo:', error);
    }
  }
  
}
