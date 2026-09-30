import { InvoiceValidationService } from './invoice-validation.service';

describe('InvoiceValidationService', () => {
  const validInvoice = {
    invoiceNumber: 'INV-001',
    customerName: 'Juan Pérez',
    customerEmail: 'juan@example.com',
    invoiceDate: '2024-01-15',
    items: [
      { description: 'Producto A', quantity: 2, unitPrice: 50 },
    ],
    subtotal: 100,
    tax: 16,
    total: 116,
  };

  describe('validateInvoice', () => {
    it('debe retornar sin errores para una factura válida', async () => {
      const errors = await InvoiceValidationService.validateInvoice(validInvoice);
      expect(errors).toHaveLength(0);
    });

    it('debe retornar errores si falta el número de factura', async () => {
      const invalid = { ...validInvoice, invoiceNumber: '' };
      const errors = await InvoiceValidationService.validateInvoice(invalid);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('número de factura'))).toBe(true);
    });

    it('debe retornar errores si el email es inválido', async () => {
      const invalid = { ...validInvoice, customerEmail: 'email-invalido' };
      const errors = await InvoiceValidationService.validateInvoice(invalid);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('email'))).toBe(true);
    });

    it('debe retornar errores si los items no son válidos', async () => {
      const invalid = {
        ...validInvoice,
        items: [{ description: '', quantity: -1, unitPrice: 0 }],
      };
      const errors = await InvoiceValidationService.validateInvoice(invalid);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('debe retornar errores si hay campos no permitidos', async () => {
      const invalid = { ...validInvoice, campoExtra: 'no-permitido' };
      const errors = await InvoiceValidationService.validateInvoice(invalid);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateSendInvoice', () => {
    it('debe retornar sin errores para un payload válido', async () => {
      const payload = {
        invoice: validInvoice,
        recipientEmail: 'destino@example.com',
      };
      const errors = await InvoiceValidationService.validateSendInvoice(payload);
      expect(errors).toHaveLength(0);
    });

    it('debe retornar errores si falta el email de destino', async () => {
      const payload = {
        invoice: validInvoice,
        recipientEmail: '',
      };
      const errors = await InvoiceValidationService.validateSendInvoice(payload);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('debe retornar errores si el email de destino es inválido', async () => {
      const payload = {
        invoice: validInvoice,
        recipientEmail: 'no-es-email',
      };
      const errors = await InvoiceValidationService.validateSendInvoice(payload);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});