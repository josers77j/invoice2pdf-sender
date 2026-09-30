import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendInvoiceDto } from '@invoice/shared';
import { PDF_GENERATOR } from '../pdf/pdf.constants';
import { IPdfGenerator } from '../pdf/interfaces/pdf-generator.interface';
import { EMAIL_SERVICE } from '../email/email.constants';
import { IEmailService } from '../email/interfaces/email-service.interface';

/**
 * Servicio de facturas
 * Orquesta la generación del PDF y el envío del email
 * Depende de abstracciones (IPdfGenerator, IEmailService) no de implementaciones concretas
 */
@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @Inject(PDF_GENERATOR) private readonly pdfGenerator: IPdfGenerator,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Genera el PDF de la factura y lo envía por email
   * @param sendInvoiceDto - DTO con la factura y el email de destino
   * @returns Confirmación del envío
   */
  async generateAndSendInvoice(sendInvoiceDto: SendInvoiceDto): Promise<{ message: string; invoiceNumber: string }> {
    const { invoice, recipientEmail } = sendInvoiceDto;

    this.logger.log(`Generando factura ${invoice.invoiceNumber} para ${recipientEmail}`);

    // 1. Generar el PDF
    const pdfBuffer = await this.pdfGenerator.generateInvoicePdf(invoice);

    // 2. Enviar el email con el PDF adjunto
    const filename = `factura-${invoice.invoiceNumber}.pdf`;
    const subject = `Factura ${invoice.invoiceNumber} - ${invoice.customerName}`;
    const text = `Estimado/a ${invoice.customerName},\n\nAdjuntamos la factura ${invoice.invoiceNumber} por un total de $${invoice.total.toFixed(2)}.\n\nSaludos cordiales.`;

    await this.emailService.sendEmailWithAttachment(
      recipientEmail,
      subject,
      text,
      pdfBuffer,
      filename,
    );

    this.logger.log(`Factura ${invoice.invoiceNumber} enviada exitosamente a ${recipientEmail}`);

    return {
      message: 'Factura generada y enviada exitosamente',
      invoiceNumber: invoice.invoiceNumber,
    };
  }
}