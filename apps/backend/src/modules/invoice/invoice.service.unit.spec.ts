import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InvoiceService } from './invoice.service';
import { PDF_GENERATOR } from '../pdf/pdf.constants';
import { EMAIL_SERVICE } from '../email/email.constants';
import { IPdfGenerator } from '../pdf/interfaces/pdf-generator.interface';
import { IEmailService } from '../email/interfaces/email-service.interface';
import { SendInvoiceDto } from '@invoice/shared';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let pdfGenerator: jest.Mocked<IPdfGenerator>;
  let emailService: jest.Mocked<IEmailService>;

  const mockInvoice: SendInvoiceDto = {
    invoice: {
      invoiceNumber: 'INV-001',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      invoiceDate: '2024-01-15',
      items: [
        { description: 'Producto A', quantity: 2, unitPrice: 50 },
        { description: 'Producto B', quantity: 1, unitPrice: 100 },
      ],
      subtotal: 200,
      tax: 32,
      total: 232,
      notes: 'Pago a 30 días',
    },
    recipientEmail: 'destino@example.com',
  };

  const mockPdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');

  beforeEach(async () => {
    pdfGenerator = {
      generateInvoicePdf: jest.fn().mockResolvedValue(mockPdfBuffer),
    };

    emailService = {
      sendEmailWithAttachment: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: PDF_GENERATOR,
          useValue: pdfGenerator,
        },
        {
          provide: EMAIL_SERVICE,
          useValue: emailService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test@example.com'),
          },
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  describe('generateAndSendInvoice', () => {
    it('debe generar el PDF y enviar el email exitosamente', async () => {
      const result = await service.generateAndSendInvoice(mockInvoice);

      // Verificar que se generó el PDF
      expect(pdfGenerator.generateInvoicePdf).toHaveBeenCalledWith(mockInvoice.invoice);

      // Verificar que se envió el email con los parámetros correctos
      expect(emailService.sendEmailWithAttachment).toHaveBeenCalledWith(
        mockInvoice.recipientEmail,
        `Factura ${mockInvoice.invoice.invoiceNumber} - ${mockInvoice.invoice.customerName}`,
        expect.stringContaining(mockInvoice.invoice.customerName),
        mockPdfBuffer,
        `factura-${mockInvoice.invoice.invoiceNumber}.pdf`,
      );

      // Verificar el resultado
      expect(result).toEqual({
        message: 'Factura generada y enviada exitosamente',
        invoiceNumber: mockInvoice.invoice.invoiceNumber,
      });
    });

    it('debe propagar el error si la generación del PDF falla', async () => {
      pdfGenerator.generateInvoicePdf.mockRejectedValue(new Error('Error al generar PDF'));

      await expect(service.generateAndSendInvoice(mockInvoice)).rejects.toThrow(
        'Error al generar PDF',
      );

      // El email no debe enviarse si el PDF falla
      expect(emailService.sendEmailWithAttachment).not.toHaveBeenCalled();
    });

    it('debe propagar el error si el envío del email falla', async () => {
      emailService.sendEmailWithAttachment.mockRejectedValue(new Error('Error al enviar email'));

      await expect(service.generateAndSendInvoice(mockInvoice)).rejects.toThrow(
        'Error al enviar email',
      );

      // El PDF sí debe haberse generado
      expect(pdfGenerator.generateInvoicePdf).toHaveBeenCalled();
    });
  });
});