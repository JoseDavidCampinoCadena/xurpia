import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('api/send-invite')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-invite')
  async sendInvite(@Body() body: { email: string; projectName: string; role: string }) {
    return this.emailService.sendInvitationEmail(body.email, body.projectName, body.role);
  }
  
}
 