import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { InvoiceModule } from './modules/invoice/invoice.module';

/**
 * Módulo raíz de la aplicación
 * Configura la validación de variables de entorno con Joi
 * e importa los módulos funcionales
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    InvoiceModule,
  ],
})
export class AppModule {}