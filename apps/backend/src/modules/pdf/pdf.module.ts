import { Module } from '@nestjs/common';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { PDF_GENERATOR } from './pdf.constants';

/**
 * Módulo de PDF
 * Encapsula la lógica de generación de documentos PDF
 * y expone el token PDF_GENERATOR para inyección de dependencias
 */
@Module({
  providers: [
    {
      provide: PDF_GENERATOR,
      useClass: PdfGeneratorService,
    },
  ],
  exports: [PDF_GENERATOR],
})
export class PdfModule {}