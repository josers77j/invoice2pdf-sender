/**
 * Token de inyección de dependencias para el servicio de email
 * Se usa en lugar de la interfaz directamente porque TypeScript
 * no puede usar interfaces como tokens en tiempo de ejecución
 */
export const EMAIL_SERVICE = 'EMAIL_SERVICE';