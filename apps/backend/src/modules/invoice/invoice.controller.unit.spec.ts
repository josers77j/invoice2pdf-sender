import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { SendInvoiceDto } from '@invoice/shared';

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let invoiceService: jest.Mocked<InvoiceService>;

  const mockSendInvoiceDto: SendInvoiceDto = {
    invoice: {
      invoiceNumber: 'INV-002',
      customerName: 'María García',
      customerEmail: 'maria@example.com',
      invoiceDate: '2024-02-20',
      items: [{ description: 'Servicio de consultoría', quantity: 1, unitPrice: 500 }],
      subtotal: 500,
      tax: 80,
      total: 580,
    },
    recipientEmail: 'cliente@example.com',
  };

  beforeEach(async () => {
    invoiceService = {
      generateAndSendInvoice: jest.fn().mockResolvedValue({
        message: 'Factura generada y enviada exitosamente',
        invoiceNumber: 'INV-002',
      }),
    } as unknown as jest.Mocked<InvoiceService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: invoiceService,
        },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
  });

  describe('sendInvoice', () => {
    it('debe llamar al servicio y retornar la confirmación', async () => {
      const result = await controller.sendInvoice(mockSendInvoiceDto);

      expect(invoiceService.generateAndSendInvoice).toHaveBeenCalledWith(mockSendInvoiceDto);
      expect(result).toEqual({
        message: 'Factura generada y enviada exitosamente',
        invoiceNumber: 'INV-002',
      });
    });

    it('debe propagar errores del servicio', async () => {
      invoiceService.generateAndSendInvoice.mockRejectedValue(new Error('Error interno'));

      await expect(controller.sendInvoice(mockSendInvoiceDto)).rejects.toThrow('Error interno');
    });
  });
});