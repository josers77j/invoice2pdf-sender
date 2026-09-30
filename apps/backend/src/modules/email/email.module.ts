import { Module } from '@nestjs/common';
import { ResendEmailService } from './services/resend-email.service';
import { EMAIL_SERVICE } from './email.constants';

/**
 * Módulo de email
 * Encapsula la lógica de envío de correos electrónicos
 * y expone el token EMAIL_SERVICE para inyección de dependencias
 */
@Module({
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: ResendEmailService,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}