import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { PDF_GENERATOR } from '../pdf/pdf.constants';
import { EMAIL_SERVICE } from '../email/email.constants';
import { ConfigService } from '@nestjs/config';

describe('InvoiceController (integración)', () => {
  let app: INestApplication;
  let pdfGenerator: { generateInvoicePdf: jest.Mock };
  let emailService: { sendEmailWithAttachment: jest.Mock };

  const validPayload = {
    invoice: {
      invoiceNumber: 'INV-100',
      customerName: 'Carlos López',
      customerEmail: 'carlos@example.com',
      invoiceDate: '2024-03-10',
      items: [
        { description: 'Laptop', quantity: 1, unitPrice: 1200 },
        { description: 'Mouse', quantity: 2, unitPrice: 25 },
      ],
      subtotal: 1250,
      tax: 200,
      total: 1450,
    },
    recipientEmail: 'destino@example.com',
  };

  beforeEach(async () => {
    pdfGenerator = {
      generateInvoicePdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 test')),
    };

    emailService = {
      sendEmailWithAttachment: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
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

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /invoices/send', () => {
    it('debe retornar 201 y enviar la factura con payload válido', async () => {
      const response = await request(app.getHttpServer())
        .post('/invoices/send')
        .send(validPayload)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Factura generada y enviada exitosamente',
        invoiceNumber: 'INV-100',
      });

      expect(pdfGenerator.generateInvoicePdf).toHaveBeenCalled();
      expect(emailService.sendEmailWithAttachment).toHaveBeenCalled();
    });

    it('debe retornar 400 si el payload es inválido', async () => {
      const invalidPayload = {
        ...validPayload,
        invoice: {
          ...validPayload.invoice,
          customerEmail: 'email-invalido',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/invoices/send')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(pdfGenerator.generateInvoicePdf).not.toHaveBeenCalled();
      expect(emailService.sendEmailWithAttachment).not.toHaveBeenCalled();
    });

    it('debe retornar 400 si falta el email de destino', async () => {
      const { recipientEmail, ...payloadSinEmail } = validPayload;

      const response = await request(app.getHttpServer())
        .post('/invoices/send')
        .send(payloadSinEmail)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });
});