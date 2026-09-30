/**
 * Token de inyección de dependencias para el generador de PDF
 * Se usa en lugar de la interfaz directamente porque TypeScript
 * no puede usar interfaces como tokens en tiempo de ejecución
 */
export const PDF_GENERATOR = 'PDF_GENERATOR';