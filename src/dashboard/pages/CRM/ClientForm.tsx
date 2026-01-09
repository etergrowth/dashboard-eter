import { useState } from 'react';
import { X, Save, Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useCreateClient, useUpdateClient } from '../../hooks/useClients';
import type { ClientInsert, Client } from '../../../types';

interface ClientFormProps {
  onClose: () => void;
  client?: Client;
}

const TOTAL_STEPS = 4;

export function ClientForm({ onClose, client }: ClientFormProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ClientInsert>>({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    address: client?.address || '',
    city: client?.city || '',
    postal_code: client?.postal_code || '',
    country: client?.country || 'Portugal',
    status: client?.status || 'lead',
    priority: client?.priority || 'medium',
    probability: client?.probability || 0,
    value: client?.value || undefined,
    notes: client?.notes || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.name?.trim();
      case 2:
        return true; // Address is optional
      case 3:
        return true; // Sales pipeline is optional
      case 4:
        return true; // Notes are optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    if (client) {
      // Update existing client
      const updateData = {
        name: formData.name!,
        email: formData.email || null,
        phone: formData.phone || null,
        company: formData.company || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country || 'Portugal',
        latitude: client.latitude,
        longitude: client.longitude,
        status: formData.status || 'lead',
        priority: formData.priority || 'medium',
        probability: Number(formData.probability) || 0,
        value: formData.value ? Number(formData.value) : null,
        notes: formData.notes && formData.notes.trim() !== '' ? formData.notes.trim() : null,
      };

      updateClient.mutate(
        { id: client.id, ...updateData },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (error: any) => {
            console.error('Erro ao atualizar cliente:', error);
            setError(error?.message || 'Erro ao atualizar cliente. Por favor, tente novamente.');
          },
        }
      );
    } else {
      // Create new client
      const clientData: ClientInsert = {
        name: formData.name!,
        email: formData.email || null,
        phone: formData.phone || null,
        company: formData.company || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country || 'Portugal',
        latitude: null,
        longitude: null,
        status: formData.status || 'lead',
        priority: formData.priority || 'medium',
        probability: Number(formData.probability) || 0,
        value: formData.value ? Number(formData.value) : null,
        notes: formData.notes && formData.notes.trim() !== '' ? formData.notes.trim() : null,
        tags: null,
        user_id: '', // Will be set by the hook
      };

      // #region agent log
      fetch('http://127.0.0.1:7249/ingest/97ef3031-d893-442a-9483-5eceb6f4d3ce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ClientForm.tsx:109',message:'before mutate call',data:{clientData,formData,name:formData.name,name_length:formData.name?.length,probability:formData.probability,probability_parsed:Number(formData.probability)||0,value:formData.value,value_parsed:formData.value?Number(formData.value):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
      // #endregion

      createClient.mutate(clientData, {
        onSuccess: () => {
          onClose();
        },
        onError: (error: any) => {
          console.error('Erro ao criar cliente:', error);
          setError(error?.message || 'Erro ao criar cliente. Por favor, tente novamente.');
        },
      });
    }
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Informação Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                  placeholder="João Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                  placeholder="Empresa Lda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                  placeholder="joao@empresa.pt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Morada
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                  placeholder="Rua Example, 123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                  placeholder="Lisboa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                  placeholder="1000-001"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Pipeline de Vendas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                >
                  <option value="lead">Lead</option>
                  <option value="proposal">Proposta</option>
                  <option value="negotiation">Negociação</option>
                  <option value="closed">Fechado</option>
                  <option value="lost">Perdido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Prioridade
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Valor (€)
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value || ''}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Notas</h3>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition resize-none"
              placeholder="Notas adicionais sobre o cliente..."
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/10 rounded-lg transition text-muted-foreground hover:text-card-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Passo {currentStep} de {TOTAL_STEPS}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Content */}
          <div className="min-h-[300px]">{renderStep()}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className="px-6 py-3 rounded-lg font-semibold text-muted-foreground hover:text-card-foreground hover:bg-muted/10 transition flex items-center gap-2"
            >
              {currentStep === 1 ? (
                'Cancelar'
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  Anterior
                </>
              )}
            </button>

            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="px-6 py-3 rounded-lg font-semibold glass-button text-secondary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Seguinte
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={createClient.isPending || updateClient.isPending || !validateStep(currentStep)}
                className="px-6 py-3 rounded-lg font-semibold glass-button text-secondary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createClient.isPending || updateClient.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {client ? 'Atualizar Cliente' : 'Guardar Cliente'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
