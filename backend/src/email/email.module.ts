import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService], // Exportar para que otros módulos lo usen
})
export class EmailModule {}
