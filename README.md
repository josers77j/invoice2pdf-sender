# 📄 Invoice Monorepo

Monorepo para generación de facturas PDF y envío por email usando **Turborepo**, **NestJS**, **React**, **pdfmake**, **Resend** y **pnpm**.

## 🏗️ Estructura

```
invoice-monorepo/
├── apps/
│   ├── backend/          # API NestJS
│   └── frontend/         # UI React (Vite)
├── packages/
│   └── shared/           # DTOs compartidos (validación)
├── turbo.json            # Configuración de Turborepo
├── pnpm-workspace.yaml   # Configuración de workspace pnpm
└── example-invoice.json  # Ejemplo de factura JSON
```

## 🚀 Requisitos

- Node.js >= 18
- pnpm >= 9

## 📦 Instalación

```bash
pnpm install
```

## ⚙️ Configuración de Variables de Entorno

### Backend (`apps/backend/.env`)

Copia `.env.example` a `.env` y completa los valores:

```env
PORT=3000
RESEND_API_KEY=tu_api_key_aqui
DEFAULT_RECIPIENT_EMAIL=destino@example.com
SENDER_EMAIL=remitente@example.com
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

> **Nota**: La validación con Joi garantiza que `RESEND_API_KEY`, `DEFAULT_RECIPIENT_EMAIL` y `SENDER_EMAIL` estén presentes antes de arrancar.

### Frontend (`apps/frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

## 🏃 Ejecutar en Desarrollo

```bash
pnpm dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## 🧪 Pruebas

```bash
# Todas las pruebas
pnpm test

# Solo unitarias
pnpm test:unit

# Solo integración
pnpm test:integration
```

## 🔨 Build

```bash
pnpm build
```

## 📋 Funcionalidades

### Frontend
- **Formulario**: Ingresa los datos de la factura manualmente
- **Carga JSON**: Arrastra o selecciona un archivo JSON con la estructura de la factura
- **Validación**: Usa los mismos DTOs del backend para validar que el JSON tenga la estructura correcta
- **Envío**: Genera el PDF y lo envía por email

### Backend
- **POST /invoices/send**: Recibe la factura y el email de destino
- **Generación PDF**: Usa pdfmake para crear un PDF profesional
- **Envío Email**: Usa Resend para enviar el PDF adjunto
- **Validación**: Joi para variables de entorno, class-validator para DTOs

## 📄 Estructura del JSON de Factura

```json
{
  "invoiceNumber": "INV-2024-001",
  "customerName": "Empresa Ejemplo S.A.",
  "customerEmail": "cliente@empresa.com",
  "invoiceDate": "2024-01-15",
  "items": [
    {
      "description": "Servicio de consultoría",
      "quantity": 10,
      "unitPrice": 150
    }
  ],
  "subtotal": 1500,
  "tax": 240,
  "total": 1740,
  "notes": "Pago a 30 días"
}
```

## 🧱 Arquitectura

### Principios SOLID
- **S**: Separación de controladores, servicios y adaptadores
- **O/L**: Abstracciones con interfaces (`IPdfGenerator`, `IEmailService`)
- **I**: Interfaces pequeñas y específicas
- **D**: Inyección de dependencias con tokens (`PDF_GENERATOR`, `EMAIL_SERVICE`)

### Módulos NestJS
- **InvoiceModule**: Orquesta el flujo completo
- **PdfModule**: Generación de PDF con pdfmake
- **EmailModule**: Envío de emails con Resend# invoice2pdf-sender
# invoice2pdf-sender
# invoice2pdf-sender
# invoice2pdf-sender
# invoice2pdf-sender
