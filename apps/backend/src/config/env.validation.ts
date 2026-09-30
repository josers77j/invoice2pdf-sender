import * as Joi from 'joi';

/**
 * Esquema de validación de variables de entorno usando Joi.
 * Garantiza que todas las variables requeridas estén presentes
 * antes de que la aplicación arranque.
 */
export const envValidationSchema = Joi.object({
  // Puerto del servidor
  PORT: Joi.number().default(3000),

  // API Key de Resend (requerida para enviar emails)
  RESEND_API_KEY: Joi.string().required().messages({
    'any.required': 'RESEND_API_KEY es requerida. Obtén una en https://resend.com',
    'string.empty': 'RESEND_API_KEY no puede estar vacía',
  }),

  // Email de destino por defecto (requerido)
  DEFAULT_RECIPIENT_EMAIL: Joi.string().email().required().messages({
    'any.required': 'DEFAULT_RECIPIENT_EMAIL es requerido',
    'string.email': 'DEFAULT_RECIPIENT_EMAIL debe ser un email válido',
    'string.empty': 'DEFAULT_RECIPIENT_EMAIL no puede estar vacío',
  }),

  // Email remitente (requerido)
  SENDER_EMAIL: Joi.string().email().required().messages({
    'any.required': 'SENDER_EMAIL es requerido',
    'string.email': 'SENDER_EMAIL debe ser un email válido',
    'string.empty': 'SENDER_EMAIL no puede estar vacío',
  }),

  // URL del frontend para CORS
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),

  // NODE_ENV
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
});