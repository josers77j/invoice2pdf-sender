import { Body, Controller, Post } from '@nestjs/common';
import { SendInvoiceDto } from '@invoice/shared';
import { InvoiceService } from './invoice.service';

/**
 * Controlador de facturas
 * Gestiona las peticiones HTTP relacionadas con facturas
 */
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /**
   * Endpoint para generar y enviar una factura
   * @param sendInvoiceDto - DTO con la factura y el email de destino
   * @returns Confirmación del envío
   */
  @Post('send')
  async sendInvoice(@Body() sendInvoiceDto: SendInvoiceDto) {
    return this.invoiceService.generateAndSendInvoice(sendInvoiceDto);
  }
}