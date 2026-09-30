/**
 * Interfaz del servicio de envío de emails
 * Define el contrato que cualquier implementación de envío
 * de correo debe cumplir (Principio de Inversión de Dependencias)
 */
export interface IEmailService {
  /**
   * Envía un email con un PDF adjunto
   * @param to - Email del destinatario
   * @param subject - Asunto del email
   * @param text - Cuerpo del email
   * @param attachment - Buffer del PDF adjunto
   * @param filename - Nombre del archivo adjunto
   */
  sendEmailWithAttachment(
    to: string,
    subject: string,
    text: string,
    attachment: Buffer,
    filename: string,
  ): Promise<void>;
}