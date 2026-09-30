import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';

/**
 * Módulo de facturas
 * Orquesta la generación de PDF y el envío de emails
 * Encapsula el controlador y el servicio de facturas
 */
@Module({
  imports: [PdfModule, EmailModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}