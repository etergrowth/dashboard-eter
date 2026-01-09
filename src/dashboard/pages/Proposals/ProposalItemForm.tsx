import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useCreateProposalItem, useUpdateProposalItem } from '../../hooks/useProposals';
import { useServices } from '../../hooks/useServices';
import type { ProposalItemInsert, ProposalItem, Service } from '../../../types';

interface ProposalItemFormProps {
  onClose: () => void;
  proposalId: string;
  item?: ProposalItem;
  position?: number;
}

export function ProposalItemForm({ onClose, proposalId, item, position }: ProposalItemFormProps) {
  const createItem = useCreateProposalItem();
  const updateItem = useUpdateProposalItem();
  const { data: services } = useServices();
  
  const [formData, setFormData] = useState<Partial<ProposalItemInsert>>({
    service_id: item?.service_id || '',
    estimated_hours: item?.estimated_hours || 0,
    software_costs: item?.software_costs || 0,
    applied_hourly_rate: item?.applied_hourly_rate || 0,
    notes: item?.notes || '',
    position: item?.position ?? position ?? 0,
  });

  const selectedService = services?.find((s) => s.id === formData.service_id);

  // Auto-fill applied_hourly_rate when service is selected
  useEffect(() => {
    if (selectedService && !item) {
      setFormData((prev) => ({
        ...prev,
        applied_hourly_rate: selectedService.final_hourly_rate,
      }));
    }
  }, [selectedService, item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'estimated_hours' || name === 'software_costs' || name === 'applied_hourly_rate'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  // Calculate line total
  const lineTotal = (formData.estimated_hours || 0) * (formData.applied_hourly_rate || 0) + (formData.software_costs || 0);
  const baseCost = selectedService?.base_cost_per_hour || 0;
  const lineMargin = ((formData.applied_hourly_rate || 0) - baseCost) * (formData.estimated_hours || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (item) {
      updateItem.mutate(
        {
          id: item.id,
          service_id: formData.service_id!,
          estimated_hours: formData.estimated_hours || 0,
          software_costs: formData.software_costs || 0,
          applied_hourly_rate: formData.applied_hourly_rate || 0,
          notes: formData.notes || null,
          position: formData.position || 0,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      const itemData: ProposalItemInsert = {
        proposal_id: proposalId,
        service_id: formData.service_id!,
        estimated_hours: formData.estimated_hours || 0,
        software_costs: formData.software_costs || 0,
        applied_hourly_rate: formData.applied_hourly_rate || 0,
        notes: formData.notes || null,
        position: formData.position || 0,
      };

      createItem.mutate(itemData, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const isLoading = createItem.isPending || updateItem.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {item ? 'Editar Item' : 'Adicionar Item à Proposta'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Serviço *
            </label>
            <select
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um serviço</option>
              {services?.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.final_hourly_rate}€/h
                </option>
              ))}
            </select>
            {selectedService && (
              <div className="mt-2 text-sm text-gray-400">
                <p>Custo Base: {selectedService.base_cost_per_hour}€/h</p>
                <p>Preço Final: {selectedService.final_hourly_rate}€/h</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horas Estimadas *
              </label>
              <input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                required
                min="0"
                step="0.5"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preço/Hora (€) *
              </label>
              <input
                type="number"
                name="applied_hourly_rate"
                value={formData.applied_hourly_rate}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Softwares/Outros (€)
              </label>
              <input
                type="number"
                name="software_costs"
                value={formData.software_costs}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Calculated values preview */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Cálculos Automáticos</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Custo Total Estimado:</span>
                <span className="ml-2 text-white font-semibold">
                  {lineTotal.toFixed(2)}€
                </span>
              </div>
              <div>
                <span className="text-gray-400">Margem Estimada:</span>
                <span className="ml-2 text-white font-semibold">
                  {lineMargin.toFixed(2)}€
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Cálculo: (Horas × Preço/Hora) + Software = {lineTotal.toFixed(2)}€
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas sobre este item..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}