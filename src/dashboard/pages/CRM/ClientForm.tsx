import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useCreateClient, useUpdateClient } from '../../hooks/useClients';
import type { ClientInsert, Client } from '../../../types';

interface ClientFormProps {
  onClose: () => void;
  client?: Client;
}

export function ClientForm({ onClose, client }: ClientFormProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        notes: formData.notes || null,
      };

      updateClient.mutate(
        { id: client.id, ...updateData },
        {
          onSuccess: () => {
            onClose();
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
        notes: formData.notes || null,
        tags: null,
        user_id: '', // Will be set by the hook
      };

      createClient.mutate(clientData, {
        onSuccess: () => {
          onClose();
        },
      });
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
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

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Endereço
            </h3>

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

          {/* Sales Info */}
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-muted/10 border border-border rounded-lg text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition resize-none"
              placeholder="Notas adicionais sobre o cliente..."
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={createClient.isPending || updateClient.isPending}
              className="flex-1 glass-button py-3 rounded-lg font-semibold text-secondary-foreground flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold text-muted-foreground hover:text-card-foreground hover:bg-muted/10 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
