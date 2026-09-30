import { Injectable } from '@nestjs/common';
import { InvoiceDto } from '@invoice/shared';
import { IPdfGenerator } from '../interfaces/pdf-generator.interface';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Configurar las fuentes virtuales de pdfmake
// vfs_fonts exporta el mapa de fuentes directamente o dentro de { pdfMake: { vfs } }
// dependiendo de la versión. Esta lógica cubre ambos casos.
const pdfFontsModule = (pdfFonts as any).pdfMake || pdfFonts;
const vfs = (pdfFontsModule as any).vfs || pdfFontsModule;
(pdfMake as any).vfs = vfs;

/**
 * Servicio de generación de PDF usando pdfmake
 * Implementa la interfaz IPdfGenerator
 */
@Injectable()
export class PdfGeneratorService implements IPdfGenerator {
  /**
   * Genera un PDF de factura profesional
   * @param invoice - Datos de la factura
   * @returns Buffer con el contenido del PDF
   */
  async generateInvoicePdf(invoice: InvoiceDto): Promise<Buffer> {
    const docDefinition = this.buildDocumentDefinition(invoice);

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition as any);
        pdfDoc.getBuffer((buffer: Buffer) => {
          resolve(buffer);
        });
      } catch (error) {
        reject(new Error(`Error al generar el PDF: ${(error as Error).message}`));
      }
    });
  }

  /**
   * Construye la definición del documento PDF
   * @param invoice - Datos de la factura
   * @returns Definición del documento para pdfmake
   */
  private buildDocumentDefinition(invoice: InvoiceDto) {
    const itemsTable = invoice.items.map((item, index) => [
      { text: String(index + 1), alignment: 'center' },
      { text: item.description },
      { text: String(item.quantity), alignment: 'center' },
      { text: `$${item.unitPrice.toFixed(2)}`, alignment: 'right' },
      { text: `$${(item.quantity * item.unitPrice).toFixed(2)}`, alignment: 'right' },
    ]);

    return {
      content: [
        // Encabezado
        {
          columns: [
            {
              text: 'FACTURA',
              style: 'header',
              alignment: 'left',
            },
            {
              text: `No. ${invoice.invoiceNumber}`,
              style: 'invoiceNumber',
              alignment: 'right',
            },
          ],
        },
        { text: '\n' },
        // Información del cliente
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'FACTURADO A:', style: 'sectionTitle' },
                { text: invoice.customerName, style: 'customerName' },
                { text: invoice.customerEmail, style: 'muted' },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'FECHA:', style: 'sectionTitle', alignment: 'right' },
                { text: invoice.invoiceDate, style: 'muted', alignment: 'right' },
              ],
            },
          ],
        },
        { text: '\n' },
        // Tabla de items
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: '#', style: 'tableHeader', alignment: 'center' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'center' },
                { text: 'Precio Unit.', style: 'tableHeader', alignment: 'right' },
                { text: 'Total', style: 'tableHeader', alignment: 'right' },
              ],
              ...itemsTable,
            ],
          },
          layout: 'lightHorizontalLines',
        },
        { text: '\n' },
        // Totales
        {
          columns: [
            {
              width: '*',
              text: '',
            },
            {
              width: 'auto',
              stack: [
                {
                  columns: [
                    { width: 100, text: 'Subtotal:', style: 'totalLabel' },
                    { width: 100, text: `$${invoice.subtotal.toFixed(2)}`, style: 'totalValue', alignment: 'right' },
                  ],
                },
                {
                  columns: [
                    { width: 100, text: 'Impuesto:', style: 'totalLabel' },
                    { width: 100, text: `$${invoice.tax.toFixed(2)}`, style: 'totalValue', alignment: 'right' },
                  ],
                },
                {
                  columns: [
                    { width: 100, text: 'TOTAL:', style: 'grandTotalLabel' },
                    { width: 100, text: `$${invoice.total.toFixed(2)}`, style: 'grandTotalValue', alignment: 'right' },
                  ],
                },
              ],
            },
          ],
        },
        { text: '\n' },
        // Notas
        ...(invoice.notes
          ? [
              { text: 'NOTAS:', style: 'sectionTitle' },
              { text: invoice.notes, style: 'muted' },
            ]
          : []),
      ],
      styles: {
        header: {
          fontSize: 28,
          bold: true,
          color: '#1a1a2e',
        },
        invoiceNumber: {
          fontSize: 18,
          bold: true,
          color: '#e94560',
        },
        sectionTitle: {
          fontSize: 11,
          bold: true,
          color: '#1a1a2e',
          margin: [0, 8, 0, 4],
        },
        customerName: {
          fontSize: 14,
          bold: true,
          color: '#333333',
        },
        muted: {
          fontSize: 11,
          color: '#666666',
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: '#ffffff',
          fillColor: '#1a1a2e',
          margin: [4, 6, 4, 6],
        },
        totalLabel: {
          fontSize: 12,
          color: '#333333',
          margin: [0, 4, 0, 4],
        },
        totalValue: {
          fontSize: 12,
          color: '#333333',
          margin: [0, 4, 0, 4],
        },
        grandTotalLabel: {
          fontSize: 14,
          bold: true,
          color: '#1a1a2e',
          margin: [0, 8, 0, 4],
        },
        grandTotalValue: {
          fontSize: 14,
          bold: true,
          color: '#e94560',
          margin: [0, 8, 0, 4],
        },
      },
      defaultStyle: {
        fontSize: 11,
        color: '#333333',
      },
    };
  }
}