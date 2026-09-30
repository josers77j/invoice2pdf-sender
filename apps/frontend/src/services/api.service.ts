import { SendInvoiceDto } from '@invoice/shared';

/**
 * Servicio de comunicación con el backend
 * Encapsula las llamadas HTTP a la API de facturas
 */
export class ApiService {
  private static readonly BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  /**
   * Envía una factura al backend para generar el PDF y enviarlo por email
   * @param payload - DTO de envío de factura
   * @returns Confirmación del backend
   */
  static async sendInvoice(payload: SendInvoiceDto): Promise<{ message: string; invoiceNumber: string }> {
    const response = await fetch(`${this.BASE_URL}/invoices/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || `Error del servidor (${response.status})`;
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }

    return response.json();
  }
}