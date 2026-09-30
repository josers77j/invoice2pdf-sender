import { InvoiceDto } from '@invoice/shared';

/**
 * Interfaz del generador de PDF
 * Define el contrato que cualquier implementación de generación
 * de PDF debe cumplir (Principio de Inversión de Dependencias)
 */
export interface IPdfGenerator {
  /**
   * Genera un PDF a partir de una factura
   * @param invoice - Datos de la factura
   * @returns Buffer con el contenido del PDF
   */
  generateInvoicePdf(invoice: InvoiceDto): Promise<Buffer>;
}