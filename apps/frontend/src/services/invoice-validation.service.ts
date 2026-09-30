import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { InvoiceDto, SendInvoiceDto } from '@invoice/shared';

/**
 * Servicio de validación de facturas en el frontend
 * Usa los mismos DTOs del paquete compartido para garantizar
 * que el formulario y el JSON cargado tengan exactamente
 * la misma estructura que el backend espera
 */
export class InvoiceValidationService {
  /**
   * Valida un objeto de factura contra el DTO compartido
   * @param data - Objeto a validar
   * @returns Lista de errores de validación (vacía si es válido)
   */
  static async validateInvoice(data: unknown): Promise<string[]> {
    const invoiceInstance = plainToInstance(InvoiceDto, data);
    const errors = await validate(invoiceInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    return this.formatErrors(errors);
  }

  /**
   * Valida el payload completo de envío (factura + email de destino)
   * @param data - Objeto a validar
   * @returns Lista de errores de validación (vacía si es válido)
   */
  static async validateSendInvoice(data: unknown): Promise<string[]> {
    const sendInvoiceInstance = plainToInstance(SendInvoiceDto, data);
    const errors = await validate(sendInvoiceInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    return this.formatErrors(errors);
  }

  /**
   * Formatea los errores de class-validator a mensajes legibles
   * @param errors - Errores de validación
   * @returns Lista de mensajes de error
   */
  private static formatErrors(errors: any[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        const constraintValues = Object.values(error.constraints) as string[];
        messages.push(...constraintValues);
      }
      if (error.children && error.children.length > 0) {
        messages.push(...this.formatErrors(error.children));
      }
    }

    return messages;
  }
}