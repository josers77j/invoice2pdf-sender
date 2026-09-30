import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para los items de la factura
 * Define la estructura de cada línea de la factura
 */
export class InvoiceItemDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  description!: string;

  @IsNumber()
  @Min(0, { message: 'La cantidad debe ser mayor o igual a 0' })
  quantity!: number;

  @IsNumber()
  @Min(0, { message: 'El precio unitario debe ser mayor o igual a 0' })
  unitPrice!: number;
}

/**
 * DTO principal de la factura
 * Define la estructura completa que el sistema espera recibir
 * tanto desde el formulario como desde el archivo JSON
 */
export class InvoiceDto {
  @IsString()
  @IsNotEmpty({ message: 'El número de factura es requerido' })
  invoiceNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del cliente es requerido' })
  customerName!: string;

  @IsEmail({}, { message: 'El email del cliente no es válido' })
  customerEmail!: string;

  @IsString()
  @IsNotEmpty({ message: 'La fecha es requerida' })
  invoiceDate!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];

  @IsNumber()
  @Min(0, { message: 'El subtotal debe ser mayor o igual a 0' })
  subtotal!: number;

  @IsNumber()
  @Min(0, { message: 'El impuesto debe ser mayor o igual a 0' })
  tax!: number;

  @IsNumber()
  @Min(0, { message: 'El total debe ser mayor o igual a 0' })
  total!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO para la solicitud de envío de factura
 * Incluye la factura y el email de destino
 */
export class SendInvoiceDto {
  @ValidateNested()
  @Type(() => InvoiceDto)
  invoice!: InvoiceDto;

  @IsEmail({}, { message: 'El email de destino no es válido' })
  recipientEmail!: string;
}