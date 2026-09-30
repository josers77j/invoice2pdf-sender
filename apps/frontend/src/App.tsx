import { useState, useCallback } from 'react';
import { InvoiceDto, SendInvoiceDto } from '@invoice/shared';
import { InvoiceValidationService } from './services/invoice-validation.service';
import { ApiService } from './services/api.service';

/**
 * Estado inicial del formulario de factura
 */
const initialInvoiceState: InvoiceDto = {
  invoiceNumber: '',
  customerName: '',
  customerEmail: '',
  invoiceDate: '',
  items: [{ description: '', quantity: 0, unitPrice: 0 }],
  subtotal: 0,
  tax: 0,
  total: 0,
  notes: '',
};

/**
 * Componente principal de la aplicación
 * Ofrece dos opciones: formulario manual o carga de archivo JSON
 */
function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [invoice, setInvoice] = useState<InvoiceDto>(initialInvoiceState);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [jsonFileName, setJsonFileName] = useState<string | null>(null);

  /**
   * Actualiza un campo de la factura
   */
  const handleInvoiceChange = useCallback(
    (field: keyof InvoiceDto, value: string | number) => {
      setInvoice((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  /**
   * Actualiza un item de la factura
   */
  const handleItemChange = useCallback(
    (index: number, field: 'description' | 'quantity' | 'unitPrice', value: string | number) => {
      setInvoice((prev) => {
        const items = [...prev.items];
        items[index] = { ...items[index], [field]: value };
        return { ...prev, items };
      });
    },
    [],
  );

  /**
   * Agrega un item a la factura
   */
  const addItem = useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 0, unitPrice: 0 }],
    }));
  }, []);

  /**
   * Elimina un item de la factura
   */
  const removeItem = useCallback((index: number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  /**
   * Maneja la carga de un archivo JSON
   * Valida que el JSON tenga la misma estructura que el formulario
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      setErrors([]);
      setSuccess(null);

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        // Validar que el JSON tenga la estructura esperada
        const validationErrors = await InvoiceValidationService.validateInvoice(parsed);

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setJsonFileName(null);
          return;
        }

        setInvoice(parsed as InvoiceDto);
        setJsonFileName(file.name);
      } catch (error) {
        setErrors([`Error al leer el archivo JSON: ${(error as Error).message}`]);
        setJsonFileName(null);
      }
    },
    [],
  );

  /**
   * Maneja el evento de arrastrar y soltar archivos
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/json') {
        handleFileUpload(file);
      } else {
        setErrors(['Por favor, sube un archivo JSON válido']);
      }
    },
    [handleFileUpload],
  );

  /**
   * Envía la factura al backend
   */
  const handleSubmit = useCallback(async () => {
    setErrors([]);
    setSuccess(null);
    setLoading(true);

    try {
      const payload: SendInvoiceDto = {
        invoice,
        recipientEmail,
      };

      // Validar el payload completo antes de enviar
      const validationErrors = await InvoiceValidationService.validateSendInvoice(payload);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      const result = await ApiService.sendInvoice(payload);
      setSuccess(`Factura ${result.invoiceNumber} enviada exitosamente`);
      setInvoice(initialInvoiceState);
      setRecipientEmail('');
      setJsonFileName(null);
    } catch (error) {
      setErrors([(error as Error).message]);
    } finally {
      setLoading(false);
    }
  }, [invoice, recipientEmail]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📄 Generador de Facturas</h1>
        <p>Genera un PDF de factura y envíalo por email</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          📝 Formulario
        </button>
        <button
          className={`tab ${activeTab === 'json' ? 'active' : ''}`}
          onClick={() => setActiveTab('json')}
        >
          📂 Cargar JSON
        </button>
      </div>

      {activeTab === 'form' ? (
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label>Número de Factura</label>
              <input
                type="text"
                value={invoice.invoiceNumber}
                onChange={(e) => handleInvoiceChange('invoiceNumber', e.target.value)}
                placeholder="INV-001"
              />
            </div>

            <div className="form-group">
              <label>Nombre del Cliente</label>
              <input
                type="text"
                value={invoice.customerName}
                onChange={(e) => handleInvoiceChange('customerName', e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label>Email del Cliente</label>
              <input
                type="email"
                value={invoice.customerEmail}
                onChange={(e) => handleInvoiceChange('customerEmail', e.target.value)}
                placeholder="cliente@example.com"
              />
            </div>

            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={invoice.invoiceDate}
                onChange={(e) => handleInvoiceChange('invoiceDate', e.target.value)}
              />
            </div>
          </div>

          <div className="items-section">
            <h3>Items de la Factura</h3>
            {invoice.items.map((item, index) => (
              <div key={index} className="item-row">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Descripción"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                  placeholder="Cantidad"
                  min="0"
                />
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                  placeholder="Precio Unit."
                  min="0"
                  step="0.01"
                />
                <button className="remove-btn" onClick={() => removeItem(index)}>
                  ✕
                </button>
              </div>
            ))}
            <button className="add-btn" onClick={addItem}>
              + Agregar Item
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Subtotal</label>
              <input
                type="number"
                value={invoice.subtotal}
                onChange={(e) => handleInvoiceChange('subtotal', Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Impuesto</label>
              <input
                type="number"
                value={invoice.tax}
                onChange={(e) => handleInvoiceChange('tax', Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Total</label>
              <input
                type="number"
                value={invoice.total}
                onChange={(e) => handleInvoiceChange('total', Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Notas (opcional)</label>
              <input
                type="text"
                value={invoice.notes || ''}
                onChange={(e) => handleInvoiceChange('notes', e.target.value)}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          className="drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            id="json-file-input"
          />
          <label htmlFor="json-file-input">
            <div className="drop-content">
              <span className="drop-icon">📂</span>
              <p>Arrastra un archivo JSON aquí o haz clic para seleccionar</p>
              {jsonFileName && <p className="file-name">Archivo cargado: {jsonFileName}</p>}
            </div>
          </label>
        </div>
      )}

      <div className="form-group recipient-section">
        <label>Email de Destino</label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="destino@example.com"
        />
      </div>

      {errors.length > 0 && (
        <div className="error-box">
          <h4>Errores de validación:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {success && <div className="success-box">✅ {success}</div>}

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Enviando...' : '🚀 Generar PDF y Enviar'}
      </button>
    </div>
  );
}

export default App;