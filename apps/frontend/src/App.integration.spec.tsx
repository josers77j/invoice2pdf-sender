import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { ApiService } from './services/api.service';

// Mock del servicio de API
jest.mock('./services/api.service', () => ({
  ApiService: {
    sendInvoice: jest.fn(),
  },
}));

describe('App (integración)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el formulario por defecto', () => {
    render(<App />);
    expect(screen.getByText('📄 Generador de Facturas')).toBeInTheDocument();
    expect(screen.getByText('📝 Formulario')).toBeInTheDocument();
    expect(screen.getByText('📂 Cargar JSON')).toBeInTheDocument();
  });

  it('debe cambiar a la pestaña de carga JSON', () => {
    render(<App />);
    fireEvent.click(screen.getByText('📂 Cargar JSON'));
    expect(screen.getByText(/Arrastra un archivo JSON aquí/)).toBeInTheDocument();
  });

  it('debe mostrar errores de validación al enviar con datos vacíos', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('🚀 Generar PDF y Enviar'));

    await waitFor(() => {
      expect(screen.getByText('Errores de validación:')).toBeInTheDocument();
    });
  });

  it('debe enviar la factura exitosamente con datos válidos', async () => {
    (ApiService.sendInvoice as jest.Mock).mockResolvedValue({
      message: 'Factura generada y enviada exitosamente',
      invoiceNumber: 'INV-001',
    });

    render(<App />);

    // Llenar el formulario
    fireEvent.change(screen.getByPlaceholderText('INV-001'), {
      target: { value: 'INV-001' },
    });
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByPlaceholderText('cliente@example.com'), {
      target: { value: 'juan@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('destino@example.com'), {
      target: { value: 'destino@example.com' },
    });

    // Llenar la fecha
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

    // Llenar el item
    const descriptionInput = screen.getByPlaceholderText('Descripción');
    fireEvent.change(descriptionInput, { target: { value: 'Producto A' } });

    const quantityInput = screen.getByPlaceholderText('Cantidad');
    fireEvent.change(quantityInput, { target: { value: '2' } });

    const priceInput = screen.getByPlaceholderText('Precio Unit.');
    fireEvent.change(priceInput, { target: { value: '50' } });

    // Llenar los totales (subtotal, impuesto, total) - son los últimos 3 inputs numéricos
    const numberInputs = document.querySelectorAll('input[type="number"]');
    const totalInputs = Array.from(numberInputs).slice(-3);
    fireEvent.change(totalInputs[0], { target: { value: '100' } });
    fireEvent.change(totalInputs[1], { target: { value: '16' } });
    fireEvent.change(totalInputs[2], { target: { value: '116' } });

    // Enviar
    fireEvent.click(screen.getByText('🚀 Generar PDF y Enviar'));

    await waitFor(() => {
      expect(ApiService.sendInvoice).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/Factura INV-001 enviada exitosamente/)).toBeInTheDocument();
    });
  });

  it('debe mostrar error si el backend falla', async () => {
    (ApiService.sendInvoice as jest.Mock).mockRejectedValue(new Error('Error del servidor'));

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('INV-001'), {
      target: { value: 'INV-002' },
    });
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'María García' },
    });
    fireEvent.change(screen.getByPlaceholderText('cliente@example.com'), {
      target: { value: 'maria@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('destino@example.com'), {
      target: { value: 'destino@example.com' },
    });

    // Llenar la fecha
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-02-20' } });

    // Llenar el item
    const descriptionInput = screen.getByPlaceholderText('Descripción');
    fireEvent.change(descriptionInput, { target: { value: 'Servicio' } });

    const quantityInput = screen.getByPlaceholderText('Cantidad');
    fireEvent.change(quantityInput, { target: { value: '1' } });

    const priceInput = screen.getByPlaceholderText('Precio Unit.');
    fireEvent.change(priceInput, { target: { value: '500' } });

    // Llenar los totales (subtotal, impuesto, total) - son los últimos 3 inputs numéricos
    const numberInputs = document.querySelectorAll('input[type="number"]');
    const totalInputs = Array.from(numberInputs).slice(-3);
    fireEvent.change(totalInputs[0], { target: { value: '500' } });
    fireEvent.change(totalInputs[1], { target: { value: '80' } });
    fireEvent.change(totalInputs[2], { target: { value: '580' } });

    fireEvent.click(screen.getByText('🚀 Generar PDF y Enviar'));

    await waitFor(() => {
      expect(screen.getByText('Error del servidor')).toBeInTheDocument();
    });
  });
});