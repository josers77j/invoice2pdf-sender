import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { IEmailService } from '../interfaces/email-service.interface';

/**
 * Servicio de envío de emails usando Resend
 * Implementa la interfaz IEmailService
 */
@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend;
  private readonly senderEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no está configurada');
    }
    this.resend = new Resend(apiKey);
    this.senderEmail = this.configService.get<string>('SENDER_EMAIL', '');
  }

  /**
   * Envía un email con un PDF adjunto usando Resend
   * @param to - Email del destinatario
   * @param subject - Asunto del email
   * @param text - Cuerpo del email
   * @param attachment - Buffer del PDF adjunto
   * @param filename - Nombre del archivo adjunto
   */
  async sendEmailWithAttachment(
    to: string,
    subject: string,
    text: string,
    attachment: Buffer,
    filename: string,
  ): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.senderEmail,
        to: [to],
        subject,
        text,
        attachments: [
          {
            filename,
            content: attachment,
          },
        ],
      });

      if (error) {
        throw new Error(`Error de Resend: ${error.message}`);
      }

      this.logger.log(`Email enviado exitosamente a ${to} - ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error al enviar email a ${to}: ${(error as Error).message}`);
      throw new Error(`Error al enviar el email: ${(error as Error).message}`);
    }
  }
}